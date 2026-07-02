import get from 'lodash/get';
import extenso from 'extenso';
// config
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

export function entidadesParse(entidades) {
  if (!entidades) return '';

  return entidades
    .split(';')
    .map((entidade) => entidade.trim())
    .filter(Boolean)
    .join(' / ');
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
    (dados?.conta && dados?.conta) ||
    (dados?.cliente && dados?.cliente) ||
    (dados?.entidades && entidadesParse(dados?.entidades)) ||
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

export function formatPrazoAmortizacao(valor) {
  if (valor === null || valor === undefined || valor === '') return '--';
  if (typeof valor === 'string' && /^\d+$/.test(valor)) return `${valor} meses`;
  if (typeof valor === 'number' && valor) return `${valor} meses`;
  if (typeof valor !== 'string') return '--';

  const texto = valor.toLowerCase().trim();
  const matchNumero = texto.match(/\d+/);
  if (!matchNumero) return '--';
  const numero = parseInt(matchNumero[0], 10);

  if (texto.includes('ano') || texto.includes('anos') || texto.match(/\b(a)\b/)) return `${numero * 12} meses`;
  if (texto.includes('mes') || texto.includes('meses') || texto.match(/\b(m)\b/)) return `${numero} meses`;

  return `${numero} meses`;
}

// ---------------------------------------------------------------------------------------------------------------------

export const queryString = (params) =>
  params && typeof params === 'object' && !params.detalhes
    ? (() => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          const isExcluded = ['id', 'notLoading', 'reset'].includes(key);
          const hasValue = value !== null && value !== undefined && value !== '';
          if (!isExcluded && hasValue) searchParams.append(key, value);
        });

        const string = searchParams.toString();
        return string ? `?${string}` : '';
      })()
    : '';

// ---------------------------------------------------------------------------------------------------------------------

export function labelMeses(valor) {
  if (valor === '' || valor === null || valor === undefined) return '';
  return `${valor} meses`;
}

// ---------------------------------------------------------------------------------------------------------------------

export function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------------------------------------------------

export const pdfInfo = {
  modificationDate: new Date(),
  producer: 'react-pdf/renderer',
  creator: 'Intranet - Caixa Económica de Cabo Verde',
};
