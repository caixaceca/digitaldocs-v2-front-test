import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
// utils
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { newLineText, noDados } from '../../utils/formatText';
// redux
import { updateItem } from '../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../redux/store';
// components
import Label from '../../components/Label';
import { SearchNotFoundSmall } from '../../components/table';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import { DefaultAction, DTFechar } from '../../components/Actions';
import { CellChecked, ColaboradorInfo } from '../../components/Panel';
//
import { RecursoGrupoForm, UtilizadorGrupoForm } from './form-gaji9';
import { TableRowItem, LabelSN, Resgisto } from '../parametrizacao/Detalhes';

// ----------------------------------------------------------------------

DetalhesGaji9.propTypes = { closeModal: PropTypes.func, item: PropTypes.string };

export default function DetalhesGaji9({ closeModal, item }) {
  const { selectedItem } = useSelector((state) => state.gaji9);

  return (
    <Dialog open onClose={closeModal} fullWidth maxWidth={item === 'grupos' || item === 'clausulas' ? 'md' : 'sm'}>
      <DTFechar title="Detalhes" handleClick={() => closeModal()} />
      <DialogContent>
        {(item === 'grupos' && <GrupoDetail dados={selectedItem} />) ||
          (item === 'clausulas' && <ClausulaDetail dados={selectedItem} />) || (
            <DetalhesContent dados={selectedItem} item={item} />
          )}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

GrupoDetail.propTypes = { dados: PropTypes.object };

function GrupoDetail({ dados }) {
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
        changeTab={(_, newValue) => setCurrentTab(newValue)}
        sx={{ mt: 2, mb: 1 }}
      />
      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </>
  );
}

// ----------------------------------------------------------------------

ClausulaDetail.propTypes = { dados: PropTypes.object };

function ClausulaDetail({ dados }) {
  const [currentTab, setCurrentTab] = useState('Info');

  const tabsList = [
    { value: 'Info', component: <DetalhesContent dados={dados} /> },
    { value: 'Alíneas', component: <AlineasClausula dados={dados?.alineas} /> },
  ];

  return (
    <>
      {dados?.alineas?.length > 0 && (
        <TabsWrapperSimple
          tabsList={tabsList}
          sx={{ mt: 2, mb: 1 }}
          currentTab={currentTab}
          changeTab={(_, newValue) => setCurrentTab(newValue)}
        />
      )}
      {tabsList.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
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
      <Table size="small" sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>{recursos ? 'Recurso' : 'Utilizador'}</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>{recursos ? 'Permissões' : 'Função'}</TableCell>
            {recursos && (
              <TableCell align="center" width={10}>
                Ativo
              </TableCell>
            )}
            <TableCell width={10}>
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
                    {row?.permissoes?.map((item, index) => (
                      <Label
                        key={`${row?.id}_${item}_${id}_${index}`}
                        color={
                          (item === 'READ' && 'info') ||
                          (item === 'DELETE' && 'error') ||
                          (item === 'CREATE' && 'success') ||
                          (item === 'UPDATE' && 'warning') ||
                          'default'
                        }
                        endIcon={
                          <Tooltip title="ELIMINAR" arrow>
                            <Fab
                              color="error"
                              sx={{ width: 15, minHeight: 15, height: 15, m: 0.2 }}
                              onClick={() =>
                                dispatch(
                                  updateItem(
                                    'prg',
                                    JSON.stringify({ grupo_id: id, recurso_id: row?.recurso_id, permissao: item }),
                                    { grupoId: id }
                                  )
                                )
                              }
                            >
                              <CloseIcon />
                            </Fab>
                          </Tooltip>
                        }
                      >
                        {item}
                      </Label>
                    ))}
                  </Stack>
                ) : (
                  row?._role || noDados()
                )}
              </TableCell>
              {recursos && <CellChecked check={row.ativo} />}
              <TableCell>
                <DefaultAction
                  small
                  label="EDITAR"
                  color="warning"
                  handleClick={() => setItem({ action: 'edit', ...row })}
                />
              </TableCell>
            </TableRow>
          ))}
          {dados?.length === 0 && (
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

AlineasClausula.propTypes = { dados: PropTypes.object };

function AlineasClausula({ dados }) {
  return (
    <Stack sx={{ px: 0.5, mt: 3 }}>
      {dados?.map((row, index) => (
        <Stack direction="row" key={`alinea_${index}`} spacing={1} sx={{ py: 0.75 }}>
          <Typography variant="subtitle2">{row?.numero_ordem}.</Typography>
          <Stack>
            <Typography variant="body2">{newLineText(row?.conteudo)}</Typography>
            {row?.sub_alineas?.map((item, index1) => (
              <Stack direction="row" key={`alinea_${index}_alinea_${index1}`} spacing={1} sx={{ py: 0.25 }}>
                <Typography variant="subtitle2">{item?.numero_ordem}.</Typography>
                <Typography variant="body2">{newLineText(item?.conteudo)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

// ----------------------------------------------------------------------

DetalhesContent.propTypes = { dados: PropTypes.object, item: PropTypes.string };

export function DetalhesContent({ dados = null, item = '' }) {
  const { isLoading } = useSelector((state) => state.gaji9);

  return (
    <>
      {!dados && isLoading ? (
        <Stack justifyContent="space-between" alignItems="center" spacing={3} sx={{ pt: 2 }}>
          <Skeleton variant="text" sx={{ height: 180, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 140, width: 1, transform: 'scale(1)' }} />
          <Skeleton variant="text" sx={{ height: 100, width: 1, transform: 'scale(1)' }} />
        </Stack>
      ) : (
        <>
          {dados ? (
            <>
              <List>
                <ListItem disableGutters divider sx={{ pb: 0 }}>
                  <Typography variant="subtitle1">Dados</Typography>
                </ListItem>
                <Table size="small">
                  <TableBody>
                    <TableRowItem title="ID:" text={dados?.id} />
                    <TableRowItem title="Utilizador ID:" text={dados?.utilizador_id} />
                    <TableRowItem title="Versão:" text={dados?.versao} />
                    {item === 'Minuta' && (
                      <TableRowItem
                        title="Estado:"
                        item={
                          <Label
                            color={
                              (dados?.revogado && 'error') ||
                              (dados?.em_vigor && 'success') ||
                              (dados?.em_analise && 'warning') ||
                              'default'
                            }
                          >
                            {(dados?.em_vigor && 'Em vigor') ||
                              (dados?.revogado && 'Revogado') ||
                              (dados?.em_analise && 'Em análise') ||
                              'Desconhecido'}
                          </Label>
                        }
                      />
                    )}
                    <TableRowItem
                      title="Secção:"
                      text={
                        (dados?.solta && 'Solta') ||
                        (dados?.seccao_identificacao && 'Secção de identificação') ||
                        (dados?.seccao_identificacao_caixa && 'Secção de identificação Caixa') ||
                        ''
                      }
                    />
                    <TableRowItem title="Nº entidade:" text={dados?.numero} />
                    <TableRowItem title="Código:" text={dados?.codigo} />
                    <TableRowItem title="Nome:" text={dados?.nome} />
                    <TableRowItem title="Tipo:" text={dados?.tipo} />
                    <TableRowItem title="Designação:" text={dados?.designacao} />
                    <TableRowItem title="Descrição:" text={dados?.descricao} />
                    <TableRowItem title="Telefone:" text={dados?.telefone} />
                    <TableRowItem title="Email:" text={dados?.email || dados?.utilizador_email} />
                    <TableRowItem title="Capital social:" text={dados?.capital_social} />
                    <TableRowItem title="Balcão:" text={dados?.balcao} />
                    <TableRowItem title="Função:" text={dados?.funcao || dados?._role} />
                    <TableRowItem title="Atua como:" text={dados?.atua_como} />
                    <TableRowItem title="Estado civil:" text={dados?.estado_civil} />
                    <TableRowItem title="Documento:" text={dados?.documento} />
                    {dados?.descritivo && (
                      <TableRowItem
                        title="Descritivo:"
                        text={`${dados?.descritivo}${dados?.documento_tipo ? ` (${dados?.documento_tipo})` : ''}`}
                      />
                    )}
                    <TableRowItem title="Doc. identificação:" text={dados?.cni} />
                    <TableRowItem title="Local emissão:" text={dados?.local_emissao || dados?.emissor} />
                    <TableRowItem title="Prefixo:" text={dados?.prefixo} />
                    <TableRowItem title="Sufixo:" text={dados?.sufixo} />
                    <TableRowItem title="Rótulo:" text={dados?.rotulo} />
                    <TableRowItem title="Título:" text={dados?.titulo} />
                    <TableRowItem title="Subtítulo:" text={dados?.subtitulo} />
                    {dados?.numero_ordem > -1 && (
                      <TableRowItem
                        title="Nº ordem:"
                        text={`${dados?.numero_ordem}${dados?.descritivo_numero_ordem ? ` (${dados?.descritivo_numero_ordem})` : ''}`}
                      />
                    )}
                    <TableRowItem title="Tipo titular:" text={dados?.tipo_titular} id={dados?.tipo_titular_id} />
                    <TableRowItem title="Tipo garantia:" text={dados?.tipo_garantia} id={dados?.tipo_garantia_id} />
                    <TableRowItem title="Componente:" text={dados?.componente} id={dados?.componente_id} />
                    <TableRowItem title="Conteúdo:" text={dados?.conteudo} />
                    {dados?.data_emissao && <TableRowItem title="Data emissão:" text={ptDate(dados?.data_emissao)} />}
                    {dados?.valido_ate && <TableRowItem title="Validade:" text={ptDate(dados?.valido_ate)} />}
                    {dados?.data_inicio && <TableRowItem title="Data início:" text={ptDateTime(dados?.data_inicio)} />}
                    {dados?.data_termino && (
                      <TableRowItem title="Data emissão:" text={ptDateTime(dados?.data_termino)} />
                    )}
                    <TableRowItem title="NIF:" text={dados?.nif} />
                    <TableRowItem title="Freguesia:" text={dados?.freguesia} />
                    <TableRowItem title="Concelho:" text={dados?.concelho} />
                    <TableRowItem title="Residência:" text={dados?.residencia} />
                    <TableRowItem title="Naturalidade:" text={dados?.naturalidade} />

                    <TableRowItem title="Nº matricula:" text={dados?.num_matricula} />
                    <TableRowItem title="Local matricula:" text={dados?.local_matricula} />
                    <TableRowItem title="Email:" text={dados?.morada_eletronico} />
                    <TableRowItem title="Endereço:" text={dados?.morada_sede} />
                    {'consumidor' in dados && (
                      <TableRowItem title="Consumidor:" item={<LabelSN item={dados?.consumidor} />} />
                    )}
                    {'instituicao' in dados && (
                      <TableRowItem title="Intituição:" item={<LabelSN item={dados?.instituicao} />} />
                    )}
                    <TableRowItem
                      title="Data entrada em vigor:"
                      text={dados?.data_vigor ? ptDateTime(dados?.data_vigor) : ''}
                    />
                    <TableRowItem title="Publicado por:" text={dados?.cc_vigor} />
                    <TableRowItem
                      title="Data de revogação:"
                      text={dados?.data_revogado ? ptDateTime(dados?.data_revogado) : ''}
                    />
                    <TableRowItem title="Revogado por:" text={dados?.cc_revogado} />
                    {dados?.nota && <TableRowItem title="Observação:" text={newLineText(dados?.nota)} />}
                    {'ativo' in dados && <TableRowItem title="Ativo:" item={<LabelSN item={dados?.ativo} />} />}
                    <TableRowItem title="Observação:" text={dados?.obs || dados?.observacao} />
                  </TableBody>
                </Table>
              </List>
              {item !== 'componentes' && (
                <List>
                  <ListItem disableGutters divider sx={{ pb: 0.5 }}>
                    <Typography variant="subtitle1">Registo</Typography>
                  </ListItem>
                  <Stack useFlexGap flexWrap="wrap" direction="row" sx={{ pt: 1 }} spacing={2}>
                    <Resgisto
                      label={item === 'titulares' ? 'Carregado' : 'Criado'}
                      em={dados?.criado_em || dados?.carregado_em}
                      por={dados?.criador || dados?.criado_por || dados?.carregado_por}
                    />
                    <Resgisto
                      label={item === 'titulares' ? 'Recaregado' : 'Modificado'}
                      em={dados?.modificado_em || dados?.recarregado_em}
                      por={dados?.modificador || dados?.modificado_por || dados?.recarregado_por}
                    />
                  </Stack>
                </List>
              )}
            </>
          ) : (
            <SearchNotFoundSmall message="Item não disponível..." />
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
      <Typography sx={{ typography: 'caption', fontStyle: !data && 'italic', pr: !data && 0.15 }}>
        {data ? ptDateTime(data) : '(Não definido)'}
      </Typography>
    </Stack>
  );
}
