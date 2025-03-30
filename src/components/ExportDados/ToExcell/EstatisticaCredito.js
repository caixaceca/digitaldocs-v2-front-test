import ExcelJS from 'exceljs';
import { sumBy } from 'lodash';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
// utils
import { ptDate } from '../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../utils/formatNumber';
// redux
import { useSelector } from '../../../redux/store';
//
import { ExportToExcell, fileInfo, sheetProperty, estiloCabecalho, ajustarLargura } from './CommonProperties';

// ----------------------------------------------------------------------

const borderCinza = { style: 'thin', color: { argb: 'AAAAAA' } };

// --------------------------------------------------------------------------------------------------------------------------------------------

ExportarEstatisticaCred.propTypes = { uo: PropTypes.string, periodo: PropTypes.string, vista: PropTypes.string };

export default function ExportarEstatisticaCred({ uo, periodo, vista }) {
  const { cc } = useSelector((state) => state.intranet);
  const { resumoEstCredito, estCredito } = useSelector((state) => state.indicadores);

  const rowsResumo = [
    ['Empresa', 'Construção', ...Object.values(dadosResumo(resumoEstCredito, 'Empresa', 'Construção'))],
    [null, 'Tesouraria', ...Object.values(dadosResumo(resumoEstCredito, 'Empresa', 'Tesouraria'))],
    [null, 'Investimento', ...Object.values(dadosResumo(resumoEstCredito, 'Empresa', 'Investimento'))],
    [null, null, ...Object.values(dadosResumo(resumoEstCredito, 'Empresa', ''))],
    ['Particular', 'Habitação', ...Object.values(dadosResumo(resumoEstCredito, 'Particular', 'Habitação'))],
    [null, 'CrediCaixa', ...Object.values(dadosResumo(resumoEstCredito, 'Particular', 'CrediCaixa'))],
    [null, 'Outros', ...Object.values(dadosResumo(resumoEstCredito, 'Particular', 'Outros'))],
    [null, null, ...Object.values(dadosResumo(resumoEstCredito, 'Particular', ''))],
    [
      'Produtor Individual',
      'Tesouraria',
      ...Object.values(dadosResumo(resumoEstCredito, 'Produtor Individual', 'Tesouraria')),
    ],
    [null, 'Investimento', ...Object.values(dadosResumo(resumoEstCredito, 'Produtor Individual', 'Investimento'))],
    [null, 'Micro-Crédito', ...Object.values(dadosResumo(resumoEstCredito, 'Produtor Individual', 'Micro-Crédito'))],
    [null, null, ...Object.values(dadosResumo(resumoEstCredito, 'Produtor Individual', ''))],
    ['Entidades Públicas', null, ...Object.values(dadosResumo(resumoEstCredito, 'Entidade Pública', ''))],
    ['Garantias Bancárias', null, ...Object.values(dadosResumo(resumoEstCredito, '', 'Garantia Bancária'))],
    ['TOTAL ACUMULADO', null, ...Object.values(dadosResumo(resumoEstCredito, '', ''))],
  ];

  const dadosEntrada = dadosFase(estCredito?.entrada, 'Entrada', 'montantes', '', 6);
  const dadosAprovado = dadosFase(estCredito?.aprovado, 'Aprovado', 'montante_aprovado', 'montantes', 4);
  const dadosContratado = dadosFase(
    estCredito?.contratado,
    'Contratado',
    'montante_contratado',
    'montante_aprovado',
    9
  );
  const dadosIndeferido = dadosFase(estCredito?.indeferido, 'Indeferido', 'montantes', '', 5);
  const dadosDesistido = dadosFase(estCredito?.desistido, 'Desistido', 'montantes', '', 5);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    fileInfo(workbook);

    const resumoSheet = workbook.addWorksheet('Resumo', sheetProperty('AAAAAA', 3, false));
    resumoSheet.columns = [
      { header: '', key: 'segmento', width: 25 },
      { header: '', key: 'linha_credito', width: 20 },
      { header: '', key: 'entradas_qtd', width: 10 },
      { header: '', key: 'entradas_valor', width: 20 },
      { header: '', key: 'aprovados_qtd', width: 10 },
      { header: '', key: 'aprovados_valor', width: 20 },
      { header: '', key: 'contratados_qtd', width: 10 },
      { header: '', key: 'contratados_valor', width: 20 },
      { header: '', key: 'indeferidos_qtd', width: 10 },
      { header: '', key: 'indeferidos_valor', width: 20 },
    ];

    resumoSheet.getRow(2).values = [
      'Segmento',
      'Linha de crédito',
      'Entradas',
      null,
      'Aprovados',
      null,
      'Contratados',
      null,
      'Indeferidos/Desistidos',
      null,
    ];
    resumoSheet.getRow(3).values = [null, null, 'Qtd', 'Valor', 'Qtd', 'Valor', 'Qtd', 'Valor', 'Qtd', 'Valor'];

    rowsResumo.forEach((row) => {
      resumoSheet.addRow(row);
    });
    resumoSheet.addRow([null]);
    resumoSheet.addRow([null]);
    resumoSheet.addRow([null, 'Tesouraria', ...Object.values(dadosResumo(resumoEstCredito, '', 'Tesouraria'))]);
    resumoSheet.addRow([null, 'Investimento', ...Object.values(dadosResumo(resumoEstCredito, '', 'Investimento'))]);

    celulasConteudo('Resumo', resumoSheet, 18, 4, 10, 3);
    celulasConteudo('Resumo Linha', resumoSheet, 22, 21, 10, 3);
    colunasSI(resumoSheet);
    estiloCabecalho(resumoSheet, 3, 10);
    resumoSheet.getRow(18).height = 20;
    resumoSheet.getRow(18).font = { bold: true };
    resumoSheet.getCell('C18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEEEEE' } };
    resumoSheet.getCell('D18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEEEEE' } };
    resumoSheet.getCell('E18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDFAE6' } };
    resumoSheet.getCell('F18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EDFAE6' } };
    resumoSheet.getCell('G18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C8FACD' } };
    resumoSheet.getCell('H18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C8FACD' } };
    resumoSheet.getCell('I18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7D9' } };
    resumoSheet.getCell('J18').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7D9' } };
    ['A4', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7', 'J7'].forEach((cell) => {
      resumoSheet.getCell(cell).font = { bold: true };
      resumoSheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DFE3E8' } };
    });
    ['A8', 'B11', 'C11', 'D11', 'E11', 'F11', 'G11', 'H11', 'I11', 'J11'].forEach((cell) => {
      resumoSheet.getCell(cell).font = { bold: true };
      resumoSheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C4CDD5' } };
    });
    ['A12', 'B15', 'C15', 'D15', 'E15', 'F15', 'G15', 'H15', 'I15', 'J15'].forEach((cell) => {
      resumoSheet.getCell(cell).font = { bold: true };
      resumoSheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A2AFBC' } };
    });

    [
      'A1:J1',
      'C2:D2',
      'E2:F2',
      'G2:H2',
      'I2:J2',
      'A2:A3',
      'B2:B3',
      'A4:A7',
      'A8:A11',
      'A12:A15',
      'A16:B16',
      'A17:B17',
      'A18:B18',
    ].forEach((cells) => {
      resumoSheet.mergeCells(cells);
    });
    resumoSheet.getCell('A1').value = {
      richText: [
        { text: 'Estatística de crédito', font: { bold: true, color: { argb: 'FFFFFF' }, size: 13 } },
        { text: '\nUnidade orgânica: ', font: { bold: false, color: { argb: 'FFFFFF' }, size: 12 } },
        { text: uo, font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 } },
        { text: '\nPeríodo: ', font: { bold: false, color: { argb: 'FFFFFF' }, size: 12 } },
        { text: periodo, font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 } },
        { text: '\nGerado por: ', font: { bold: false, color: { argb: 'FFFFFF' }, size: 12 } },
        { text: cc?.perfil?.displayName || '', font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 } },
        { text: ` (${ptDate(new Date())})`, font: { bold: false, color: { argb: 'FFFFFF' }, size: 12 } },
      ],
    };
    resumoSheet.getCell('A1').alignment = { wrapText: true, vertical: 'middle' };
    resumoSheet.getRow(1).height = 80;

    if (vista === 'Mensal' && uo !== 'Caixa' && uo !== 'DCN' && uo !== 'DCS') {
      // ENTRADAS
      const entradaSheet = workbook.addWorksheet('Entradas', sheetProperty('EEEEEE', 2, false));
      addCabecalho(entradaSheet, 'Entradas');
      dadosEntrada.rows.forEach((row) => {
        entradaSheet.addRow(row);
      });
      celulasConteudo('Entrada', entradaSheet, dadosEntrada.rows.length + 2, 3, 10, 10);
      colunasSI(entradaSheet);
      estiloCabecalho(entradaSheet, 2, 10);
      ajustarLargura(entradaSheet);
      mesclarSegmentoLinha(entradaSheet, 'A1:J1', 10, dadosEntrada.lengths);
      addTotalGeral(entradaSheet, estCredito?.entrada, 'ENTRADOS', dadosEntrada.rows.length + 4);

      // SHEET APROVADAS
      const aprovadoSheet = workbook.addWorksheet('Aprovados', sheetProperty('EDFAE6', 2, false));
      addCabecalho(aprovadoSheet, 'Aprovados');
      dadosAprovado.rows.forEach((row) => {
        aprovadoSheet.addRow(row);
      });
      celulasConteudo('Aprovado', aprovadoSheet, dadosAprovado.rows.length + 2, 3, 9, 8);
      colunasSI(aprovadoSheet);
      estiloCabecalho(aprovadoSheet, 2, 9);
      ajustarLargura(aprovadoSheet);
      mesclarSegmentoLinha(aprovadoSheet, 'A1:I1', 9, dadosAprovado.lengths);
      addTotalGeral(aprovadoSheet, estCredito?.aprovado, 'APROVADOS', dadosAprovado.rows.length + 4);

      // SHEET CONTRATADAS
      const contratadoSheet = workbook.addWorksheet('Contratados', sheetProperty('C8FACD', 2, false));
      addCabecalho(contratadoSheet, 'Contratados');
      dadosContratado.rows.forEach((row) => {
        contratadoSheet.addRow(row);
      });
      celulasConteudo('Contratado', contratadoSheet, dadosContratado.rows.length + 2, 3, 14, 13);
      colunasSI(contratadoSheet);
      estiloCabecalho(contratadoSheet, 2, 14);
      ajustarLargura(contratadoSheet);
      mesclarSegmentoLinha(contratadoSheet, 'A1:N1', 14, dadosContratado.lengths);
      addTotalGeral(contratadoSheet, estCredito?.contratado, 'CONTRATADOS', dadosContratado.rows.length + 4);

      // SHEET INDEFERIDOS
      const indeferidosSheet = workbook.addWorksheet('Indeferidos', sheetProperty('FFE7D9', 2, false));
      addCabecalho(indeferidosSheet, 'Indeferidos');
      dadosIndeferido.rows.forEach((row) => {
        indeferidosSheet.addRow(row);
      });
      celulasConteudo('Indeferido', indeferidosSheet, dadosIndeferido.rows.length + 2, 3, 9, 9);
      colunasSI(indeferidosSheet);
      estiloCabecalho(indeferidosSheet, 2, 9);
      ajustarLargura(indeferidosSheet);
      mesclarSegmentoLinha(indeferidosSheet, 'A1:I1', 9, dadosIndeferido.lengths);
      addTotalGeral(indeferidosSheet, estCredito?.indeferido, 'INDEFERIDOS', dadosIndeferido.rows.length + 4);

      // SHEET DESISTIDOS
      const desistidosSheet = workbook.addWorksheet('Desistidos', sheetProperty('FFE7D9', 2, false));
      addCabecalho(desistidosSheet, 'Desistidos');
      dadosDesistido.rows.forEach((row) => {
        desistidosSheet.addRow(row);
      });
      celulasConteudo('Desistido', desistidosSheet, dadosDesistido.rows.length + 2, 3, 9, 9);
      colunasSI(desistidosSheet);
      estiloCabecalho(desistidosSheet, 2, 9);
      ajustarLargura(desistidosSheet);
      mesclarSegmentoLinha(desistidosSheet, 'A1:I1', 9, dadosDesistido.lengths);
      addTotalGeral(desistidosSheet, estCredito?.desistido, 'DESISTIDOS', dadosDesistido.rows.length + 4);
    }

    // GERAR E BAIXAR O FICHEIRO
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `Estatística de crédito ${uo} - ${periodo}.xlsx`);
  };

  return <ExportToExcell handleExport={exportToExcel} />;
}

