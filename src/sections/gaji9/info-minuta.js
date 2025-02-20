import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getSuccess, getFromGaji9, openModal, updateItem } from '../../redux/slices/gaji9';
// Components
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { CellChecked } from '../../components/Panel';
import { DialogConfirmar } from '../../components/CustomDialog';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { UpdateItem, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { GarantiasForm } from './form-minuta';
import { applySortFilter } from './applySortFilter';
import ClausulaForm, { OpcoesClausula } from './form-clausula';
import DetalhesGaji9, { DetalhesContent } from './DetalhesGaji9';

// ----------------------------------------------------------------------

export default function InfoMinuta() {
  const { minuta } = useSelector((state) => state.gaji9);

  return (
    <Card sx={{ p: 3, pt: 1 }}>
      <DetalhesContent dados={minuta} item="Minuta" />
    </Card>
  );
}

// ----------------------------------------------------------------------

TableInfoMinuta.propTypes = { item: PropTypes.string, onClose: PropTypes.func };

export function TableInfoMinuta({ item, onClose }) {
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
  } = useTable({});
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem(`filter_${item}`) || '');
  const { minuta, infoCaixa, isOpenModal, isOpenView, isSaving, idDelete, isLoading, isEdit } = useSelector(
    (state) => state.gaji9
  );

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados:
      (item === 'clausulas' && minuta?.clausulas) ||
      (item === 'tiposGarantias' && minuta?.tipos_garantias?.filter((row) => row?.ativo)) ||
      [],
  });
  const isNotFound = !dataFiltered.length;

  const params = useMemo(
    () => ({
      patch: true,
      item: 'minuta',
      id: minuta?.id,
      msg: 'Tipo de garantia eliminado',
      afterSuccess: () => dispatch(getSuccess({ item: 'idDelete', dados: false })),
    }),
    [minuta?.id, dispatch]
  );

  const eliminarTipoGarantia = () => {
    dispatch(updateItem('removerGaranMinuta', JSON.stringify({ tipos_garantias: [idDelete] }), params));
  };

  const viewActions = (modal, id) => {
    dispatch(openModal(modal));
    dispatch(getFromGaji9('clausula', { id, item: 'selectedItem' }));
  };

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter_${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headerTable(item)} />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={(item === 'tiposGarantias' && 3) || 4} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'tiposGarantias' && <TableCell>{row?.designacao}</TableCell>) ||
                        (item === 'clausulas' && (
                          <>
                            <TableCell>
                              {row?.numero_ordem}
                              {row?.descritivo_numero_ordem ? ` (${row?.descritivo_numero_ordem})` : ''}
                            </TableCell>
                            <TableCell>{row?.titulo || 'Cláusula solta'}</TableCell>
                          </>
                        ))}
                      <CellChecked check={row.ativo} />
                      <TableCell align="center" width={50}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          {item === 'clausulas' && minuta?.ativo && row?.ativo && (
                            <DefaultAction
                              label="OPÇÕES"
                              handleClick={() => dispatch(getSuccess({ item: 'infoCaixa', dados: row }))}
                            />
                          )}
                          {minuta?.ativo && minuta?.em_analise && (
                            <>
                              {item === 'tiposGarantias' && row.ativo && minuta?.ativo && (
                                <DefaultAction
                                  color="error"
                                  label="ELIMINAR"
                                  handleClick={() => dispatch(getSuccess({ item: 'idDelete', dados: row?.id }))}
                                />
                              )}
                              {item === 'clausulas' && row?.ativo && (
                                <UpdateItem handleClick={() => viewActions('update', row?.clausula_id)} />
                              )}
                            </>
                          )}
                          {item === 'clausulas' && (
                            <DefaultAction label="DETALHES" handleClick={() => viewActions('view', row?.clausula_id)} />
                          )}
                        </Stack>
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

      {isOpenView && <DetalhesGaji9 closeModal={onClose} item={item} />}
      {!!infoCaixa && (
        <OpcoesClausula
          minutaId={minuta?.id}
          onCancel={() => dispatch(getSuccess({ item: 'infoCaixa', dados: null }))}
        />
      )}
      {isOpenModal && (
        <>
          {item === 'tiposGarantias' && <GarantiasForm onCancel={onClose} />}
          {item === 'clausulas' && isEdit && <ClausulaForm onCancel={onClose} minutaId={minuta?.id} />}
        </>
      )}

      {!!idDelete && (
        <DialogConfirmar
          isSaving={isSaving}
          handleOk={() => eliminarTipoGarantia()}
          desc="eliminar este tipo de garantia associada a minuta"
          onClose={() => dispatch(getSuccess({ item: 'idDelete', dados: false }))}
        />
      )}
    </>
  );
}

function headerTable(item) {
  return [
    ...((item === 'tiposGarantias' && [{ id: 'designacao', label: 'Designação' }]) ||
      (item === 'clausulas' && [
        { id: 'numero_ordem', label: 'Nº ordem' },
        { id: 'titulo', label: 'Título' },
      ]) ||
      []),
    { id: 'ativo', label: 'Ativo', width: 10, align: 'center' },
    { id: '', width: 10, align: 'center' },
  ];
}
