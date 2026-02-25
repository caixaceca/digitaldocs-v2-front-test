import { fCurrency, fPercent } from '@/utils/formatNumber';

export const mapearPayloadParaFINCC = (payload) => {
  if (!payload) return {};

  const credito = payload.credito || {};
  const meta = credito.gaji9_metadados || {};

  const primeiroSeguro = credito.seguros?.[0] || {};
  const listaGarantias = credito.garantias?.map((g) => g.tipo_garantia).join(', ') || '--';

  return {
    // --- SEÇÃO A: IDENTIFICAÇÃO ---
    mutuario: payload.titular || '--',
    obs_juridico_simulacao: '--',
    obs_juridico_aprovacao: '--',

    // --- SEÇÃO B: CARACTERÍSTICAS ---
    produto: credito.linha || '--',
    modalidade: credito.componente || '--',
    finalidade: credito.finalidade || '--',
    tipo_credito: 'Crédito Consumo',
    campanha: '--',
    abertura_conta_do: meta.conta_do_renda ? 'Sim' : 'Não',
    adesao_outro_produto: meta.colaborador_empresa_parceira ? 'Sim (Protocolo Empresa)' : 'Não',
    disponibilizacao_tranches: meta.montante_tranches_credibolsa ? 'Sim' : 'Não',
    montante: fCurrency(credito.montante_solicitado || 0),
    duracao_contrato: `${meta.numero_prestacao || '--'} meses`,
    modalidade_reembolso: 'Prestações Constantes',
    regime_prestacoes: 'Mensal',
    periodicidade_prestacoes: payload.periodicidade || 'Mensal',
    montante_prestacoes: fCurrency(meta.valor_prestacao || 0),
    numero_prestacoes: `${meta.numero_prestacao || '--'} meses`,
    garantias_desc: listaGarantias,

    // Seguros (Seção 9.1)
    segurador: primeiroSeguro.seguradora || '--',
    produto_seguro: primeiroSeguro.tipo_seguro || '--',
    descricao_seguro: `Apólice: ${primeiroSeguro.apolice || '--'}`,

    // --- SEÇÃO C: CUSTOS ---
    tan: fPercent(meta.taxa_tan || 0, 3),
    regime_taxa_juro: 'Fixa',
    taxa_juro_nominal_fixa: fPercent(meta.taxa_tan || 0),
    taeg: fPercent(meta.taxa_taeg || 0, 3),
    valor_total_encargos_iniciais: fCurrency(meta.custo_total),
    comissoes_iniciais: fCurrency(meta.valor_comissao || 0),
    comissoes_processamento: '--',
    capital: fCurrency(meta.valor_imposto_selo || 0),
    juros: fPercent(meta.taxa_juro || 0),
    comissoes: fCurrency(meta.valor_comissao || 0),
    taxa_mora: '2',

    // --- SEÇÃO III: INFORMAÇÃO GERAL ---
    docs_analise:
      'Documento de Identificação, NIF, Comprovativo de Rendimentos (3 últimos meses), Declaração de Rendimentos.',
    docs_contrato: 'Livrança assinada, Contrato de Mútuo.',
    rejeicao_pedido:
      'A instituição reserva-se o direito de rejeitar o pedido com base na análise de risco e solvabilidade.',
    contrato: 'O consumidor tem direito a uma cópia do contrato após a assinatura de todas as partes.',
    reclamacoes: 'Podem ser apresentadas no Livro de Reclamações físico ou eletrónico, ou junto do Banco Central.',
    autoridade_supervisao: 'Banco de Cabo Verde (BCV).',
  };
};
