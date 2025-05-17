import { Header, Footer, TextRun, ImageRun, Paragraph, PageNumber, AlignmentType } from 'docx';

// ----------------------------------------------------------------------

export function CabecalhoWord(cabecalho, logo, codificacao) {
  return {
    default: cabecalho
      ? new Header({
          children: [
            new Paragraph({
              style: 'codificacao',
              frame: { position: { x: 1361, y: 557 }, anchor: { horizontal: 'page', vertical: 'page' } },
              children: [
                new TextRun(codificacao),
                new TextRun({ children: [' | ', PageNumber.CURRENT] }),
                new TextRun({ children: ['/', PageNumber.TOTAL_PAGES] }),
              ],
            }),
            new Paragraph({
              children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 193, height: 185 } })],
              frame: { position: { x: 9015 }, anchor: { horizontal: 'page', vertical: 'page' } },
            }),
            new Paragraph({
              style: 'slogan',
              text: 'o banco que combina comigo',
              frame: { position: { x: 9015, y: 2891 }, anchor: { horizontal: 'page', vertical: 'page' } },
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
              indent: { left: 300 },
              frame: { position: { x: 9000 }, anchor: { horizontal: 'page', vertical: 'text' }, width: 2778 },
              children: [new ImageRun({ data: iso27001, type: 'png', transformation: { width: 108.3, height: 42 } })],
            }),
            new Paragraph({
              indent: { left: 300 },
              spacing: { after: 650, before: 100 },
              frame: { position: { x: 9000 }, anchor: { horizontal: 'page', vertical: 'text' }, width: 2778 },
              children: [new ImageRun({ data: iso9001, type: 'png', transformation: { width: 108.3, height: 42 } })],
            }),
          ],
        })
      : new Footer({ children: [] }),
  };
}
