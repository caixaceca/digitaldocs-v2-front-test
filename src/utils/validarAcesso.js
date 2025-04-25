// hooks
import { getComparator, applySort } from '../hooks/useTable';

// ----------------------------------------------------------------------

export function temAcesso(acessos, acessosList) {
  return !!acessosList?.find((row) => acessos?.includes(row));
}

// ----------------------------------------------------------------------

export function acessoGaji9(acessos, acessosList) {
  if (!acessos || acessos?.length === 0) return false;
  return !!acessosList?.find((row) => acessos?.includes(row));
}

export function gestaoContrato(funcao) {
  return funcao === 'ADMIN' || funcao === 'GERENTE';
}

export function gestaoCredito(utilizador, permissoes) {
  return gestaoContrato(utilizador?._role) || acessoGaji9(utilizador?.acessos, permissoes);
}

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

// ----------------------------------------------------------------------

export function emailCheck(mail, check) {
  return mail?.split('')?.reverse()?.join('')?.toLowerCase() === (check || 'vc.axiac@arove.ordnavi');
}

// ----------------------------------------------------------------------

export function ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes) {
  let colaboradoresList = [];
  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') colaboradoresList = colaboradores;
  else if (cc?.uo?.label === 'DCN')
    colaboradoresList = colaboradores?.filter(({ uo }) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Norte');
  else if (cc?.uo?.label === 'DCS')
    colaboradoresList = colaboradores?.filter(({ uo }) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Sul');
  else if (cc?.uo?.label === 'DOP') colaboradoresList = colaboradores?.filter(({ uo }) => uo?.label?.includes('DOP'));
  else if (UosGerente(meusAmbientes)?.length > 0)
    colaboradoresList = colaboradores?.filter(({ uo }) => UosGerente(meusAmbientes)?.includes(uo?.id));
  else if (temNomeacao(cc)) colaboradoresList = colaboradores?.filter(({ uo }) => uo?.id === cc?.uo_id);
  else colaboradoresList = colaboradores?.filter(({ id }) => id === cc?.id);

  return colaboradoresList?.map(({ id: cid, perfil_id: id, nome, uo_id: uoId }) => ({ id, cid, label: nome, uoId }));
}

// ----------------------------------------------------------------------

export function UosAcesso(uos, cc, acessoAll, meusAmbientes, key) {
  let uosList = [];
  if (acessoAll || cc?.nomeacao === 'Administrador Executivo') uosList = uos;
  else if (cc?.uo?.label === 'DCN')
    uosList = uos?.filter(({ tipo, morada }) => tipo === 'Agências' && morada?.regiao === 'Norte');
  else if (cc?.uo?.label === 'DCS')
    uosList = uos?.filter(({ tipo, morada }) => tipo === 'Agências' && morada?.regiao === 'Sul');
  else if (cc?.uo?.label === 'DOP') uosList = uos?.filter(({ label }) => label?.includes('DOP'));
  else if (meusAmbientes?.length > 0)
    uosList = uos?.filter(({ id }) => meusAmbientes?.map(({ uo_id: uoId }) => uoId)?.includes(Number(id)));
  else uosList = uos?.filter(({ id }) => id === cc?.uo_id);

  return uosList?.map(({ id, balcao, label }) => ({ id: key === 'balcao' ? balcao : id, label }));
}

// ----------------------------------------------------------------------

export function estadosAcesso(uos, cc, isAdmin, estados, meusAmbientes) {
  let estadosList = [];
  const uosDOP = uos?.filter(({ label }) => label?.includes('DOP'))?.map(({ id }) => id);
  const uosDCS = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Sul')?.map(({ id }) => id);
  const uosDCN = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Norte')?.map(({ id }) => id);

  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') estadosList = estados;
  else if (cc?.uo?.label === 'DCN') estadosList = estados?.filter(({ uo_id: uoId }) => uosDCN?.includes(uoId));
  else if (cc?.uo?.label === 'DCS') estadosList = estados?.filter(({ uo_id: uoId }) => uosDCS?.includes(uoId));
  else if (cc?.uo?.label === 'DOP') estadosList = estados?.filter(({ uo_id: uoId }) => uosDOP?.includes(uoId));
  else estadosList = meusAmbientes?.filter((item) => item?.id > 0);

  return applySort(
    estadosList?.map(({ id, nome }) => ({ id, label: nome })),
    getComparator('asc', 'label')
  );
}

// ----------------------------------------------------------------------

export function UosGerente(meusAmbientes) {
  const uosGerente = [];
  meusAmbientes?.forEach((row) => {
    if (row?.nome?.includes('Gerência')) uosGerente.push(Number(row?.uo_id));
  });
  return uosGerente;
}

// ----------------------------------------------------------------------

export const podeArquivar = (processo, meusAmbientes, arquivarProcessos, fromAgencia, gerencia) => {
  const estadoProcesso = meusAmbientes?.find((row) => Number(row?.id) === Number(processo?.estado_atual_id));
  const arqAtendimento = arquivoAtendimento(
    processo?.assunto,
    processo?.htransicoes?.[0]?.modo === 'Seguimento' && !processo?.htransicoes?.[0]?.resgate
  );
  return (
    arquivarProcessos ||
    estadoProcesso?.isfinal ||
    (estadoProcesso?.isinicial && gerencia) ||
    (estadoProcesso?.isinicial && !fromAgencia) ||
    (estadoProcesso?.isinicial && fromAgencia && arqAtendimento) ||
    (estadoProcesso?.isinicial && fromAgencia && gestorEstado(meusAmbientes, processo?.estado_atual_id))
  );
};

// ----------------------------------------------------------------------

export const arquivarCC = (meusAmbientes, estadoAtualID) => {
  const estadoProcesso = meusAmbientes?.find((row) => Number(row?.id) === Number(estadoAtualID));
  return estadoProcesso?.isinicial || estadoProcesso?.isfinal;
};

// ----------------------------------------------------------------------

export function paraLevantamento(assunto) {
  return (
    assunto?.includes('Cartão') ||
    assunto?.includes('Extrato') ||
    assunto?.includes('Declarações') ||
    assunto?.includes('Cheques - Requisição')
  );
}

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

export function noEstado(estado, labels) {
  return !!labels?.find((row) => estado?.includes(row));
}

export function processoEstadoInicial(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find((row) => Number(row?.id) === Number(estadoId))?.isinicial;
}

// ----------------------------------------------------------------------

export function arquivoAtendimento(assunto, encGer) {
  return (paraLevantamento(assunto) || assunto?.includes('Conta Caixa Ordenado')) && encGer;
}

// ----------------------------------------------------------------------

export function estadoInicial(meusAmbientes) {
  return !!meusAmbientes?.find((row) => row?.isinicial);
}

// ----------------------------------------------------------------------

export function pertencoAoEstado(meusAmbientes, estados) {
  return !!meusAmbientes?.find((row) => estados?.includes(row?.nome));
}

// ----------------------------------------------------------------------

export function pertencoEstadoId(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find((row) => row?.id === estadoId);
}

// ----------------------------------------------------------------------

export function gestorEstado(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find(({ id, gestor }) => id === estadoId && gestor);
}

// ----------------------------------------------------------------------

export function findColaboradores(colaboradores, idsList) {
  return colaboradores
    ?.filter(({ perfil_id: pidc }) => idsList?.map(({ perfil_id: pidl }) => pidl)?.includes(pidc))
    ?.map(({ perfil }) => ({ id: perfil?.id, label: perfil?.displayName, mail: perfil?.mail }));
}
