import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { useParametrizacaoData } from './use-data';
import { applySortFilter } from '../applySortFilter';
import useTable, { getComparator } from '@/hooks/useTable';
// components
import Scrollbar from '@/components/Scrollbar';
import { CellChecked } from '@/components/Panel';
import { DefaultAction } from '@/components/Actions';
import { SkeletonTable } from '@/components/skeleton';
import { SearchToolbarSimple } from '@/components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '@/components/table';
// sections
import Detalhes from '../details';
import { FluxoForm } from '../form-fluxo';
import { EstadoForm } from '../form-estado';
import PrecarioForm from '../forms/precario-form';
import { LinhaForm, OrigemForm, DespesaForm, DocumentoForm } from '../ParametrizacaoForm';
//
import { getItemConfig } from './itemConfig';

// ---------------------------------------------------------------------------------------------------------------------

const FORM_MAP = {
  linhas: LinhaForm,
  fluxos: FluxoForm,
  estados: EstadoForm,
  origens: OrigemForm,
  despesas: DespesaForm,
  precarios: PrecarioForm,
  documentos: DocumentoForm,
};

// ---------------------------------------------------------------------------------------------------------------------

export default function TableParametrizacao({ item }) {
  const [filter, setFilter] = useState(() => localStorage.getItem(`filter${item}`) || '');

  const { isLoading, isOpenView, isOpenModal, dados, handleView, closeModalAction } = useParametrizacaoData(item);
  const config = getItemConfig(item);

  const {
    page,
    order,
    dense,
    orderBy,
    setPage,
    rowsPerPage,
    onSort,
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
  } = useTable({ defaultOrder: 'asc', defaultOrderBy: config.defaultOrderBy });

  useEffect(() => {
    setFilter(localStorage.getItem(`filter${item}`) || '');
  }, [item]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  const dataFiltered = applySortFilter({ filter, dados, comparator: getComparator(order, orderBy) });
  const isNotFound = dataFiltered.length === 0;
  const FormComponent = FORM_MAP[item] ?? null;

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={config.headers} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={config.skeletonColumns} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {config.renderCells(row)}
                      {config.showAtivo && <CellChecked check={row?.is_ativo ?? row?.ativo} />}
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {config.canEdit && (
                            <DefaultAction small label="EDITAR" onClick={() => handleView(row, 'update')} />
                          )}
                          <DefaultAction small label="DETALHES" onClick={() => handleView(row, 'view')} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {!isLoading && isNotFound && (
                <TableSearchNotFound message="Não foi encontrado nenhum registo disponível..." />
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

      {isOpenView && <Detalhes item={item} closeModal={closeModalAction} />}
      {isOpenModal && FormComponent && <FormComponent onClose={closeModalAction} />}
    </>
  );
}
