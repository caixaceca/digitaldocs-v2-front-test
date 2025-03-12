import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
// utils
import { noDados } from '../../utils/formatText';
import { ptDateTime } from '../../utils/formatTime';
import { colorLabel } from '../../utils/getColorPresets';
import { sortPermissoes } from '../../utils/formatObject';
// redux
import { updateItem } from '../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../redux/store';
// components
import Label from '../../components/Label';
import { DefaultAction } from '../../components/Actions';
import { ColaboradorInfo } from '../../components/Panel';
import { SearchNotFoundSmall } from '../../components/table';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
//
import { DetalhesContent } from './DetalhesGaji9';
import { RecursoGrupoForm, UtilizadorGrupoForm } from './form-gaji9';

// ----------------------------------------------------------------------

GrupoDetail.propTypes = { dados: PropTypes.object };

export default function GrupoDetail({ dados }) {
  const [currentTab, setCurrentTab] = useState('Info');
  const { colaboradores } = useSelector((state) => state.intranet);

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} /> },
    {
      value: 'Recursos',
      component: <RecursosUtilizadores id={dados?.id} dados={dados?.recursos_permissoes || []} recursos />,
    },
    {
      value: 'Colaboradores',
      component: (
        <RecursosUtilizadores
          id={dados?.id}
          dados={dados?.utilizadores?.map((row) => ({
            ...row,
            colaborador: colaboradores?.find(
              (item) =>
                item?.perfil?.id_aad === row?.utilizador_id ||
                item?.perfil?.mail?.toLowerCase() === row?.email?.toLowerCase()
            ),
          }))}
        />
      ),
    },
  ];

  return (
    <>
      <TabsWrapperSimple
        tabsList={tabsList}
        currentTab={currentTab}
        sx={{ mt: 2, mb: 1, boxShadow: 'none' }}
        changeTab={(_, newValue) => setCurrentTab(newValue)}
      />
      <Box>{tabsList?.find((tab) => tab?.value === currentTab)?.component}</Box>
    </>
  );
}

// ----------------------------------------------------------------------

RecursosUtilizadores.propTypes = { id: PropTypes.string, dados: PropTypes.array, recursos: PropTypes.bool };

function RecursosUtilizadores({ id, dados, recursos = false }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);

  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">{recursos ? 'Recurso' : 'Utilizador'}</TableCell>
            <TableCell size="small">Data</TableCell>
            <TableCell size="small">{recursos ? 'Permissões' : 'Função'}</TableCell>
            <TableCell size="small" width={10}>
              {!!id && <DefaultAction label="ADICIONAR" small handleClick={() => setItem({ action: 'add' })} />}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${id}_${index}`}>
              <TableCell>
                {recursos ? (
                  row?.recurso
                ) : (
                  <ColaboradorInfo
                    labelAltCaption
                    id={row?.colaborador?.id}
                    labelAlt={row?.utilizador_id}
                    foto={row?.colaborador?.foto_disk}
                    caption={!row?.colaborador?.uo?.label}
                    nome={row?.colaborador?.nome || row?.utilizador_email || row?.nome}
                    label={row?.colaborador?.uo?.desegnicao || 'Perfil sem ID_AAD na Intranet'}
                  />
                )}
              </TableCell>
              <TableCell>
                <DataLabel data={row?.data_inicio || ''} />
                <DataLabel data={row?.data_termino || ''} termino />
              </TableCell>
              <TableCell>
                {recursos ? (
                  <Stack direction="row" useFlexGap flexWrap="wrap" spacing={0.5}>
                    {sortPermissoes(row?.permissoes)?.map((item, index) => {
                      const isReadWO = item === 'READ' && row?.permissoes.length > 1;

                      return (
                        <Label
                          key={`${id}_${item}_${index}`}
                          color={colorLabel(item, 'default')}
                          endIcon={
                            !isReadWO && (
                              <Tooltip title="ELIMINAR" arrow>
                                <Fab
                                  color="error"
                                  sx={{ width: 14, minHeight: 14, height: 14, m: 0.3 }}
                                  onClick={() =>
                                    dispatch(
                                      updateItem(
                                        'prg',
                                        JSON.stringify({ grupo_id: id, permissao: item, recurso_id: row?.recurso_id }),
                                        { grupoId: id, msg: 'Permissão eliminada' }
                                      )
                                    )
                                  }
                                >
                                  <CloseIcon />
                                </Fab>
                              </Tooltip>
                            )
                          }
                        >
                          {item}
                        </Label>
                      );
                    })}
                  </Stack>
                ) : (
                  row?._role || noDados()
                )}
              </TableCell>
              <TableCell>
                <DefaultAction small label="EDITAR" handleClick={() => setItem({ action: 'edit', ...row })} />
              </TableCell>
            </TableRow>
          ))}
          {(!dados || dados?.length === 0) && (
            <TableRow>
              <TableCell colSpan={5}>
                <SearchNotFoundSmall message="Nenhum registo disponível..." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!!item && (
        <>
          {recursos ? (
            <RecursoGrupoForm grupoId={id} selectedItem={item} onCancel={() => setItem(null)} />
          ) : (
            <UtilizadorGrupoForm grupoId={id} selectedItem={item} onCancel={() => setItem(null)} />
          )}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

DataLabel.propTypes = { data: PropTypes.string, termino: PropTypes.bool };

function DataLabel({ data = '', termino = false }) {
  return (
    <Stack direction="row" spacing={0.5}>
      <Typography sx={{ typography: 'caption', color: 'text.secondary' }}>{termino ? 'Término' : 'Início'}:</Typography>
      <Typography
        sx={{ typography: 'caption', fontStyle: !data && 'italic', pr: !data && 0.15, color: !data && 'text.disabled' }}
      >
        {data ? ptDateTime(data) : 'Não definido'}
      </Typography>
    </Stack>
  );
}
