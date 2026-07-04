import {
  Table,
  Header,
  TextRun,
  TableRow,
  ImageRun,
  WidthType,
  Paragraph,
  TableCell,
  PageNumber,
  HeightRule,
  BorderStyle,
  LineRuleType,
  AlignmentType,
  VerticalAlign,
  VerticalMergeType,
} from 'docx';

// ---- CONSTANTES -----------------------------------------------------------------------------------------------------

const LOGO_W = 150;
const TABLE_W = 10544;
const ROW_H = [408, 851, 260];
const TEXT_W = TABLE_W - LOGO_W;
const LOGO_PT = { width: 143, height: 57 };

const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideH: NONE, insideV: NONE };
const NO_MARGINS = { top: 0, bottom: 0, left: 0, right: 0 };

const sp = (line) => ({ before: 0, after: 0, line, lineRule: LineRuleType.EXACT });

// ---- HELPERS --------------------------------------------------------------------------------------------------------

const textCell = (vAlign, children) =>
  new TableCell({
    width: { size: TEXT_W, type: WidthType.DXA },
    verticalAlign: vAlign,
    borders: NO_BORDERS,
    margins: NO_MARGINS,
    children,
  });

const logoCell = (logo, start) =>
  new TableCell({
    width: { size: LOGO_W, type: WidthType.DXA },
    borders: NO_BORDERS,
    margins: NO_MARGINS,
    ...(start
      ? { verticalAlign: VerticalAlign.TOP, verticalMerge: VerticalMergeType.RESTART }
      : { verticalMerge: VerticalMergeType.CONTINUE }),
    children: start
      ? [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 0, after: 0 },
            children: [new ImageRun({ data: logo, type: 'png', transformation: LOGO_PT })],
          }),
        ]
      : [new Paragraph({ children: [] })],
  });

const makeRow = (height, cell, logo, start) =>
  new TableRow({
    height: { value: height, rule: HeightRule.AT_LEAST },
    children: [cell, ...(logo ? [logoCell(logo, start)] : [])],
  });

// ---- PARÁGRAFOS -----------------------------------------------------------------------------------------------------

const pCodificacao = (cod) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: sp(260),
    children: [
      new TextRun({ text: `${cod} | `, size: '12pt' }),
      new TextRun({ size: '12pt', children: [PageNumber.CURRENT] }),
      new TextRun({ text: '/', size: '12pt' }),
      new TextRun({ size: '12pt', children: [PageNumber.TOTAL_PAGES] }),
    ],
  });

const pTitulo = (titulo) =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: sp(360),
    children: [new TextRun({ text: titulo, size: '15pt' })],
  });

const pBanco = () =>
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: sp(260),
    children: [new TextRun({ text: 'Caixa Económica de Cabo Verde', size: '12pt' })],
  });

// ---------------------------------------------------------------------------------------------------------------------

export function CabecalhoWordAlt({ enabled = true, logo, codificacao, titulo }) {
  if (!enabled) return { default: new Header({ children: [] }) };

  const tabela = new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: logo ? [TEXT_W, LOGO_W] : [TABLE_W],
    borders: NO_BORDERS,
    rows: [
      makeRow(ROW_H[0], textCell(VerticalAlign.TOP, [pCodificacao(codificacao)]), logo, true),
      makeRow(ROW_H[1], textCell(VerticalAlign.TOP, [pTitulo(titulo)]), logo, false),
      makeRow(ROW_H[2], textCell(VerticalAlign.BOTTOM, [pBanco()]), logo, false),
    ],
  });

  return { default: new Header({ children: [tabela] }) };
}
