import get from 'lodash/get';
import extenso from 'extenso';
// config
import { ambiente } from '../config';
import { noDados } from '../components/Panel';

// ---------------------------------------------------------------------------------------------------------------------

export function normalizeText(text) {
  return text
    ?.toString()
    ?.toLowerCase()
    ?.normalize('NFD')
    ?.replace(/[\u0300-\u036f]/g, '');
}

// ---------------------------------------------------------------------------------------------------------------------

export function baralharString(str) {
  if (!str || ambiente === 'producao') return str;
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

// ---------------------------------------------------------------------------------------------------------------------

export function entidadesParse(entidades) {
  let entidadesList = '';
  entidades?.split(';')?.forEach((row, index) => {
    entidadesList += entidades?.split(';')?.length - 1 === index ? row : `${row} / `;
  });
  return entidadesList;
}

// ---------------------------------------------------------------------------------------------------------------------

export const errorMsg = (error) => {
  const paths = [
    'response.data.details',
    'response.data.erro',
    'response.data.error',
    'response.data.errot',
    'response.data.errop',
    'response.data.mensagem',
    'error.0.message',
    'error.1.message',
    'response.mensagem',
    'response.data',
    'mensagem',
    '0.msg',
    'message',
    'error',
  ];

  return (
    paths.map((path) => get(error, path)).find((msg) => typeof msg === 'string' && msg.trim()) || 'Ocorreu um erro...'
  );
};

// ---------------------------------------------------------------------------------------------------------------------

export function valorPorExtenso(valor = 0) {
  return extenso(valor, { mode: 'currency', currency: { type: 'CVE' } });
}

// ---------------------------------------------------------------------------------------------------------------------

export function contaCliEnt(dados) {
  return (
    (dados?.conta && baralharString(dados?.conta)) ||
    (dados?.cliente && baralharString(dados?.cliente)) ||
    (dados?.entidades && baralharString(entidadesParse(dados?.entidades))) ||
    noDados()
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function nomeacaoBySexo(nomeacao, sexo) {
  if (nomeacao === 'Diretor' && sexo === 'Feminino') nomeacao = 'Diretora';
  else if (nomeacao === 'Coordenador de Gabinete' && sexo === 'Feminino') nomeacao = 'Coordenadora de Gabinete';
  else if (nomeacao === 'Coordenador de Serviço' && sexo === 'Feminino') nomeacao = 'Coordenadora de Serviço';
  else if (nomeacao === 'Coordenador Adjunto' && sexo === 'Feminino') nomeacao = 'Coordenador Adjunta';
  else if (nomeacao === 'Assessor' && sexo === 'Feminino') nomeacao = 'Assessora';
  else if (nomeacao === 'Coordenador Gabinete') nomeacao = 'Coordenador de Gabinete';
  return nomeacao;
}

// ---------------------------------------------------------------------------------------------------------------------

export function saudacao() {
  const agora = new Date();
  const hora = agora.getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ---------------------------------------------------------------------------------------------------------------------

export function numeroParaLetra(numero) {
  return String.fromCharCode(96 + numero);
}

// ---------------------------------------------------------------------------------------------------------------------

export const pdfInfo = {
  modificationDate: new Date(),
  producer: 'react-pdf/renderer',
  creator: 'Intranet - Caixa Económica de Cabo Verde',
};
