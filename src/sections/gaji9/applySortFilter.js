// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort, getComparator } from '../../hooks/useTable';

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
        (row?.cliente && normalizeText(row?.cliente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.titular && normalizeText(row?.titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.prefixo && normalizeText(row?.prefixo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.subtitulo && normalizeText(row?.subtitulo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.componente && normalizeText(row?.componente).indexOf(normalizeText(filter)) !== -1) ||
        (row?.descritivo && normalizeText(row?.descritivo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.designacao && normalizeText(row?.designacao).indexOf(normalizeText(filter)) !== -1) ||
        (row?.finalidade && normalizeText(row?.finalidade).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo_titular && normalizeText(row?.tipo_titular).indexOf(normalizeText(filter)) !== -1) ||
        (row?.tipo_conteudo && normalizeText(row?.tipo_conteudo).indexOf(normalizeText(filter)) !== -1) ||
        (row?.numero_proposta && normalizeText(row?.numero_proposta).indexOf(normalizeText(filter)) !== -1) ||
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
    label: descritivo === 'Particular' && !consumidor ? `${descritivo} (Não consumidor)` : descritivo,
  }));
}

export function listaProdutos(componentes) {
  return componentes?.map(({ id, rotulo, descritivo }) => ({ id, label: `${rotulo || descritivo} (ID: ${id})` }));
}

export function listaGarantias(tiposGarantias) {
  return tiposGarantias?.map(({ id, designacao, descritivo }) => ({ id, label: designacao || descritivo }));
}

export function listaClausulas(clausulas) {
  return applySort(
    clausulas?.map((row) => ({
      id: row?.id,
      numero_ordem: row?.numero_ordem,
      label: `${
        (row?.solta && 'SOLTA') ||
        (row?.seccao_identificacao && 'IDENTIFICAÇÃO') ||
        (row?.seccao_identificacao_caixa && 'IDENTIFICAÇÃO CAIXA') ||
        row?.descritivo
      } - ${row?.solta ? 'Cláusula solta' : row?.titulo} (ID: ${row?.id})`,
    })),
    getComparator('asc', 'numero_ordem')
  );
}

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find((item) => item?.perfil_id === row?.perfil_id)?.perfil?.displayName || row?.perfil_id,
  }));
}
