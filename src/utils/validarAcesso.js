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

export function findColaboradoresAcesso(colaboradores, currentColaborador, uosResp, isAdmin, isChefia) {
  let colaboradoresAcesso = [];
  if (isAdmin) {
    colaboradoresAcesso = colaboradores;
  } else if (uosResp?.length > 0) {
    colaboradoresAcesso = colaboradores?.filter((row) => uosResp?.includes(row?.uo?.id));
  } else if (currentColaborador?.uo?.label === 'DOP') {
    colaboradoresAcesso = colaboradores?.filter((row) => row?.uo?.label?.encludes('DOP'));
  } else if (isChefia) {
    colaboradoresAcesso = colaboradores?.filter((row) => row?.uo?.id === currentColaborador?.uo?.id);
  } else if (currentColaborador?.uo?.label === 'DCN') {
    colaboradoresAcesso = colaboradores?.filter(
      (row) => row?.uo?.tipo === 'Agências' && row?.uo?.morada?.regiao === 'Norte'
    );
  } else if (currentColaborador?.uo?.label === 'DCS') {
    colaboradoresAcesso = colaboradores?.filter(
      (row) => row?.uo?.tipo === 'Agências' && row?.uo?.morada?.regiao === 'Sul'
    );
  } else {
    colaboradoresAcesso = colaboradores?.filter((row) => row?.id === currentColaborador?.id);
  }
  return colaboradoresAcesso;
}
