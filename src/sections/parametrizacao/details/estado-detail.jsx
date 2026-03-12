// @mui
import TableCell from '@mui/material/TableCell';
// components
import { CellChecked, CellUoBalcao } from '@/components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export function EstadoDetail({ row = null }) {
  return (
    <>
      <TableCell>{row.nome}</TableCell>
      <CellUoBalcao uo={row?.uo} balcao={row?.balcao} />
      <CellChecked check={row.is_inicial} />
      <CellChecked check={row.is_final} />
    </>
  );
}
