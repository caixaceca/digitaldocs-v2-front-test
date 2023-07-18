import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, TableRow, TableBody, TableCell, Typography, TableContainer } from '@mui/material';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { entidadesParse, noDados, parametrosPesquisa } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import { ViewItem } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import applySortFilter from './applySortFilter';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'colaborador', label: 'Criado por', align: 'left' },
  { id: 'trabalhado_em', label: 'Modificado em', align: 'center' },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

export default function TablePorConcluir() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams({ tab: 'porconcluir' });
  const { porConcluir, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, cc } = useSelector((state) => state.intranet);
  const fromAgencia = cc?.uo?.tipo === 'Agências';
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
    defaultOrderBy: 'trabalhado_em',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: cc?.id === 362,
    defaultOrder: cc?.id === 362 ? 'desc' : 'asc',
  });

  useEffect(() => {
    if (mail && cc?.perfil_id) {
      dispatch(getAll('porconcluir', { perfilId: cc?.perfil_id, mail }));
    }
  }, [dispatch, cc?.perfil_id, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=porconcluir${parametrosPesquisa(filter)}`);
  };

  const dados = [];
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
    if (row?.motivo && !estadosList.includes('Pendente')) {
      estadosList.push('Pendente');
    }
    if (row?.motivo && !estadosList.includes('Excepto Pendente')) {
      estadosList.push('Excepto Pendente');
    }
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    dados.push({ ...row, colaborador: colaborador?.perfil?.displayName });
  });

  const dataFiltered = applySortFilter({
    dados,
    filter: filter?.get('filter'),
    estado: filter?.get('estado'),
    assunto: filter?.get('assunto'),
    colaborador: filter?.get('colaborador'),
    comparator: getComparator(order, orderBy),
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs
        heading="Processos por concluir"
        links={[{ name: '' }]}
        action={''}
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          tab="porconcluir"
          filter={filter}
          setFilter={setFilter}
          estadosList={estadosList}
          assuntosList={assuntosList}
          colaboradoresList={colaboradoresList}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable column={8} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.nentrada}</TableCell>
                      <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                      <TableCell>{row.conta || row.cliente || entidadesParse(row?.entidades) || noDados()}</TableCell>
                      <TableCell>{row?.assunto}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{row?.nome}</Typography>
                        {row?.motivo && (
                          <Label variant="ghost" color="warning" sx={{ mt: 1 }}>
                            {row?.motivo}
                          </Label>
                        )}
                      </TableCell>
                      <TableCell>{row?.colaborador}</TableCell>
                      <TableCell align="center" sx={{ width: 10 }}>
                        {row?.trabalhado_em && (
                          <Typography noWrap variant="body2">
                            {ptDateTime(row.trabalhado_em)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <ViewItem handleView={() => handleViewRow(row?.id)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum processo por concluir disponível..." />
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
    </>
  );
}
