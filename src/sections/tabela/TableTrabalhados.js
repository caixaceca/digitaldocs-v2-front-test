import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import { Card, Table, Stack, Divider, TableBody, TableContainer } from '@mui/material';
// utils
import { parametrosPesquisa } from '../../utils/normalizeText';
import { ColaboradoresAcesso, UosAcesso } from '../../utils/validarAcesso';
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
// sections
import ArquivoAnalytic from '../arquivo/ArquivoAnalytic';
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
  { id: 'trabalhado_em', label: 'Trabalhado', align: 'left', width: 50 },
  { id: '', width: 50 },
];

// ----------------------------------------------------------------------

export default function TableTrabalhados() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useSearchParams();
  const [data, setData] = useState(filter?.get('data') || format(new Date(), 'yyyy-MM-dd'));
  const { mail, colaboradores, cc, uos } = useSelector((state) => state.intranet);
  const { trabalhados, meusAmbientes, isAdmin, isLoading } = useSelector((state) => state.digitaldocs);
  const uosList = UosAcesso(uos, cc, isAdmin, meusAmbientes);
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
    defaultOrderBy: 'trabalhado_em',
    defaultRowsPerPage: fromAgencia ? 100 : 25,
    defaultDense: cc?.id === 362,
  });

  useEffect(() => {
    if (cc?.uo?.id && uosList && !uo?.id) {
      setUo(uosList?.find((row) => row?.id === cc?.uo?.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cc?.uo?.id, uosList]);

  useEffect(() => {
    if (mail && data && uo?.id) {
      dispatch(getAll('trabalhados', { mail, uoId: uo?.id, data }));
    }
  }, [dispatch, uo?.id, data, mail]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=trabalhados${parametrosPesquisa(filter)}`);
  };

  const dados = [];
  const estadosList = [];
  const assuntosList = [];
  const colaboradoresList = [];
  trabalhados?.forEach((row) => {
    const colaborador = colaboradores?.find((colab) => Number(colab.perfil_id) === Number(row?.perfil_id));
    if (colaborador && !colaboradoresList?.some((item) => item.id === colaborador.id)) {
      colaboradoresList.push(colaborador);
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

  const totalUo = dados?.length || 0;
  const totalAssunto = filter?.get('assunto')
    ? dados?.filter((row) => row?.assunto === filter?.get('assunto'))?.length
    : 0;
  const totalColab =
    (filter?.get('colaborador') &&
      filter?.get('assunto') &&
      dados?.filter(
        (row) => row?.perfil_id === filter?.get('colaborador') && row?.colaborador === filter?.get('assunto')
      )?.length) ||
    (filter?.get('colaborador') && dados?.filter((row) => row?.colaborador === filter?.get('colaborador'))?.length) ||
    0;

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
        heading="Processos trabalhados"
        links={[{ name: '' }]}
        action={
          <UoData
            uo={uo}
            setUo={setUo}
            filter={filter}
            dataSingle={data}
            setData={setData}
            uosList={uosList}
            setFilter={setFilter}
          />
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      {(uo?.label || filter?.get('colaborador') || filter?.get('assunto')) && totalUo > 0 && (
        <Card sx={{ mb: 3 }}>
          <Scrollbar>
            <Stack
              sx={{ py: 2 }}
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            >
              <ArquivoAnalytic
                title={`Total: ${uo?.label ? uo?.label : ''}`}
                total={totalUo}
                icon="/assets/icons/navbar/dashboard.svg"
                color="success.main"
              />
              {filter?.get('assunto') && (
                <ArquivoAnalytic
                  total={totalAssunto}
                  title={filter?.get('assunto')}
                  percent={totalAssunto === 0 || totalUo === 0 ? 0 : (totalAssunto * 100) / totalUo}
                />
              )}
              {filter?.get('colaborador') && (
                <ArquivoAnalytic
                  total={totalColab}
                  title={filter?.get('colaborador')}
                  percent={totalColab === 0 || totalUo === 0 ? 0 : (totalColab * 100) / totalUo}
                />
              )}
            </Stack>
          </Scrollbar>
        </Card>
      )}

      <Card sx={{ p: 1 }}>
        <SearchToolbarEntradas
          tab="trabalhados"
          filter={filter}
          setFilter={setFilter}
          estadosList={estadosList}
          assuntosList={assuntosList}
          colaboradoresList={ColaboradoresAcesso(colaboradoresList, cc, isAdmin, meusAmbientes)?.map(
            (row) => row?.label
          )}
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
                <TableSearchNotFound message="Não foi encontrado nenhum processo trabalhado disponível..." />
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