// ----------------------------------------------------------------------

function dadosResumo(dados, segmento, linha) {
  const entradas = dadosPorItem(dados?.entrada, segmento, linha);
  const aprovados = dadosPorItem(dados?.aprovado, segmento, linha);
  const contratados = dadosPorItem(dados?.contratado, segmento, linha);
  const indeferidos = dadosPorItem(dados?.indeferido, segmento, linha);
  const desistidos = dadosPorItem(dados?.desistido, segmento, linha);

  return {
    qtdEnt: sumBy(entradas, 'total'),
    valorEnt: sumBy(entradas, 'montantes'),
    qtdAp: sumBy(aprovados, 'total'),
    valorAp: sumBy(aprovados, 'montante_aprovado'),
    qtdCont: sumBy(contratados, 'total'),
    valorCont: sumBy(contratados, 'montante_contratado'),
    qtdId: sumBy(indeferidos, 'total') + sumBy(desistidos, 'total'),
    valorId: sumBy(indeferidos, 'montantes') + sumBy(desistidos, 'montantes'),
  };
}

function dadosFase(dados, fase, item1, item2, emptyRows) {
  const empConst = dadosItem(dados, 'Empresa', 'Construção', fase, true);
  const empTes = dadosItem(dados, 'Empresa', 'Tesouraria', fase, false);
  const empInvest = dadosItem(dados, 'Empresa', 'Investimento', fase, false);
  const partHab = dadosItem(dados, 'Particular', 'Habitação', fase, true);
  const partCredi = dadosItem(dados, 'Particular', 'CrediCaixa', fase, false);
  const partOut = dadosItem(dados, 'Particular', 'Outros', fase, false);
  const piTes = dadosItem(dados, 'Produtor Individual', 'Tesouraria', fase, true);
  const piInvest = dadosItem(dados, 'Produtor Individual', 'Investimento', fase, false);
  const piMicro = dadosItem(dados, 'Produtor Individual', 'Micro-Crédito', fase, false);
  const entPub = dadosItem(dados, 'Entidade Pública', '', fase, true);
  const barantBanc = dadosItem(dados, '', 'Garantia Bancária', fase, true);

  return {
    rows: [
      ...empConst,
      ...empTes,
      ...empInvest,
      totalSegmento(dados, 'Empresa', emptyRows, item1, item2),
      ...partHab,
      ...partCredi,
      ...partOut,
      totalSegmento(dados, 'Particular', emptyRows, item1, item2),
      ...piTes,
      ...piInvest,
      ...piMicro,
      totalSegmento(dados, 'Produtor Individual', emptyRows, item1, item2),
      ...entPub,
      ...barantBanc,
    ],
    lengths: {
      ec: empConst?.length,
      et: empTes?.length,
      ei: empInvest?.length,
      ph: partHab?.length,
      pc: partCredi?.length,
      po: partOut?.length,
      pit: piTes?.length,
      pii: piInvest?.length,
      pim: piMicro?.length,
      ep: entPub?.length,
      gb: barantBanc?.length,
    },
  };
}

