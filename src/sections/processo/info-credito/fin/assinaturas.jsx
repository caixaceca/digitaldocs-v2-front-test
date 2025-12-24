import { TextRun, Paragraph, AlignmentType } from 'docx';
// utils
import { gerarTabela } from './gerar-tabela';

// ---------------------------------------------------------------------------------------------------------------------

const assinatura = (nome) =>
  new Paragraph({
    spacing: { after: 100 },
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: '__________________________________________', break: 2 }),
      new TextRun({ text: nome, break: 1 }),
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

const assinaturaBanco = (agencia, nomeGerente) =>
  gerarTabela({
    title: 'ASSINATURA DO BANCO',
    rows: [
      {
        value: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `A Gerência da ${agencia}`, break: 1 })],
          }),
          assinatura(nomeGerente),
        ],
      },
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

const assinaturaProponente = (nomeProponente) =>
  gerarTabela({
    title: 'DECLARAÇÃO DO PROPONENTE',
    rows: [
      {
        value: [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'Declaro que tomei conhecimento e estou ciente das condições da presente FINCC de crédito. E declaro que:',
              }),
              new TextRun({
                text: '☐ Aceito as condições da proposta.\t☐ Não aceito as condições da proposta.',
                break: 2,
              }),
            ],
          }),
          assinatura(nomeProponente),
        ],
      },
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

const assinaturaFiadores = (fiadores = []) =>
  gerarTabela({
    title: 'DECLARAÇÃO DO(S) FIADOR(ES)',
    rows: [
      {
        value: [
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: 'Declaramos que tomámos conhecimento das condições da presente FINCC e estamos cientes das nossas responsabilidades na qualidade de fiadores e principais pagadores.',
              }),
            ],
          }),
          ...fiadores.map((f) => assinatura(f.nome)),
        ],
      },
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

export const assinaturas = (agencia, nomeGerente, nomeProponente, fiadores) => [
  new Paragraph({ spacing: { after: 100 } }),
  assinaturaBanco(agencia, nomeGerente),

  new Paragraph({ spacing: { after: 100 } }),
  assinaturaProponente(nomeProponente),

  ...(fiadores?.length ? [new Paragraph({ spacing: { after: 100 } }), assinaturaFiadores(fiadores)] : []),
];
