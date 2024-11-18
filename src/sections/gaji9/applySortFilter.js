// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titulo && normalizeText(row?.titulo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.sufixo && normalizeText(row?.sufixo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.prefixo && normalizeText(row?.prefixo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.descritivo && normalizeText(row?.descritivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}
