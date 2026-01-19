export function mapDadosPoposta(modelo) {
  if (!modelo || typeof modelo !== 'object') {
    throw new Error('Modelo inválido para geração de contrato');
  }

  return { condicoes: mapCondicoes(modelo), encargos: mapEncargos(modelo), obrigacoes: mapObrigacoes(modelo) };
}

function mapCondicoes(modelo) {
  const credito = modelo?.credito ?? {};
  const meta = credito?.gaji9_metadados ?? {};

  // Extração Elaborada de Fiadores
  const fiadores =
    credito?.garantias
      ?.filter((g) => g.tipo_garantia?.toUpperCase().includes('FIANÇA') || g.metadados?.fiadores)
      .flatMap(
        (g) =>
          g?.metadados?.fiadores?.map((f) => ({
            nome: f?.nome_entidade || '---',
            nif: f?.nif || '---',
            estadoCivil: f?.estado_civil || '---',
          })) ?? []
      ) ?? [];

  return {
    tan: meta?.taxa_tan,
    taeg: meta?.taxa_taeg,
    agencia: modelo?.uo?.nome || 'Agência',
    taxa_mora: meta?.taxa_juro_mora || '2',
    nome_proponente: modelo?.titular,
    data_entrada: modelo?.data_entrada,
    montante: credito?.montante_aprovado || credito?.montante_solicitado,
    meses_vencimento: meta?.meses_vencimento,
    valor_prestacao: meta?.valor_prestacao,
    prazo_amortizacao: credito?.prazo_amortizacao,
    prazo_entrega_contrato: 15,
    fiadores,
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
  return {
    prazo_entrega_contrato: modelo?.credito?.gaji9_metadados?.prazo_utilizacao || 15,
    tem_seguro: modelo?.credito?.seguros?.length > 0,
    descricao_seguro: modelo?.credito?.seguros?.[0]?.tipo_seguro || 'Não aplicável',
  };
}
