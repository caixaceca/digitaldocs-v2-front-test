// hooks
import { getComparator, applySort } from '../hooks/useTable';

// ----------------------------------------------------------------------

export function validarAcesso(grupo, grupos) {
  return !!grupos?.find((row) => row?.grupo?.label === grupo);
}
export function temAcesso(acessos, acessosList) {
  return !!acessosList?.find((row) => acessos?.includes(row));
}

export function temNomeacao(colaborador) {
  let nomeacao = '';
  if (
    colaborador?.nomeacao === 'Gerente' ||
    colaborador?.nomeacao === 'Director' ||
    colaborador?.nomeacao === 'Sub-gerente' ||
    colaborador?.nomeacao === 'Coordenador Adjunto' ||
    colaborador?.nomeacao === 'Coordenador Gabinete' ||
    colaborador?.nomeacao === 'Gerente Caixa Empresas'
  ) {
    nomeacao = colaborador?.nomeacao;
  }
  return nomeacao;
}

// ----------------------------------------------------------------------

export function isResponsavelUo(uo, mail) {
  let isResponsavel = false;
  if (mail?.toLowerCase() === uo?.responsavel?.toLowerCase()) {
    isResponsavel = true;
  }
  return isResponsavel;
}

// ----------------------------------------------------------------------

export function uosResponsavel(uos, colaborador) {
  const responsavel = [];
  uos?.forEach((row) => {
    if (row?.responsavel === colaborador?.perfil?.mail) {
      responsavel.push(row?.id);
    }
  });
  return responsavel;
}

// ----------------------------------------------------------------------

export function nomeacaoBySexo(nomeacao, sexo) {
  let _nomeaca = nomeacao;

  if (nomeacao === 'Director' && sexo === 'Feminino') {
    _nomeaca = 'Diretora';
  } else if (nomeacao === 'Coordenador Gabinete' && sexo === 'Feminino') {
    _nomeaca = 'Coordenadora de Gabinete';
  } else if (nomeacao === 'Coordenador Adjunto' && sexo === 'Feminino') {
    _nomeaca = 'Coordenador Adjunta';
  } else if (nomeacao === 'Assessor' && sexo === 'Feminino') {
    _nomeaca = 'Assessora';
  } else if (nomeacao === 'Director') {
    _nomeaca = 'Diretor';
  } else if (nomeacao === 'Coordenador Gabinete') {
    _nomeaca = 'Coordenador de Gabinete';
  }

  return _nomeaca;
}

// ----------------------------------------------------------------------

export function emailCheck(mail, check) {
  return mail?.split('')?.reverse()?.join('')?.toLowerCase() === check;
}

// ----------------------------------------------------------------------

export function ColaboradoresAcesso(colaboradores, cc, isAdmin, meusAmbientes) {
  let colaboradoresList = [];
  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') {
    colaboradoresList = colaboradores;
  } else if (cc?.uo?.label === 'DCN') {
    colaboradoresList = colaboradores?.filter(
      (colaborador) => colaborador?.uo?.tipo === 'Agências' && colaborador?.uo?.morada?.regiao === 'Norte'
    );
  } else if (cc?.uo?.label === 'DCS') {
    colaboradoresList = colaboradores?.filter(
      (colaborador) => colaborador?.uo?.tipo === 'Agências' && colaborador?.uo?.morada?.regiao === 'Sul'
    );
  } else if (cc?.uo?.label === 'DOP') {
    colaboradoresList = colaboradores?.filter((colaborador) => colaborador?.uo?.label?.includes('DOP'));
  } else if (UosGerente(meusAmbientes)?.length > 0) {
    colaboradoresList = colaboradores?.filter((colaborador) =>
      UosGerente(meusAmbientes)?.includes(colaborador?.uo?.id)
    );
  } else if (temNomeacao(cc)) {
    colaboradoresList = colaboradores?.filter((colaborador) => colaborador?.uo?.id === cc?.uo_id);
  } else {
    colaboradoresList = colaboradores?.filter((colaborador) => colaborador?.id === cc?.id);
  }
  return colaboradoresList?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName, uoId: row?.uo_id }));
}

// ----------------------------------------------------------------------

export function UosAcesso(uos, cc, acessoAll, meusAmbientes, key) {
  let uosList = [];
  if (acessoAll || cc?.nomeacao === 'Administrador Executivo') {
    uosList = uos;
  } else if (cc?.uo?.label === 'DCN') {
    uosList = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Norte');
  } else if (cc?.uo?.label === 'DCS') {
    uosList = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Sul');
  } else if (cc?.uo?.label === 'DOP') {
    uosList = uos?.filter((uo) => uo?.label?.includes('DOP'));
  } else if (UosGerente(meusAmbientes)?.length > 0) {
    uosList = uos?.filter((uo) => UosGerente(meusAmbientes)?.includes(Number(uo?.id)));
  } else {
    uosList = uos?.filter((uo) => uo?.id === cc?.uo_id);
  }
  return uosList?.map((row) => ({ id: key === 'balcao' ? row?.balcao : row?.id, label: row?.label }));
}

