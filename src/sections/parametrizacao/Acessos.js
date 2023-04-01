import { useNavigate, useSearchParams } from 'react-router-dom';
// @mui
import {
  Box,
  Fab,
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
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
// utils
import { BASEURL } from '../../utils/axios';
import { nomeacaoBySexo } from '../../utils/validarAcesso';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useSelector } from '../../redux/store';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { TableToolbarPerfilEstados } from '../../components/SearchToolbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
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
  const { isLoading } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.colaborador);

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

  const [filterSearch, setFilterSearch] = useSearchParams();

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleUpdate = (id) => {
    navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/acesso/${id}`);
  };

  const colaboradoresByName = colaboradores.map((row) => ({
    nome: row?.perfil?.displayName,
    unidade_organica: row?.uo?.label,
    nomeacao_funcao: row.nomeacao || row?.funcao,
    sexo: row.sexo,
    foto_disk: row?.foto_disk,
    perfil: row?.perfil,
    uo: row?.uo,
  }));
  const dataFiltered = applySortFilter({
    colaboradoresByName,
    comparator: getComparator(order, orderBy),
    filterSearch,
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <HeaderBreadcrumbs heading="Acessos" links={[{ name: '' }]} action="" sx={{ color: 'text.secondary', px: 1 }} />

      <RoleBasedGuard
        hasContent
        roles={['acesso-110', 'acesso-111', 'perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}
      >
        <Card sx={{ p: 1 }}>
          <TableToolbarPerfilEstados filterSearch={filterSearch} onFilterSearch={handleFilterSearch} />
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
                              src={`${BASEURL}/colaborador/file/colaborador/${row?.foto_disk}`}
                              sx={{ boxShadow: (theme) => theme.customShadows.z8 }}
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
                            <Fab
                              size="small"
                              variant="soft"
                              color="success"
                              onClick={() => handleUpdate(row?.perfil?.id)}
                            >
                              <SwapHorizOutlinedIcon sx={{ height: 28, width: 28 }} />
                            </Fab>
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
      </RoleBasedGuard>
    </>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ colaboradoresByName, comparator, filterSearch }) {
  const uo = filterSearch.get('uo') || 'Todos';
  const filter = filterSearch.get('filter') || '';
  const stabilizedThis = colaboradoresByName.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  colaboradoresByName = stabilizedThis.map((el) => el[0]);

  if (uo !== 'Todos' && uo !== null) {
    colaboradoresByName = colaboradoresByName.filter((row) => row?.uo?.label === uo);
  }

  if (filter && filter !== null) {
    colaboradoresByName = colaboradoresByName.filter(
      (row) =>
        (row?.nome && row?.nome.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1) ||
        (row?.perfil?.mail && row?.perfil?.mail.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    );
  }

  return colaboradoresByName;
}
