// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort } from '../../hooks/useTable';

// ----------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    const campos = [
      'uo',
      'obs',
      'nome',
      'tipo',
      'ilha',
      'linha',
      'corpo',
      'email',
      'estado',
      'modelo',
      'acesso',
      'objeto',
      'motivo',
      'cidade',
      'assunto',
      'titular',
      'processo',
      'telefone',
      'descricao',
      'entidades',
      'descritivo',
      'designacao',
      'seguimento',
      'referencia',
    ];

    dados = dados.filter((row) =>
      campos.some((campo) => row?.[campo] && normalizeText(row[campo]).includes(normalizedFilter))
    );
  }

  return dados;
}

// ----------------------------------------------------------------------

export function listaPerfis(perfis, colaboradores) {
  perfis = perfis?.map(({ perfil_id: id }) => ({
    id,
    label: colaboradores?.find(({ perfil_id: pid }) => pid === id)?.perfil?.displayName || id,
  }));
  const perfisIdDistint = new Set(perfis?.map(({ id }) => id));
  perfis = Array.from(perfisIdDistint, (id) => perfis?.find(({ id: idRow }) => idRow === id));
  return perfis;
}
