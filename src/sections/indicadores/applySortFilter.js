// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, item, acao, colaborador, mes, comparator }) {
  if (comparator) dados = applySort(dados, comparator);
  if (item && !acao) dados = dados.filter(({ tipo }) => tipo === item);
  if (item && acao) dados = dados.filter(({ forma }) => forma === item);
  if (mes?.id) dados = dados.filter(({ mes }) => mes === mes?.id);
  if (colaborador?.id) dados = dados.filter(({ perfil_id: pid }) => pid === colaborador?.id);
  return dados;
}
