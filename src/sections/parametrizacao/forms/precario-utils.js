// Parâmetros numéricos disponíveis no preçário
export const PARAMS_NUMERICOS = [
  { id: 'taxa_mora', label: 'Taxa de mora', tipo: '%' },
  { id: 'prazo_utilizacao', label: 'Prazo de utilização', tipo: 'meses' },
  { id: 'periodo_carencia', label: 'Período de carência', tipo: 'meses' },
  { id: 'taxa_imposto_selo', label: 'Taxa de imposto de selo', tipo: '%' },
  { id: 'taxa_juro_precario', label: 'Taxa de juro do preçário', tipo: '%' },
  { id: 'taxa_juro_desconto', label: 'Taxa de juros de desconto', tipo: '%' },
  { id: 'taxa_comissao_abertura', label: 'Taxa de comissão de abertura', tipo: '%' },
  { id: 'taxa_comissao_imobilizacao', label: 'Taxa de comissão de imobilização', tipo: '%' },
  { id: 'taxa_imposto_selo_utilizacao', label: 'Taxa de imposto de selo de utilização', tipo: '%' },
  { id: 'capital_max_isento_imposto_selo', label: 'Capital máximo isento imposto de selo', tipo: 'CVE' },
];

// Parâmetros booleanos disponíveis no preçário
export const PARAMS_BOOLEANOS = [
  { id: 'revolving', label: 'Revolving' },
  { id: 'bonificado', label: 'Bonificado' },
  { id: 'jovem_bonificado', label: 'Jovem bonificado' },
  { id: 'isento_comissao', label: 'Isento de comissão' },
  { id: 'modo_taxa_equivalente', label: 'Taxa equivalente' },
  { id: 'tem_isencao_imposto_selo', label: 'Isento de imposto de selo' },
];

// Valor inicial de um novo parâmetro numérico
export const PARAM_NUMERICO_DEFAULT = { item: null, min: '', max: '', default: '', obrigatorio: false };

export function buildLinhasList(linhas = []) {
  const nomesRepetidos = new Set(linhas.map((r) => r?.linha).filter((nome, i, arr) => arr.indexOf(nome) !== i));

  return linhas
    .map((r) => ({
      ...r,
      label: nomesRepetidos.has(r?.linha) ? `${r?.linha} - ${r?.descricao}` : r?.linha,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Transforma os valores do form para o contrato da API:
export function toRequestBody(values) {
  const precario = {};

  values.params.forEach(({ item, min, max, default: def, obrigatorio }) => {
    if (item?.id) {
      precario[item.id] = {
        min: min?.toString() ?? '',
        max: max?.toString() ?? '',
        default: def?.toString() ?? '',
        obrigatorio: !!obrigatorio,
      };
    }
  });

  PARAMS_BOOLEANOS.forEach(({ id }) => {
    precario[id] = { default: !!values[id] };
  });

  return {
    ...(values.linha?.id ? { linha_id: values.linha.id } : {}),
    ...(values.componente?.id ? { componente_id: values.componente.id } : {}),
    precario,
  };
}

// Hidrata o form a partir de um preçário existente (edição)
export function fromSelectedItem({ selectedItem, linhasList, componentesList }) {
  const precario = selectedItem?.precario ?? {};

  const params = PARAMS_NUMERICOS.filter((p) => precario[p.id]).map((p) => ({
    item: p,
    min: precario[p.id]?.min ?? '',
    max: precario[p.id]?.max ?? '',
    default: precario[p.id]?.default ?? '',
    obrigatorio: !!precario[p.id]?.obrigatorio,
  }));

  const bools = Object.fromEntries(PARAMS_BOOLEANOS.map(({ id }) => [id, precario[id]?.default ?? false]));

  return {
    params,
    ...bools,
    linha: linhasList?.find(({ id }) => id === selectedItem?.linha_id) || null,
    componente: componentesList?.find(({ id }) => id === selectedItem?.componente_id) || null,
  };
}
