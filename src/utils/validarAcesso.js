// hooks
import { getComparator, applySort } from '../hooks/useTable';

// ---------------------------------------------------------------------------------------------------------------------

export function temAcesso(acessos, acessosList) {
  return !!acessosList?.find((row) => acessos?.includes(row));
}

// ---------------------------------------------------------------------------------------------------------------------

export function temNomeacao(colaborador) {
  let nomeacao = '';
  if (
    colaborador?.nomeacao === 'Diretor' ||
    colaborador?.nomeacao === 'Gerente' ||
    colaborador?.nomeacao === 'Sub-gerente' ||
    colaborador?.nomeacao === 'Gerente Caixa Empresas' ||
    colaborador?.nomeacao === 'Coordenador de Gabinete' ||
    colaborador?.nomeacao === 'Coordenador de Serviço' ||
    colaborador?.nomeacao === 'Coordenador Adjunto'
  ) {
    nomeacao = colaborador?.nomeacao;
  }
  return nomeacao;
}

// ---------------------------------------------------------------------------------------------------------------------

export function ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes) {
  if (!colaboradores) return [];

  const uoLabel = cc?.uo_label;
  const uosGerenciadas = UosGerente(meusAmbientes) || [];
  const isExecutivo = cc?.nomeacao === 'Administrador Executivo';

  const filtrar = () => {
    if (isAdmin || isExecutivo) return colaboradores;

    if (uoLabel === 'DCN') return colaboradores.filter((c) => c.uo_tipo === 'Agências' && c.uo_regiao === 'Norte');
    if (uoLabel === 'DCS') return colaboradores.filter((c) => c.uo_tipo === 'Agências' && c.uo_regiao === 'Sul');
    if (uoLabel === 'DOP') return colaboradores.filter((c) => c.uo_label?.includes('DOP'));

    if (uosGerenciadas.length > 0) return colaboradores.filter((c) => uosGerenciadas.includes(Number(c.uo_id)));
    if (temNomeacao(cc)) return colaboradores.filter((c) => Number(c.uo_id) === Number(cc?.uo_id));

    return colaboradores.filter((c) => c.id === cc?.id);
  };

  const dadosFiltrados = filtrar();

  return dadosFiltrados.map(({ id: cid, perfil_id: id, nome, uo_id: uoId }) => ({ id, cid, label: nome, uoId }));
}

// ---------------------------------------------------------------------------------------------------------------------

export function UosAcesso(uos, cc, acessoAll, meusAmbientes, key) {
  if (!uos) return [];

  const uoLabel = cc?.uo_label;
  const isExecutivo = cc?.nomeacao === 'Administrador Executivo';
  const idsAmbientes = new Set((meusAmbientes || []).map((m) => Number(m.uo_id)));

  const obterListaFiltrada = () => {
    if (acessoAll || isExecutivo) return uos;

    if (uoLabel === 'DCN') return uos.filter((u) => u.tipo === 'Agências' && u.regiao === 'Norte');
    if (uoLabel === 'DCS') return uos.filter((u) => u.tipo === 'Agências' && u.regiao === 'Sul');
    if (uoLabel === 'DOP') return uos.filter((u) => u.label?.includes('DOP'));

    if (idsAmbientes.size > 0) return uos.filter((u) => idsAmbientes.has(Number(u.id)));

    return uos.filter((u) => u.id === cc?.uo_id);
  };

  const listaFinal = obterListaFiltrada();

  return listaFinal.map(({ id, balcao, label }) => ({ id: key === 'balcao' ? balcao : id, label }));
}

// ---------------------------------------------------------------------------------------------------------------------

export function estadosAcesso(uos, cc, isAdmin, estados, meusAmbientes) {
  if (!estados) return [];

  const uoLabel = cc?.uo_label;
  const isExecutivo = cc?.nomeacao === 'Administrador Executivo';

  const obterEstadosFiltrados = () => {
    if (isAdmin || isExecutivo) return estados;

    const getUoIdsByCritery = (filterFn) => new Set(uos?.filter(filterFn).map((u) => Number(u.id)));

    if (uoLabel === 'DCN') {
      const uosDCN = getUoIdsByCritery((u) => u.tipo === 'Agências' && u.regiao === 'Norte');
      return estados.filter((e) => uosDCN.has(Number(e.uo_id)));
    }

    if (uoLabel === 'DCS') {
      const uosDCS = getUoIdsByCritery((u) => u.tipo === 'Agências' && u.regiao === 'Sul');
      return estados.filter((e) => uosDCS.has(Number(e.uo_id)));
    }

    if (uoLabel === 'DOP') {
      const uosDOP = getUoIdsByCritery((u) => u.label?.includes('DOP'));
      return estados.filter((e) => uosDOP.has(Number(e.uo_id)));
    }

    const idsMeusAmbientes = new Set(meusAmbientes?.filter((i) => i.id > 0).map((i) => Number(i.id)));
    return estados.filter((e) => idsMeusAmbientes.has(Number(e.id)));
  };

  const listaFinal = obterEstadosFiltrados();
  const formatados = listaFinal.map(({ id, nome }) => ({ id, label: nome }));

  return applySort(formatados, getComparator('asc', 'label'));
}

