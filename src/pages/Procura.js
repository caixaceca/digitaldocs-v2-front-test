import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
} from '@mui/material';
// utils
import { ptDateTime, ptDate } from '../utils/formatTime';
import { normalizeText, entidadesParse, noDados } from '../utils/normalizeText';
// hooks
import useTable, { getComparator } from '../hooks/useTable';
// redux
import { useSelector } from '../redux/store';
// hooks
import useSettings from '../hooks/useSettings';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// components
import Page from '../components/Page';
import Panel from '../components/Panel';
import Scrollbar from '../components/Scrollbar';
import { SkeletonTable } from '../components/skeleton';
import { ViewItem, CriadoEmPor } from '../components/Actions';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { SearchToolbarProcura } from '../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nentrada', label: 'Nº', align: 'left' },
  { id: 'assunto', label: 'Assunto', align: 'left' },
  { id: 'titular', label: 'Titular', align: 'left' },
  { id: 'entidades', label: 'Conta/Cliente/Entidade(s)', align: 'left' },
  { id: 'estado', label: 'Estado', align: 'left' },
  { id: 'criado_em', label: 'Criado' },
  { id: 'empty' },
];

// ----------------------------------------------------------------------

export default function Procura() {
  const navigate = useNavigate();
  const { themeStretch } = useSettings();
  const [uo, setUo] = useState(localStorage.getItem('uoFSearch') || null);
  const [search, setSearch] = useState(localStorage.getItem('filterSearch') || '');
  const [estado, setEstado] = useState(localStorage.getItem('estadoSearch') || null);
  const [assunto, setAssunto] = useState(localStorage.getItem('assuntoSearch') || null);
  const { pesquisa, isLoading } = useSelector((state) => state.digitaldocs);
  const { colaboradores, cc, uos } = useSelector((state) => state.intranet);
  const fromAgencia = cc?.uo?.tipo === 'Agências';

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
  } = useTable({
    defaultOrderBy: 'noOrderDefault',
    defaultOrder: cc?.id === 362 ? 'desc' : 'asc',
    defaultRowsPerPage: localStorage.getItem('rowsPerPage') || (fromAgencia && 100) || 25,
  });

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uo, search, assunto, estado]);

  const handleViewRow = (id) => {
    navigate(`${PATH_DIGITALDOCS.processos.root}/${id}?from=procurar`);
  };

  const newPesquisa = [];
  const estadosList = [];
  const assuntosList = [];
  const uosorigemList = [];
  pesquisa?.forEach((row) => {
    const uo = uos?.find((uo) => uo?.id === row?.uo_origem_id);
    const colaborador = colaboradores?.find((colaborador) => colaborador?.perfil_id === row?.dono);
    if (uo && !uosorigemList.includes(uo?.label)) {
      uosorigemList.push(uo?.label);
    }
    if (!estadosList.includes(row?.estado)) {
      estadosList.push(row?.estado);
    }
    if (!assuntosList.includes(row?.assunto)) {
      assuntosList.push(row?.assunto);
    }
    newPesquisa?.push({
      ...row,
      uo: uo?.label,
      tipo: uo?.tipo,
      entidades: entidadesParse(row?.entidades),
      colaborador: colaborador?.perfil?.displayName,
    });
  });

  const dataFiltered = applySortFilter({
    newPesquisa,
    comparator: getComparator(order, orderBy),
    uo,
    search,
    estado,
    assunto,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <Page title="Pesquisa | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={1}>
              <Typography variant="h4">Resultado da procura [{pesquisa?.length || 0}]:</Typography>
              {localStorage.getItem('tipoPesquisa') === 'avancada' ? (
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap" sx={{ pt: 0.5 }}>
                  {localStorage.getItem('uoSearch') && (
                    <Panel label="Agência/U.O">
                      <Typography noWrap>
                        {uos?.find((row) => row?.id === Number(localStorage.getItem('uoSearch')))?.label}
                      </Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('colaboradorSearch') && (
                    <Panel label="Criado por">
                      <Typography noWrap>
                        {
                          colaboradores?.find(
                            (row) => row?.perfil_id === Number(localStorage.getItem('colaboradorSearch'))
                          )?.perfil?.displayName
                        }
                      </Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('conta') && (
                    <Panel label="Nº conta">
                      <Typography noWrap>{localStorage.getItem('conta')}</Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('cliente') && (
                    <Panel label="Nº cliente">
                      <Typography noWrap>{localStorage.getItem('cliente')}</Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('entidade') && (
                    <Panel label="Nº entidade">
                      <Typography noWrap>{localStorage.getItem('entidade')}</Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('nentrada') && (
                    <Panel label="Nº entrada">
                      <Typography noWrap>{localStorage.getItem('nentrada')}</Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('noperacao') && (
                    <Panel label="Nº operação">
                      <Typography noWrap>{localStorage.getItem('noperacao')}</Typography>
                    </Panel>
                  )}
                  {localStorage.getItem('dataISearch') && localStorage.getItem('dataFSearch') && (
                    <Panel label="Data">
                      <Typography noWrap>
                        {ptDate(localStorage.getItem('dataISearch'))} - {ptDate(localStorage.getItem('dataFSearch'))}
                      </Typography>
                    </Panel>
                  )}
                </Stack>
              ) : (
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {localStorage.getItem('search')}
                </Box>
              )}
            </Stack>
          }
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Processos', href: PATH_DIGITALDOCS.processos.root },
            { name: 'Procurar' },
          ]}
          action=""
          sx={{ color: 'text.secondary' }}
        />

        <Card sx={{ p: 1 }}>
          {newPesquisa.length > 1 && (
            <SearchToolbarProcura
              uo={uo}
              setUo={setUo}
              search={search}
              estado={estado}
              assunto={assunto}
              setSearch={setSearch}
              setEstado={setEstado}
              setAssunto={setAssunto}
              uosorigemList={uosorigemList}
              estadosList={estadosList}
              assuntosList={assuntosList}
            />
          )}
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={7} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow hover key={row.id}>
                        <TableCell>{row.nentrada}</TableCell>
                        <TableCell>{row.assunto}</TableCell>
                        <TableCell>{row?.titular ? row.titular : noDados()}</TableCell>
                        <TableCell>{row.conta || row.cliente || row?.entidades || noDados()}</TableCell>
                        <TableCell>{row.estado}</TableCell>
                        <TableCell sx={{ width: 10 }}>
                          {row?.criado_em && <CriadoEmPor tipo="time" value={ptDateTime(row.criado_em)} />}
                          {row?.uo && (
                            <CriadoEmPor
                              tipo="company"
                              value={row?.tipo === 'Agências' ? `Agência ${row?.uo}` : row?.uo}
                            />
                          )}
                          {row?.colaborador && <CriadoEmPor tipo="user" value={row.colaborador} />}
                        </TableCell>
                        <TableCell align="center" width={50}>
                          <ViewItem handleClick={() => handleViewRow(row?.id)} />
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
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ newPesquisa, comparator, uo, search, estado, assunto }) {
  const stabilizedThis = newPesquisa.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  newPesquisa = stabilizedThis.map((el) => el[0]);

  if (assunto) {
    newPesquisa = newPesquisa.filter((row) => row?.assunto === assunto);
  }
  if (estado) {
    newPesquisa = newPesquisa.filter((row) => row?.estado === estado);
  }
  if (uo) {
    newPesquisa = newPesquisa.filter((row) => row?.uo === uo);
  }
  if (search) {
    newPesquisa = newPesquisa.filter(
      (row) =>
        (row?.nentrada && normalizeText(row?.nentrada).indexOf(normalizeText(search)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(search)) !== -1) ||
        (row?.conta && normalizeText(row?.conta).indexOf(normalizeText(search)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(search)) !== -1) ||
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(search)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(search)) !== -1) ||
        (row?.noperacao && normalizeText(row?.noperacao).indexOf(normalizeText(search)) !== -1)
    );
  }

  return newPesquisa;
}