function dadosItem(dados, segmento, linha, tab, first) {
  segmento = linha === 'Garantia Bancária' ? '' : segmento;
  linha = segmento === 'Entidade Pública' ? '' : linha;
  const dadosFilter = dadosPorItem(dados, segmento, linha);
  const segmentoLabel =
    (linha === 'Garantia Bancária' && 'Garantias Bancárias') ||
    (segmento === 'Entidade Pública' && 'Entidades Públicas') ||
    segmento;
  const linhaLabel = linha === 'Garantia Bancária' ? null : linha;

  if (tab === 'Entrada' && dadosFilter?.length > 0) {
    const dadosList = dadosFilter?.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_entrada),
      row?.setor_atividade || '',
      row?.finalidade || '',
      row?.situacao_final_mes || '',
      row?.nproposta || '',
      row?.montantes || 0,
    ]);
    return [
      ...dadosList,
      [...[...Array(9)].map(() => null), sumBy(dadosPorItem(dadosFilter, segmento, linha), 'montantes')],
    ];
  }
  if (tab === 'Aprovado' && dadosFilter?.length > 0) {
    const dadosList = dadosFilter?.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_aprovacao),
      row?.setor_atividade || '',
      row?.situacao_final_mes || '',
      row?.montantes || 0,
      row?.montante_aprovado || 0,
    ]);
    return [
      ...dadosList,
      [
        ...[...Array(7)].map(() => null),
        sumBy(dadosPorItem(dadosFilter, segmento, linha), 'montantes'),
        sumBy(dadosPorItem(dadosFilter, segmento, linha), 'montante_aprovado'),
      ],
    ];
  }
  if (tab === 'Contratado' && dadosFilter?.length > 0) {
    const dadosList = dadosFilter?.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_contratacao),
      row?.setor_atividade || '',
      row?.finalidade || '',
      row?.prazo_amortizacao || '',
      fPercent(row?.taxa_juro),
      row?.garantia || '',
      row?.escalao_decisao || '',
      row?.cliente || '',
      row?.montante_aprovado || 0,
      row?.montante_contratado || 0,
    ]);
    return [
      ...dadosList,
      [
        ...[...Array(12)].map(() => null),
        sumBy(dadosPorItem(dadosFilter, segmento, linha), 'montante_aprovado'),
        sumBy(dadosPorItem(dadosFilter, segmento, linha), 'montante_contratado'),
      ],
    ];
  }
  if ((tab === 'Indeferido' || tab === 'Desistido') && dadosFilter?.length > 0) {
    const dadosList = dadosFilter?.map((row, index) => [
      first && index === 0 && segmentoLabel ? segmentoLabel : null,
      index === 0 && linhaLabel ? linhaLabel : null,
      index + 1,
      row?.titular || '',
      ptDate(row?.data_entrada),
      row?.setor_atividade || '',
      row?.finalidade || '',
      (tab === 'Indeferido' && !!row?.data_indeferido && ptDate(row?.data_indeferido)) ||
        (tab === 'Desistido' && !!row?.data_desistido && ptDate(row?.data_desistido)) ||
        '',
      row?.montantes || 0,
    ]);
    return [
      ...dadosList,
      [...[...Array(8)].map(() => null), sumBy(dadosPorItem(dadosFilter, segmento, linha), 'montantes')],
    ];
  }
  return [
    [
      first ? segmentoLabel : null,
      linhaLabel,
      ...((tab === 'Aprovado' && [...[...Array(5)].map(() => null), 0, 0]) ||
        (tab === 'Contratado' && [...[...Array(10)].map(() => null), 0, 0]) || [
          ...[...Array(tab === 'Entrada' ? 7 : 6)].map(() => null),
          0,
        ]),
    ],
  ];
}

