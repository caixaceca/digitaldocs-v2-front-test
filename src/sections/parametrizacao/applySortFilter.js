// utils
import { normalizeText } from '../../utils/normalizeText';
// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    dados = dados.filter(
      (row) =>
        (row?.obs && normalizeText(row?.obs).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo && normalizeText(row?.tipo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.ilha && normalizeText(row?.ilha).indexOf(normalizeText(filter)) !== -1) ||
        (row?.email && normalizeText(row?.email).indexOf(normalizeText(filter)) !== -1) ||
        (row?.linha && normalizeText(row?.linha).indexOf(normalizeText(filter)) !== -1) ||
        (row?.corpo && normalizeText(row?.corpo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.email && normalizeText(row?.email).indexOf(normalizeText(filter)) !== -1) ||
        (row.estado && normalizeText(row?.estado).indexOf(normalizeText(filter)) !== -1) ||
        (row?.modelo && normalizeText(row?.modelo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.acesso && normalizeText(row?.acesso).indexOf(normalizeText(filter)) !== -1) ||
        (row?.objeto && normalizeText(row?.objeto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.cidade && normalizeText(row?.cidade).indexOf(normalizeText(filter)) !== -1) ||
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.telefone && normalizeText(row?.telefone).indexOf(normalizeText(filter)) !== -1) ||
        (row?.processo && normalizeText(row?.processo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.telefone && normalizeText(row?.telefone).indexOf(normalizeText(filter)) !== -1) ||
        (row?.descricao && normalizeText(row?.descricao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizeText(filter)) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.seguimento && normalizeText(row?.seguimento).indexOf(normalizeText(filter)) !== -1) ||
        (row?.referencia && normalizeText(row?.referencia).indexOf(normalizeText(filter)) !== -1) ||
        (row.estado_final && normalizeText(row?.estado_final).indexOf(normalizeText(filter)) !== -1) ||
        (row.estado_inicial && normalizeText(row?.estado_inicial).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}

// ----------------------------------------------------------------------

export function listaTransicoes(transicoes, estados) {
  return (
    transicoes?.map((row) => ({
      id: row?.id,
      label: `${row?.modo?.toUpperCase()}: ${
        estados?.find((item) => item?.id === row.estado_inicial_id)?.nome || row.estado_inicial_id
      } para ${estados?.find((item) => item?.id === row.estado_final_id)?.nome || row.estado_final_id}${
        row?.is_after_devolucao ? ' (DD)' : ''
      }`,
      estadoInicial: row.estado_inicial_id,
    })) || []
  );
}

// ----------------------------------------------------------------------

export function listaPerfis(perfis, colaboradores) {
  perfis = perfis?.map((row) => ({
    id: row?.perfil_id,
    label: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
  const perfisIdDistint = new Set(perfis?.map((objeto) => objeto.id));
  perfis = Array.from(perfisIdDistint, (id) => perfis?.find((objeto) => objeto.id === id));
  return perfis;
}
