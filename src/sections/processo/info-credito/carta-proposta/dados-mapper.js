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
    data_entrada: modelo?.data_entrada,
    agencia: modelo?.uo?.nome || 'Agência',
    nome_proponente: modelo?.titular || '---',
    garantias_brutas: credito?.garantias || [],
    taxa_imposto_selo: meta?.taxa_imposto_selo,
    fiadores: extrairFiadores(credito?.garantias),
    taxa_comissao_abertura: meta?.taxa_comissao_abertura,
    taxa_imposto_selo_utilizacao: meta?.taxa_imposto_selo_utilizacao,
    prazo_entrega_contrato: 15,
    taeg: meta?.taxa_taeg || 0,
    taxa_mora: meta?.taxa_mora || '2',
    taxa_juro: credito?.taxa_juro || 0,
    valor_prestacao: meta?.valor_prestacao || 0,
    meses_vencimento: meta?.meses_vencimento || 0,
    prazo_amortizacao: credito?.prazo_amortizacao || '---',
    montante: credito?.montante_aprovado || credito?.montante_solicitado || 0,
  };
}

function mapEncargos(modelo) {
  const meta = modelo?.credito?.gaji9_metadados ?? {};

  return {
    valor_juro: meta?.valor_juro,
    custo_total: meta?.custo_total,
    valor_comissao: meta?.valor_comissao,
    valor_imposto_selo: meta?.valor_imposto_selo,
    conta_pagamento: meta?.conta_do_renda || modelo?.conta || modelo?.cliente || '---',
  };
}

function mapObrigacoes(modelo) {
  const credito = modelo?.credito ?? {};
  const meta = credito?.gaji9_metadados ?? {};

  const temSeguroCredito = credito?.seguros?.length > 0;
  const temSeguroColateral = credito?.garantias?.some((g) => g.metadados?.bem?.seguros?.length > 0);

  return {
    prazo_entrega_contrato: meta?.prazo_utilizacao || 15,
    tem_seguro: Boolean(temSeguroCredito || temSeguroColateral),
    descricao_seguro: credito?.seguros?.[0]?.tipo_seguro || 'Seguro de Vida / Multiriscos',
  };
}

export function extrairFiadores(garantias) {
  if (!garantias) return [];
  return garantias
    .filter((g) => !g.metadados?.numero_livranca)
    .flatMap((g) => g.metadados?.garantidores || [])
    .map((f) => ({ ...f, nome: f?.nome_entidade || '---' }));
}
