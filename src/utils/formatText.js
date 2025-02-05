// @mui
import Typography from '@mui/material/Typography';
// config
import { ambiente } from '../config';

const numero = require('numero-por-extenso');

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
  if (!text) return '';
  const newText = text.split('\n').map((str) => <p key={str}>{str}</p>);
  return newText;
}

// ----------------------------------------------------------------------

export function baralharString(str) {
  if (!str || ambiente === 'producao') {
    return str;
  }
  return str;

  // if (foto) {
  //   return 'foto';
  // }

  // const arr = str.split('');

  // for (let i = arr.length - 1; i > 0; i -= 1) {
  //   const j = Math.floor(Math.random() * (i + 1));
  //   [arr[i], arr[j]] = [arr[j], arr[i]];
  // }

  // return arr.join('');
}

// ----------------------------------------------------------------------

export function entidadesParse(entidades) {
  let entidadesList = '';
  entidades?.split(';')?.forEach((row, index) => {
    entidadesList += entidades?.split(';')?.length - 1 === index ? row : `${row} / `;
  });
  return entidadesList;
}

// ----------------------------------------------------------------------

export function errorMsg(error) {
  return (
    error?.response?.data?.erro ||
    error?.response?.data?.error ||
    error?.response?.data?.errot ||
    error?.response?.data?.errop ||
    error?.response?.data?.mensagem ||
    error?.error?.[0]?.message ||
    error?.error?.[1]?.message ||
    error?.response?.mensagem ||
    error?.response?.data ||
    error?.mensagem ||
    error?.[0]?.msg ||
    error?.message ||
    error?.error ||
    'Ocorreu um erro...'
  );
}

// ----------------------------------------------------------------------

export function substituirTexto(string, parametros, valores) {
  parametros?.forEach((row) => {
    string = string?.replace(`«${row}»`, valores?.[row] || 'NÃO DEFINIDO');
  });
  return string;
}

// ----------------------------------------------------------------------

export function valorPorExtenso(valor) {
  let _valor = '';
  if (valor > 1999 || valor < 1000) {
    _valor = numero.porExtenso(valor, numero.estilo.monetario);
  } else if (valor === 1000) {
    _valor = 'mil escudos';
  } else if (
    (valor > 1000 && valor < 1101) ||
    valor === 1100 ||
    valor === 1200 ||
    valor === 1300 ||
    valor === 1400 ||
    valor === 1500 ||
    valor === 1600 ||
    valor === 1700 ||
    valor === 1800 ||
    valor === 1900
  ) {
    _valor = `mil e ${numero.porExtenso(valor - 1000, numero.estilo.monetario)}`;
  } else {
    _valor = `mil ${numero.porExtenso(valor - 1000, numero.estilo.monetario)}`;
  }
  return _valor?.replace('real', 'escudo')?.replace('reais', 'escudos');
}

// ----------------------------------------------------------------------

export function contaCliEnt(dados) {
  return (
    (dados?.conta && baralharString(dados?.conta)) ||
    (dados?.cliente && baralharString(dados?.cliente)) ||
    (dados?.entidades && baralharString(entidadesParse(dados?.entidades))) ||
    noDados()
  );
}

// ----------------------------------------------------------------------

export function nomeacaoBySexo(nomeacao, sexo) {
  if (nomeacao === 'Diretor' && sexo === 'Feminino') {
    nomeacao = 'Diretora';
  } else if (nomeacao === 'Coordenador de Gabinete' && sexo === 'Feminino') {
    nomeacao = 'Coordenadora de Gabinete';
  } else if (nomeacao === 'Coordenador de Serviço' && sexo === 'Feminino') {
    nomeacao = 'Coordenadora de Serviço';
  } else if (nomeacao === 'Coordenador Adjunto' && sexo === 'Feminino') {
    nomeacao = 'Coordenador Adjunta';
  } else if (nomeacao === 'Assessor' && sexo === 'Feminino') {
    nomeacao = 'Assessora';
  } else if (nomeacao === 'Coordenador Gabinete') {
    nomeacao = 'Coordenador de Gabinete';
  }

  return nomeacao;
}

// ----------------------------------------------------------------------

export function noDados(text) {
  return (
    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      {text || '(Não identificado)'}
    </Typography>
  );
}
