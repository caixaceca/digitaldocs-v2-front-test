import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, TableBody, TableContainer } from '@mui/material';
// utils
import { format } from 'date-fns';
import { UosAcesso } from '../../utils/validarAcesso';
import { parametrosPesquisa, paramsObject } from '../../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getAll } from '../../redux/slices/digitaldocs';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarEntradas } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { UoData, RowItem } from './Dados';
import applySortFilter from './applySortFilter';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'nome', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado', align: 'left', width: 50 },
  { id: 'empty', width: 50 },
];

// ----------------------------------------------------------------------

export default function TableEntradas() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams({ colaborador: '' });
  const [data, setData] = useState([
    filter?.get('datai') || format(new Date(), 'yyyy-MM-dd'),
    filter?.get('dataf') || format(new Date(), 'yyyy-MM-dd'),
  ]);
  const { mail, colaboradores, cc, uos } = useSelector((state) => state.intranet);
  const { entradas, meusAmbientes, isAdmin, isLoading } = useSelector((state) => state.digitaldocs);
  const uosList = UosAcesso(uos, cc, isAdmin, meusAmbientes);
  const perfilId = cc?.perfil_id;
  const fromAgencia = cc?.uo?.tipo === 'Agências';
  const [uo, setUo] = useState(
    filter?.get('uoId') ? uosList?.find((row) => row?.id?.toString() === filter?.get('uoId')?.toString()) : null
  );

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
    defaultOrder: 'desc',
    defaultOrderBy: 'nentrada',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: cc?.id === 362,
  });

  useEffect(() => {
    if (cc?.uo && !filter?.get('uoId')) {
      setFilter({ tab: 'entradas', ...paramsObject(filter), uoId: cc?.uo?.id });
      setUo({ id: cc?.uo?.id, label: cc?.uo?.label });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, cc?.uo]);

  useEffect(() => {
    if (mail && perfilId && uo?.id) {
      dispatch(getAll('entradas', { mail, uoId: uo?.id, perfilId, dataInicio: data[0], dataFim: data[1] }));
    }
  }, [dispatch, perfilId, uo?.id, mail, data]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=entradas${parametrosPesquisa(filter)}`);
  };

  const dados = [];
  const estadosList = [];
  const assuntosList = [];
  const colaboradoresList = [];
  entradas?.forEach((row) => {
    const colaborador = colaboradores?.find((colaborador) => Number(colaborador.perfil_id) === Number(row?.dono));
    if (colaborador && !colaboradoresList.includes(colaborador?.perfil?.displayName)) {
      colaboradoresList.push(colaborador?.perfil?.displayName);
    }
    if (!estadosList.includes(row?.nome)) {
      estadosList.push(row?.nome);
    }
    if (row?.nome === 'Arquivo' && !estadosList.includes('Excepto Arquivo')) {
      estadosList.push('Excepto Arquivo');
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
        heading="Entradas"
        links={[{ name: '' }]}
        action={
          <UoData
            uo={uo}
            entradas
            setUo={setUo}
            filter={filter}
            dataRange={data}
            setData={setData}
            uosList={uosList}
            setFilter={setFilter}
          />
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          tab="entradas"
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
                  <SkeletonTable column={7} row={10} />
                ) : (
                  dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => <RowItem row={row} key={`${row.id}_${index}`} handleViewRow={handleViewRow} />)
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhuma entrada disponível..." />
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
    </>
  );
}
