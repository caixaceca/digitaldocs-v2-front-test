import ExcelJS from 'exceljs';
import { sumBy } from 'lodash';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// utils
import { ptDate } from '../../../../utils/formatTime';
import { useSelector } from '../../../../redux/store';
import { fCurrency, fConto } from '../../../../utils/formatNumber';
//
import { ExportToExcell, fileInfo, sheetProperty, estiloCabecalho, ajustarLargura } from '../formatacoes';
import { montateNC, dataNC } from '../../../../sections/indicadores/estatistica-credito/nao-classificados';
//
import resumoEstatistica from './resumo';
import dadosFase, { dadosPorItem } from './dados-fase';
import { cabecalho, valorMoeda, colunasSI, celulasConteudo, mesclarSegmentoLinha } from './formatacoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function ExportarEstatisticaCredito({ uo, data, periodo }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const { cc } = useSelector((state) => state.intranet);
  const { resumoEstCredito, estCredito, moeda } = useSelector((state) => state.indicadores);

  const dadosEntrada = dadosFase(estCredito?.entrada, 'Entrada', 'montantes', '', 6, moeda);
  const dadosAprovado = dadosFase(estCredito?.aprovado, 'Aprovado', 'montante_aprovado', 'montantes', 4, moeda);
  const dadosContratado = dadosFase(
    estCredito?.contratado,
    'Contratado',
    'montante_contratado',
    'montante_aprovado',
    9,
    moeda
  );
  const dadosIndeferido = dadosFase(estCredito?.indeferido, 'Indeferido', 'montantes', '', 5, moeda);
  const dadosDesistido = dadosFase(estCredito?.desistido, 'Desistido', 'montantes', '', 5, moeda);

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const workbook = new ExcelJS.Workbook();
      fileInfo(workbook);

      const resumoSheet = workbook.addWorksheet('Resumo', sheetProperty('AAAAAA', 3, false));
      resumoEstatistica({ cc, moeda, dados: resumoEstCredito, uo, data, resumoSheet });

      if (periodo === 'Mensal' && uo !== 'Caixa' && uo !== 'DCN' && uo !== 'DCS') {
        // ENTRADAS
        const entradaSheet = workbook.addWorksheet('Entradas', sheetProperty('EEEEEE', 2, false));
        cabecalho(entradaSheet, 'Entradas');
        dadosEntrada.rows.forEach((row) => {
          entradaSheet.addRow(row);
        });
        celulasConteudo('Entrada', entradaSheet, dadosEntrada.rows.length + 2, 3, 10, 10);
        colunasSI(entradaSheet);
        estiloCabecalho(entradaSheet, 2, 10);
        ajustarLargura(entradaSheet);
        mesclarSegmentoLinha(entradaSheet, 'A1:J1', 10, dadosEntrada.lengths);
        addTotalGeral(entradaSheet, estCredito?.entrada, 'ENTRADOS', dadosEntrada.rows.length + 4, moeda);
        if (dadosEntrada.naoClassificados?.length > 0) {
          addNaoClassificados(entradaSheet, dadosEntrada.naoClassificados, 'entrada', moeda);
        }

        // SHEET APROVADAS
        const aprovadoSheet = workbook.addWorksheet('Aprovados', sheetProperty('EDFAE6', 2, false));
        cabecalho(aprovadoSheet, 'Aprovados');
        dadosAprovado.rows.forEach((row) => {
          const novaLinha = aprovadoSheet.addRow(row);
          const celula = novaLinha.getCell(10);
          if (celula.value === '*') celula.font = { color: { argb: 'FF4842' }, bold: true };
        });
        celulasConteudo('Aprovado', aprovadoSheet, dadosAprovado.rows.length + 2, 3, 9, 8);
        colunasSI(aprovadoSheet);
        estiloCabecalho(aprovadoSheet, 2, 9);
        ajustarLargura(aprovadoSheet);
        mesclarSegmentoLinha(aprovadoSheet, 'A1:I1', 9, dadosAprovado.lengths);
        addTotalGeral(aprovadoSheet, estCredito?.aprovado, 'APROVADOS', dadosAprovado.rows.length + 4, moeda);
        if (dadosAprovado.naoClassificados?.length > 0) {
          addNaoClassificados(aprovadoSheet, dadosAprovado.naoClassificados, 'aprovado', moeda);
        }

        // SHEET CONTRATADAS
        const contratadoSheet = workbook.addWorksheet('Contratados', sheetProperty('C8FACD', 2, false));
        cabecalho(contratadoSheet, 'Contratados');
        dadosContratado.rows.forEach((row) => {
          const novaLinha = contratadoSheet.addRow(row);
          const celula = novaLinha.getCell(15);
          if (celula.value === '*') celula.font = { color: { argb: 'FF4842' }, bold: true };
        });
        celulasConteudo('Contratado', contratadoSheet, dadosContratado.rows.length + 2, 3, 14, 13);
        colunasSI(contratadoSheet);
        estiloCabecalho(contratadoSheet, 2, 14);
        ajustarLargura(contratadoSheet);
        mesclarSegmentoLinha(contratadoSheet, 'A1:N1', 14, dadosContratado.lengths);
        addTotalGeral(contratadoSheet, estCredito?.contratado, 'CONTRATADOS', dadosContratado.rows.length + 4, moeda);
        if (dadosContratado.naoClassificados?.length > 0) {
          addNaoClassificados(contratadoSheet, dadosContratado.naoClassificados, 'contratado', moeda);
        }

        // SHEET INDEFERIDOS
        const indeferidosSheet = workbook.addWorksheet('Indeferidos', sheetProperty('FFE7D9', 2, false));
        cabecalho(indeferidosSheet, 'Indeferidos');
        dadosIndeferido.rows.forEach((row) => {
          indeferidosSheet.addRow(row);
        });
        celulasConteudo('Indeferido', indeferidosSheet, dadosIndeferido.rows.length + 2, 3, 9, 9);
        colunasSI(indeferidosSheet);
        estiloCabecalho(indeferidosSheet, 2, 9);
        ajustarLargura(indeferidosSheet);
        mesclarSegmentoLinha(indeferidosSheet, 'A1:I1', 9, dadosIndeferido.lengths);
        addTotalGeral(indeferidosSheet, estCredito?.indeferido, 'INDEFERIDOS', dadosIndeferido.rows.length + 4, moeda);
        if (dadosIndeferido.naoClassificados?.length > 0) {
          addNaoClassificados(indeferidosSheet, dadosIndeferido.naoClassificados, 'indeferido', moeda);
        }

        // SHEET DESISTIDOS
        const desistidosSheet = workbook.addWorksheet('Desistidos', sheetProperty('FFE7D9', 2, false));
        cabecalho(desistidosSheet, 'Desistidos');
        dadosDesistido.rows.forEach((row) => {
          desistidosSheet.addRow(row);
        });
        celulasConteudo('Desistido', desistidosSheet, dadosDesistido.rows.length + 2, 3, 9, 9);
        colunasSI(desistidosSheet);
        estiloCabecalho(desistidosSheet, 2, 9);
        ajustarLargura(desistidosSheet);
        mesclarSegmentoLinha(desistidosSheet, 'A1:I1', 9, dadosDesistido.lengths);
        addTotalGeral(desistidosSheet, estCredito?.desistido, 'DESISTIDOS', dadosDesistido.rows.length + 4, moeda);
        if (dadosDesistido.naoClassificados?.length > 0) {
          addNaoClassificados(desistidosSheet, dadosDesistido.naoClassificados, 'desistido', moeda);
        }
      }

      // GERAR E BAIXAR O FICHEIRO
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `Estatística de crédito ${uo} - ${data}.xlsx`);
      enqueueSnackbar('Ficheiro gerado com sucesso', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao gerar o ficheiro Excel', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return <ExportToExcell handleExport={exportToExcel} loading={loading} />;
}

