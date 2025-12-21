// utils
import { normalizeText } from '../../utils/formatText';
// hooks
import { applySort, getComparator } from '../../hooks/useTable';

// ---------------------------------------------------------------------------------------------------------------------

export function applySortFilter({ dados, filter, comparator }) {
  dados = applySort(dados, comparator);

  if (filter) {
    const normalizedFilter = normalizeText(filter);
    dados = dados.filter(
      ({ uo, nome, codigo, titulo, titular, rotulo, _role, descritivo, designacao, componente, cliente, ...res }) =>
        (uo && normalizeText(uo).indexOf(normalizedFilter) !== -1) ||
        (nome && normalizeText(nome).indexOf(normalizedFilter) !== -1) ||
        (_role && normalizeText(_role).indexOf(normalizedFilter) !== -1) ||
        (rotulo && normalizeText(rotulo).indexOf(normalizedFilter) !== -1) ||
        (codigo && normalizeText(codigo).indexOf(normalizedFilter) !== -1) ||
        (titulo && normalizeText(titulo).indexOf(normalizedFilter) !== -1) ||
        (cliente && normalizeText(cliente).indexOf(normalizedFilter) !== -1) ||
        (titular && normalizeText(titular).indexOf(normalizedFilter) !== -1) ||
        (componente && normalizeText(componente).indexOf(normalizedFilter) !== -1) ||
        (descritivo && normalizeText(descritivo).indexOf(normalizedFilter) !== -1) ||
        (designacao && normalizeText(designacao).indexOf(normalizedFilter) !== -1) ||
        (res?.sufixo && normalizeText(res?.sufixo).indexOf(normalizedFilter) !== -1) ||
        (res?.prefixo && normalizeText(res?.prefixo).indexOf(normalizedFilter) !== -1) ||
        (res?.subtitulo && normalizeText(res?.subtitulo).indexOf(normalizedFilter) !== -1) ||
        (res?.finalidade && normalizeText(res?.finalidade).indexOf(normalizedFilter) !== -1) ||
        (res?.tipo_titular && normalizeText(res?.tipo_titular).indexOf(normalizedFilter) !== -1) ||
        (res?.tipo_conteudo && normalizeText(res?.tipo_conteudo).indexOf(normalizedFilter) !== -1) ||
        (res?.numero_proposta && normalizeText(res?.numero_proposta).indexOf(normalizedFilter) !== -1) ||
        (res?.numero_entidade && normalizeText(res?.numero_entidade).indexOf(normalizedFilter) !== -1) ||
        (res?.utilizador_email && normalizeText(res?.utilizador_email).indexOf(normalizedFilter) !== -1)
    );
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

export function dadosComColaborador(dados, colaboradores) {
  return dados?.map((row) => ({
    ...row,
    nome: colaboradores?.find(({ perfil_id: pid }) => pid === row?.perfil_id)?.nome || row?.perfil_id,
  }));
}

export function labelTitular(titular, consumidor) {
  return titular === 'Particular' && !consumidor ? `${titular} (Não consumidor)` : titular;
}
