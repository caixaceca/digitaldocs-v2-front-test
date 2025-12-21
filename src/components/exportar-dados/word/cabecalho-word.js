import { Header, Paragraph, TextRun, ImageRun, PageNumber, AlignmentType } from 'docx';

// -------------------------------------------------------------------------------------------------

function criarCodificacao(codificacao) {
  if (!codificacao) return null;

  return new Paragraph({
    style: 'codificacao',
    frame: { position: { x: 1361, y: 557 }, anchor: { horizontal: 'page', vertical: 'page' } },
    children: [
      new TextRun(codificacao),
      new TextRun({ text: ' | ' }),
      new TextRun({ children: [PageNumber.CURRENT] }),
      new TextRun({ text: '/' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
    ],
  });
}

// -------------------------------------------------------------------------------------------------

function criarLogo(logo) {
  if (!logo) return null;

  return new Paragraph({
    frame: { position: { x: 9015 }, anchor: { horizontal: 'page', vertical: 'page' } },
    children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 193, height: 185 } })],
  });
}

// -------------------------------------------------------------------------------------------------

function criarSlogan(texto) {
  if (!texto) return null;

  return new Paragraph({
    style: 'slogan',
    frame: { position: { x: 9015, y: 2891 }, anchor: { horizontal: 'page', vertical: 'page' } },
    text: texto,
  });
}

// -------------------------------------------------------------------------------------------------

function criarTituloCentral(titulo) {
  if (!titulo) return null;

  return new Paragraph({
    alignment: AlignmentType.LEFT,
    frame: { position: { x: 1361, y: 1500 }, anchor: { horizontal: 'page', vertical: 'page' } },
    children: [new TextRun({ text: titulo, bold: true })],
  });
}

// -------------------------------------------------------------------------------------------------

export function CabecalhoWord({ enabled = true, logo, codificacao, titulo, slogan = 'o banco que combina comigo' }) {
  if (!enabled) {
    return { default: new Header({ children: [] }) };
  }

  return {
    default: new Header({
      children: [
        criarCodificacao(codificacao),
        criarTituloCentral(titulo),
        criarLogo(logo),
        criarSlogan(slogan),
      ].filter(Boolean),
    }),
  };
}