function totalSegmento(dados, segmento, cellsEmpty, item1, item2) {
  return [
    null,
    null,
    dadosPorItem(dados, segmento, '')?.length,
    ...[...Array(cellsEmpty)].map(() => null),
    ...(item2
      ? [sumBy(dadosPorItem(dados, segmento, ''), item2), sumBy(dadosPorItem(dados, segmento, ''), item1)]
      : [sumBy(dadosPorItem(dados, segmento, ''), item1)]),
  ];
}

function addTotalGeral(sheet, dados, fase, length) {
  sheet.addRow([...Array((fase === 'ENTRADOS' && 10) || (fase === 'CONTRATADOS' && 14) || 9)].map(() => null));
  sheet.addRow([
    `TOTAL DE CRÉDITOS ${fase} (${dadosPorItem(dados, '', '')?.length}) - ${fCurrency(sumBy(dadosPorItem(dados, '', ''), (fase === 'APROVADOS' && 'montante_aprovado') || (fase === 'CONTRATADOS' && 'montante_contratado') || 'montantes'))}`,
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
}

function dadosPorItem(dados, segmento, linha) {
  return (
    (segmento && linha && dados?.filter((row) => row?.segmento === segmento && row?.linha === linha)) ||
    (segmento && dados?.filter((row) => row?.segmento === segmento && row?.linha !== 'Garantia Bancária')) ||
    (linha && dados?.filter((row) => row?.linha === linha && row?.segmento !== 'Entidade Pública')) ||
    dados
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

function addCabecalho(sheet, tab) {
  sheet.columns = [
    { header: tab.toUpperCase(), key: 'segmento' },
    { header: '', key: 'linha_credito' },
    { header: '', key: 'numero' },
    { header: '', key: 'proponente' },
    { header: '', key: 'data' },
    { header: '', key: 'setor_atividade' },
    ...(tab === 'Entradas' || tab === 'Indeferidos' || tab === 'Desistidos' ? [{ header: '', key: 'finalidade' }] : []),
    ...(tab === 'Entradas' || tab === 'Aprovados' ? [{ header: '', key: 'situacao' }] : []),
    ...(tab === 'Entradas' ? [{ header: '', key: 'numero_proposta' }] : []),
    ...(tab === 'Contratados'
      ? [
          { header: '', key: 'finalidade' },
          { header: '', key: 'prazo_amortizacao' },
          { header: '', key: 'taxa_juros' },
          { header: '', key: 'garantia' },
          { header: '', key: 'escalao_decisao' },
          { header: '', key: 'numero_cliente' },
        ]
      : []),
    ...(tab === 'Indeferidos' ? [{ header: '', key: 'data_indeferimento' }] : []),
    ...(tab === 'Desistidos' ? [{ header: '', key: 'data_desistencia' }] : []),
    ...(tab !== 'Contratados' ? [{ header: '', key: 'montante_solicitado' }] : []),
    ...(tab === 'Aprovados' || tab === 'Contratados' ? [{ header: '', key: 'montante_aprovado' }] : []),
    ...(tab === 'Contratados' ? [{ header: '', key: 'montante_contratado' }] : []),
  ];

  sheet.getRow(2).values = [
    'Segmento',
    'Linha de crédito',
    'Nº',
    'Proponente',
    (tab === 'Aprovados' && 'Data aprovação') || (tab === 'Contratados' && 'Data contratação') || 'Data entrada',
    'Setor atividade',
    ...(tab === 'Entradas' || tab === 'Indeferidos' || tab === 'Desistidos' ? ['Finalidade'] : []),
    ...(tab === 'Entradas' || tab === 'Aprovados' ? ['Situação'] : []),
    ...(tab === 'Entradas' ? ['Nº proposta'] : []),
    ...(tab === 'Contratados'
      ? ['Finalidade', 'Prazo amortização', 'Taxa juros', 'Garantia', 'Escalao decisão', 'Nº cliente']
      : []),
    ...(tab === 'Indeferidos' ? ['Data indeferimento'] : []),
    ...(tab === 'Desistidos' ? ['Data desistência'] : []),
    ...(tab !== 'Contratados' ? ['Montante solicitado'] : []),
    ...(tab === 'Aprovados' || tab === 'Contratados' ? ['Montante aprovado'] : []),
    ...(tab === 'Contratados' ? ['Montante contratado'] : []),
  ];
}

function colunasSI(sheet) {
  sheet.getColumn(1).alignment = { vertical: 'middle' };
  sheet.getColumn(2).alignment = { vertical: 'middle' };
  sheet.getColumn(1).font = { bold: true };
  sheet.getColumn(2).font = { bold: true };
}

function celulasConteudo(tab, sheet, rows, rowInicial, columns, columnInicial) {
  const colCont = tab === 'Resumo Linha' ? 2 : 1;
  for (let row = rowInicial; row <= rows; row += 1) {
    sheet.getRow(row).getCell(5).alignment = { horizontal: 'center' };
    if (tab === 'Contratado') {
      sheet.getRow(row).getCell(8).alignment = { horizontal: 'right' };
      sheet.getRow(row).getCell(9).alignment = { horizontal: 'right' };
      sheet.getRow(row).getCell(11).alignment = { horizontal: 'center' };
      sheet.getRow(row).getCell(12).alignment = { horizontal: 'center' };
    }
    if (tab === 'Indeferido' || tab === 'Desistido') {
      sheet.getRow(row).getCell(8).alignment = { horizontal: 'center' };
    }
    for (let col = colCont; col <= columns; col += 1) {
      const cell = sheet.getRow(row).getCell(col);
      cell.font = { size: 10 };
      cell.border = { top: borderCinza, left: borderCinza, bottom: borderCinza, right: borderCinza };
    }
    for (let col = columnInicial; col <= columns; col += 1) {
      sheet.getRow(row).getCell(col).numFmt = '#,##0';
    }
  }
}

function mesclarSegmentoLinha(sheet, cab, columns, lg) {
  sheet.mergeCells(cab);
  // Empresa
  const lenEmp = lg.ec + lg.et + lg.ei + 3;
  sheet.mergeCells(3, 1, lenEmp, 1);
  sheet.mergeCells(3, 2, lg.ec + 2, 2);
  sheet.mergeCells(3 + lg.ec, 2, lg.ec + lg.et + 2, 2);
  sheet.mergeCells(3 + lg.ec + lg.et, 2, lg.ec + lg.et + lg.ei + 2, 2);
  // Particular
  const lenPart = lenEmp + lg.ph + lg.pc + lg.po;
  sheet.mergeCells(lenEmp + 1, 1, lenPart + 1, 1);
  sheet.mergeCells(lenEmp + 1, 2, lenEmp + lg.ph, 2);
  sheet.mergeCells(lenEmp + lg.ph + 1, 2, lenEmp + lg.ph + lg.pc, 2);
  sheet.mergeCells(lenEmp + lg.ph + lg.pc + 1, 2, lenEmp + lg.ph + lg.pc + lg.po, 2);
  // Produtores individuais
  const lenPI = lenPart + lg.pit + lg.pii + lg.pim;
  sheet.mergeCells(lenPart + 2, 1, lenPI + 2, 1);
  sheet.mergeCells(lenPart + 2, 2, lenPart + lg.pit + 1, 2);
  sheet.mergeCells(lenPart + lg.pit + 2, 2, lenPart + lg.pit + lg.pii + 1, 2);
  sheet.mergeCells(lenPart + lg.pit + lg.pii + 2, 2, lenPart + lg.pit + lg.pii + lg.pim + 1, 2);
  // Entidades públicas
  const lenEp = lenPI + lg.ep;
  sheet.mergeCells(lenPI + 3, 1, lenEp + 2, 1);
  // Garantias bancárias
  sheet.mergeCells(lenEp + 3, 1, lenEp + lg.gb + 2, 1);
  // bold subtotal
  sheet.getRow(lg.ec + 2).font = { bold: true };
  sheet.getRow(lg.ec + lg.et + 2).font = { bold: true };
  sheet.getRow(lg.ec + lg.et + lg.ei + 2).font = { bold: true };
  sheet.getRow(lenEmp + lg.ph).font = { bold: true };
  sheet.getRow(lenEmp + lg.ph + lg.pc).font = { bold: true };
  sheet.getRow(lenEmp + lg.ph + lg.pc + lg.po).font = { bold: true };
  sheet.getRow(lenPart + 1 + lg.pit).font = { bold: true };
  sheet.getRow(lenPart + 1 + lg.pit + lg.pii).font = { bold: true };
  sheet.getRow(lenPart + 1 + lg.pit + lg.pii + lg.pim).font = { bold: true };
  sheet.getRow(lenPI + 2 + lg.ep, columns).font = { bold: true };
  sheet.getRow(lenPI + 2 + lg.ep + lg.gb).font = { bold: true };

  // bgcolor
  [{ l: 3, c: 1 }, ...[...Array(columns - 1)].map((_, index) => ({ l: lenEmp, c: index + 2 }))].forEach((cell) => {
    sheet.getCell(cell.l, cell.c).font = { bold: true };
    sheet.getCell(cell.l, cell.c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DFE3E8' } };
  });
  [{ l: lenEmp + 1, c: 1 }, ...[...Array(columns - 1)].map((_, index) => ({ l: lenPart + 1, c: index + 2 }))].forEach(
    (cell) => {
      sheet.getCell(cell.l, cell.c).font = { bold: true };
      sheet.getCell(cell.l, cell.c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C4CDD5' } };
    }
  );
  [{ l: lenPart + 2, c: 1 }, ...[...Array(columns - 1)].map((_, index) => ({ l: lenPI + 2, c: index + 2 }))].forEach(
    (cell) => {
      sheet.getCell(cell.l, cell.c).font = { bold: true };
      sheet.getCell(cell.l, cell.c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A2AFBC' } };
    }
  );
}
