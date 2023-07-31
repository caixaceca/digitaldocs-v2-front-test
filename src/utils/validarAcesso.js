// hooks
import { getComparator, applySort } from '../hooks/useTable';

// ----------------------------------------------------------------------

export function temNomeacao(colaborador) {
  let nomeacao = '';
  if (
    colaborador?.nomeacao === 'Gerente' ||
    colaborador?.nomeacao === 'Gerente Caixa Empresas' ||
    colaborador?.nomeacao === 'Sub-gerente' ||
    colaborador?.nomeacao === 'Coordenador Gabinete' ||
    colaborador?.nomeacao === 'Coordenador Adjunto' ||
    colaborador?.nomeacao === 'Director'
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
  uos?.forEach((_row) => {
    if (_row?.responsavel === colaborador?.perfil?.mail) {
      responsavel.push(_row?.id);
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
  } else if (UosGerente(meusAmbientes)?.length > 1) {
    colaboradoresList = colaboradores?.filter((colaborador) =>
      UosGerente(meusAmbientes)?.includes(colaborador?.uo?.id)
    );
  } else if (temNomeacao(cc)) {
    colaboradoresList = colaboradores?.filter((colaborador) => colaborador?.uo?.id === cc?.uo_id);
  } else {
    colaboradoresList = colaboradores?.filter((colaborador) => colaborador?.id === cc?.id);
  }
  return applySort(
    colaboradoresList?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName, uoId: row?.uo_id })),
    getComparator('asc', 'label')
  );
}

// ----------------------------------------------------------------------

export function UosAcesso(uos, cc, isAdmin, meusAmbientes) {
  let uosList = [];
  if (isAdmin || cc?.nomeacao === 'Administrador Executivo') {
    uosList = uos;
  } else if (cc?.uo?.label === 'DCN') {
    uosList = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Norte');
  } else if (cc?.uo?.label === 'DCS') {
    uosList = uos?.filter((uo) => uo?.tipo === 'Agências' && uo?.morada?.regiao === 'Sul');
  } else if (cc?.uo?.label === 'DOP') {
    uosList = uos?.filter((uo) => uo?.label?.includes('DOP'));
  } else if (UosGerente(meusAmbientes)?.length > 1) {
    uosList = uos?.filter((uo) => UosGerente(meusAmbientes)?.includes(uo?.id));
  } else {
    uosList = uos?.filter((uo) => uo?.id === cc?.uo_id);
  }
  return applySort(
    uosList?.map((row) => ({ id: row?.id, label: row?.label })),
    getComparator('asc', 'label')
  );
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
    estadosList = meusAmbientes;
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
      uosGerente.push(row?.uo_id);
    }
  });
  return uosGerente;
}

// ----------------------------------------------------------------------

export const podeFinalizarNE = (meusAmbientes) => {
  let i = 0;
  while (i < meusAmbientes?.length) {
    if (meusAmbientes[i]?.nome === 'DOP - Validação Notas Externas') {
      return true;
    }
    i += 1;
  }
  return false;
};

// ----------------------------------------------------------------------

export const podeFinalizarAgendados = (meusAmbientes) => {
  let i = 0;
  while (i < meusAmbientes?.length) {
    if (meusAmbientes[i]?.nome === 'Autorização SWIFT') {
      return true;
    }
    i += 1;
  }
  return false;
};

// ----------------------------------------------------------------------

export const podeArquivar = (meusAmbientes, fromAgencia, iAmInGrpGerente, estadoAtualiID, arquivoAtendimento) => {
  let i = 0;
  while (i < meusAmbientes?.length) {
    if (
      ((meusAmbientes[i]?.is_inicial && fromAgencia && iAmInGrpGerente) ||
        (meusAmbientes[i]?.is_inicial && fromAgencia && arquivoAtendimento) ||
        (meusAmbientes[i]?.is_inicial && !fromAgencia) ||
        meusAmbientes[i]?.is_final) &&
      Number(meusAmbientes[i]?.id) === Number(estadoAtualiID)
    ) {
      return true;
    }
    i += 1;
  }
  return false;
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

export function arquivoAtendimento(assunto, encGer) {
  return (
    (assunto?.includes('Cartão') ||
      assunto?.includes('Extrato') ||
      assunto?.includes('Declarações') ||
      assunto?.includes('Cheques - Requisição')) &&
    !!encGer
  );
}
