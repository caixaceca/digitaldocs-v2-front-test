// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort, getComparator } from '../../hooks/useTable';

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    const SEARCH_FIELDS = [
      'uo',
      'nome',
      '_role',
      'codigo',
      'titulo',
      'rotulo',
      'sufixo',
      'titular',
      'cliente',
      'prefixo',
      'subtitulo',
      'finalidade',
      'descritivo',
      'designacao',
      'componente',
      'tipo_titular',
      'tipo_conteudo',
      'numero_proposta',
      'numero_entidade',
      'utilizador_email',
    ];

    const matchesFilter = (item) =>
      SEARCH_FIELDS.some((field) => {
        const value = item[field];
        return value && normalizeText(value).includes(normalizedFilter);
      });

    dados = dados.filter(matchesFilter);
  }

  return dados;
}

// ---------------------------------------------------------------------------------------------------------------------

export function listaTitrulares(tiposTitulares) {
  return tiposTitulares?.map(({ id, consumidor, descritivo }) => ({
    id,
    segmento: descritivo,
    label: labelTitular(descritivo, consumidor),
  }));
}

export function listaProdutos(componentes) {
  return componentes?.map(({ id, codigo, rotulo, descritivo }) => ({
    id,
    label: `${codigo ? `${codigo} » ` : ''}${rotulo || descritivo}`,
  }));
}

export function listaGarantias(tiposGarantias) {
  return applySort(
    tiposGarantias?.map((row) => ({ ...row, label: row?.designacao || row?.tipo })),
    getComparator('asc', 'label')
  );
}

export function subTiposGarantia(subtipos) {
  return subtipos?.map(({ id, designacao }) => ({ id, label: designacao }));
}

export function listaClausulas(clausulas) {
  return applySort(
    clausulas?.map(({ id, numero_ordem: num, solta, titulo, descritivo, ...res }) => ({
      id,
      numero_ordem: num,
      label: `${
        (solta && 'SOLTA') ||
        (res?.seccao_identificacao && 'IDENTIFICAÇÃO') ||
        (res?.seccao_identificacao_caixa && 'IDENTIFICAÇÃO CAIXA') ||
        descritivo
      } - ${solta ? 'Cláusula solta' : titulo} (ID: ${id})`,
    })),
    getComparator('asc', 'numero_ordem')
  );
}

export function labelTitular(titular, consumidor) {
  return titular === 'Particular' && !consumidor ? `${titular} (Não consumidor)` : titular;
}
