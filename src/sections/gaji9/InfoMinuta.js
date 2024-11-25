import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
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
import { getSuccess } from '../../redux/slices/parametrizacao';
// Components
import { Checked } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { UpdateItem, DefaultAction } from '../../components/Actions';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter } from './applySortFilter';
import { DetalhesContent } from '../parametrizacao/Detalhes';
import MinutaForm from './MinutaForm';

// ----------------------------------------------------------------------

InfoEstado.propTypes = { onClose: PropTypes.func };

export default function InfoEstado({ onClose }) {
  const { minuta, isOpenModal } = useSelector((state) => state.gaji9);

  return (
    <>
      <Card sx={{ p: 3, pt: 1 }}>
        <DetalhesContent dados={minuta} item="Minuta" />
      </Card>
      {isOpenModal && <MinutaForm onCancel={() => onClose()} />}
    </>
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
  const { minuta, isOpenModal, isLoading } = useSelector((state) => state.gaji9);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: (item === 'tiposGarantias' && minuta?.tipos_garantias) || (item === 'clausulas' && minuta?.clausulas) || [],
  });
  const isNotFound = !dataFiltered.length;

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
                  <SkeletonTable column={(item === 'tiposGarantias' && 3) || 5} row={10} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      {(item === 'tiposGarantias' && <TableCell>{row?.designacao}</TableCell>) ||
                        (item === 'clausulas' && (
                          <>
                            <TableCell>{row?.titulo}</TableCell>
                            <TableCell align="center">{row?.numero_ordem}</TableCell>
                            <TableCell>{row?.descritivo_numero_ordem}</TableCell>
                          </>
                        ))}
                      <TableCell align="center" width={10}>
                        <Checked check={row.ativo} />
                      </TableCell>
                      {item === 'clausulas' && (
                        <TableCell align="center" width={50}>
                          <Stack direction="row" spacing={0.5} justifyContent="right">
                            <UpdateItem
                              handleClick={() => dispatch(getSuccess({ item: 'selectedItem', dados: row }))}
                            />
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
              {!isLoading && isNotFound && <TableSearchNotFound message="Nenhum registo disponível.." />}
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

      {isOpenModal && (
        <>
          {/* {item === 'tiposGarantias' && <RegraEstadoForm onCancel={onClose} />}
          {item === 'clausulas' && <PerfisEstadoForm onCancel={onClose} />} */}
        </>
      )}
    </>
  );
}

function headerTable(item) {
  return [
    ...((item === 'tiposGarantias' && [{ id: 'designacao', label: 'Designação', align: 'left' }]) ||
      (item === 'clausulas' && [
        { id: 'titulo', label: 'Colaborador', align: 'left' },
        { id: 'numero_ordem', label: 'Nº ordem', align: 'center' },
        { id: 'descritivo_numero_ordem', label: 'Desc Nº', align: 'center' },
      ]) ||
      []),
    { id: 'ativo', width: 10, align: 'center' },
    ...(item === 'clausulas' ? [{ id: '', width: 10, align: 'center' }] : []),
  ];
}
