import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { idCheck } from '@/utils/formatObject';
import { ptDateTime } from '@/utils/formatTime';
import { PATH_DIGITALDOCS } from '@/routes/paths';
import useTable, { getComparator } from '@/hooks/useTable';
// redux
import { useDispatch, useSelector } from '@/redux/store';
import { setModal, deleteItem } from '@/redux/slices/parametrizacao';
// components
import Scrollbar from '@/components/Scrollbar';
import { DefaultAction } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import { DialogConfirmar } from '@/components/CustomDialog';
import HeaderBreadcrumbs from '@/components/HeaderBreadcrumbs';
import { SearchToolbarSimple } from '@/components/SearchToolbar';
import { CellChecked, DataLabel, noDados } from '@/components/Panel';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';
// guards
import RoleBasedGuard from '@/guards/RoleBasedGuard';
//
import { AcessoForm } from './ParametrizacaoForm';
import { EstadosPerfilForm } from './form-estado';
import { applySortFilter } from './applySortFilter';
// _mock
import { codacessos, objetos } from '@/_mock';

// ---------------------------------------------------------------------------------------------------------------------

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
  const { idAd } = useSelector((state) => state.intranet);
  const [filter, setFilter] = useState(localStorage.getItem('filterAcesso') || '');
  const { isLoading, isSaving, acessos, modalParams, estados, estadosPerfil, selectedItem } = useSelector(
    (state) => state.parametrizacao
  );

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      tab === 'acessos'
        ? acessos?.map((row) => ({
            ...row,
            nome: objetos.find(({ id }) => id === row?.objeto)?.label || row?.objeto,
            acessoLabel: codacessos.find(({ id }) => id === row.acesso)?.label || row.acesso,
          }))
        : estadosPerfil?.map((row) => ({
            ...row,
            nome: row?.nome || estados?.find(({ id }) => id === row?.estado_id)?.nome || row?.estado_id,
          })),
  });
  const isNotFound = !dataFiltered.length;

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleDelete = () => {
    const params = { id: selectedItem?.id, msg: `${tab === 'acessos' ? 'Acesso' : 'Estado'} eliminado` };
    dispatch(deleteItem(tab === 'acessos' ? tab : 'estadosPerfil', { ...params, onClose: () => dispatch(setModal()) }));
  };

  return (
    <>
      <HeaderBreadcrumbs
        sx={{ px: 1 }}
        heading={tab === 'acessos' ? 'Acessos' : 'Estados'}
        links={[
          { name: 'Indicadores', href: PATH_DIGITALDOCS.root },
          { name: 'Parametrização', href: PATH_DIGITALDOCS.parametrizacao.tabs },
          { name: tab === 'acessos' ? 'Acessos' : 'Estados' },
        ]}
        action={
          <RoleBasedGuard roles={['acesso-110', 'acesso-111', 'Todo-110', 'Todo-111']}>
            <DefaultAction button label="Adicionar" onClick={() => dispatch(setModal({ item: `form-${tab}` }))} />
          </RoleBasedGuard>
        }
      />
      <RoleBasedGuard hasContent roles={['acesso-110', 'acesso-111', 'Todo-110', 'Todo-111']}>
        <Card sx={{ p: 1 }}>
          <SearchToolbarSimple item="filterAcesso" filter={filter} setFilter={setFilter} />
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  onSort={onSort}
                  orderBy={orderBy}
                  headLabel={[
                    ...(tab === 'acessos'
                      ? [
                          { id: 'nome', label: 'Objeto' },
                          { id: 'acessoLabel', label: 'Acesso' },
                          { id: 'datalimite', label: 'Data de término', align: 'center' },
                        ]
                      : [
                          { id: 'nome', label: 'Nome' },
                          { id: '', label: 'Data' },
                          { id: 'padrao', label: 'Padrão', align: 'center' },
                          { id: 'gestor', label: 'Gestor', align: 'center' },
                          { id: 'observador', label: 'Observador', align: 'center' },
                        ]),
                    { id: '' },
                  ]}
                />
                <TableBody>
                  {isLoading && isNotFound ? (
                    <SkeletonTable column={tab === 'estados' ? 6 : 4} row={10} />
                  ) : (
                    dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                      <TableRow hover key={`${tab}_${index}`}>
                        {tab === 'acessos' ? (
                          <>
                            <TableCell>{row?.nome}</TableCell>
                            <TableCell>{row?.acessoLabel}</TableCell>
                            <TableCell align="center">
                              {ptDateTime(row.datalimite) || noDados('(Não definido)')}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{row.nome}</TableCell>
                            <TableCell>
                              <DataLabel data={row?.data_inicial || ''} />
                              <DataLabel data={row?.data_limite || ''} termino />
                            </TableCell>
                            <CellChecked check={row.padrao} />
                            <CellChecked check={row.gestor} />
                            <CellChecked check={row.observador} />
                          </>
                        )}
                        <TableCell align="center" width={10}>
                          {(idCheck(idAd) || dataVal(row?.datalimite || row?.data_limite)) && (
                            <Stack direction="row" spacing={0.5} justifyContent="right">
                              {idCheck(idAd) && (
                                <DefaultAction
                                  small
                                  label="ELIMINAR"
                                  onClick={() => dispatch(setModal({ item: 'eliminar-item', dados: row }))}
                                />
                              )}
                              <DefaultAction
                                small
                                label="EDITAR"
                                onClick={() => dispatch(setModal({ item: `form-${tab}`, dados: row, isEdit: true }))}
                              />
                            </Stack>
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

        {modalParams === 'form-acessos' && <AcessoForm onClose={() => dispatch(setModal())} perfilIdA={id} />}
        {modalParams === 'form-estados' && <EstadosPerfilForm onClose={() => dispatch(setModal())} perfilIdE={id} />}
        {modalParams === 'eliminar-item' && (
          <DialogConfirmar
            isSaving={isSaving}
            handleOk={handleDelete}
            onClose={() => dispatch(setModal())}
            desc={(tab === 'acessos' && 'eliminar este acesso') || 'eliminar este estado'}
          />
        )}
      </RoleBasedGuard>
    </>
  );
}

function dataVal(data) {
  return !data || (data && new Date(data) > new Date());
}
