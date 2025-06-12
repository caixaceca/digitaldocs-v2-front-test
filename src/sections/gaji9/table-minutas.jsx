import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import useTable, { getComparator } from '../../hooks/useTable';
// redux
import { getFromGaji9 } from '../../redux/slices/gaji9';
import { useDispatch, useSelector } from '../../redux/store';
// Components
import { noDados } from '../../components/Panel';
import Scrollbar from '../../components/Scrollbar';
import { DefaultAction } from '../../components/Actions';
import { SkeletonTable } from '../../components/skeleton';
import { SearchToolbarSimple } from '../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../components/table';
//
import { applySortFilter, labelTitular } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

TableMinutas.propTypes = { item: PropTypes.string, inativos: PropTypes.bool };

export default function TableMinutas({ item, inativos }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(localStorage.getItem(`filter${item}`) || '');

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
  } = useTable({ defaultOrderBy: 'designacao', defaultOrder: 'asc' });

  const { minutas, isLoading, estadoMinutas } = useSelector((state) => state.gaji9);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, filter]);

  useEffect(() => {
    dispatch(
      getFromGaji9(item, {
        inativos,
        emVigor: estadoMinutas === 'Em vigor',
        revogado: estadoMinutas === 'Revogado',
        emAnalise: estadoMinutas === 'Em análise',
      })
    );
  }, [dispatch, item, inativos, estadoMinutas]);

  const dataFiltered = applySortFilter({
    filter,
    comparator: getComparator(order, orderBy),
    dados: (item === 'minutas' && minutas) || [],
  });
  const isNotFound = !dataFiltered.length;

  return (
    <>
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item={`filter${item}`} filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={[
                  { id: 'titulo', label: 'Título' },
                  { id: 'subtitulo', label: 'Subtiulo' },
                  { id: 'tipo_titular', label: 'Tipo titular' },
                  { id: 'componente', label: 'Componente' },
                  { id: 'versão', label: 'Versão', align: 'center' },
                  { id: '', width: 10 },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={6} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`${item}_${index}`}>
                      <TableCell>{row?.titulo || noDados()}</TableCell>
                      <TableCell>{row?.subtitulo}</TableCell>
                      <TableCell>{labelTitular(row?.tipo_titular, row?.consumidor)}</TableCell>
                      <TableCell>{row?.componente}</TableCell>
                      <TableCell align="center">{row?.versao}</TableCell>
                      <TableCell align="center" width={10}>
                        <DefaultAction
                          label="DETALHES"
                          onClick={() => navigate(`${PATH_DIGITALDOCS.gaji9.root}/minuta/${row?.id}`)}
                        />
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
    </>
  );
}
