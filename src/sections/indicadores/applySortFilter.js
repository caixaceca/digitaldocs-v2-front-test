// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, assunto, colaborador, mes, comparator }) {
  if (comparator) {
    dados = applySort(dados, comparator);
  }

  if (assunto) {
    dados = dados.filter((row) => row?.tipo === assunto);
  }

  if (mes?.id) {
    dados = dados.filter((row) => row?.mes === mes?.id);
  }

  if (colaborador?.id) {
    dados = dados.filter((row) => row?.perfil_id === colaborador?.id);
  }

  return dados;
}
