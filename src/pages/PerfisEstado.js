import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useSearchParams } from 'react-router-dom';
// @mui
import {
  Box,
  Fab,
  Card,
  Stack,
  Table,
  Button,
  Avatar,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// utils
import { BASEURL } from '../utils/axios';
import { ptDateTime } from '../utils/formatTime';
import { nomeacaoBySexo } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getItem, resetItem, deleteItem, selectAnexo, closeModalAnexo } from '../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useToggle from '../hooks/useToggle';
import useSettings from '../hooks/useSettings';
import useTable, { getComparator, applySort } from '../hooks/useTable';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SvgIconStyle from '../components/SvgIconStyle';
import { SkeletonTable } from '../components/skeleton';
import DialogConfirmar from '../components/DialogConfirmar';
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
  { id: '' },
];

// ----------------------------------------------------------------------

export default function PerfisEstado() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const [filterSearch, setFilterSearch] = useSearchParams();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isLoading, isSaving, estado, done, isOpenModalAnexo, selectedAnexoId } = useSelector(
    (state) => state.digitaldocs
  );
  const { mail, colaboradores, currentColaborador, uos } = useSelector((state) => state.intranet);

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
    if (mail && id && currentColaborador?.perfil_id) {
      dispatch(getItem('estado', { id, mail, perfilId: currentColaborador?.perfil_id }));
    }
    return () => dispatch(resetItem('estado'));
  }, [dispatch, currentColaborador?.perfil_id, mail, id]);

  const handleFilterSearch = (event) => {
    setFilterSearch(event);
    setPage(0);
  };

  const handleDelete = (id) => {
    dispatch(selectAnexo(id));
  };

  const confirmDelete = () => {
    dispatch(
      deleteItem('perfil from estado', {
        mail,
        id: selectedAnexoId,
        mensagem: 'Perfil eliminado',
        perfilId: currentColaborador?.perfil_id,
      })
    );
  };

  const handleCloseModal = () => {
    dispatch(closeModalAnexo());
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
                      <SkeletonTable column={6} row={10} />
                    ) : (
                      dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow key={row?.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                alt={row?.perfil?.displayName || row?.perfil?.mail}
                                src={`${BASEURL}/colaborador/file/colaborador/${row?.foto_disk}`}
                              />
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
                          <TableCell align="center" width={50}>
                            <Tooltip title="Eliminar" arrow>
                              <Fab
                                color="error"
                                size="small"
                                variant="soft"
                                onClick={() => handleDelete(row?.peid)}
                                sx={{ width: 34, height: 34 }}
                              >
                                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 20, height: 20 }} />
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

            {!isNotFound && dataFiltered.length > 10 && (
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

          <PerfisEstadoForm isOpenModal={open} onCancel={onClose} estado={estado} />

          <DialogConfirmar
            isLoading={isSaving}
            open={isOpenModalAnexo}
            handleOk={confirmDelete}
            onClose={handleCloseModal}
            title="Eliminar perfil"
            desc="eliminar este perfil do estado"
          />
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
        (row?.perfil?.displayName &&
          row?.perfil?.displayName.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1) ||
        (row?.perfil?.mail && row?.perfil?.mail.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    );
  }

  return perfisAssociados;
}
