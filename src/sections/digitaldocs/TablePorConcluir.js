import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
// @mui
import { Fab, Card, Table, Tooltip, TableRow, TableBody, TableCell, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Número', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'colaborador', label: 'Criado por', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'trabalhado_em', label: 'Modificado em', align: 'center' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function TablePorConcluir() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [estado, setEstado] = useState('');
  const [assunto, setAssunto] = useState('');
  const [colaborador, setColaborador] = useState('');
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { porConcluir, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, currentColaborador } = useSelector((state) => state.colaborador);

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
  } = useTable({ defaultOrderBy: 'criado_em', defaultOrder: currentColaborador?.id === 362 ? 'desc' : 'asc' });

  useEffect(() => {
    if (mail && currentColaborador?.perfil_id) {
      dispatch(getAll('porconcluir', { perfilId: currentColaborador?.perfil_id, mail }));
    }
  }, [dispatch, currentColaborador?.perfil_id, mail]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleFilterAssunto = (event) => {
    setAssunto(event);
    setPage(0);
  };

  const handleFilterEstado = (event) => {
    setEstado(event);
    setPage(0);
  };

  const handleFilterColaborador = (event) => {
    setColaborador(event);
    setPage(0);
  };

  const handleViewRow = (id) => {
    navigate({
      pathname: `${PATH_DIGITALDOCS.controle.root}/${id}`,
      search: createSearchParams({ from: 'porconcluir' }).toString(),
    });
  };

  const newList = [];
  const estadosList = [];
  const assuntosList = [];
  const colaboradoresList = [];
  porConcluir?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => Number(colaborador.perfil_id) === Number(row?.dono));
    if (colaborador && !colaboradoresList.includes(colaborador?.perfil?.displayName)) {
      colaboradoresList.push(colaborador?.perfil?.displayName);
    }
    if (!estadosList.includes(row?.nome)) {
      estadosList.push(row?.nome);
    }
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    newList.push({ ...row, colaborador: colaborador?.perfil?.displayName });
  });

  const dataFiltered = applySortFilter({
    newList,
    comparator: getComparator(order, orderBy),
    filterSearch,
    colaborador,
    estado,
    assunto,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Processos por concluir"
        links={[{ name: '' }]}
        action={''}
        sx={{ color: 'text.secondary', m: 0, px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          estado={estado}
          assunto={assunto}
          colaborador={colaborador}
          estadosList={estadosList}
          assuntosList={assuntosList}
          filterSearch={filterSearch}
          onFilterSearch={handleFilterSearch}
          onFilterEstado={handleFilterEstado}
          onFilterAssunto={handleFilterAssunto}
          colaboradoresList={colaboradoresList}
          onFilterColaborador={handleFilterColaborador}
          tab="porconcluir"
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={8} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    let _entidades = '';
                    row?.entidades?.split(';')?.forEach((_row, index) => {
                      _entidades += row?.entidades?.split(';')?.length - 1 === index ? _row : `${_row} / `;
                    });
                    return (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.titular}</TableCell>
                        <TableCell>
                          {(row?.conta && row.conta) || (row?.cliente && row.cliente) || _entidades}
                        </TableCell>
                        <TableCell>{row?.assunto}</TableCell>
                        <TableCell>{row?.colaborador}</TableCell>
                        <TableCell>{row?.nome}</TableCell>
                        <TableCell align="center">{row?.trabalhado_em && ptDateTime(row.trabalhado_em)}</TableCell>
                        <TableCell align="center" width={50}>
                          <Tooltip title="DETALHES" arrow>
                            <Fab color="success" size="small" variant="soft" onClick={() => handleViewRow(row?.id)}>
                              <SvgIconStyle src="/assets/icons/view.svg" />
                            </Fab>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhuma entrada disponível..." />
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        {!isNotFound && (
          <TablePaginationAlt
            dense={dense}
            onChangeDense={onChangeDense}
            onChangeRowsPerPage={onChangeRowsPerPage}
            onChangePage={onChangePage}
            page={page}
            rowsPerPage={rowsPerPage}
            count={dataFiltered.length}
          />
        )}
      </Card>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newList, comparator, filterSearch, colaborador, assunto, estado }) {
  const stabilizedThis = newList.map((el, index) => [el, index]);
  const text = filterSearch.get('filter');

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  newList = stabilizedThis.map((el) => el[0]);

  if (colaborador) {
    newList = newList.filter((row) => row?.colaborador === colaborador);
  }
  if (estado) {
    newList = newList.filter((row) => row?.nome === estado);
  }
  if (assunto) {
    newList = newList.filter((row) => row?.assunto === assunto);
  }
  if (text) {
    newList = newList.filter(
      (row) =>
        (row?.id && row?.id.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.conta && row?.conta.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.cliente && row?.cliente.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.titular && row?.titular.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1) ||
        (row?.entidades && row?.entidades.toString().toLowerCase().indexOf(text.toLowerCase()) !== -1)
    );
  }

  return newList;
}
