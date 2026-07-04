import { fCurrency, fPercent } from '@/utils/formatNumber';

// ---------------------------------------------------------------------------------------------------------------------

function descreverBemFinanciado(bem) {
  if (!bem) return null;
  if (bem.descritivo) return bem.descritivo;
  if (bem.marca || bem.modelo) return `${bem.marca || ''} ${bem.modelo || ''}`.trim() || null;
  if (bem.numero_matriz || bem.numero_descricao_predial) return `Imóvel (matriz nº ${bem.numero_matriz || '---'})`;
  return bem.tipo || null;
}

export const mapearPayloadParaFINCC = (payload) => {
  if (!payload) return {};

  const credito = payload.credito || {};
  const meta = credito.gaji9_metadados || {};

  const seguroBem = credito.garantias?.map((g) => g.metadados?.bem?.seguros?.[0]).find(Boolean);
  const primeiroSeguro = credito.seguros?.[0] || seguroBem || {};
  const temSeguroExigido = Boolean(credito.seguros?.length > 0 || seguroBem);

  const listaGarantias = credito.garantias?.map((g) => g.tipo_garantia).join(', ') || '--';

  const primeiroBemFinanciado = meta.bens_financiados?.[0];
  const descricaoBemFinanciado = descreverBemFinanciado(primeiroBemFinanciado);

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
    abertura_conta_do: 'Não',
    adesao_outro_produto: 'Não',
    disponibilizacao_tranches: meta.montante_tranches_credibolsa ? 'Sim' : 'Não',
    montante: fCurrency(credito.montante_solicitado || 0),
    duracao_contrato: `${credito?.prazo_amortizacao || '--'} meses`,
    modalidade_reembolso: 'Prestações Constantes',
    regime_prestacoes: 'Mensal',
    periodicidade_prestacoes: 'Mensal',
    valor_prestacao: fCurrency(meta?.valor_prestacao || 0),
    prazo_amortizacao: `${credito.prazo_amortizacao || '--'} meses`,
    garantias_desc: listaGarantias,

    // Contrato coligado (7.1/7.2)
    bem_servico: descricaoBemFinanciado || '--',
    preco: primeiroBemFinanciado?.valor ? fCurrency(primeiroBemFinanciado.valor) : '--',

    // Seguros exigidos (Secção 9.1)
    segurador: primeiroSeguro?.seguradora || '--',
    seguro: primeiroSeguro?.tipo_seguro || '--',
    descricao: `Apólice: ${primeiroSeguro?.apolice || '--'}`,
    coberturas_minimas: primeiroSeguro?.percentagem_cobertura
      ? `${fPercent(primeiroSeguro.percentagem_cobertura)} do capital em dívida`
      : '--',
    periodicidade_seguro: primeiroSeguro?.periodicidade || '--',
    periodicidade_deguro: primeiroSeguro?.periodicidade || '--',

    // Seguros exigidos
    seguros: temSeguroExigido ? primeiroSeguro?.tipo_seguro || 'Seguro exigido' : 'Não aplicável',

    // --- SEÇÃO C: CUSTOS ---
    regime_taxa_juro: 'Fixa',
    taeg: fPercent(meta.taxa_taeg || 0, 3),
    taxa_mora: fPercent(meta.taxa_mora ?? '2'),
    taxa_juro: fPercent(credito?.taxa_juro || 0, 3),
    taxa_base: fPercent(meta?.taxa_juro_precario || 0, 3),
    spread_inicial: fPercent(meta?.taxa_juro_desconto) || '',
    taxa_juro_nominal_fixa: fPercent(meta?.taxa_juro_precario || 0),
    taxa_juro_fixa_contratada: fPercent(credito?.taxa_juro || 0, 3),
    alteracao_taxa: 'Não aplicável (taxa fixa)',
    comissoes_iniciais: fCurrency(meta?.valor_comissao || 0),
    valor_total_encargos_iniciais: fCurrency(meta?.custo_total || 0),
    comissoes_processamento: '--',
    comissoes: fCurrency(meta.valor_comissao || 0),
    valor_imposto_selo: fCurrency(meta.valor_imposto_selo || 0),
    taxa_imposto_selo_utilizacao: fPercent(meta.taxa_imposto_selo_utilizacao || 0),

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
