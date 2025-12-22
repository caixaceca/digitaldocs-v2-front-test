import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
// docx
import { Packer, TextRun, Document, Paragraph, AlignmentType } from 'docx';
// @mui
import Stack from '@mui/material/Stack';
// utils
import { ptDate } from '../../../../utils/formatTime';
import { fCurrency, fPercent } from '../../../../utils/formatNumber';
import { CabecalhoWord, RodapeWord, createStyles } from '../../../../components/exportar-dados/word';
//
import DownloadModelo from './download-modelo';
import { assinaturas } from '../../info-credito/fin/assinaturas';
import { gerarTabela } from '../../info-credito/fin/gerar-tabela';

// ---------------------------------------------------------------------------------------------------------------------

export default function CartaPropostaWord({ dados = {} }) {
  const { enqueueSnackbar } = useSnackbar();

  const defaulted = {
    proponente_nome: dados?.titular ?? 'Nome do proponente',
    fiadores: [
      { nome: 'Nome Fiador 1', estadoCivil: 'Solteiro', nif: '124357453', residencia: 'Palmarejo' },
      { nome: 'Nome Fiador 2', estadoCivil: 'Solteira', nif: '223145321', residencia: 'Fazenda' },
    ],
    data_proposta: new Date(),
    data_solicitacao: dados?.data_entrada ?? '2025-01-21',
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

      const condicoesGerais = gerarTabela({
        columns: 2,
        columnsWidth: [40, 60],
        title: 'CONDIÇÕES GERAIS',
        rows: [
          [2, 1, 'Modalidade', 'Mútuo, na modalidade de CrediCaixa'],
          [
            2,
            1,
            `Montante aprovado`,
            `${fCurrency(montante ?? 0)} CVE, corresponde a 16 meses de vencimento do proponente.`,
          ],
          [
            2,
            1,
            `Desembolso`,
            `Numa única tranche no prazo máximo de ${prazoEntregaContrato} dias úteis após entrega do contrato com as assinaturas reconhecidas perante o Notário.`,
          ],
          [2, 1, `Forma de utilização`, 'Imediata, na data de disponibilização do crédito.'],
          [2, 1, `Prazo de amortização`, `${prazoAmortizacao} meses, a contar da data de assinatura do contrato.`],
          [
            2,
            1,
            `Taxa de juro anual nominal (TAN)`,
            [
              new TextRun({ text: `${fPercent(tan)} ao ano, sujeito às alterações do preçário da Caixa` }),
              new TextRun({
                text: 'Os juros serão contados sobre o capital utilizado e efetivamente em dívida e serão incluídos nas prestações de reembolso.',
                break: 2,
              }),
            ],
          ],
          [2, 1, `TAEG`, `${fPercent(taeg)} conforme cálculo efetuado nos termos legais.`],
          [2, 1, `Taxa de juro de mora`, `${fPercent(taxaMora)} a.a. que acresce à TAN, em caso de mora.`],
          [
            2,
            1,
            `Garantia`,
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
            2,
            1,
            `Reembolso`,
            `Em ${prazoAmortizacao} prestações mensais e consecutivas de ${fCurrency(Math.round((montante || 0) / prazoAmortizacao))} CVE cada, acrescido de imposto de selo sobre os juros.`,
          ],
        ],
      });

      const encargos = gerarTabela({
        columns: 2,
        columnsWidth: [40, 60],
        title: 'ENCARGOS INICIAIS',
        rows: [
          [
            2,
            1,
            'Comissão de abertura',
            `À taxa de ${comissaoAbertura}. No montante de ${fCurrency(valorComissaoAbertura ?? 0)}.`,
          ],
          [
            2,
            1,
            'Imposto de selo sobre crédito',
            `À taxa de ${fPercent(impostoSelo)}. No montante de ${fCurrency(valorImpostoSelo ?? 0)}.`,
          ],
          [
            2,
            1,
            'Imposto de selo sobre comissão',
            `À taxa de 3,5%. No montante de ${fCurrency(valorImpostoSeloComissao ?? 0)}.`,
          ],
          [
            2,
            1,
            'Total de encargos iniciais',
            `${fCurrency(encargosIniciais ?? 0)}. Todos os pagamentos serão efetuados por débito na conta nº ${contaPagamento} do proponente.`,
          ],
        ],
      });

      const obrigacoes = gerarTabela({
        columnsWidth: [40, 60],
        title: 'OUTRAS OBRIGAÇÕES',
        rows: [
          [
            1,
            1,
            'Domiciliação de salário',
            'Em caso de contratualização, o Proponente e Fiadores obrigam-se a manter o salário/pensão/outros rendimentos domiciliados na Caixa enquanto perdurarem as obrigações contratuais.',
          ],
          [
            1,
            1,
            'Contratualização',
            `O contrato deverá ser assinado e devolvido no prazo máximo de ${prazoEntregaContrato} dias úteis, sob pena da proposta ser considerada sem efeito.`,
          ],
        ],
      });

      const doc = new Document({
        creator: 'Intranet - Caixa Económica de Cabo Verde',
        title: `Carta Proposta - ${nomeProponente}`,
        styles: createStyles('10pt'),
        sections: [
          {
            properties: { page: { margin: { top: '58mm', right: '18mm', left: '18mm' } } },
            headers: CabecalhoWord({ enabled: true, logo, codificacao: 'JRDC.FM.C.023.00', titulo: '' }),
            footers: RodapeWord({ enabled: true, certificacoes: [iso27001, iso9001] }),
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
              ...assinaturas(agencia, nomeGerente, nomeProponente, fiadores),
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
    <Stack sx={{ mt: 1 }}>
      <DownloadModelo modelo="Modelo de Carta Proposta - CrediCaixa.docx" onClick={exportToWord} />
    </Stack>
  );
}
