// @mui
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function normalizeText(text) {
  return text
    ?.toString()
    ?.toLowerCase()
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '');
}

// ----------------------------------------------------------------------

export function newLineText(text) {
  const newText = (
    <>
      {text.split('\n').map((str) => (
        <p key={str}>{str}</p>
      ))}
    </>
  );
  return newText;
}

// ----------------------------------------------------------------------

export function entidadesParse(entidades) {
  let _entidades = '';
  entidades?.split(';')?.forEach((row, index) => {
    _entidades += entidades?.split(';')?.length - 1 === index ? row : `${row} / `;
  });
  return _entidades;
}

// ----------------------------------------------------------------------

export function noDados() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      Não identificado
    </Typography>
  );
}

// ----------------------------------------------------------------------

export function errorMsg(error) {
  return (
    error.response?.data?.error ||
    error.response?.data?.errop ||
    error?.error?.[0]?.message ||
    error?.error?.[1]?.message ||
    error.response?.data?.mensagem ||
    error.response?.mensagem ||
    error.response?.data ||
    error?.mensagem ||
    error?.message ||
    error?.error ||
    'Ocorreu um erro...'
  );
}

// ----------------------------------------------------------------------

export function parametrosPesquisa(params) {
  return `${params?.get?.('avancada') ? `&avancada=${params?.get?.('avancada')}` : ''}${
    params?.get?.('chave') ? `&chave=${params?.get?.('chave')}` : ''
  }${params?.get?.('conta') ? `&conta=${params?.get?.('conta')}` : ''}${
    params?.get?.('cliente') ? `&cliente=${params?.get?.('cliente')}` : ''
  }${params?.get?.('entidade') ? `&entidade=${params?.get?.('entidade')}` : ''}${
    params?.get?.('nentrada') ? `&nentrada=${params?.get?.('nentrada')}` : ''
  }${params?.get?.('noperacao') ? `&noperacao=${params?.get?.('noperacao')}` : ''}${
    params?.get?.('uoId') ? `&uoId=${params?.get?.('uoId')}` : ''
  }${params?.get?.('uo') ? `&uo=${params?.get?.('uo')}` : ''}${
    params?.get?.('perfilId') ? `&perfilId=${params?.get?.('perfilId')}` : ''
  }${params?.get?.('datai') ? `&datai=${params?.get?.('datai')}` : ''}${
    params?.get?.('dataf') ? `&dataf=${params?.get?.('dataf')}` : ''
  }${params?.get?.('data') ? `&data=${params?.get?.('data')}` : ''}${
    params?.get?.('estado') ? `&estado=${params?.get?.('estado')}` : ''
  }${params?.get?.('assunto') ? `&assunto=${params?.get?.('assunto')}` : ''}${
    params?.get?.('colaborador') ? `&colaborador=${params?.get?.('colaborador')}` : ''
  }${params?.get?.('filterSearch') ? `&filterSearch=${params?.get?.('filterSearch')}` : ''}${
    params?.get?.('segmento') ? `&segmento=${params?.get?.('segmento')}` : ''
  }${params?.get?.('filter') ? `&filter=${params?.get?.('filter')}` : ''}`;
}

// ----------------------------------------------------------------------

export function paramsObject(params) {
  const paramsFind = {};
  if (params.get('segmento')) {
    paramsFind.segmento = params.get('segmento');
  }
  if (params.get('colaborador')) {
    paramsFind.colaborador = params.get('colaborador');
  }
  if (params.get('filter')) {
    paramsFind.filter = params.get('filter');
  }
  if (params.get('uoId')) {
    paramsFind.uoId = params.get('uoId');
  }
  if (params.get('estado')) {
    paramsFind.estado = params.get('estado');
  }
  if (params.get('assunto')) {
    paramsFind.assunto = params.get('assunto');
  }
  if (params.get('colaborador')) {
    paramsFind.colaborador = params.get('colaborador');
  }
  if (params.get('datai')) {
    paramsFind.datai = params.get('datai');
  }
  if (params.get('dataf')) {
    paramsFind.dataf = params.get('dataf');
  }
  if (params.get('data')) {
    paramsFind.data = params.get('data');
  }
  if (params.get('filter')) {
    paramsFind.filter = params.get('filter');
  }
  return paramsFind;
}
