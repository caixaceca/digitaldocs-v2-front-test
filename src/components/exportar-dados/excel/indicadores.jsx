import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
// utils
import { fMonthYear } from '@/utils/formatTime';
//
import { ExportToExcell, fileInfo, sheetProperty, ajustarLargura, estiloCabecalho } from './formatacoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function ExportarIndicadores({ dados, tabela }) {
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    fileInfo(workbook);
    const workSheet = workbook.addWorksheet(tabela, sheetProperty('5AAA28', 1, true));

    workSheet.columns = [
      {
        header:
          (tabela === 'Total de processos - Data' && 'Data') ||
          (tabela === 'Origem dos processos' && 'Origem') ||
          'Processo',
        key: 'label',
      },
      { header: 'Quantidade', key: 'auantidade' },
    ];

    dados?.forEach(({ assunto, label, total, dias, criado_em: em }) => {
      workSheet.addRow([
        (tabela === 'Total de processos - Data' && fMonthYear(em)) || assunto || label || '',
        total || dias || '',
      ]);
    });

    estiloCabecalho(workSheet, 1, 2);
    ajustarLargura(workSheet);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `${tabela}.xlsx`);
  };

  return <ExportToExcell handleExport={exportToExcel} small />;
}
