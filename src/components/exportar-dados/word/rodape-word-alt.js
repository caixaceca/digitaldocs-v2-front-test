import {
  Table,
  Footer,
  TextRun,
  TableRow,
  TableCell,
  Paragraph,
  WidthType,
  HeightRule,
  BorderStyle,
  LineRuleType,
  VerticalAlign,
} from 'docx';

// ---- TEXTO INSTITUCIONAL --------------------------------------------------------------------------------------------

const TEXTO_INSTITUCIONAL =
  import.meta.env?.VITE_WORD_FOOTER_INSTITUCIONAL ||
  'Caixa Económica de Cabo Verde: Sede/ Headquarters: Av. Cidade de Lisboa, Cidade da Praia | Número de Identificação Fiscal: 200131753 | Matriculada sob o n.º 336 na Conservatória do Registo Comercial da Praia | Indicativo do País/Country Code (238) | Tel: 260 36 00 | Website: www.caixa.cv | caixa@caixa.cv';

// ---- CONSTANTES -----------------------------------------------------------------------------------------------------

const TABLE_W = 10544;
const ROW_H = [397, 964];
const NO_MARGINS = { top: 0, bottom: 0, left: 0, right: 0 };
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const SP = { before: 0, after: 0, line: 9 * 20, lineRule: LineRuleType.EXACT };
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideH: NONE, insideV: NONE };

// ---- HELPER ---------------------------------------------------------------------------------------------------------

const makeRow = (height, children) =>
  new TableRow({
    height: { value: height, rule: HeightRule.EXACT },
    children: [
      new TableCell({
        width: { size: TABLE_W, type: WidthType.DXA },
        verticalAlign: VerticalAlign.TOP,
        borders: NO_BORDERS,
        margins: NO_MARGINS,
        children,
      }),
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

export function RodapeWordAlt({ enabled = true, nota = null }) {
  if (!enabled) return { default: new Footer({ children: [] }) };

  const tabela = new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [TABLE_W],
    borders: NO_BORDERS,
    rows: [
      makeRow(ROW_H[0], [
        new Paragraph({ spacing: SP, children: nota ? [new TextRun({ text: nota, size: '8pt', italics: true })] : [] }),
      ]),
      makeRow(ROW_H[1], [
        new Paragraph({ spacing: SP, children: [new TextRun({ text: TEXTO_INSTITUCIONAL, size: '8pt' })] }),
      ]),
    ],
  });

  return { default: new Footer({ children: [tabela] }) };
}
