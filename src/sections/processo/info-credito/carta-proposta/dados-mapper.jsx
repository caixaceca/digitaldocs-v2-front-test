export function mapDadosPoposta(modelo) {
  if (!modelo || typeof modelo !== 'object') {
    throw new Error('Modelo inválido para geração de contrato');
  }

  return { condicoes: mapCondicoes(modelo), encargos: mapEncargos(modelo), obrigacoes: mapObrigacoes(modelo) };
}

// ---------------------------------------------------------------------------------------------------------------------

function mapCondicoes(modelo) {
  const credito = modelo?.credito ?? {};
  const meta = credito?.gaji9_metadados ?? {};

  const fiadores =
    credito?.garantias?.flatMap(
      (g) =>
        g?.metadados?.fiadores?.map((f) => ({
          residencia: null,
          estadoCivil: null,
          naturalidade: null,
          nome: f?.nome_entidade,
          nif: f?.numero_entidade,
        })) ?? []
    ) ?? [];

  return {
    tan: meta?.taxa_tan,
    taeg: meta?.taxa_taeg,
    agencia: modelo?.uo?.nome,
    taxa_mora: meta?.taxa_juro_mora,
    nome_proponente: modelo?.titular,
    data_entrada: modelo?.data_entrada,
    montante: credito?.montante_aprovado,
    valor_prestacao: meta?.valor_prestacao,
    prazo_amortizacao: credito?.prazo_amortizacao,
    prazo_entrega_contrato: meta?.prazo_entrega_contrato,
    fiadores,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

function mapEncargos(modelo) {
  const meta = modelo?.credito?.gaji9_metadados ?? {};

  return {
    conta_pagamento: modelo?.conta,
    imposto_selo: meta?.taxa_imposto_selo,
    valor_encargos_iniciais: meta?.custo_total,
    valor_imposto_selo: meta?.valor_imposto_selo,
    valor_comissao_abertura: meta?.valor_comissao,
    comissao_abertura: meta?.taxa_comissao_abertura,
    imposto_selo_comissao: meta?.imposto_selo_comissao,
    valor_imposto_selo_comissao: meta?.valor_imposto_selo_comissao,
  };
}

// ---------------------------------------------------------------------------------------------------------------------

function mapObrigacoes(modelo) {
  return { prazo_entrega_contrato: modelo?.credito?.gaji9_metadados?.prazo_utilizacao };
}
