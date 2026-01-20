import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// routes
import { PATH_DIGITALDOCS } from '../../../routes/paths';
// hooks
import useTable, { getComparator } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// Components
import { noDados } from '../../../components/Panel';
import Scrollbar from '../../../components/Scrollbar';
import { DefaultAction } from '../../../components/Actions';
import { SkeletonTable } from '../../../components/skeleton';
import { SearchToolbarSimple } from '../../../components/SearchToolbar';
import { TableHeadCustom, TableSearchNotFound, TablePaginationAlt } from '../../../components/table';
//
import PesquisarCredito from './pesquisar-credito';
import { applySortFilter, labelTitular } from '../applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

export default function TableCredito() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState(localStorage.getItem('filterCredito') || '');

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

  const { isLoading, creditos, infoPag } = useSelector((state) => state.gaji9);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, creditos]);

  const dataFiltered = applySortFilter({ filter, dados: creditos, comparator: getComparator(order, orderBy) });
  const isNotFound = !dataFiltered.length;

  return (
    <PesquisarCredito
      cursor={infoPag?.proximo}
      mais={page + 1 === Math.ceil(dataFiltered.length / rowsPerPage) && infoPag?.mais && infoPag?.proximo}
    >
      <Card sx={{ p: 1 }}>
        <SearchToolbarSimple item="filterCredito" filter={filter} setFilter={setFilter} />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
            <Table size={dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={order}
                onSort={onSort}
                orderBy={orderBy}
                headLabel={[
                  { id: 'codigo', label: 'Código' },
                  { id: 'cliente', label: 'Cliente' },
                  { id: 'titular', label: 'Titular' },
                  { id: 'componente', label: 'Componente' },
                  { id: 'montante', label: 'Montante', align: 'right' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {isLoading && isNotFound ? (
                  <SkeletonTable row={10} column={6} />
                ) : (
                  dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow hover key={`credito_${index}`}>
                      <TableCell>
                        {row?.codigo || noDados('Não definido')}
                        {row?.numero_proposta && (
                          <Typography variant="body2" noWrap>
                            <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                              Nº proposta:{' '}
                            </Typography>
                            {row?.numero_proposta}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {labelTitular(row?.tipo_titular, row?.consumidor)}
                        {row?.cliente && (
                          <Typography variant="body2" noWrap>
                            <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
                              Nº :{' '}
                            </Typography>
                            {row?.cliente}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row?.titular}</TableCell>
                      <TableCell>{row?.rotulo || row?.componente}</TableCell>
                      {/* <TableCell>{newLineText(row?.finalidade) || noDados('Não definido')}</TableCell> */}
                      <TableCell align="right">
                        <Typography variant="body2" noWrap>
                          {row?.montante ? fCurrency(row?.montante) : noDados('Não definido')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" width={10}>
                        <Stack direction="row" spacing={0.5} justifyContent="right">
                          <DefaultAction
                            label="DETALHES"
                            onClick={() => navigate(`${PATH_DIGITALDOCS.gaji9.root}/credito/${row?.id}`)}
                          />
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
    </PesquisarCredito>
  );
}
