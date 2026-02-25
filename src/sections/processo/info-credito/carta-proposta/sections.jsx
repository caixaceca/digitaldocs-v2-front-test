// docx
import { TextRun } from 'docx';
// utils
import { gerarTabela } from '../fin/gerar-tabela';
import { extrairDescricaoGarantias } from './garantias';
import { fCurrency, fPercent } from '@/utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

export const condicoesGerais = (dados) =>
  gerarTabela({
    columns: 2,
    columnsWidth: [35, 65],
    title: 'CONDIÇÕES GERAIS',
    rows: [
      { cells: 2, label: 'Modalidade', value: 'Mútuo, na modalidade de CrediCaixa' },
      {
        cells: 2,
        label: `Montante aprovado`,
        value: `${fCurrency(dados?.montante) || 'XX CVE'}, corresponde a ${
          dados?.meses_vencimento || 'XX'
        } meses de vencimento do proponente.`,
      },
      {
        cells: 2,
        label: `Desembolso`,
        value: `Numa única tranche no prazo máximo de ${
          dados?.prazo_entrega_contrato || '15'
        } dias úteis após entrega do contrato com as assinaturas reconhecidas perante o Notário.`,
      },
      { cells: 2, label: `Forma de utilização`, value: 'Imediata, na data de disponibilização do crédito.' },
      {
        cells: 2,
        label: `Prazo de amortização`,
        value: `${dados?.prazo_amortizacao || 'XX'} meses, a contar da data de assinatura do contrato.`,
      },
      {
        cells: 2,
        label: `Taxa de juro anual nominal (TAN)`,
        value: [
          new TextRun({
            text: `${fPercent(dados?.tan, 3) || 'X%'} ao ano, sujeito às alterações do preçário da Caixa`,
          }),
          new TextRun({
            text: 'Os juros serão contados sobre o capital utilizado e efetivamente em dívida e serão incluídos nas prestações de reembolso.',
            break: 2,
          }),
        ],
      },
      {
        cells: 2,
        label: `TAEG`,
        value: `${fPercent(dados?.taeg, 3) || 'X%'} conforme cálculo efetuado nos termos legais.`,
      },
      {
        cells: 2,
        label: `Taxa de juro de mora`,
        value: `${fPercent(dados?.taxa_mora) || '2%'} a.a. que acresce à TAN, em caso de mora.`,
      },
      { cells: 2, label: `Garantia`, value: extrairDescricaoGarantias(dados?.garantias_brutas) },
      {
        cells: 2,
        label: `Reembolso`,
        value: `Em ${dados?.prazo_amortizacao || 'XX'} prestações mensais e consecutivas de ${
          fCurrency(dados?.valor_prestacao) || 'XX CVE'
        } cada, acrescido de imposto de selo sobre os juros.`,
      },
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

export const encargos = (dados) =>
  gerarTabela({
    columns: 2,
    columnsWidth: [35, 65],
    title: 'ENCARGOS INICIAIS',
    rows: [
      {
        cells: 2,
        label: 'Comissão de abertura',
        value: `À taxa de ${fPercent(dados?.comissao_abertura) || 'X%'}. No montante de ${
          fCurrency(dados?.valor_comissao_abertura) || 'XX CVE'
        }.`,
      },
      {
        cells: 2,
        label: 'Imposto de selo sobre crédito',
        value: `À taxa de ${fPercent(dados?.imposto_selo) || 'X%'}. No montante de ${
          fCurrency(dados?.valor_imposto_selo) || 'XX CVE'
        }.`,
      },
      {
        cells: 2,
        label: 'Imposto de selo sobre comissão',
        value: `À taxa de ${fPercent(dados?.imposto_selo_comissao) || 'X%'}. No montante de ${
          fCurrency(dados?.valor_imposto_selo_comissao) || 'XX CVE'
        }.`,
      },
      {
        cells: 2,
        label: 'Total de encargos iniciais',
        value: `${
          fCurrency(dados?.valor_encargos_iniciais) || 'XX CVE'
        }. Todos os pagamentos serão efetuados por débito na conta nº ${dados?.conta_pagamento ?? 'XX'} do proponente.`,
      },
    ],
  });

// ---------------------------------------------------------------------------------------------------------------------

export const obrigacoes = (dados) =>
  gerarTabela({
    columns: 2,
    columnsWidth: [35, 65],
    title: 'OUTRAS OBRIGAÇÕES',
    rows: [
      {
        cells: 2,
        label: 'Domiciliação de salário',
        value:
          'Em caso de contratualização, o Proponente e Fiadores obrigam-se a manter o salário/pensão/outros rendimentos domiciliados na Caixa enquanto perdurarem as obrigações contratuais.',
      },
      {
        cells: 2,
        label: 'Seguros',
        value: dados?.tem_seguro
          ? `Obrigatória a manutenção do seguro (${dados?.descricao_seguro}) durante a vigência do contrato.`
          : 'Não aplicável (salvo condições específicas de preçário).',
      },
      {
        cells: 2,
        label: 'Contratualização',
        value: `O contrato deverá ser assinado e devolvido no prazo máximo de ${
          dados?.prazo_entrega_contrato ?? '15'
        } dias úteis, sob pena da proposta ser considerada sem efeito.`,
      },
    ],
  });
