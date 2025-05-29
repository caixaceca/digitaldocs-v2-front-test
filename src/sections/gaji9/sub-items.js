import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
// utils
import { noDados } from '../../utils/formatText';
import { ptDateTime } from '../../utils/formatTime';
import { colorLabel } from '../../utils/getColorPresets';
import { sortPermissoes } from '../../utils/formatObject';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { updateItem, deleteItem } from '../../redux/slices/gaji9';
// components
import Label from '../../components/Label';
import { DefaultAction } from '../../components/Actions';
import { SearchNotFoundSmall } from '../../components/table';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import { DialogConfirmar, DialogTitleAlt } from '../../components/CustomDialog';
import { ColaboradorInfo, DataLabel, CellChecked } from '../../components/Panel';
//
import { DetalhesContent } from './DetalhesGaji9';
import { SubtiposForm } from './form-identificadores';
import { BalcaoForm, RecursoGrupoForm, UtilizadorGrupoForm } from './form-gaji9';

// ----------------------------------------------------------------------

GrupoDetail.propTypes = { dados: PropTypes.object };

export function GrupoDetail({ dados }) {
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
              ({ perfil }) =>
                perfil?.id_aad === row?.utilizador_id || perfil?.mail?.toLowerCase() === row?.email?.toLowerCase()
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
      <Box>{tabsList?.find(({ value }) => value === currentTab)?.component}</Box>
    </>
  );
}

// ----------------------------------------------------------------------

RecursosUtilizadores.propTypes = { id: PropTypes.string, dados: PropTypes.array, recursos: PropTypes.bool };

function RecursosUtilizadores({ id, dados = [], recursos = false }) {
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
              {!!id && <DefaultAction label="ADICIONAR" small onClick={() => setItem({ action: 'add' })} />}
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
                <DefaultAction small label="EDITAR" onClick={() => setItem({ action: 'edit', ...row })} />
              </TableCell>
            </TableRow>
          ))}
          {dados?.length === 0 && <SemDados />}
        </TableBody>
      </Table>
      {!!item && (
        <>
          {recursos ? (
            <RecursoGrupoForm grupoId={id} selectedItem={item} onClose={() => setItem(null)} />
          ) : (
            <UtilizadorGrupoForm grupoId={id} selectedItem={item} onClose={() => setItem(null)} />
          )}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

BalcoesRepresentante.propTypes = { id: PropTypes.string, dados: PropTypes.array };

export function BalcoesRepresentante({ id, dados = [] }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { uos } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.gaji9);
  const params = { item1: 'selectedItem', repId: id, msg: 'Balcão eliminado', onClose: () => setItem(null) };

  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            {[
              { label: 'Balcão' },
              { label: 'Data iníco', center: true },
              { label: 'Data término', center: true },
              { label: 'Ativo', center: true },
            ]?.map((row) => (
              <CellHeader key={row?.label} dados={row} />
            ))}
            <TableCell size="small" width={10}>
              <Stack direction="row" justifyContent="right">
                {!!id && <DefaultAction button label="ADICIONAR" small onClick={() => setItem({ action: 'add' })} />}
              </Stack>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.map((row, index) => {
            const uo = uos?.find(({ balcao }) => Number(balcao) === Number(row?.balcao))?.label;
            return (
              <TableRow hover key={`${row?.id}_${id}_${index}`}>
                <TableCell>{uo ? `${row?.balcao} - ${uo}` : row?.balcao}</TableCell>
                <TableCell align="center">{ptDateTime(row?.data_inicio) || noDados('(Não definido)')}</TableCell>
                <TableCell align="center">{ptDateTime(row?.data_termino) || noDados('(Não definido)')}</TableCell>
                <CellChecked check={row?.ativo} />
                <Actions row={row} setItem={setItem} />
              </TableRow>
            );
          })}
          {(!dados || dados?.length === 0) && <SemDados />}
        </TableBody>
      </Table>
      {(item?.action === 'add' || item?.action === 'editar') && (
        <BalcaoForm id={id} item={item} onClose={() => setItem(null)} />
      )}
      {item?.action === 'detalhes' && <Detalhes dados={item} onClose={() => setItem(null)} />}
      {item?.action === 'eliminar' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setItem(null)}
          desc="eliminar este balcão da lista de balcões representados"
          handleOk={() => dispatch(deleteItem('balcoes', { id: item?.id, ...params }))}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

SubtiposGarantias.propTypes = { id: PropTypes.string, dados: PropTypes.array };

export function SubtiposGarantias({ id, dados = [] }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { isSaving } = useSelector((state) => state.gaji9);
  const params = { item1: 'selectedItem', garantiaId: id, msg: 'Subtipo  eliminado', onClose: () => setItem(null) };

  return (
    <>
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell size="small">Designação</TableCell>
            <TableCell size="small">Descritivo</TableCell>
            <TableCell size="small" width={10}>
              <Stack direction="row" justifyContent="right">
                {!!id && <DefaultAction button label="ADICIONAR" small onClick={() => setItem({ action: 'add' })} />}
              </Stack>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${id}_${index}`}>
              <TableCell>{row?.designacao || noDados('(Não definido)')}</TableCell>
              <TableCell>{row?.descritivo || noDados('(Não definido)')}</TableCell>
              <Actions row={row} setItem={setItem} />
            </TableRow>
          ))}
          {(!dados || dados?.length === 0) && <SemDados />}
        </TableBody>
      </Table>
      {(item?.action === 'add' || item?.action === 'editar') && (
        <SubtiposForm id={id} item={item} onClose={() => setItem(null)} />
      )}
      {item?.action === 'detalhes' && <Detalhes dados={item} onClose={() => setItem(null)} />}
      {item?.action === 'eliminar' && (
        <DialogConfirmar
          isSaving={isSaving}
          onClose={() => setItem(null)}
          desc="eliminar este subtipo da garantia"
          handleOk={() => dispatch(deleteItem('subtipos', { id: item?.id, ...params }))}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

Detalhes.propTypes = { onClose: PropTypes.func, dados: PropTypes.object };

function Detalhes({ dados, onClose }) {
  return (
    <Dialog open fullWidth onClose={onClose} maxWidth="sm">
      <DialogTitleAlt title="Detalhes" onClose={onClose} />
      <DialogContent>
        <DetalhesContent dados={dados} />
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

Actions.propTypes = { setItem: PropTypes.func, row: PropTypes.object };

function Actions({ row, setItem }) {
  return (
    <TableCell>
      <Stack direction="row" spacing={0.5} justifyContent="right">
        {row?.ativo && (
          <>
            <DefaultAction small label="EDITAR" onClick={() => setItem({ action: 'editar', ...row })} />
            <DefaultAction small label="ELIMINAR" onClick={() => setItem({ action: 'eliminar', ...row })} />
          </>
        )}
        <DefaultAction small label="DETALHES" onClick={() => setItem({ action: 'detalhes', ...row })} />
      </Stack>
    </TableCell>
  );
}

// ----------------------------------------------------------------------

CellHeader.propTypes = { dados: PropTypes.object };

function CellHeader({ dados }) {
  return (
    <TableCell size="small" align={dados?.center ? 'center' : 'left'}>
      {dados?.label}
    </TableCell>
  );
}

// ----------------------------------------------------------------------

function SemDados() {
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <SearchNotFoundSmall message="Nenhum registo disponível..." />
      </TableCell>
    </TableRow>
  );
}
