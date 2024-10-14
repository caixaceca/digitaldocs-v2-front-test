import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fPercent } from '../../utils/formatNumber';
import { ptDate, ptDateTime } from '../../utils/formatTime';
import { setItemValue, noDados } from '../../utils/formatText';
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
import Markdown from '../../components/Markdown';
import Scrollbar from '../../components/Scrollbar';
import { Checked, Criado } from '../../components/Panel';
import { SkeletonTable } from '../../components/skeleton';
import { TabsWrapperSimple } from '../../components/TabsWrapper';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { AddItem, UpdateItem, DefaultAction } from '../../components/Actions';
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
  MotivoTransicaoForm,
  MotivoPendenciaForm,
} from './ParametrizacaoForm';
import { Detalhes } from './Detalhes';
import { applySortFilter, listaTransicoes } from './applySortFilter';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

ParametrizacaoItemTabs.propTypes = { item: PropTypes.string };

export default function ParametrizacaoItemTabs({ item }) {
  const dispatch = useDispatch();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { fluxo, fluxos, estados, notificacaoId } = useSelector((state) => state.parametrizacao);

  const estadosList = estados?.map((row) => ({ id: row?.id, label: row?.nome }));
  const transicoesList = useMemo(() => listaTransicoes(fluxo?.transicoes || [], estados), [estados, fluxo?.transicoes]);
  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })),
    [fluxos]
  );

  const [currentTab, setCurrentTab] = useState(
    (item === 'anexos' && 'Anexos') ||
      (item === 'pareceres' && 'Estados') ||
      (item === 'motivos' && 'Motivos transição') ||
      (item === 'crédito' && 'Linhas de crédito') ||
      (item === 'notificacoes' && 'Notificações')
  );
  const [fluxoR, setFluxoR] = useState(
    fluxosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('fluxoRegras')))
  );
  const [transicao, setTransicao] = useState(
    transicoesList?.find((row) => Number(row?.id) === Number(localStorage.getItem('transicaoRegras'))) || null
  );
  const [estado, setEstado] = useState(
    estadosList?.find((row) => Number(row?.id) === Number(localStorage.getItem('estadoRegras'))) || null
  );

  useEffect(() => {
    if (currentTab === 'Estados' && mail && estado?.id && perfilId) {
      dispatch(getFromParametrizacao('estado', { id: estado?.id, mail, perfilId }));
      dispatch(getFromParametrizacao('regrasEstado', { mail, estadoId: estado?.id }));
    }
  }, [dispatch, currentTab, estado?.id, perfilId, mail]);

  useEffect(() => {
    if (currentTab === 'Regras anexos' && mail && fluxoR?.id && perfilId) {
      dispatch(getFromParametrizacao('fluxo', { id: fluxoR?.id, mail, perfilId }));
      dispatch(getFromParametrizacao('regrasAnexos', { mail, fluxoId: fluxoR?.id }));
    }
    if ((currentTab === 'Transições' || currentTab === 'Notificações') && mail && fluxoR?.id && perfilId) {
      dispatch(getFromParametrizacao('fluxo', { id: fluxoR?.id, mail, perfilId }));
    }
  }, [dispatch, currentTab, fluxoR?.id, perfilId, mail]);

  useEffect(() => {
    if (currentTab === 'Transições' && mail && transicao?.id && perfilId) {
      dispatch(getFromParametrizacao('regrasTransicao', { id: transicao?.id, mail }));
      dispatch(getFromParametrizacao('estado', { id: transicao?.estadoInicial, mail, perfilId }));
    }
  }, [dispatch, currentTab, transicao, mail, perfilId]);

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
    ...((item === 'anexos' && tabItems('Anexos', 'Regras anexos', 'anexos', 'regras anexos')) ||
      (item === 'crédito' && tabItems('Linhas de crédito', 'Despesas', 'linhas', 'despesas')) ||
      (item === 'pareceres' && tabItems('Estados', 'Transições', 'regras estado', 'regras transicao')) ||
      (item === 'motivos' && [
        { value: 'Motivos transição', component: <TableItem item="motivos transicao" fluxo={fluxoR} /> },
        { value: 'Motivos pendência', component: <TableItem item="motivos pendencia" fluxo={fluxoR} /> },
      ]) ||
      (item === 'notificacoes' && [
        {
          value: 'Notificações',
          component: <TableItem item="notificacoes" transicao={transicao} fluxo={fluxo} changeTab={setCurrentTab} />,
        },
        ...(notificacaoId ? [{ value: 'Destinatários', component: <TableItem item="destinatarios" /> }] : []),
      ]) ||
      []),
  ];

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={currentTab}
        action={
          <RoleBasedGuard roles={['Todo-110', 'Todo-111']}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {(currentTab === 'Transições' ||
                currentTab === 'Notificações' ||
                currentTab === 'Regras anexos' ||
                currentTab === 'Motivos transição') && (
                <Autocomplete
                  fullWidth
                  size="small"
                  options={fluxosList}
                  value={fluxoR || null}
                  disableClearable={currentTab !== 'Motivos transição'}
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
              ((currentTab === 'Transições' || currentTab === 'Notificações') && (!fluxo || !transicao)) ? (
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
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const {
    anexos,
    linhas,
    despesas,
    isLoading,
    isOpenView,
    isOpenModal,
    regrasEstado,
    regrasAnexos,
    notificacoes,
    destinatarios,
    regrasTransicao,
    motivosTransicao,
    motivosPendencia,
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

  useEffect(() => {
    if (mail && perfilId && item) {
      dispatch(getFromParametrizacao(item, { mail, perfilId, fluxoId: fluxo?.id }));
    }
  }, [dispatch, perfilId, item, fluxo, mail]);

  const dataFiltered = applySortFilter({
    filter,
    dados:
      (item === 'anexos' && anexos) ||
      (item === 'linhas' && linhas) ||
      (item === 'despesas' && despesas) ||
      (item === 'notificacoes' && notificacoes) ||
      (item === 'regras anexos' && regrasAnexos) ||
      (item === 'destinatarios' && destinatarios) ||
      (item === 'motivos pendencia' && motivosPendencia) ||
      (item === 'motivos transicao' && motivosTransicao) ||
      (item === 'regras estado' && dadosComColaborador(regrasEstado, colaboradores)) ||
      (item === 'regras transicao' && dadosComColaborador(regrasTransicao, colaboradores)) ||
      [],
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  const handleView = (dados) => {
    if (item === 'notificacoes') {
      dispatch(setNotificacaoId(dados?.id));
      changeTab('Destinatários');
    } else if (item === 'motivos transicao') {
      dispatch(openModal('view'));
      dispatch(getFromParametrizacao('motivo transicao', { id: dados?.id, mail, perfilId }));
    } else {
      dispatch(openModal('view'));
      dispatch(selectItem(dados));
    }
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable
                    row={10}
                    column={
                      (item === 'linhas' && 5) ||
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
                        </>
                      )) ||
                        (item === 'linhas' && (
                          <>
                            <TableCell>{row.linha}</TableCell>
                            <TableCell>{row.descricao}</TableCell>
                          </>
                        )) ||
                        ((item === 'despesas' || item === 'motivos transicao') && (
                          <TableCell>{row.designacao}</TableCell>
                        )) ||
                        (item === 'motivos pendencia' && (
                          <>
                            <TableCell>{row.motivo}</TableCell>
                            <TableCell>{row.obs}</TableCell>
                          </>
                        )) ||
                        (item === 'regras anexos' && (
                          <>
                            <TableCell>{row.designacao}</TableCell>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell align="center">
                              <Checked check={row.obrigatorio} />
                            </TableCell>
                          </>
                        )) ||
                        ((item === 'regras estado' || item === 'regras transicao') && (
                          <>
                            {item === 'regras transicao' && <TableCell>{row.assunto}</TableCell>}
                            <TableCell>{row.estado}</TableCell>
                            {item === 'regras transicao' && <TableCell>{row.estado_final}</TableCell>}
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="right">{fPercent(row.percentagem)}</TableCell>
                          </>
                        )) ||
                        (item === 'notificacoes' && (
                          <>
                            <TableCell>{row.assunto}</TableCell>
                            <TableCell>
                              <Markdown own children={row.corpo} />
                            </TableCell>
                            <TableCell>{row.via}</TableCell>
                          </>
                        )) ||
                        (item === 'destinatarios' && (
                          <>
                            <TableCell>{row.email}</TableCell>
                            <TableCell align="center">{row?.telefone || noDados()}</TableCell>
                            <TableCell align="center">
                              {row.data_inicio ? ptDate(row.data_inicio) : 'Acesso permanente'}
                            </TableCell>
                            <TableCell align="center">
                              {row.data_fim ? ptDate(row.data_fim) : 'Acesso permanente'}
                            </TableCell>
                          </>
                        ))}
                      <TableCell align="center">
                        <Checked check={item === 'motivos pendencia' ? true : row.ativo} />
                      </TableCell>
                      {(item === 'notificacoes' || item === 'destinatarios' || item === 'linhas') && (
                        <TableCell width={10}>
                          {row?.criado_em && <Criado caption tipo="time" value={ptDateTime(row.criado_em)} />}
                          {row?.criador && <Criado caption tipo="user" value={row.criador} baralhar />}
                          {row?.modificado_em && row.modificador ? (
                            <Box sx={{ color: 'text.secondary' }}>
                              <Divider sx={{ my: 0.5 }} />
                              {row?.modificado_em && (
                                <Criado caption tipo="time" value={ptDateTime(row.modificado_em)} />
                              )}
                              {row?.modificador && <Criado caption tipo="user" value={row.modificador} baralhar />}
                            </Box>
                          ) : (
                            ''
                          )}
                        </TableCell>
                      )}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {((item !== 'regras estado' &&
                            item !== 'regras transicao' &&
                            item !== 'motivos transicao' &&
                            row?.ativo) ||
                            item === 'motivos pendencia') && <UpdateItem dados={row} />}
                          {item === 'motivos transicao' && <UpdateItem item="motivo transicao" id={row?.id} />}
                          {item !== 'linhas' && item !== 'destinatarios' && (
                            <DefaultAction
                              handleClick={() => handleView(row)}
                              label={item === 'notificacoes' ? 'DESTINATÁRIOS' : 'DETALHES'}
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

      {isOpenView && <Detalhes item={item} closeModal={handleCloseModal} />}
      {isOpenModal && (
        <>
          {item === 'linhas' && <LinhaForm onCancel={handleCloseModal} />}
          {item === 'regras anexos' && <RegraAnexoForm onCancel={handleCloseModal} />}
          {item === 'regras estado' && <RegraEstadoForm onCancel={handleCloseModal} />}
          {item === 'destinatarios' && <DestinatarioForm onCancel={handleCloseModal} />}
          {item === 'anexos' && <AnexoDespesaForm item="Anexo" onCancel={handleCloseModal} />}
          {item === 'motivos pendencia' && <MotivoPendenciaForm onCancel={handleCloseModal} />}
          {item === 'motivos transicao' && <MotivoTransicaoForm onCancel={handleCloseModal} />}
          {item === 'despesas' && <AnexoDespesaForm item="Despesa" onCancel={handleCloseModal} />}
          {item === 'regras transicao' && <RegraTransicaoForm onCancel={handleCloseModal} transicao={transicao} />}
          {item === 'notificacoes' && (
            <NotificacaoForm onCancel={handleCloseModal} transicao={transicao} fluxo={fluxo} />
          )}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function tabItems(label1, label2, item1, item2) {
  return [
    { value: label1, component: <TableItem item={item1} /> },
    { value: label2, component: <TableItem item={item2} /> },
  ];
}

function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
}

function headerTable(item) {
  return [
    ...((item === 'motivos pendencia' && [
      { id: 'motivo', label: 'Designação', align: 'left' },
      { id: 'obs', label: 'Observação', align: 'left' },
    ]) ||
      ((item === 'motivos transicao' || item === 'despesas') && [
        { id: 'designacao', label: 'Designação', align: 'left' },
      ]) ||
      (item === 'linhas' && [
        { id: 'linha', label: 'Linha', align: 'left' },
        { id: 'descricao', label: 'Segmento', align: 'left' },
      ]) ||
      (item === 'anexos' && [
        { id: 'designacao', label: 'Designação', align: 'left' },
        { id: 'obriga_prazo_validade', label: 'Prazo de validade', align: 'center' },
        { id: 'reutilizavel', label: 'Reutilizável', align: 'center' },
      ]) ||
      (item === 'regras anexos' && [
        { id: 'designacao', label: 'Designação', align: 'left' },
        { id: 'assunto', label: 'Assunto', align: 'left' },
        { id: 'obrigatorio', label: 'Obrigatório', align: 'center' },
      ]) ||
      (item === 'regras estado' && [
        { id: 'estado', label: 'Estado', align: 'left' },
        { id: 'nome', label: 'Colaborador', align: 'left' },
        { id: 'percentagem', label: 'Percentagem', align: 'right' },
      ]) ||
      (item === 'regras transicao' && [
        { id: 'assunto', label: 'Assunto', align: 'left' },
        { id: 'estado', label: 'Origem', align: 'left' },
        { id: 'estado_final', label: 'Destino', align: 'left' },
        { id: 'nome', label: 'Colaborador', align: 'left' },
        { id: 'percentagem', label: 'Percentagem', align: 'right' },
      ]) ||
      (item === 'notificacoes' && [
        { id: 'assunto', label: 'Assunto', align: 'left' },
        { id: 'corpo', label: 'Corpo', align: 'left' },
        { id: 'via', label: 'Via', align: 'left' },
      ]) ||
      (item === 'destinatarios' && [
        { id: 'email', label: 'Email', align: 'left' },
        { id: 'telefone', label: 'Telefone', align: 'center' },
        { id: 'data_inicio', label: 'Data inicial', align: 'center' },
        { id: 'data_termino', label: 'Data final', align: 'center' },
      ]) ||
      []),
    { id: 'ativo', label: 'Ativo', align: 'center' },
    ...(item === 'notificacoes' || item === 'destinatarios' || item === 'linhas'
      ? [{ id: 'criado_em', label: 'Registo', align: 'left' }]
      : []),
    { id: '' },
  ];
}
