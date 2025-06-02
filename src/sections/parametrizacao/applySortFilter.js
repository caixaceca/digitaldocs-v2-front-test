// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      (row) =>
        (row?.uo && normalizeText(row?.uo).indexOf(normalizedFilter) !== -1) ||
        (row?.obs && normalizeText(row?.obs).indexOf(normalizedFilter) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizedFilter) !== -1) ||
        (row?.tipo && normalizeText(row?.tipo).indexOf(normalizedFilter) !== -1) ||
        (row?.ilha && normalizeText(row?.ilha).indexOf(normalizedFilter) !== -1) ||
        (row?.linha && normalizeText(row?.linha).indexOf(normalizedFilter) !== -1) ||
        (row?.corpo && normalizeText(row?.corpo).indexOf(normalizedFilter) !== -1) ||
        (row?.email && normalizeText(row?.email).indexOf(normalizedFilter) !== -1) ||
        (row?.estado && normalizeText(row?.estado).indexOf(normalizedFilter) !== -1) ||
        (row?.modelo && normalizeText(row?.modelo).indexOf(normalizedFilter) !== -1) ||
        (row?.acesso && normalizeText(row?.acesso).indexOf(normalizedFilter) !== -1) ||
        (row?.objeto && normalizeText(row?.objeto).indexOf(normalizedFilter) !== -1) ||
        (row?.motivo && normalizeText(row?.motivo).indexOf(normalizedFilter) !== -1) ||
        (row?.cidade && normalizeText(row?.cidade).indexOf(normalizedFilter) !== -1) ||
        (row?.assunto && normalizeText(row?.assunto).indexOf(normalizedFilter) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizedFilter) !== -1) ||
        (row?.processo && normalizeText(row?.processo).indexOf(normalizedFilter) !== -1) ||
        (row?.telefone && normalizeText(row?.telefone).indexOf(normalizedFilter) !== -1) ||
        (row?.descricao && normalizeText(row?.descricao).indexOf(normalizedFilter) !== -1) ||
        (row?.entidades && normalizeText(row?.entidades).indexOf(normalizedFilter) !== -1) ||
        (row?.descritivo && normalizeText(row?.descritivo).indexOf(normalizedFilter) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizedFilter) !== -1) ||
        (row?.seguimento && normalizeText(row?.seguimento).indexOf(normalizedFilter) !== -1) ||
        (row?.referencia && normalizeText(row?.referencia).indexOf(normalizedFilter) !== -1)
    );
  }

  return dados;
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
