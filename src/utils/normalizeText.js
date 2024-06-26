import { format } from 'date-fns';
// @mui
import Typography from '@mui/material/Typography';

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
  const newText = text.split('\n').map((str) => <p key={str}>{str}</p>);
  return newText;
}

// ----------------------------------------------------------------------

export function shuffleString(str = '') {
  if (isProduction()) {
    return str;
  }

  const regexLetras = /[a-zA-Z]/;
  const regexNumeros = /[0-9]/;
  const chars = str?.split('') || [];
  for (let i = 0; i < chars?.length; i += 1) {
    if (regexLetras.test(chars[i])) {
      chars[i] = 'X';
    }
    if (regexNumeros.test(chars[i])) {
      chars[i] = '#';
    }
  }
  return chars?.join('') || [];
}

export function isProduction() {
  return true;
  // return window.location.origin?.includes('digitaldocs.caixa.cv');
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

export function findColaborador(mail, colaboradores) {
  const colaborador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === mail?.toLowerCase());
  return colaborador
    ? `${colaborador?.perfil?.displayName} ${colaborador?.uo?.label ? `(${colaborador?.uo?.label})` : ''}`
    : mail;
}

// ----------------------------------------------------------------------

export function noDados(vazio) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      {vazio ? '--' : 'Não identificado'}
    </Typography>
  );
}

// ----------------------------------------------------------------------

export function setItemValue(newValue, setItem, localS, id) {
  if (setItem) {
    setItem(newValue);
  }
  if (localS) {
    localStorage.setItem(localS, (newValue && id && newValue?.id) || (newValue && newValue) || '');
  }
}

export function setDataUtil(newValue, setData, localSI, resetDate, localSIF, valueF) {
  setData(newValue);
  if (localSI) {
    localStorage.setItem(localSI, dataValido(newValue) ? format(newValue, 'yyyy-MM-dd') : '');
  }
  if (resetDate) {
    if (newValue && dataValido(newValue) && newValue > valueF) {
      resetDate(new Date());
      if (localSIF) {
        localStorage.setItem(localSIF, format(new Date(), 'yyyy-MM-dd'));
      }
    } else if (!newValue) {
      resetDate(null);
      if (localSIF) {
        localStorage.setItem(localSIF, '');
      }
    }
  }
}

export function dataValido(data) {
  return !!(data && data?.toString() !== 'Invalid Date');
}

// ----------------------------------------------------------------------

export function errorMsg(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.errot ||
    error?.response?.data?.errop ||
    error?.error?.[0]?.message ||
    error?.error?.[1]?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.mensagem ||
    error?.response?.data?.erro ||
    error?.response?.mensagem ||
    error.response?.data ||
    error?.mensagem ||
    error?.[0]?.msg ||
    error?.message ||
    error?.error ||
    'Ocorreu um erro...'
  );
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
    valor === 110 ||
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

export function converterParaOrdinal(numero, f) {
  if (!Number.isInteger(numero)) {
    throw new Error('Introduza um número inteiro.');
  }
  if (numero > 999) {
    throw new Error('Introduza um número número menor que 1000.');
  }
  if (numero < 1) {
    throw new Error('Introduza um número inteiro positivo.');
  }
  const g = f ? 'a' : 'o';
  let txt = '';
  if (numero < 1000 && numero > 99) {
    const t = [
      '',
      'cent',
      'ducent',
      'trecent',
      'quadrigent',
      'quingent',
      'sexcent',
      'septigent',
      'octigent',
      'nongent',
    ];
    const n100 = Math.floor(numero / 100);
    const l = numero - n100 * 100;
    txt = `${t[n100]}ésim${g} ${l > 0 ? converterParaOrdinal(l, f) : ''}`;
  }
  if (numero < 100 && numero > 9) {
    const x = ['', 'décimo', 'vig', 'trig', 'quadrag', 'quinquag', 'sexag', 'septuag', 'octog', 'nonag'];
    const n10 = Math.floor(numero / 10);
    const l = numero - n10 * 10;
    txt = `${x[n10] + (n10 > 1 ? `ésim${g}` : '')} ${l > 0 ? converterParaOrdinal(l, f) : ''}`;
  }
  if (numero < 10 && numero > 0) {
    const u = ['', 'primeir', 'segund', 'terceir', 'quart', 'quint', 'sext', 'sétim', 'oitav', 'non'];
    txt = u[numero] + g;
  }
  return txt;
}

// ----------------------------------------------------------------------

export function substituirTexto(string, parametros, valores) {
  parametros?.forEach((row) => {
    string = string?.replace(`«${row}»`, valores?.[row] || 'NÃO DEFINIDO');
  });
  return string;
}