// ---------------------------------------------------------------------------------------------------------------------

export function UosGerente(meusAmbientes) {
  const uosGerente = [];
  meusAmbientes?.forEach(({ nome, uo_id: uoId }) => {
    if (nome?.includes('Gerência')) uosGerente.push(Number(uoId));
  });
  return uosGerente;
}

// ---------------------------------------------------------------------------------------------------------------------

export const podeArquivar = (processo, meusAmbientes, arquivarProcessos, fromAgencia, gerencia) => {
  const { fluxo, estado, htransicoes } = processo;
  const estadoProcesso = meusAmbientes?.find(({ id }) => id === Number(estado?.estado_id));
  const arqAtendimento = arquivoAtendimento(
    fluxo,
    htransicoes?.[0]?.modo === 'Seguimento' && !htransicoes?.[0]?.resgate
  );
  return (
    arquivarProcessos ||
    estadoProcesso?.isfinal ||
    (estadoProcesso?.isinicial && gerencia) ||
    (estadoProcesso?.isinicial && !fromAgencia) ||
    (estadoProcesso?.isinicial && fromAgencia && arqAtendimento) ||
    (estadoProcesso?.isinicial && fromAgencia && gestorEstado(meusAmbientes, estado?.estado_id))
  );
};

// ---------------------------------------------------------------------------------------------------------------------

export function paraLevantamento(assunto) {
  return (
    assunto?.includes('Cartão') ||
    assunto?.includes('Extrato') ||
    assunto?.includes('Declarações') ||
    assunto?.includes('Cheques - Requisição')
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function fluxosGmkt(assunto) {
  return assunto === 'Preçário' || assunto === 'Formulário' || assunto === 'Produtos e Serviços';
}

export function bancaDigital(assunto) {
  return assunto === 'Banca Digital - Adesão' || assunto === 'Banca Digital - Novos Códigos';
}

export function fluxoFixo(assunto) {
  return (
    assunto === 'Diário' ||
    assunto === 'OPE DARH' ||
    assunto === 'Preçário' ||
    assunto === 'Formulário' ||
    assunto === 'Abertura de Conta' ||
    assunto === 'Produtos e Serviços' ||
    assunto === 'Banca Digital - Adesão' ||
    assunto === 'Receção de Cartões - DOP' ||
    assunto === 'Transferência Internacional' ||
    assunto === 'Banca Digital - Novos Códigos'
  );
}

export function estadoFixo(assunto) {
  return (
    assunto === 'Compliance' ||
    assunto === 'Execução OPE' ||
    assunto === 'Validação OPE' ||
    assunto === 'Autorização SWIFT' ||
    assunto === 'Comissão Executiva' ||
    assunto === 'DOP - Execução Notas Externas' ||
    assunto === 'DOP - Validação Notas Externas'
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function emailCheck(mail, check = 'vc.axiac@arove.ordnavi') {
  if (typeof mail !== 'string') return false;
  const reversedMail = mail.split('').reverse().join('').toLowerCase();
  return reversedMail === check.toLowerCase();
}

// ---------------------------------------------------------------------------------------------------------------------

export function noEstado(estado, labels) {
  return !!labels?.find((row) => estado?.includes(row));
}

export function processoEstadoInicial(meusAmbientes, estadoId) {
  const estado = meusAmbientes?.find(({ id }) => id === Number(estadoId));
  return !!(estado?.isinicial === true);
}

export function processoEstadoFinal(meusAmbientes, estadoId) {
  const estado = meusAmbientes?.find(({ id }) => id === Number(estadoId));
  return !!(estado?.isfinal === true && estado?.isinicial === false);
}

// ---------------------------------------------------------------------------------------------------------------------

export function arquivoAtendimento(assunto, encGer) {
  return (paraLevantamento(assunto) || assunto?.includes('Conta Caixa Ordenado')) && encGer;
}

// ---------------------------------------------------------------------------------------------------------------------

export function estadoInicial(meusAmbientes) {
  return !!meusAmbientes?.find(({ isinicial }) => isinicial);
}

// ---------------------------------------------------------------------------------------------------------------------

export function pertencoAoEstado(meusAmbientes, estados) {
  return !!meusAmbientes?.find(({ nome }) => estados?.includes(nome));
}

export function pertencoEstadoId(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find(({ id, observador }) => id === estadoId && !observador);
}

export function gestorEstado(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find(({ id, gestor }) => id === estadoId && gestor);
}

// ---------------------------------------------------------------------------------------------------------------------

export function eliminarAnexo(meusAmbientes, modificar, estadoAnexo, estadoId) {
  return (
    modificar &&
    ((estadoAnexo && pertencoEstadoId(meusAmbientes, estadoAnexo)) ||
      (!estadoAnexo && processoEstadoInicial(meusAmbientes, estadoId)))
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export const findColaboradores = (colaboradores = [], idsList = []) => {
  const validIds = new Set(idsList.filter((i) => !i.observador).map((i) => i.perfil_id));
  return colaboradores
    .filter((c) => validIds.has(c.perfil_id))
    .map(({ perfil_id: id, nome: label, email: mail }) => ({ id, label, mail }));
};