// ----------------------------------------------------------------------

export function EstadosAcesso(uos, cc, isAdmin, estados, meusAmbientes) {
  let estadosList = [];
  const uosDOP = uos?.filter((uo) => uo?.label?.includes('DOP'))?.map((row) => row?.id);
  const uosDCS = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Sul')?.map((row) => row?.id);
  const uosDCN = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Norte')?.map((row) => row?.id);

  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') {
    estadosList = estados;
  } else if (cc?.uo?.label === 'DCN') {
    estadosList = estados?.filter((estado) => uosDCN?.includes(estado?.uo_id));
  } else if (cc?.uo?.label === 'DCS') {
    estadosList = estados?.filter((estado) => uosDCS?.includes(estado?.uo_id));
  } else if (cc?.uo?.label === 'DOP') {
    estadosList = estados?.filter((estado) => uosDOP?.includes(estado?.uo_id));
  } else {
    estadosList = meusAmbientes?.filter((item) => item?.id > 0);
  }
  return applySort(
    estadosList?.map((row) => ({ id: row?.id, label: row?.nome })),
    getComparator('asc', 'label')
  );
}

// ----------------------------------------------------------------------

export function UosGerente(meusAmbientes) {
  const uosGerente = [];
  meusAmbientes?.forEach((row) => {
    if (row?.nome?.includes('Gerência')) {
      uosGerente.push(Number(row?.uo_id));
    }
  });
  return uosGerente;
}

// ----------------------------------------------------------------------

export const podeArquivar = (
  meusAmbientes,
  fromAgencia,
  isGerente,
  estadoAtualID,
  arquivoAtendimento,
  acessoArquivarProcesso
) => {
  const estadoProcesso = meusAmbientes?.find((row) => Number(row?.id) === Number(estadoAtualID));
  return (
    (estadoProcesso?.is_inicial && fromAgencia && isGerente) ||
    (estadoProcesso?.is_inicial && fromAgencia && arquivoAtendimento) ||
    (estadoProcesso?.is_inicial && !fromAgencia) ||
    estadoProcesso?.is_final ||
    acessoArquivarProcesso
  );
};

// ----------------------------------------------------------------------

export const arquivarCC = (meusAmbientes, estadoAtualID) => {
  const estadoProcesso = meusAmbientes?.find((row) => Number(row?.id) === Number(estadoAtualID));
  return estadoProcesso?.is_inicial || estadoProcesso?.is_final;
};

// ----------------------------------------------------------------------

export function podeSerAtribuido(assunto) {
  return (
    !assunto?.includes('Cartão') &&
    !assunto?.includes('Extrato') &&
    !assunto?.includes('Declarações') &&
    !assunto?.includes('Cheques - Requisição')
  );
}

// ----------------------------------------------------------------------

export function naGerencia(estado) {
  return estado?.includes('Gerência') || estado?.includes('Caixa Principal');
}

// ----------------------------------------------------------------------

export function arquivoAtendimento(assunto, encGer) {
  return (
    (assunto?.includes('Cartão') ||
      assunto?.includes('Extrato') ||
      assunto?.includes('Declarações') ||
      assunto?.includes('Cheques - Requisição') ||
      assunto?.includes('Conta Caixa Ordenado')) &&
    encGer
  );
}

// ----------------------------------------------------------------------

export function caixaPrincipal(meusAmbientes) {
  return !!meusAmbientes?.find((row) => row?.nome?.includes('Caixa Principal'));
}

// ----------------------------------------------------------------------

export function estadoInicial(meusAmbientes) {
  return !!meusAmbientes?.find((row) => row?.is_inicial);
}

// ----------------------------------------------------------------------

export function pertencoEstadoId(meusAmbientes, estadoId) {
  return !!meusAmbientes?.find((row) => row?.id === estadoId);
}

// ----------------------------------------------------------------------

export function pertencoAoEstado(meusAmbientes, estados) {
  return !!meusAmbientes?.find((row) => estados?.includes(row?.nome));
}

// ----------------------------------------------------------------------

export function podeDarParecer(meusAmbientes, pareceres) {
  let parecer = false;
  pareceres?.forEach((element) => {
    if (meusAmbientes.some((row) => row.id === element?.estado_id) && !element?.validado) {
      parecer = element;
    }
    return parecer;
  });
  return parecer;
}

// ----------------------------------------------------------------------

export function findColaboradores(colaboradores, idsList) {
  return colaboradores
    ?.filter((row) => idsList.includes(row?.perfil_id))
    ?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }));
}
