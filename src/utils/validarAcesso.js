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

export function emailCheck(mail, check) {
  return mail?.split('')?.reverse()?.join('')?.toLowerCase() === (check || 'vc.axiac@arove.ordnavi');
}

// ---------------------------------------------------------------------------------------------------------------------

export function ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes) {
  let dados = [];
  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') dados = colaboradores;
  else if (cc?.uo_label === 'DCN')
    dados = colaboradores?.filter(({ uo_tipo: tipo, uo_regiao: regiao }) => tipo === 'Agências' && regiao === 'Norte');
  else if (cc?.uo_label === 'DCS')
    dados = colaboradores?.filter(({ uo_tipo: tipo, uo_regiao: regiao }) => tipo === 'Agências' && regiao === 'Sul');
  else if (cc?.uo_label === 'DOP') dados = colaboradores?.filter(({ uo_label: label }) => label?.includes('DOP'));
  else if (UosGerente(meusAmbientes)?.length > 0)
    dados = colaboradores?.filter(({ uo_id: uoId }) => UosGerente(meusAmbientes)?.includes(Number(uoId)));
  else if (temNomeacao(cc)) dados = colaboradores?.filter(({ uo_id: uoId }) => Number(uoId) === Number(cc?.uo_id));
  else dados = colaboradores?.filter(({ id }) => id === cc?.id);

  return dados?.map(({ id: cid, perfil_id: id, nome, uo_id: uoId }) => ({ id, cid, label: nome, uoId }));
}

// ---------------------------------------------------------------------------------------------------------------------

export function UosAcesso(uos, cc, acessoAll, meusAmbientes, key) {
  let uosList = [];
  if (acessoAll || cc?.nomeacao === 'Administrador Executivo') uosList = uos;
  else if (cc?.uo_label === 'DCN')
    uosList = uos?.filter(({ tipo, regiao }) => tipo === 'Agências' && regiao === 'Norte');
  else if (cc?.uo_label === 'DCS') uosList = uos?.filter(({ tipo, regiao }) => tipo === 'Agências' && regiao === 'Sul');
  else if (cc?.uo_label === 'DOP') uosList = uos?.filter(({ label }) => label?.includes('DOP'));
  else if (meusAmbientes?.length > 0)
    uosList = uos?.filter(({ id }) => meusAmbientes?.map(({ uo_id: uoId }) => Number(uoId))?.includes(Number(id)));
  else uosList = uos?.filter(({ id }) => id === cc?.uo_id);

  return uosList?.map(({ id, balcao, label }) => ({ id: key === 'balcao' ? balcao : id, label }));
}

// ---------------------------------------------------------------------------------------------------------------------

export function estadosAcesso(uos, cc, isAdmin, estados, meusAmbientes) {
  let estadosList = [];
  const uosDOP = uos?.filter(({ label }) => label?.includes('DOP'))?.map(({ id }) => id);
  const uosDCS = uos?.filter(({ tipo, regiao }) => tipo === 'Agências' && regiao === 'Sul')?.map(({ id }) => id);
  const uosDCN = uos?.filter(({ tipo, regiao }) => tipo === 'Agências' && regiao === 'Norte')?.map(({ id }) => id);

  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') estadosList = estados;
  else if (cc?.uo_label === 'DCN') estadosList = estados?.filter(({ uo_id: uoId }) => uosDCN?.includes(Number(uoId)));
  else if (cc?.uo_label === 'DCS') estadosList = estados?.filter(({ uo_id: uoId }) => uosDCS?.includes(Number(uoId)));
  else if (cc?.uo_label === 'DOP') estadosList = estados?.filter(({ uo_id: uoId }) => uosDOP?.includes(Number(uoId)));
  else estadosList = meusAmbientes?.filter((item) => item?.id > 0);

  return applySort(
    estadosList?.map(({ id, nome }) => ({ id, label: nome })),
    getComparator('asc', 'label')
  );
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

export function noEstado(estado, labels) {
  return !!labels?.find((row) => estado?.includes(row));
}

export function processoEstadoInicial(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find(({ id }) => id === Number(estadoId))?.isinicial;
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
  return !!meusAmbientes?.find(({ id }) => id === estadoId);
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

export function findColaboradores(colaboradores, idsList) {
  return colaboradores
    ?.filter(({ perfil_id: pidc }) => idsList?.map(({ perfil_id: pidl }) => pidl)?.includes(pidc))
    ?.map(({ perfil_id: id, nome, email }) => ({ id, label: nome, mail: email }));
}
