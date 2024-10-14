import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '../utils/formatTime';
import { nomeacaoBySexo } from '../utils/validarAcesso';
// redux
import { useDispatch, useSelector } from '../redux/store';
import { getFromParametrizacao } from '../redux/slices/parametrizacao';
// routes
import { PATH_DIGITALDOCS } from '../routes/paths';
// hooks
import useToggle from '../hooks/useToggle';
import useSettings from '../hooks/useSettings';
import useTable, { getComparator } from '../hooks/useTable';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import { AddItem } from '../components/Actions';
import { SkeletonTable } from '../components/skeleton';
import { ColaboradorInfo, Checked } from '../components/Panel';
import HeaderBreadcrumbs from '../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../components/table';
// sections
import { applySortFilter } from '../sections/parametrizacao/applySortFilter';
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
  { id: 'observador', label: 'Observador', align: 'center' },
];

// ----------------------------------------------------------------------

export default function PerfisEstado() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, colaboradores, perfilId } = useSelector((state) => state.intranet);
  const { isLoading, estado, done } = useSelector((state) => state.parametrizacao);
  const [filter, setFilter] = useState(localStorage.getItem('filterAcesso') || '');

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

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (mail && id && perfilId) {
      dispatch(getFromParametrizacao('estado', { id, mail, perfilId }));
    }
  }, [dispatch, perfilId, mail, id]);

  const perfisAssociados = [];
  estado?.perfis?.forEach((row) => {
    const colabByPerfil = colaboradores?.find((colab) => colab?.perfil_id === row.perfil_id);
    if (colabByPerfil) {
      perfisAssociados.push({
        peid: row?.peid,
        uo: colabByPerfil?.uo,
        sexo: colabByPerfil?.sexo,
        observador: row?.observador,
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

  const dataFiltered = applySortFilter({ dados: perfisAssociados, comparator: getComparator(order, orderBy), filter });
  const isNotFound = !dataFiltered.length;
  const title = estado?.nome ? `${estado.nome} » Colaboradores associados` : 'Colaboradores associados';

  return (
    <Page title="Acessos | DigitalDocs">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <HeaderBreadcrumbs
          heading={title}
          links={[
            { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
            { name: 'Parametrização', href: `${PATH_DIGITALDOCS.parametrizacao.tabs}` },
            { name: title },
          ]}
          action={
            <RoleBasedGuard roles={['estado-110', 'estado-111', 'Todo-110', 'Todo-111']}>
              <AddItem handleClick={onOpen} />
            </RoleBasedGuard>
          }
          sx={{ color: 'text.secondary' }}
        />

        <RoleBasedGuard
          hasContent
          roles={['acesso-110', 'acesso-111', 'perfilestado-110', 'perfilestado-111', 'Todo-110', 'Todo-111']}
        >
          <Card sx={{ p: 1 }}>
            <SearchToolbarSimple item="filterAcesso" filter={filter} setFilter={setFilter} />
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
                            <ColaboradorInfo
                              foto={row?.foto_disk}
                              label={row?.uo?.label}
                              nome={row?.perfil?.displayName || `Perfil: ${row.perfil_id}`}
                            />
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
                          <TableCell align="center" width={10}>
                            <Checked check={row.observador} />
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
                count={dataFiltered.length}
                onChangePage={onChangePage}
                onChangeDense={onChangeDense}
                onChangeRowsPerPage={onChangeRowsPerPage}
              />
            )}
          </Card>

          {open && <PerfisEstadoForm onCancel={onClose} estado={estado} />}
        </RoleBasedGuard>
      </Container>
    </Page>
  );
}
