import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import CircleIcon from '@mui/icons-material/Circle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { Card, Stack, Table, Button, TableRow, TableBody, TableCell, Typography, TableContainer } from '@mui/material';
// utils
import { fToNow, ptDateTime } from '../../utils/formatTime';
import { normalizeText, entidadesParse, noDados, parametrosPesquisa } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAll, resetItem, selectItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { ViewItem, Pendente } from '../../components/Actions';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarProcessos } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { ColocarPendente } from '../processo/IntervencaoForm';

// ----------------------------------------------------------------------

TableProcessos.propTypes = { from: PropTypes.string };

export default function TableProcessos({ from }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams();
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { isLoading, meuAmbiente, meusAmbientes, meuFluxo, processos } = useSelector((state) => state.digitaldocs);
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
    orderBy,
    setPage,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'data_last_transicao',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: cc?.id === 362,
    defaultOrder: cc?.id === 362 ? 'desc' : 'asc',
  });

  useEffect(() => {
    if (mail && meuAmbiente?.id && meuFluxo?.id && cc?.perfil_id) {
      dispatch(resetItem('processo'));
      dispatch(resetItem('processos'));
      setPage(0);
      dispatch(getAll(from, { mail, fluxoId: meuFluxo?.id, estadoId: meuAmbiente?.id, perfilId: cc?.perfil_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, meuAmbiente?.id, meuFluxo?.id, cc?.perfil_id, from, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=${from}${parametrosPesquisa(filter)}`);
  };

  const handlePendente = (item) => {
    dispatch(selectItem(item));
  };

  const podeAdicionar = () => {
    let i = 0;
    while (i < meusAmbientes?.length) {
      if (meusAmbientes[i]?.is_inicial) {
        return true;
      }
      i += 1;
    }
    return false;
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

  const dataFiltered = applySortFilter({ from, newList, filter, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

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
        action={
          podeAdicionar() && (
            <Button
              variant="soft"
              component={RouterLink}
              startIcon={<AddCircleIcon />}
              to={PATH_DIGITALDOCS.processos.novoProcesso}
            >
              Adicionar
            </Button>
          )
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarProcessos
          tab={from}
          filter={filter}
          setFilter={setFilter}
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
                        {from === 'pendentes' && (
                          <>
                            <Typography variant="body2">{row?.motivo}</Typography>
                            {row?.nome && (
                              <Label variant="ghost" color="default" sx={{ mt: 1 }}>
                                {row?.nome}
                              </Label>
                            )}
                          </>
                        )}
                        {from === 'tarefas' && row.nome && row?.nome}
                        {from === 'tarefas' && !row.nome && meuAmbiente.nome}
                        {(from === 'retidos' || from === 'atribuidos') && row?.colaborador}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        {row?.data_last_transicao && (
                          <>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CalendarTodayIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                              <Typography variant="caption" noWrap>
                                {ptDateTime(row.data_last_transicao)}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccessTimeOutlinedIcon sx={{ width: 15, height: 15, color: 'text.secondary' }} />
                              <Typography variant="caption" noWrap>
                                {fToNow(row.data_last_transicao)?.replace('aproximadamente', 'aprox.')}
                              </Typography>
                            </Stack>
                          </>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="right">
                          {from === 'tarefas' && row?.nome?.includes('Atendimento') && (
                            <Pendente handleView={() => handlePendente(row)} />
                          )}
                          <ViewItem handleView={() => handleViewRow(row?.id)} />
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

function applySortFilter({ newList, comparator, filter, from }) {
  const stabilizedThis = newList.map((el, index) => [el, index]);
  const text = filter.get('filter');
  const segmento = filter.get('segmento');
  const colaborador = filter.get('colaborador');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  newList = stabilizedThis.map((el) => el[0]);

  if (segmento === 'Particulares') {
    newList = newList.filter((row) => row?.segcliente === 'P');
  }
  if (segmento === 'Empresas') {
    newList = newList.filter((row) => row?.segcliente === 'E');
  }

  if ((from === 'atribuidos' || from === 'retidos') && colaborador) {
    newList = newList.filter((row) => row?.colaborador === colaborador);
  }

  if (text) {
    newList = newList.filter(
      (row) =>
        (row?.nentrada && normalizeText(row?.nentrada).indexOf(normalizeText(text)) !== -1) ||
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizeText(text)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(text)) !== -1) ||
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(text)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(text)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(text)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(text)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(text)) !== -1)
    );
  }

  return newList;
}
