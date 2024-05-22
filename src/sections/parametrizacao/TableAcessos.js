import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { ptDateTime } from '../../utils/formatTime';
import { emailCheck } from '../../utils/validarAcesso';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromParametrizacao, closeModal } from '../../redux/slices/parametrizacao';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { Checked } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { AddItem, UpdateItem } from '../../components/Actions';
import { Notificacao } from '../../components/NotistackProvider';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';
//
import { applySortFilter } from './applySortFilter';
import { AcessoForm, EstadosPerfilForm } from './ParametrizacaoForm';
// _mock
import { codacessos, objetos } from '../../_mock';

// ----------------------------------------------------------------------

const TABLE_HEAD_ACESSOS = [
  { id: 'nome', label: 'Objeto', align: 'left' },
  { id: 'acesso', label: 'Acesso', align: 'left' },
  { id: 'datalimite', label: 'Data de término', align: 'center' },
  { id: '' },
];

const TABLE_HEAD_ESTADOS = [
  { id: 'nome', label: 'Nome', align: 'left' },
  { id: 'data_inicial', label: 'Data de iníco', align: 'center' },
  { id: 'data_limite', label: 'Data de término', align: 'center' },
  { id: 'observador', label: 'Observador', align: 'center' },
  { id: '' },
];

// ----------------------------------------------------------------------

TableAcessos.propTypes = { tab: PropTypes.string };

export default function TableAcessos({ tab }) {
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

  const { id } = useParams();
  const dispatch = useDispatch();
  const { mail, cc } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem('filterAcesso') || '');
  const { done, error, acessos, isLoading, isOpenModal, estadosPerfil } = useSelector((state) => state.parametrizacao);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      tab === 'acessos'
        ? acessos?.map((row) => ({
            ...row,
            nome: objetos.find((item) => item?.id === row?.objeto)?.label || row?.objeto,
            acesso: codacessos.find((item) => item.id === row.acesso)?.label || row.acesso,
          }))
        : estadosPerfil,
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (mail && id && tab === 'acessos') {
      dispatch(getFromParametrizacao('acessos', { mail, perfilId: id }));
    }
  }, [dispatch, id, tab, mail]);

  useEffect(() => {
    if (mail && id && cc?.perfil_id && tab === 'estados') {
      dispatch(getFromParametrizacao('estadosPerfil', { mail, estadoId: id, perfilId: cc?.perfil_id }));
    }
  }, [dispatch, id, cc?.perfil_id, tab, mail]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading={tab === 'acessos' ? 'Acessos' : 'Estados'}
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: PATH_DIGITALDOCS.parametrizacao.tabs },
          { name: tab === 'acessos' ? 'Acessos' : 'Estados' },
        ]}
        action={
          <RoleBasedGuard roles={['acesso-110', 'acesso-111', 'Todo-110', 'Todo-111']}>
            <AddItem />
          </RoleBasedGuard>
        }
        sx={{ color: 'text.secondary', px: 1 }}
      />
      <RoleBasedGuard hasContent roles={['acesso-110', 'acesso-111', 'Todo-110', 'Todo-111']}>
        <Notificacao done={done} error={error} afterSuccess={handleCloseModal} />
        <Card sx={{ p: 1 }}>
          <SearchToolbarSimple item="filterAcesso" filter={filter} setFilter={setFilter} />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  onSort={onSort}
                  orderBy={orderBy}
                  headLabel={tab === 'acessos' ? TABLE_HEAD_ACESSOS : TABLE_HEAD_ESTADOS}
                />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={tab === 'estados' ? 5 : 4} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow hover key={`${tab}_${index}`}>
                        {tab === 'acessos' ? (
                          <>
                            <TableCell>{row?.nome}</TableCell>
                            <TableCell>{row?.acesso}</TableCell>
                            <TableCell align="center">
                              {row?.datalimite ? ptDateTime(row.datalimite) : 'Acesso permanente'}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell align="center">
                              {row?.data_inicial ? ptDateTime(row.data_inicial) : 'Acesso permanente'}
                            </TableCell>
                            <TableCell align="center">
                              {row?.data_limite ? ptDateTime(row.data_limite) : 'Acesso permanente'}
                            </TableCell>
                            <TableCell align="center" width={10}>
                              <Checked check={row.observador} />
                            </TableCell>
                          </>
                        )}
                        <TableCell align="center" width={10}>
                          {tab === 'acessos' &&
                            row.objeto !== 'Processo' &&
                            (!row?.datalimite || (row?.datalimite && new Date(row?.datalimite) > new Date())) && (
                              <UpdateItem item="acesso" id={row?.id} />
                            )}
                          {tab === 'estados' &&
                            (emailCheck(mail, 'vc.axiac@arove.ordnavi') ||
                              !row?.data_limite ||
                              (row?.data_limite && new Date(row?.data_limite) > new Date())) && (
                              <UpdateItem dados={row} />
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível..." />}
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

        {tab === 'acessos' ? (
          <AcessoForm isOpenModal={isOpenModal} onCancel={handleCloseModal} perfilId={id} />
        ) : (
          <EstadosPerfilForm onCancel={handleCloseModal} perfilId={id} />
        )}
      </RoleBasedGuard>
    </>
  );
}
