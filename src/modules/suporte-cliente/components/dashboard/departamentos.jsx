import { useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
// utils
import { dispatch, useSelector } from '@/redux/store';
import { fNumber, fPercent } from '@/utils/formatNumber';
import { getInSuporte } from '@/redux/slices/suporte-cliente';
import useTable, { getComparator, applySort } from '@/hooks/useTable';
// Components
import Scrollbar from '@/components/Scrollbar';
import { SkeletonTable } from '@/components/skeleton';
import { TableHeadCustom, TableSearchNotFound } from '@/components/table';

// ---------------------------------------------------------------------------------------------------------------------

export default function DashDepartamentos({ department, data, periodo }) {
  const { dashdepartamentos, isLoading } = useSelector((state) => state.suporte);
  const { order, dense, onSort, orderBy } = useTable({ defaultOrderBy: 'department_name', defaultOrder: 'asc' });

  useEffect(() => {
    const year = data.getFullYear();
    const month = periodo === 'Mensal' ? data.getMonth() + 1 : '';
    dispatch(getInSuporte('dashdepartamentos', { year, month, department, reset: { dados: [] } }));
  }, [data, department, periodo]);

  const isNotFound = !dashdepartamentos.length;
  const dados = applySort(dashdepartamentos, getComparator(order, orderBy));

  const headLabel = [
    { id: 'department_name', label: 'Departamento' },
    { id: 'check_in_count', label: 'Entradas', align: 'right' },
    { id: 'check_in_out', label: 'Saídas', align: 'right' },
    { id: 'check_out_rate', label: 'Taxa de Saída', align: 'right' },
    { id: 'sla_compliance_rate', label: 'Conformidade SLA', align: 'right' },
  ];

  return (
    <Card sx={{ p: 1 }}>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, position: 'relative', overflow: 'hidden' }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHeadCustom order={order} onSort={onSort} orderBy={orderBy} headLabel={headLabel} />
            <TableBody>
              {isLoading && isNotFound ? (
                <SkeletonTable row={10} column={5} />
              ) : (
                dados.map((row, index) => (
                  <TableRow hover key={`departamento_${index}`}>
                    <TableCell>{row.department_name}</TableCell>
                    <TableCell align="right">{fNumber(row.check_in_count)}</TableCell>
                    <TableCell align="right">{fNumber(row.check_out_count)}</TableCell>
                    <TableCell align="right">{fPercent(row?.check_out_rate)}</TableCell>
                    <TableCell align="right">{fPercent(row?.sla_compliance_rate)}</TableCell>
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
    </Card>
  );
}
