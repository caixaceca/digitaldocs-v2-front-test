import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Stack,
  Table,
  Avatar,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';
// utils
import { BASEURL } from '../../utils/axios';
import { normalizeText } from '../../utils/normalizeText';
import { nomeacaoBySexo } from '../../utils/validarAcesso';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { ViewItem } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableToolbarPerfilEstados } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'unidade_organica', label: 'Unidade orgânica', align: 'left' },
  { id: 'nomeacao_funcao', label: 'Nomeação/Função', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function Acessos() {
  const navigate = useNavigate();
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { isLoading } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.intranet);

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
  } = useTable({ defaultOrderBy: 'nome', defaultOrder: 'asc' });

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleUpdate = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/acesso/${id}`);
  };

  const colasByName = colaboradores.map((row) => ({
    uo: row?.uo,
    sexo: row.sexo,
    perfil: row?.perfil,
    foto_disk: row?.foto_disk,
    nome: row?.perfil?.displayName,
    unidade_organica: row?.uo?.label,
    nomeacao_funcao: row.nomeacao || row?.funcao,
  }));
  const dataFiltered = applySortFilter({ colasByName, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs heading="Acessos" links={[{ name: '' }]} action="" sx={{ color: 'text.secondary', px: 1 }} />

      <RoleBasedGuard
        hasContent
        roles={['acesso-110', 'acesso-111', 'perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}
      >
        <Card sx={{ p: 1 }}>
          {colasByName.length > 1 && (
            <TableToolbarPerfilEstados filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />
          )}
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={4} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row?.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              alt={row?.nome || row?.perfil?.mail}
                              sx={{ boxShadow: (theme) => theme.customShadows.z8 }}
                              src={row?.foto_disk && `${BASEURL}/colaborador/file/colaborador/${row?.foto_disk}`}
                            />
                            <Stack sx={{ ml: 2 }}>
                              <Typography variant="subtitle2" noWrap>
                                {row?.nome}
                              </Typography>
                              <Typography noWrap variant="body2" sx={{ color: (theme) => theme.palette.text.disabled }}>
                                {row?.perfil?.mail}
                              </Typography>
                            </Stack>
                          </Box>
                        </TableCell>
                        <TableCell align="left">
                          <Typography variant="subtitle2"> {row?.uo?.label}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Balcão nº {row?.uo?.balcao}
                          </Typography>
                        </TableCell>
                        <TableCell>{nomeacaoBySexo(row?.nomeacao_funcao, row?.sexo)}</TableCell>
                        <TableCell align="center" width={50}>
                          <Tooltip title="Gerir acessos" arrow>
                            <ViewItem swap handleClick={() => handleUpdate(row?.perfil?.id)} />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && (
                  <TableSearchNotFound message="Não foi encontrado nenhum colaborador disponível..." />
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
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ colasByName, comparator, filterSearch }) {
  const uo = filterSearch.get('uo') || 'Todos';
  const filter = filterSearch.get('filter') || '';
  const stabilizedThis = colasByName.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  colasByName = stabilizedThis.map((el) => el[0]);

  if (uo !== 'Todos' && uo !== null) {
    colasByName = colasByName.filter((row) => row?.uo?.label === uo);
  }

  if (filter && filter !== null) {
    colasByName = colasByName.filter(
      (row) =>
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.perfil?.mail && normalizeText(row?.perfil?.mail).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return colasByName;
}
