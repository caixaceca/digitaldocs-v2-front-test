// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { getFileThumb } from '../../../utils/formatFile';

// ---------------------------------------------------------------------------------------------------------------------

export function ExportToExcell({ handleExport, small = false, absolute = false, loading = false }) {
  return (
    <Box sx={absolute ? { top: 10, right: 10, position: 'absolute' } : null}>
      <Tooltip title="EXPORTAR" arrow>
        <Fab
          disabled={loading}
          onClick={() => handleExport()}
          color={small ? 'inherit' : 'success'}
          sx={{ width: small ? 30 : 36, height: small ? 30 : 36 }}
        >
          {loading ? (
            <CircularProgress size={small ? 18 : 24} />
          ) : (
            getFileThumb(true, { width: small ? 18 : 22 }, 'file.xlsx')
          )}
        </Fab>
      </Tooltip>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function fileInfo(workbook) {
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastPrinted = new Date();
  workbook.creator = 'Intranet - Caixa Económica de Cabo Verde';
  workbook.lastModifiedBy = 'Intranet - Caixa Económica de Cabo Verde';
}

export function sheetProperty(color, fixed, showGridLines = false) {
  return {
    properties: { tabColor: { argb: color } },
    views: [{ state: 'frozen', activeCell: 'Z1000', ySplit: fixed, showGridLines }],
  };
}

export function estiloCabecalho(sheet, rows, columns) {
  const borderBranco = { style: 'thin', color: { argb: 'FFFFFF' } };

  for (let row = 1; row <= rows; row += 1) {
    sheet.getRow(row).height = 20;
    for (let col = 1; col <= columns; col += 1) {
      const cell = sheet.getRow(row).getCell(col);
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5AAA28' } };
      cell.border = { top: borderBranco, left: borderBranco, bottom: borderBranco, right: borderBranco };
    }
  }
}

export function ajustarLargura(sheet) {
  sheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      if (cellValue.length > maxLength) maxLength = cellValue.length;
    });
    column.width = maxLength + 2;
  });
}
