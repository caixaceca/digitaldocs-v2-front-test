import { Footer, Paragraph, TextRun, AlignmentType, ImageRun } from 'docx';

// -------------------------------------------------------------------------------------------------

const INSTITUCIONAL_TEXT = [
  'Caixa Económica de Cabo Verde, S.A.',
  'Capital social nominal de 1.392.000.000$00, Conserv. do Reg. Comerc. da Praia nº 336',
  'Sede: Av. Cidade de Lisboa, C.P. 199, Praia, Ilha de Santiago, Cabo Verde',
  'Tel. +238 260 36 00, fax +238 261 55 60, e-mail: caixa@caixa.cv',
  'NIF: 200131753, Swift: CXEC CV CV',
  'O único banco em Cabo Verde certificado ISO 9001 e ISO 27001',
];

// -------------------------------------------------------------------------------------------------

function criarParagrafoInstitucional() {
  return new Paragraph({
    style: 'slogan',
    alignment: AlignmentType.RIGHT,
    children: INSTITUCIONAL_TEXT.map((linha) => new TextRun({ text: linha, break: 1 })),
  });
}

// -------------------------------------------------------------------------------------------------

function criarParagrafoImagem(imageData, index) {
  if (!imageData) return null;

  return new Paragraph({
    indent: { left: 300 },
    spacing: { after: index === 0 ? 0 : 650, before: index === 0 ? 0 : 100 },
    frame: { position: { x: 9000 }, anchor: { horizontal: 'page', vertical: 'text' }, width: 2778 },
    children: [new ImageRun({ data: imageData, type: 'png', transformation: { width: 108.3, height: 42 } })],
  });
}

// -------------------------------------------------------------------------------------------------

export function RodapeWord({ enabled = true, certificacoes = [] }) {
  if (!enabled) {
    return { default: new Footer({ children: [] }) };
  }
  const imagensCertificacao = certificacoes.map(criarParagrafoImagem).filter(Boolean);

  return { default: new Footer({ children: [criarParagrafoInstitucional(), ...imagensCertificacao] }) };
}
