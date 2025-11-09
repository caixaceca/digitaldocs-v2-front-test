import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import {
  Table,
  Packer,
  TextRun,
  Document,
  TableRow,
  Paragraph,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  AlignmentType,
} from 'docx';
// @mui
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
// utils
import { ptDate } from '../../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../../utils/formatNumber';
import { CabecalhoWord, RodapeWord, stylesWord } from '../../../../components/exportar-dados/word';
//
import DownloadModelo from './download-modelo';

// ---------------------------------------------------------------------------------------------------------------------

export default function CartaPropostaWord({ dados = {} }) {
  const { enqueueSnackbar } = useSnackbar();

  const defaulted = {
    proponente_nome: 'Joel Freire Fortes',
    fiadores: [{ nome: 'Bryan Freire Fortes' }, { nome: 'Doriana Lopes Alves' }],
    data_proposta: new Date(),
    data_solicitacao: '2025-01-21',
    montante: 1250000,
    prazo_amortizacao: 60,
    tan: 11,
    taeg: 13.153,
    taxa_mora: 2,
    comissao_abertura: 1.75,
    valor_comissao_abertura: 1250,
    imposto_selo_credito: 0.5,
    valor_imposto_selo_credito: 136,
    valor_imposto_selo_comissao: 250,
    valor_total_encargos_iniciais: 12500,
    conta_pagamento: '3929767210001',
    agencia: 'PLATEAU',
    prazo_entrega_contrato: 15,
    gerente_nome: 'Nome do Gerente',
    agencia_localizacao: 'Plateau',
    ...dados,
  };

  const fCVE = (v) => fCurrency(v || 0);

  const gerarTabela = (titulo, linhas, cells) => {
    const borderConf = {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'd9d9d9' },
    };

    const header = new TableRow({
      children: [
        new TableCell({
          columnSpan: cells,
          borders: borderConf,
          verticalAlign: VerticalAlign.CENTER,
          shading: { fill: 'f2f2f2', type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          children: [
            new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: titulo, bold: true })] }),
          ],
        }),
      ],
    });

    const rows =
      cells === 2
        ? linhas.map(
            ([campo, valor]) =>
              new TableRow({
                children: [
                  new TableCell({
                    borders: borderConf,
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    margins: { top: 100, bottom: 50, left: 120, right: 120 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: campo, bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: borderConf,
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    margins: { top: 100, bottom: 50, left: 120, right: 120 },
                    children: [
                      new Paragraph({
                        spacing: { line: 300 },
                        alignment: AlignmentType.JUSTIFIED,
                        children: valor instanceof Array ? valor : [new TextRun({ text: valor })],
                      }),
                    ],
                  }),
                ],
              })
          )
        : [
            new TableRow({
              children: [
                new TableCell({
                  borders: borderConf,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  margins: { top: 100, bottom: 200, left: 120, right: 120 },
                  children: linhas,
                }),
              ],
            }),
          ];

    return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] });
  };

  const assinatura = (nome) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '__________________________________________', break: 2 }),
        new TextRun({ text: nome, break: 1 }),
      ],
    });

  const exportToWord = async (setLoading) => {
    try {
      setLoading(true);

      const [logo, iso27001, iso9001] = await Promise.all([
        fetch('/assets/caixa_logo_carta.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso27001.png').then((r) => r.arrayBuffer()),
        fetch('/assets/iso9001.png').then((r) => r.arrayBuffer()),
      ]);

      const {
        tan,
        taeg,
        agencia,
        fiadores,
        montante,
        taxa_mora: taxaMora,
        gerente_nome: nomeGerente,
        data_proposta: dataProposta,
        conta_pagamento: contaPagamento,
        proponente_nome: nomeProponente,
        data_solicitacao: dataSolicitado,
        imposto_selo_credito: impostoSelo,
        prazo_amortizacao: prazoAmortizacao,
        comissao_abertura: comissaoAbertura,
        agencia_localizacao: agenciaLocalizacao,
        valor_imposto_selo_credito: valorImpostoSelo,
        prazo_entrega_contrato: prazoEntregaContrato,
        valor_comissao_abertura: valorComissaoAbertura,
        valor_total_encargos_iniciais: encargosIniciais,
        valor_imposto_selo_comissao: valorImpostoSeloComissao,
      } = defaulted;

      const condicoesGerais = gerarTabela(
        'CONDIÇÕES GERAIS',
        [
          ['Modalidade', 'Mútuo, na modalidade de CrediCaixa'],
          ['Montante aprovado', `${fCVE(montante)} CVE, corresponde a 16 meses de vencimento do proponente.`],
          [
            'Desembolso',
            `Numa única tranche no prazo máximo de ${prazoEntregaContrato} dias úteis após entrega do contrato com as assinaturas reconhecidas perante o Notário.`,
          ],
          ['Forma de utilização', 'Imediata, na data de disponibilização do crédito.'],
          ['Prazo de amortização', `${prazoAmortizacao} meses, a contar da data de assinatura do contrato.`],
          [
            'Taxa de juro anual nominal (TAN)',
            [
              new TextRun({ text: `${fPercent(tan)} ao ano, sujeito às alterações do preçário da Caixa` }),
              new TextRun({
                text: 'Os juros serão contados sobre o capital utilizado e efetivamente em dívida e serão incluídos nas prestações de reembolso.',
                break: 2,
              }),
            ],
          ],
          ['TAEG', `${fPercent(taeg)} conforme cálculo efetuado nos termos legais.`],
          ['Taxa de juro de mora', `${fPercent(taxaMora)} a.a. que acresce à TAN, em caso de mora.`],
          [
            'Garantia',
            [
              new TextRun({ text: 'Fiança solidária sem benefício de excussão prévia, prestada por:' }),
              ...fiadores.map(
                (f) =>
                  new TextRun({
                    text: `- ${f?.nome}, ${f?.estadoCivil || ''}, NATURAL DE ${f?.naturalidade || ''}, NIF ${f?.nif || ''}, RESIDENTE EM ${f?.residencia || ''}`,
                    break: 1,
                  })
              ),
            ],
          ],
          [
            'Reembolso',
            `Em ${prazoAmortizacao} prestações mensais e consecutivas de ${fCVE(Math.round((montante || 0) / prazoAmortizacao))} CVE cada, acrescido de imposto de selo sobre os juros.`,
          ],
        ],
        2
      );

      const encargos = gerarTabela(
        'ENCARGOS',
        [
          ['Comissão de abertura', `À taxa de ${comissaoAbertura}. No montante de ${fCVE(valorComissaoAbertura)}.`],
          [
            'Imposto de selo sobre crédito',
            `À taxa de ${fPercent(impostoSelo)}. No montante de ${fCVE(valorImpostoSelo)}.`,
          ],
          ['Imposto de selo sobre comissão', `À taxa de 3,5%. No montante de ${fCVE(valorImpostoSeloComissao)}.`],
          [
            'Total de encargos iniciais',
            `${fCVE(encargosIniciais)}. Todos os pagamentos serão efetuados por débito na conta nº ${contaPagamento} do proponente.`,
          ],
        ],
        2
      );

      const obrigacoes = gerarTabela(
        'OUTRAS OBRIGAÇÕES',
        [
          [
            'Domiciliação de salário',
            'Em caso de contratualização, o Proponente e Fiadores obrigam-se a manter o salário/pensão/outros rendimentos domiciliados na Caixa enquanto perdurarem as obrigações contratuais.',
          ],
          [
            'Contratualização',
            `O contrato deverá ser assinado e devolvido no prazo máximo de ${prazoEntregaContrato} dias úteis, sob pena da proposta ser considerada sem efeito.`,
          ],
        ],
        2
      );

      const declaracaoProponente = gerarTabela(
        'DECLARAÇÃO DO PROPONENTE',
        [
          new Paragraph({
            spacing: { line: 300 },
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: 'Declaro que tomei conhecimento e estou ciente das condições da presente carta-proposta de crédito. E declaro que:',
              }),
              new TextRun({
                text: '☐ Aceito as condições da proposta.\t☐ Não aceito as condições da proposta.',
                break: 2,
              }),
            ],
          }),
          ...[assinatura(nomeProponente)],
        ],
        1
      );

      const declaracaoFiadores = gerarTabela(
        'DECLARAÇÃO DOS FIADORES',
        [
          new Paragraph({
            spacing: { line: 300 },
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: 'Declaramos que tomamos conhecimento das condições da presente proposta e estamos cientes das nossas responsabilidades na qualidade de fiadores e principais pagadores.',
              }),
            ],
          }),
          ...fiadores?.map((f) => assinatura(f.nome)),
        ],
        1
      );

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        title: `Carta Proposta - ${nomeProponente}`,
        styles: stylesWord,
        sections: [
          {
            properties: { page: { margin: { top: '60mm', bottom: '40mm', right: '24mm', left: '24mm' } } },
            headers: CabecalhoWord(true, logo, 'JRDC.FM.C.023.00'),
            footers: RodapeWord(true, iso27001, iso9001),
            children: [
              new Paragraph({
                style: 'titulo',
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Carta Proposta' })],
              }),

              new Paragraph({
                spacing: { line: 300 },
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: `Exmo. Sr(a). ${nomeProponente}`, break: 1 }),
                  new TextRun({
                    text: `${agenciaLocalizacao}, ${ptDate(dataProposta)}`,
                    break: 2,
                  }),
                  new TextRun({
                    text: `Comunicamos que o crédito solicitado em ${ptDate(dataSolicitado) ?? '___/___/______'} foi aprovado nas seguintes condições:`,
                    break: 2,
                  }),
                ].filter(Boolean),
              }),

              new Paragraph({ text: '', break: 1 }),
              condicoesGerais,
              new Paragraph({ text: '', break: 1 }),
              encargos,
              new Paragraph({ text: '', break: 1 }),
              obrigacoes,

              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: 'Sem outro assunto, apresentamos os nossos melhores cumprimentos', break: 1 }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `A Gerência da Agência ${agencia}`, break: 2 })],
              }),
              new Paragraph({ text: '', break: 1 }),
              new Paragraph({ text: '', break: 1 }),
              ...[assinatura(nomeGerente)],

              new Paragraph({ text: '', break: 2 }),
              declaracaoProponente,
              new Paragraph({ text: '', break: 1 }),
              declaracaoFiadores,
            ],
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `Carta Proposta - ${nomeProponente || 'Proponente'}.docx`);
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao gerar Carta Proposta', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Divider textAlign="left" sx={{ mt: 1.5, mb: 0.5, typography: 'overline' }}>
        Modelo de Carta Proposta
      </Divider>

      <DownloadModelo modelo="Modelo - CrediCaixa.docx" onClick={exportToWord} />
    </Stack>
  );
}
