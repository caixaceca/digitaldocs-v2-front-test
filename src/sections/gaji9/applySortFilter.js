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
        (row?.uo && normalizeText(row?.uo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.nome && normalizeText(row?.nome).indexOf(normalizeText(filter)) !== -1) ||
        (row?._role && normalizeText(row?._role).indexOf(normalizeText(filter)) !== -1) ||
        (row?.rotulo && normalizeText(row?.rotulo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.codigo && normalizeText(row?.codigo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titulo && normalizeText(row?.titulo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.sufixo && normalizeText(row?.sufixo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.prefixo && normalizeText(row?.prefixo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.subtitulo && normalizeText(row?.subtitulo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.componente && normalizeText(row?.componente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.descritivo && normalizeText(row?.descritivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo_titular && normalizeText(row?.tipo_titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo_conteudo && normalizeText(row?.tipo_conteudo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero_entidade && normalizeText(row?.numero_entidade).indexOf(normalizeText(filter)) !== -1) ||
        (row?.utilizador_email && normalizeText(row?.utilizador_email).indexOf(normalizeText(filter)) !== -1)
    );
  }

  return dados;
}

// ----------------------------------------------------------------------

export function listaTitrulares(tiposTitulares) {
  return tiposTitulares?.map(({ id, consumidor, descritivo }) => ({
    id,
    label: consumidor ? `${descritivo} (Consumidor)` : descritivo,
  }));
}

export function listaProdutos(componentes) {
  return componentes?.map(({ id, rotulo, descritivo }) => ({ id, label: `${rotulo || descritivo} (ID: ${id})` }));
}

export function listaGarantias(tiposGarantias) {
  return tiposGarantias?.map(({ id, designacao }) => ({ id, label: designacao }));
}

export function listaClausulas(clausulas, idsClausulas) {
  return clausulas
    ?.filter((item) => !idsClausulas?.includes(item?.id))
    ?.map((row) => ({
      id: row?.id,
      numero_ordem: row?.numero_ordem,
      label: `${row?.solta ? 'Cláusula solta' : row?.titulo} ${row?.numero_ordem ? `(ID: ${row?.id})` : ''}`,
      // ...(extra
      //   ? {
      //       componente: row?.componente,
      //       garantia: row?.tipo_garantia,
      //       titular: row?.tipo_titular ? `${row?.tipo_titular}${row?.consumidor ? ' (Consumidor)' : ''}` : '',
      //     }
      //   : null),
    }));
}

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
}
