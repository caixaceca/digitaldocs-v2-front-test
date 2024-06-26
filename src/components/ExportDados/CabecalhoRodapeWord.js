import {
  Header,
  Footer,
  TextRun,
  ImageRun,
  Table,
  TableCell,
  TableRow,
  Paragraph,
  PageNumber,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';

// ----------------------------------------------------------------------

export function CabecalhoWord(cabecalho, logo, codificacao) {
  return {
    default: cabecalho
      ? new Header({
          children: [
            new Paragraph({
              style: 'codificacao',
              frame: { position: { x: '24mm', y: '10mm' }, anchor: { horizontal: 'page', vertical: 'page' } },
              children: [
                new TextRun({ children: [codificacao, ' | ', PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES] }),
              ],
            }),
            new Paragraph({
              children: [new ImageRun({ data: logo, transformation: { width: 193, height: 185 } })],
              frame: { position: { x: '159mm' }, anchor: { horizontal: 'page', vertical: 'page' } },
            }),
            new Paragraph({
              style: 'slogan',
              text: 'o banco que combina comigo',
              frame: { position: { x: '159mm', y: '51mm' }, anchor: { horizontal: 'page', vertical: 'page' } },
            }),
          ],
        })
      : new Header({ children: [] }),
  };
}

// ----------------------------------------------------------------------

export function RodapeWord(rodape, iso27001, iso9001) {
  return {
    default: rodape
      ? new Footer({
          children: [
            new Paragraph({
              style: 'slogan',
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'Caixa Económica de Cabo Verde, S.A.', break: 1 }),
                new TextRun({
                  text: 'Capital social nominal de 1.392.000.000$00, Conserv. do Reg. Comerc. da Praia nº 336',
                  break: 1,
                }),
                new TextRun({
                  text: 'Sede: Av. Cidade de Lisboa, C.P. 199, Praia, Ilha de Santiago, Cabo Verde',
                  break: 1,
                }),
                new TextRun({ text: 'Tel. +238 260 36 00, fax +238 261 55 60, e-mail: caixa@caixa.cv', break: 1 }),
                new TextRun({ text: 'NIF: 200131753, Swift: CXEC CV CV', break: 1 }),
                new TextRun({ text: 'O único banco em Cabo Verde certificado ISO 9001 e ISO 27001', break: 1 }),
              ],
            }),
            new Paragraph({
              frame: { position: { x: '168mm' }, anchor: { horizontal: 'page', vertical: 'text' } },
              children: [new ImageRun({ data: iso27001, transformation: { width: 94, height: 40 } })],
            }),
            new Paragraph({
              spacing: { after: '10mm' },
              frame: { position: { x: '168mm' }, anchor: { horizontal: 'page', vertical: 'text' } },
              children: [new ImageRun({ data: iso9001, transformation: { width: 94, height: 40 } })],
            }),
          ],
        })
      : new Footer({ children: [] }),
  };
}

export function RodapeWordAlt(rodape, codificacao) {
  return {
    default: rodape
      ? new Footer({
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: codificacao, size: '8pt' })] })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES],
                              size: '8pt',
                            }),
                          ],
                          alignment: AlignmentType.RIGHT,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      : new Footer({ children: [] }),
  };
}
