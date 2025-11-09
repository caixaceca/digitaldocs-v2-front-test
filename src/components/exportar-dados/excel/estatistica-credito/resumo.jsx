import { sumBy } from 'lodash';
// utils
import {
  segmentos,
  filtrarSegLinha,
  dadosNaoClassificados,
} from '../../../../sections/indicadores/estatistica-credito/resumo';
import { estiloCabecalho } from '../formatacoes';
import { ptDate } from '../../../../utils/formatTime';
//
import { dadosPorItem } from './dados-fase';
import { addNaoClassificados } from './index';
import { valorMoeda, colunasSI, celulasConteudo } from './formatacoes';

// ---------------------------------------------------------------------------------------------------------------------

export default function resumoEstatistica({ cc, moeda, dados, uo, data, resumoSheet }) {
  const naoClassificados = dadosNaoClassificados(dados);
  const rowsResumo = segmentos.flatMap((seg) => gerarLinhasSegmento(seg.nome, seg.linhas, dados, moeda));
  rowsResumo.push(
    ['Entidades Públicas', null, ...Object.values(dadosResumo(dados, 'Entidade Pública', '', moeda))],
    ['Garantias Bancárias', null, ...Object.values(dadosResumo(dados, '', 'Garantia Bancária', moeda))],
    ['TOTAL ACUMULADO', null, ...Object.values(dadosResumo(dados, '', '', moeda))]
  );

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
  resumoSheet.addRow([null, 'Tesouraria', ...Object.values(dadosResumo(dados, '', 'Tesouraria'))]);
  resumoSheet.addRow([null, 'Investimento', ...Object.values(dadosResumo(dados, '', 'Investimento'))]);

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
      { text: data, font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 } },
      { text: '\nGerado por: ', font: { bold: false, color: { argb: 'FFFFFF' }, size: 12 } },
      { text: cc?.nome || '', font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 } },
      { text: ` (${ptDate(new Date())})`, font: { bold: false, color: { argb: 'FFFFFF' }, size: 12 } },
    ],
  };
  resumoSheet.getCell('A1').alignment = { wrapText: true, vertical: 'middle' };
  resumoSheet.getRow(1).height = 80;

  if (naoClassificados?.length > 0) addNaoClassificados(resumoSheet, naoClassificados, 'resumo', moeda);
}

// ---------------------------------------------------------------------------------------------------------------------

function dadosResumo(dados, segmento, linha, moeda) {
  const entradas = dadosPorItem(dados?.entrada, segmento, linha);
  const aprovados = dadosPorItem(dados?.aprovado, segmento, linha);
  const contratados = dadosPorItem(dados?.contratado, segmento, linha);
  const indeferidos = dadosPorItem(dados?.indeferido, segmento, linha);
  const desistidos = dadosPorItem(dados?.desistido, segmento, linha);

  return {
    qtdEnt: sumBy(entradas, 'total'),
    valorEnt: valorMoeda(sumBy(entradas, 'montantes'), moeda),
    qtdAp: sumBy(aprovados, 'total'),
    valorAp: valorMoeda(sumBy(aprovados, 'montante_aprovado'), moeda),
    qtdCont: sumBy(contratados, 'total'),
    valorCont: valorMoeda(sumBy(contratados, 'montante_contratado'), moeda),
    qtdId: sumBy(indeferidos, 'total') + sumBy(desistidos, 'total'),
    valorId: valorMoeda(sumBy(indeferidos, 'montantes') + sumBy(desistidos, 'montantes'), moeda),
  };
}

// ---------------------------------------------------------------------------------------------------------------------

function gerarLinhasSegmento(segmento, linhas, dados, moeda) {
  const rows = linhas?.map((linha, idx) => [
    idx === 0 ? segmento : null,
    linha,
    ...Object.values(dadosResumo(dados, segmento, linha, moeda)),
  ]);

  rows.push([null, null, ...Object.values(dadosResumo(filtrarSegLinha(dados, segmento, linhas), segmento, '', moeda))]);
  return rows;
}
