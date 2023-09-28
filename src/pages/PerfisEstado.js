import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useSearchParams } from 'react-router-dom';
// @mui
import {
  Box,
  Card,
  Stack,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// utils
import { getFile } from '../utils/getFile';
import { ptDateTime } from '../utils/formatTime';
import { normalizeText } from '../utils/normalizeText';
import { nomeacaoBySexo } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, resetItem } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useToggle from '../hooks/useToggle';
import useSettings from '../hooks/useSettings';
import useTable, { getComparator, applySort } from '../hooks/useTable';
// components
import Page from '../components/Page';
import MyAvatar from '../components/MyAvatar';
import Scrollbar from '../components/Scrollbar';
import { SkeletonTable } from '../components/skeleton';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { TableToolbarPerfilEstados } from '../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';
// sections
import { PerfisEstadoForm } from '../sections/parametrizacao/ParametrizacaoForm';
// guards
import RoleBasedGuard from '../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'unidade_organica', label: 'Unidade orgânica', align: 'left' },
  { id: 'nomeacao_funcao', label: 'Nomeação/Função', align: 'left' },
  { id: 'data_inicial', label: 'Data de início', align: 'left' },
  { id: 'data_limite', label: 'Data de fim', align: 'left' },
];

// ----------------------------------------------------------------------

export default function PerfisEstado() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isLoading, estado, done } = useSelector((state) => state.digitaldocs);
  const { mail, colaboradores, cc, uos } = useSelector((state) => state.intranet);

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

  useEffect(() => {
    if (done === 'Perfil eliminado') {
      enqueueSnackbar('Perfil eliminado com sucesso', { variant: 'success' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const _uosList = ['Todos'];
  applySort(uos, getComparator('asc', 'label'))?.forEach((_uo) => {
    _uosList.push(_uo?.label);
  });

  useEffect(() => {
    if (mail && id && cc?.perfil_id) {
      dispatch(getItem('estado', { id, mail, perfilId: cc?.perfil_id }));
    }
    return () => dispatch(resetItem('estado'));
  }, [dispatch, cc?.perfil_id, mail, id]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const perfisAssociados = [];
  estado?.perfis?.forEach((row) => {
    const colabByPerfil = colaboradores?.find((colab) => colab?.perfil_id === row.perfil_id);
    if (colabByPerfil) {
      perfisAssociados.push({
        peid: row?.peid,
        uo: colabByPerfil?.uo,
        sexo: colabByPerfil?.sexo,
        data_limite: row?.data_limite,
        perfil: colabByPerfil?.perfil,
        data_inicial: row?.data_inicial,
        foto_disk: colabByPerfil?.foto_disk,
        nome: colabByPerfil?.perfil?.displayName,
        unidade_organica: colabByPerfil?.uo?.label,
        nomeacao_funcao: colabByPerfil?.nomeacao || colabByPerfil?.funcao,
      });
    }
  });

  const dataFiltered = applySortFilter({ perfisAssociados, comparator: getComparator(order, orderBy), filterSearch });
  const isNotFound = !dataFiltered.length;
  const title = estado?.nome ? `${estado.nome} » Colaboradores associados` : 'Colaboradores associados';

  return (
    <Page title="Acessos | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={title}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Parametrização', href: `${PATH_DIGITALDOCS.parametrizacao.tabs}?tab=estados&filter=` },
            { name: title },
          ]}
          action={
            <RoleBasedGuard roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
              <Button variant="soft" startIcon={<AddCircleIcon />} onClick={onOpen}>
                Adicionar
              </Button>
            </RoleBasedGuard>
          }
          sx={{ color: 'text.secondary' }}
        />

        <RoleBasedGuard
          hasContent
          roles={['acesso-110', 'acesso-111', 'perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}
        >
          <Card sx={{ p: 1 }}>
            {perfisAssociados.length > 1 && (
              <TableToolbarPerfilEstados
                options={_uosList}
                filterSearch={filterSearch}
                onFilterSearch={handleFilterSearch}
              />
            )}
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
                <Table size={dense ? 'small' : 'medium'}>
                  <TableHeadCustom order={order} orderBy={orderBy} headLabel={TABLE_HEAD} onSort={onSort} />
                  <TableBody>
                    {isLoading && isNotFound ? (
                      <SkeletonTable column={5} row={10} />
                    ) : (
                      dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow key={row?.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MyAvatar alt={row?.perfil?.displayName} src={getFile('colaborador', row?.foto_disk)} />
                              <Stack sx={{ ml: 2 }}>
                                <Typography variant="subtitle2" noWrap>
                                  {row?.perfil?.displayName}
                                </Typography>
                                <Typography
                                  noWrap
                                  variant="body2"
                                  sx={{ color: (theme) => theme.palette.text.disabled }}
                                >
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
                          <TableCell>{row.data_inicial ? ptDateTime(row.data_inicial) : 'Acesso permanente'}</TableCell>
                          <TableCell>{row.data_limite ? ptDateTime(row.data_limite) : 'Acesso permanente'}</TableCell>
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
                count={dataFiltered.length}
                onChangePage={onChangePage}
                onChangeDense={onChangeDense}
                onChangeRowsPerPage={onChangeRowsPerPage}
              />
            )}
          </Card>

          <PerfisEstadoForm isOpenModal={open} onCancel={onClose} estado={estado} />
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ perfisAssociados, comparator, filterSearch }) {
  const uo = filterSearch.get('uo') || 'Todos';
  const filter = filterSearch.get('filter') || '';
  const stabilizedThis = perfisAssociados.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  perfisAssociados = stabilizedThis.map((el) => el[0]);

  if (uo !== 'Todos' && uo !== null) {
    perfisAssociados = perfisAssociados.filter((row) => row?.uo?.label === uo);
  }

  if (filter && filter !== null) {
    perfisAssociados = perfisAssociados.filter(
      (row) =>
        (row?.perfil?.displayName && normalizeText(row?.perfil?.displayName).indexOf(normalizeText(filter)) !== -1) ||
        (row?.perfil?.mail && normalizeText(row?.perfil?.mail).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return perfisAssociados;
}
