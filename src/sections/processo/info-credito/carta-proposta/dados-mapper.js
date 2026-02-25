export function mapDadosPoposta(modelo) {
  if (!modelo || typeof modelo !== 'object') {
    throw new Error('Modelo inválido para geração de contrato');
  }

  return { condicoes: mapCondicoes(modelo), encargos: mapEncargos(modelo), obrigacoes: mapObrigacoes(modelo) };
}

function mapCondicoes(modelo) {
  const credito = modelo?.credito ?? {};
  const meta = credito?.gaji9_metadados ?? {};

  return {
    tan: meta?.taxa_tan || 0,
    taeg: meta?.taxa_taeg || 0,
    agencia: modelo?.uo?.nome || 'Agência',
    taxa_mora: meta?.taxa_juro_mora || '2',
    nome_proponente: modelo?.titular || '---',
    data_entrada: modelo?.data_entrada,
    montante: credito?.montante_aprovado || credito?.montante_solicitado || 0,
    meses_vencimento: meta?.meses_vencimento || 0,
    valor_prestacao: meta?.valor_prestacao || 0,
    prazo_amortizacao: credito?.prazo_amortizacao || '---',
    prazo_entrega_contrato: 15,
    garantias_brutas: credito?.garantias || [],
    fiadores: extrairFiadoresSimples(credito?.garantias),
  };
}

function mapEncargos(modelo) {
  const meta = modelo?.credito?.gaji9_metadados ?? {};

  return {
    conta_pagamento: modelo?.conta || modelo?.cliente || '---',
    imposto_selo: meta?.taxa_imposto_selo,
    valor_encargos_iniciais: meta?.custo_total,
    valor_imposto_selo: meta?.valor_imposto_selo,
    valor_comissao_abertura: meta?.valor_comissao,
    comissao_abertura: meta?.taxa_comissao_abertura,
    imposto_selo_comissao: meta?.taxa_imposto_selo_utilizacao || '0',
    valor_imposto_selo_comissao: meta?.valor_imposto_selo_comissao || 0,
  };
}

function mapObrigacoes(modelo) {
  const credito = modelo?.credito ?? {};
  const meta = credito?.gaji9_metadados ?? {};

  const temSeguroGeral = credito?.seguros?.length > 0;
  const temSeguroGarantia = credito?.garantias?.some((g) => g.metadados?.seguros?.length > 0);

  return {
    prazo_entrega_contrato: meta?.prazo_utilizacao || 15,
    tem_seguro: temSeguroGeral || temSeguroGarantia,
    descricao_seguro: credito?.seguros?.[0]?.tipo_seguro || 'Seguro de Vida / Multiriscos',
  };
}

function extrairFiadoresSimples(garantias) {
  if (!garantias) return [];
  return garantias.flatMap((g) => g.metadados?.fiadores || []).map((f) => ({ nome: f?.nome_entidade || '---' }));
}