// ---------------------------------------------------------------------------------------------------------------------

function addTotalGeral(sheet, dados, fase, length, moeda) {
  const total = sumBy(
    dadosPorItem(dados, '', ''),
    (fase === 'APROVADOS' && 'montante_aprovado') || (fase === 'CONTRATADOS' && 'montante_contratado') || 'montantes'
  );
  const totalPrev =
    (fase === 'APROVADOS' && sumBy(dados, 'montantes')) ||
    (fase === 'CONTRATADOS' && sumBy(dados, 'montante_aprovado')) ||
    0;

  sheet.addRow([...Array((fase === 'ENTRADOS' && 10) || (fase === 'CONTRATADOS' && 14) || 9)].map(() => null));
  sheet.addRow([
    `TOTAL DE CRÉDITOS ${fase} (${dadosPorItem(dados, '', '')?.length}) - ${moeda === 'Escudo' ? fCurrency(total) : fConto(total, true)}`,
  ]);
  sheet.getRow(length).height = 20;
  sheet.getCell(`A${length}`).font = { size: 12, bold: true };
  sheet.getCell(`A${length}`).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.mergeCells(length, 1, length, (fase === 'ENTRADOS' && 10) || (fase === 'CONTRATADOS' && 14) || 9);
  sheet.getCell(`A${length}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb:
        (fase === 'ENTRADOS' && 'EEEEEE') ||
        (fase === 'APROVADOS' && 'EDFAE6') ||
        (fase === 'CONTRATADOS' && 'C8FACD') ||
        'FFE7D9',
    },
  };

  if ((fase === 'APROVADOS' || fase === 'CONTRATADOS') && totalPrev !== total) {
    sheet.addRow([
      `* O montante ${fase === 'APROVADOS' ? 'solicitado' : 'aprovado'} difere do montante ${fase === 'APROVADOS' ? 'aprovado' : 'contratado'}`,
    ]);
    sheet.getCell(`A${length + 1}`).font = { bold: false };
    sheet.mergeCells(length + 1, 1, length + 1, fase === 'APROVADOS' ? 10 : 14);
    sheet.getCell(`A${length + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  }
}

export function addNaoClassificados(sheet, naoClassificados, fase, moeda) {
  sheet.addRow([null]);
  sheet.addRow([null]);

  const isResumo = fase === 'resumo';
  const labelRowNumber = sheet.lastRow.number + 1;
  const labelRow = sheet.addRow([
    '*Não foi possíveil classificar alguns registos. Verifique os dados de segmento e linha',
  ]);

  labelRow.getCell(1).font = { color: { argb: 'FF9800' } };
  const mergeCols = (fase === 'ENTRADOS' && 10) || (fase === 'CONTRATADOS' && 14) || 9;
  sheet.mergeCells(labelRowNumber, 1, labelRowNumber, mergeCols);

  const header = sheet.addRow([
    'Segmento',
    'Linha',
    ...(isResumo ? [] : [null]),
    isResumo ? 'Fase' : 'Proponente',
    ...(isResumo ? [] : ['Data']),
    'Montante',
  ]);
  header.font = { bold: true };
  header.getCell(isResumo ? 4 : 6).alignment = { horizontal: 'right' };
  if (!isResumo) header.getCell(5).alignment = { horizontal: 'center' };

  naoClassificados.forEach((row) => {
    const novaLinha = sheet.addRow([
      row?.segmento || '',
      row?.linha || '',
      ...(isResumo ? [] : [null]),
      row?.titular || row?.fase || '',
      ...(isResumo ? [] : [ptDate(dataNC(fase, row))]),
      valorMoeda(montateNC(fase, row) || 0, moeda),
    ]);
    novaLinha.font = { bold: false };
    novaLinha.getCell(isResumo ? 4 : 6).numFmt = '#,##0';
    novaLinha.getCell(isResumo ? 4 : 6).alignment = { horizontal: 'right' };
    if (!isResumo) novaLinha.getCell(5).alignment = { horizontal: 'center' };
  });
}
