import {
  Table,
  TextRun,
  TableRow,
  TableCell,
  Paragraph,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  AlignmentType,
} from 'docx';

// ---------------------------------------------------------------------------------------------------------------------

const PT_TO_TWIPS = 20;
const LEVEL_INDENT_PT = 8;
const BASE_LEFT_MARGIN = 120;

const borderConf = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
};

// ---------------------------------------------------------------------------------------------------------------------

const calcLeftMarginByLevel = (level = 1) => {
  if (level <= 1) return BASE_LEFT_MARGIN;
  return BASE_LEFT_MARGIN + (level - 1) * LEVEL_INDENT_PT * PT_TO_TWIPS;
};

const normalizeChildren = (value, bold = false) => {
  if (typeof value === 'string' || typeof value === 'number') {
    return [new TextRun({ text: String(value), bold })];
  }

  if (Array.isArray(value) && value.every((v) => v instanceof TextRun)) {
    return value;
  }

  return [new TextRun({ text: 'Não identificado' })];
};

const createCell = ({ size, shading, children, level = 1, columnSpan, bold = false }) => {
  const justified = !bold && !Array.isArray(children);
  const paragraphs =
    Array.isArray(children) && children[0] instanceof Paragraph
      ? children
      : [
          new Paragraph({
            spacing: justified ? { line: 276 } : undefined,
            children: normalizeChildren(children, bold, 20),
            alignment: justified ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
          }),
        ];

  return new TableCell({
    shading,
    columnSpan,
    borders: borderConf,
    verticalAlign: VerticalAlign.CENTER,
    width: { size, type: WidthType.PERCENTAGE },
    margins: { top: 60, bottom: 60, left: calcLeftMarginByLevel(level), right: 80 },
    children: paragraphs,
  });
};

const createRow = (cells) => new TableRow({ children: cells });

// ---------------------------------------------------------------------------------------------------------------------

export const header = (title, columns) =>
  createRow([
    createCell({
      size: 100,
      bold: true,
      children: title,
      columnSpan: columns,
      shading: { fill: 'DCDCDC', type: ShadingType.CLEAR },
    }),
  ]);

export const headerSection = (section, columns) =>
  createRow([
    createCell({
      size: 100,
      bold: true,
      columnSpan: columns,
      shading: { fill: '5AAA28', type: ShadingType.CLEAR },
      children: [new TextRun({ text: section, color: 'FFFFFF', bold: true })],
    }),
  ]);

// ---------------------------------------------------------------------------------------------------------------------

const buildOneColumnRows = ({ level, label, value, columns }) => {
  const rows = [];

  if (label !== undefined && label !== null && label !== '') {
    rows.push(createRow([createCell({ level, bold: true, children: label, columnSpan: columns, size: 100 })]));
  }
  if (value !== undefined && value !== null && value !== '') {
    rows.push(createRow([createCell({ level, children: value, columnSpan: columns, size: 100 })]));
  }

  return rows;
};

const buildTwoColumnRows = ({ level, label, value, columnsWidth }) => [
  createRow([
    createCell({ children: label, bold: true, level, size: columnsWidth[0] }),
    createCell({ children: value, size: columnsWidth[1] }),
  ]),
];

// ---------------------------------------------------------------------------------------------------------------------

export const gerarTabela = ({ columns = 1, title = '', rows = [], section = '', columnsWidth = [45, 55] }) => {
  if (!Array.isArray(rows)) {
    throw new Error('rows deve ser um array');
  }

  const body = rows.flatMap(({ cells = 1, level = 1, label = '', value = null }) => {
    if (cells === 2) {
      return buildTwoColumnRows({ level, label, value, columnsWidth });
    }
    return buildOneColumnRows({ level, label, value, columns });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [...(section ? [headerSection(section, columns)] : []), ...(title ? [header(title, columns)] : []), ...body],
  });
};
