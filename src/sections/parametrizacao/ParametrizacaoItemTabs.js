import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fPercent } from '../../utils/formatNumber';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { setItemValue, noDados } from '../../utils/normalizeText';
// hooks
import useModal from '../../hooks/useModal';
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import {
  openModal,
  selectItem,
  closeModal,
  setNotificacaoId,
  getFromParametrizacao,
} from '../../redux/slices/parametrizacao';
// Components
import { Criado } from '../../components/Panel';
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { AddItem, UpdateItem, ViewItem, Checked } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import {
  LinhaForm,
  RegraAnexoForm,
  RegraEstadoForm,
  NotificacaoForm,
  AnexoDespesaForm,
  DestinatarioForm,
  RegraTransicaoForm,
} from './ParametrizacaoForm';
import { Detalhes } from './Detalhes';
import { applySortFilter, listaTransicoes } from './applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD_DESPESA = [
  { id: 'designacao', label: 'Designação', align: 'left' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_ANEXO = [
  { id: 'designacao', label: 'Designação', align: 'left' },
  { id: 'obriga_prazo_validade', label: 'Prazo de validade', align: 'center' },
  { id: 'reutilizavel', label: 'Reutilizável', align: 'center' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_REGRAS_ANEXOS = [
  { id: 'designacao', label: 'Designação', align: 'left' },
  { id: 'assunto', label: 'Fluxo/Assunto/', align: 'left' },
  { id: 'obrigatorio', label: 'Obrigatório', align: 'center' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_LINHAS = [
  { id: 'linha', label: 'Linha', align: 'left' },
  { id: 'descricao', label: 'Segmento', align: 'left' },
  { id: '' },
];

const TABLE_HEAD_REGRAS_ESTADOS = [
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'percentagem', label: 'Percentagem', align: 'right' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_REGRAS_TRANSICOES = [
  { id: 'assunto', label: 'Fluxo/Assunto', align: 'left' },
  { id: 'estado', label: 'Origem', align: 'left' },
  { id: 'estado_final', label: 'Destino', align: 'left' },
  { id: 'nome', label: 'Colaborador', align: 'left' },
  { id: 'percentagem', label: 'Percentagem', align: 'right' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_NOTIFICACOES = [
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'corpo', label: 'Corpo', align: 'left' },
  { id: 'via', label: 'Via', align: 'left' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: 'criado_em', label: 'Registo', align: 'left' },
  { id: '' },
];

const TABLE_HEAD_DESTINATARIOS = [
  { id: 'email', label: 'Email', align: 'left' },
  { id: 'telefone', label: 'Telefone', align: 'left' },
  { id: 'data_inicio', label: 'Data inicial', align: 'center' },
  { id: 'data_termino', label: 'Data final', align: 'center' },
  { id: 'ativo', label: 'Ativo', align: 'center' },
  { id: 'criado_em', label: 'Registo', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

ParametrizacaoItemTabs.propTypes = { item: PropTypes.string };

export default function ParametrizacaoItemTabs({ item }) {
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { fluxo, fluxos, estados, notificacaoId } = useSelector((state) => state.parametrizacao);
  const fluxosList = fluxos?.map((row) => ({ id: row?.id, label: row?.assunto }));
  const transicoesList = useMemo(() => listaTransicoes(fluxo?.transicoes || [], estados), [estados, fluxo?.transicoes]);
  const [fluxoR, setFluxoR] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoRegras')))
  );
  const [transicao, setTransicao] = useState(
    transicoesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('transicaoRegras')))
  );
  const [currentTab, setCurrentTab] = useState(
    (item === 'anexos' && 'Anexos') ||
      (item === 'crédito' && 'Linhas de crédito') ||
      (item === 'pareceres' && 'Estados') ||
      (item === 'notificacoes' && 'Notificações')
  );
  const estadosList = estados?.map((row) => ({ id: row?.id, label: row?.nome }));
  const [estado, setEstado] = useState(
    estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoRegras')))
  );

  useEffect(() => {
    if (currentTab === 'Regras' && !fluxoR?.id && fluxosList && localStorage.getItem('fluxoRegras')) {
      setFluxoR(fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoRegras'))));
    }
  }, [currentTab, fluxoR?.id, fluxosList]);

  useEffect(() => {
    if (currentTab === 'Estados' && !estado?.id && estadosList && localStorage.getItem('estadoRegras')) {
      setEstado(estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoRegras'))));
    }
  }, [currentTab, estado?.id, estadosList]);

  useEffect(() => {
    if (currentTab === 'Anexos' && mail) {
      dispatch(getFromParametrizacao('anexos', { mail }));
    }
  }, [dispatch, currentTab, mail]);

  useEffect(() => {
    if (currentTab === 'Linhas de crédito' && mail && cc?.perfil_id) {
      dispatch(getFromParametrizacao('linhas', { mail, perfilId: cc?.perfil_id }));
    }
    if (currentTab === 'Despesas' && mail && cc?.perfil_id) {
      dispatch(getFromParametrizacao('despesas', { mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, currentTab, cc?.perfil_id, mail]);

  useEffect(() => {
    if (currentTab === 'Regras' && mail && fluxoR?.id && cc?.perfil_id) {
      dispatch(getFromParametrizacao('regrasAnexos', { mail, fluxoId: fluxoR?.id }));
      dispatch(getFromParametrizacao('fluxo', { id: fluxoR?.id, mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, currentTab, fluxoR?.id, cc?.perfil_id, mail]);

  useEffect(() => {
    if (currentTab === 'Estados' && mail && estado?.id && cc?.perfil_id) {
      dispatch(getFromParametrizacao('regrasEstado', { mail, estadoId: estado?.id }));
      dispatch(getFromParametrizacao('estado', { id: estado?.id, mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, currentTab, estado?.id, cc?.perfil_id, mail]);

  useEffect(() => {
    if ((currentTab === 'Transições' || currentTab === 'Notificações') && mail && fluxoR?.id && cc?.perfil_id) {
      dispatch(getFromParametrizacao('fluxo', { id: fluxoR?.id, mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, currentTab, fluxoR?.id, cc?.perfil_id, mail]);

  useEffect(() => {
    if (currentTab === 'Transições' && mail && transicao?.id && cc?.perfil_id) {
      dispatch(getFromParametrizacao('regrasTransicao', { id: transicao?.id, mail }));
      dispatch(getFromParametrizacao('estado', { id: transicao?.estadoInicial, mail, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, currentTab, transicao, mail, cc?.perfil_id]);

  useEffect(() => {
    if (currentTab === 'Notificações' && mail && transicao?.id) {
      dispatch(getFromParametrizacao('notificacoes', { id: transicao?.id, mail }));
    }
  }, [dispatch, currentTab, transicao?.id, mail]);

  useEffect(() => {
    if (currentTab === 'Destinatários' && mail && notificacaoId) {
      dispatch(getFromParametrizacao('destinatarios', { id: notificacaoId, mail }));
    }
  }, [dispatch, currentTab, notificacaoId, mail]);

  const handleChangeTab = async (event, newValue) => {
    setItemValue(newValue, setCurrentTab, '', false);
  };

  const tabsList = [
    ...(item === 'anexos'
      ? [
          { value: 'Anexos', component: <TableItem item="anexos" /> },
          { value: 'Regras', component: <TableItem item="regras anexos" /> },
        ]
      : []),
    ...(item === 'crédito'
      ? [
          { value: 'Linhas de crédito', component: <TableItem item="linhas" /> },
          { value: 'Despesas', component: <TableItem item="despesas" /> },
        ]
      : []),
    ...(item === 'pareceres'
      ? [
          { value: 'Estados', component: <TableItem item="regras estado" /> },
          { value: 'Transições', component: <TableItem item="regras transicao" transicao={transicao} /> },
        ]
      : []),
    ...(item === 'notificacoes'
      ? [
          {
            value: 'Notificações',
            component: <TableItem item="notificacoes" transicao={transicao} fluxo={fluxo} changeTab={setCurrentTab} />,
          },
          ...(notificacaoId ? [{ value: 'Destinatários', component: <TableItem item="destinatarios" /> }] : []),
        ]
      : []),
  ];

  return (
    <>
      <HeaderBreadcrumbs
        links={[{ name: '' }]}
        sx={{ color: 'text.secondary', px: 1 }}
        heading={
          (currentTab === 'Regras' && 'Regras de anexos') ||
          (item === 'pareceres' && 'Regras de pareceres') ||
          currentTab
        }
        action={
          <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {(currentTab === 'Regras' || currentTab === 'Transições' || currentTab === 'Notificações') && (
                <Autocomplete
                  fullWidth
                  size="small"
                  disableClearable
                  options={fluxosList}
                  value={fluxoR || null}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(event, newValue) => {
                    setItemValue(newValue, setFluxoR, 'fluxoRegras', true);
                    setItemValue(null, setTransicao, 'transicaoRegras', false);
                  }}
                  renderInput={(params) => <TextField {...params} label="Fluxo" sx={{ width: { md: 250 } }} />}
                />
              )}
              {(currentTab === 'Transições' || currentTab === 'Notificações') && (
                <Autocomplete
                  fullWidth
                  size="small"
                  disableClearable
                  options={transicoesList}
                  value={transicao || null}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(event, newValue) => setItemValue(newValue, setTransicao, 'transicaoRegras', true)}
                  renderInput={(params) => <TextField {...params} label="Transição" sx={{ width: { md: 250 } }} />}
                />
              )}
              {currentTab === 'Estados' && (
                <Autocomplete
                  fullWidth
                  size="small"
                  disableClearable
                  options={estadosList}
                  value={estado || null}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(event, newValue) => setItemValue(newValue, setEstado, 'estadoRegras', true)}
                  renderInput={(params) => <TextField {...params} label="Estado" sx={{ width: { md: 250 } }} />}
                />
              )}
              {(currentTab === 'Estados' && !estado) ||
              ((currentTab === 'Transições' || currentTab === 'notificacoes') && (!fluxo || !transicao)) ? (
                ''
              ) : (
                <AddItem />
              )}
            </Stack>
          </RoleBasedGuard>
        }
      />

      <RoleBasedGuard hasContent roles={['Todo-110', 'Todo-111']}>
        <TabsWrapperSimple tabsList={tabsList} currentTab={currentTab} changeTab={handleChangeTab} sx={{ mb: 3 }} />
        {tabsList.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

TableItem.propTypes = {
  item: PropTypes.string,
  fluxo: PropTypes.object,
  changeTab: PropTypes.func,
  transicao: PropTypes.object,
};

function TableItem({ item, transicao = null, fluxo = null, changeTab }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');
  const { handleCloseModal } = useModal(closeModal());
  const { colaboradores } = useSelector((state) => state.intranet);
  const {
    anexos,
    linhas,
    despesas,
    isLoading,
    regrasEstado,
    regrasAnexos,
    selectedItem,
    notificacoes,
    destinatarios,
    regrasTransicao,
  } = useSelector((state) => state.parametrizacao);

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleView = (dados) => {
    if (item === 'notificacoes') {
      dispatch(setNotificacaoId(dados?.id));
      changeTab('Destinatários');
    } else {
      dispatch(openModal('view'));
      dispatch(selectItem(dados));
    }
  };

  const dataFiltered = applySortFilter({
    filter,
    dados:
      (item === 'anexos' && anexos) ||
      (item === 'linhas' && linhas) ||
      (item === 'despesas' && despesas) ||
      (item === 'notificacoes' && notificacoes) ||
      (item === 'regras anexos' && regrasAnexos) ||
      (item === 'destinatarios' && destinatarios) ||
      (item === 'regras estado' &&
        regrasEstado?.map((row) => ({
          ...row,
          nome:
            colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
        }))) ||
      (item === 'regras transicao' && regrasTransicao) ||
      [],
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={
                  (item === 'anexos' && TABLE_HEAD_ANEXO) ||
                  (item === 'linhas' && TABLE_HEAD_LINHAS) ||
                  (item === 'despesas' && TABLE_HEAD_DESPESA) ||
                  (item === 'notificacoes' && TABLE_HEAD_NOTIFICACOES) ||
                  (item === 'destinatarios' && TABLE_HEAD_DESTINATARIOS) ||
                  (item === 'regras anexos' && TABLE_HEAD_REGRAS_ANEXOS) ||
                  (item === 'regras estado' && TABLE_HEAD_REGRAS_ESTADOS) ||
                  (item === 'regras transicao' && TABLE_HEAD_REGRAS_TRANSICOES) ||
                  []
                }
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={
                      (item === 'notificacoes' && 6) ||
                      ((item === 'regras transicao' || item === 'destinatarios') && 7) ||
                      ((item === 'regras anexos' || item === 'regras estado' || item === 'anexos') && 5) ||
                      3
                    }
                  />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'anexos' && (
                        <>
                          <TableCell>{row.designacao}</TableCell>
                          <TableCell align="center">
                            <Checked check={row.obriga_prazo_validade} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.reutilizavel} />
                          </TableCell>
                          <TableCell align="center">
                            <Checked check={row.ativo} />
                          </TableCell>
                        </>
                      )) ||
                        (item === 'despesas' && (
                          <>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.ativo} />
                            </TableCell>
                          </>
                        )) ||
                        (item === 'linhas' && (
                          <>
                            <TableCell>{row.linha}</TableCell>
                            <TableCell>{row.descricao}</TableCell>
                          </>
                        )) ||
                        (item === 'regras anexos' && (
                          <>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.obrigatorio} />
                            </TableCell>
                            <TableCell align="center">
                              <Checked check={row.ativo} />
                            </TableCell>
                          </>
                        )) ||
                        (item === 'regras estado' && (
                          <>
                            <TableCell>{row.estado}</TableCell>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="right">{fPercent(row.percentagem)}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.ativo} />
                            </TableCell>
                          </>
                        )) ||
                        (item === 'regras transicao' && (
                          <>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell>{row.estado}</TableCell>
                            <TableCell>{row.estado_final}</TableCell>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="right">{fPercent(row.percentagem)}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.ativo} />
                            </TableCell>
                          </>
                        )) ||
                        (item === 'notificacoes' && (
                          <>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell>
                              <Markdown own children={row.corpo} />
                            </TableCell>
                            <TableCell>{row.via}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.ativo} />
                            </TableCell>
                          </>
                        )) ||
                        (item === 'destinatarios' && (
                          <>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row?.telefone || noDados()}</TableCell>
                            <TableCell align="center">
                              {row.data_inicio ? ptDate(row.data_inicio) : 'Acesso permanente'}
                            </TableCell>
                            <TableCell align="center">
                              {row.data_fim ? ptDate(row.data_fim) : 'Acesso permanente'}
                            </TableCell>
                            <TableCell align="center">
                              <Checked check={row.ativo} />
                            </TableCell>
                          </>
                        ))}
                      {(item === 'notificacoes' || item === 'destinatarios') && (
                        <TableCell width={10}>
                          {row?.criado_em && <Criado tipo="time" value={ptDateTime(row.criado_em)} />}
                          {row?.criador && <Criado tipo="user" value={row.criador} />}
                          {row?.modificado_em && <Criado tipo="time" value={ptDateTime(row.modificado_em)} />}
                          {row?.modificador && <Criado tipo="user" value={row.modificador} />}
                        </TableCell>
                      )}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.75} justifyContent="right">
                          {item !== 'regras estado' && item !== 'regras transicao' && <UpdateItem dados={row} />}
                          {item !== 'linhas' && item !== 'destinatarios' && (
                            <ViewItem
                              handleClick={() => handleView(row)}
                              label={item === 'notificacoes' ? 'DESTINATÁRIOS' : ''}
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
            onChangePage={onChangePage}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>

      {selectedItem && <Detalhes item={item} closeModal={handleCloseModal} />}
      {(item === 'anexos' && <AnexoDespesaForm item="Anexo" onCancel={handleCloseModal} />) ||
        (item === 'despesas' && <AnexoDespesaForm item="Despesa" onCancel={handleCloseModal} />) ||
        (item === 'regras anexos' && <RegraAnexoForm onCancel={handleCloseModal} />) ||
        (item === 'linhas' && <LinhaForm onCancel={handleCloseModal} />) ||
        (item === 'regras estado' && <RegraEstadoForm onCancel={handleCloseModal} />) ||
        (item === 'regras transicao' && <RegraTransicaoForm onCancel={handleCloseModal} transicao={transicao} />) ||
        (item === 'notificacoes' && (
          <NotificacaoForm onCancel={handleCloseModal} transicao={transicao} fluxo={fluxo} />
        )) ||
        (item === 'destinatarios' && <DestinatarioForm onCancel={handleCloseModal} />)}
    </>
  );
}
