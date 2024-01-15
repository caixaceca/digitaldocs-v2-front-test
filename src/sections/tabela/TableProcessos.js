import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import TableContainer from '@mui/material/TableContainer';
// utils
import { estadoInicial } from '../../utils/validarAcesso';
import { fToNow, ptDateTime } from '../../utils/formatTime';
import { normalizeText, entidadesParse, noDados } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetItem, selectItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import { Criado } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { AddItem, ViewItem, Pendente } from '../../components/Actions';
import { SearchToolbarProcessos } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { ColocarPendente } from '../processo/IntervencaoForm';

// ----------------------------------------------------------------------

TableProcessos.propTypes = { from: PropTypes.string };

export default function TableProcessos({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, processos } = useSelector((state) => state.digitaldocs);
  const [filter, setFilter] = useState(localStorage.getItem('filterP') || '');
  const [segmento, setSegmento] = useState(localStorage.getItem('segmento') || null);
  const [colaborador, setColaborador] = useState(localStorage.getItem('colaboradorP') || null);
  const { meuAmbiente, meusAmbientes, meuFluxo } = useSelector((state) => state.parametrizacao);
  const fromAgencia = cc?.uo?.tipo === 'Agências';
  const title =
    (from === 'tarefas' && 'Lista de tarefas') ||
    (from === 'finalizados' && 'Finalizados') ||
    (from === 'executados' && 'Executados') ||
    (from === 'atribuidos' && 'Atribuídos') ||
    (from === 'agendados' && 'Agendados') ||
    (from === 'pendentes' && 'Pendentes') ||
    (from === 'retidos' && 'Retidos') ||
    from;

  const {
    page,
    dense,
    order,
    onSort,
    orderBy,
    setPage,
    rowsPerPage,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'data_last_transicao',
    defaultOrder: cc?.id === 362 ? 'desc' : 'asc',
    defaultRowsPerPage: Number(localStorage.getItem('rowsPerPage') || (fromAgencia && 100) || 25),
  });

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && cc?.perfil_id) {
      setPage(0);
      dispatch(resetItem('processo'));
      dispatch(resetItem('processos'));
      dispatch(getAll(from, { mail, fluxoId: meuFluxo?.id, estadoId: meuAmbiente?.id, perfilId: cc?.perfil_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, meuAmbiente?.id, meuFluxo?.id, cc?.perfil_id, from, mail]);

  const handleAdd = () => {
    navigate(PATH_DIGITALDOCS.processos.novoProcesso);
  };

  const handleView = (id, isCC) => {
    if (isCC) {
      navigate(`${PATH_DIGITALDOCS.processos.root}/cc/${id}`);
    } else {
      navigate(`${PATH_DIGITALDOCS.processos.root}/${id}`);
    }
  };

  const handlePendente = (item) => {
    dispatch(selectItem(item));
  };

  const newList = [];
  const colaboradoresList = [];
  processos?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => Number(colaborador.perfil_id) === Number(row?.perfil_id));
    if (colaborador && !colaboradoresList.includes(colaborador?.perfil?.displayName)) {
      colaboradoresList.push(colaborador?.perfil?.displayName);
    }
    newList.push({ ...row, colaborador: colaborador?.perfil?.displayName || '' });
  });

  const dataFiltered = applySortFilter({
    from,
    filter,
    newList,
    segmento,
    colaborador,
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, segmento, colaborador, meuAmbiente?.id, meuFluxo?.id]);

  const TABLE_HEAD = [
    { id: 'nentrada', label: 'Nº', align: 'left' },
    { id: 'titular', label: 'Titular', align: 'left' },
    { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
    { id: 'assunto', label: 'Assunto', align: 'left' },
    {
      id:
        (from === 'pendentes' && 'motivo') ||
        ((from === 'retidos' || from === 'atribuidos') && 'colaborador') ||
        'nome',
      label:
        (from === 'pendentes' && 'Motivo') ||
        (from === 'retidos' && 'Retido em') ||
        (from === 'atribuidos' && 'Atribuído a') ||
        'Estado',
      align: 'left',
    },
    { id: 'data_last_transicao', label: 'Desde', align: 'center', width: 50 },
    { id: 'empty', width: 50 },
  ];

  return (
    <>
      <HeaderBreadcrumbs
        heading={title}
        links={[{ name: '' }]}
        sx={{ color: 'text.secondary', px: 1 }}
        action={estadoInicial(meusAmbientes) && <AddItem button handleClick={handleAdd} />}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarProcessos
          tab={from}
          filter={filter}
          segmento={segmento}
          setFilter={setFilter}
          setSegmento={setSegmento}
          colaborador={colaborador}
          setColaborador={setColaborador}
          colaboradoresList={colaboradoresList}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={TABLE_HEAD} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={7} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CircleIcon
                            sx={{
                              ml: -1.5,
                              width: 15,
                              height: 15,
                              color:
                                (row?.cor === 'verde' && 'text.success') ||
                                (row?.cor === 'vermelha' && 'text.error') ||
                                (row?.cor === 'amarela' && 'text.warning') ||
                                'text.focus',
                            }}
                          />
                          <Stack>{row.nentrada}</Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                      <TableCell>{row.conta || row.cliente || entidadesParse(row?.entidades) || noDados()}</TableCell>
                      <TableCell>{row?.assunto ? row.assunto : meuFluxo.assunto}</TableCell>
                      <TableCell>
                        {from === 'pendentes' && <Typography variant="body2">{row?.motivo}</Typography>}
                        {from === 'tarefas' && row.nome && row?.nome}
                        {from === 'tarefas' && !row.nome && meuAmbiente.nome}
                        {(from === 'retidos' || from === 'atribuidos') && row?.colaborador}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        {row?.data_last_transicao && (
                          <>
                            <Criado tipo="date" value={ptDateTime(row.data_last_transicao)} />
                            <Criado
                              tipo="time"
                              value={fToNow(row.data_last_transicao)?.replace('aproximadamente', 'aprox.')}
                            />
                          </>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {from === 'tarefas' && row?.nome?.includes('Atendimento') && (
                            <Pendente handleClick={() => handlePendente(row)} />
                          )}
                          <ViewItem handleClick={() => handleView(row?.id, row?.credito_colaborador)} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum processo disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && dataFiltered.length > 10 && (
          <TablePaginationAlt
            page={page}
            dense={dense}
            rowsPerPage={rowsPerPage}
            onChangePage={onChangePage}
            count={dataFiltered.length}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        )}
      </Card>
      <ColocarPendente from="tarefas" />
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newList, comparator, filter, segmento, colaborador, from }) {
  newList = applySort(newList, comparator);

  if (segmento === 'Particulares') {
    newList = newList.filter((row) => row?.segcliente === 'P');
  }
  if (segmento === 'Empresas') {
    newList = newList.filter((row) => row?.segcliente === 'E');
  }

  if ((from === 'atribuidos' || from === 'retidos') && colaborador) {
    newList = newList.filter((row) => row?.colaborador === colaborador);
  }

  if (filter) {
    newList = newList.filter(
      (row) =>
        (row?.nentrada && normalizeText(row?.nentrada).indexOf(normalizeText(filter)) !== -1) ||
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return newList;
}
