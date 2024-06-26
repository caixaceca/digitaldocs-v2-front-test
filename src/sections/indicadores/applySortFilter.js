// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, item, acao, colaborador, mes, comparator }) {
  if (comparator) {
    dados = applySort(dados, comparator);
  }

  if (item && !acao) {
    dados = dados.filter((row) => row?.tipo === item);
  }

  if (item && acao) {
    dados = dados.filter((row) => row?.forma === item);
  }

  if (mes?.id) {
    dados = dados.filter((row) => row?.mes === mes?.id);
  }

  if (colaborador?.id) {
    dados = dados.filter((row) => row?.perfil_id === colaborador?.id);
  }

  return dados;
}
