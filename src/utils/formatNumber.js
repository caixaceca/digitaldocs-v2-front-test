import numeral from 'numeral';
import replace from 'lodash/replace';

numeral.register('locale', 'cv-cv', {
  delimiters: { thousands: ' ', decimal: ',' },
  abbreviations: { thousand: 'm', million: 'M', billion: 'b', trillion: 't' },
  ordinal() {
    return 'º';
  },
  currency: { symbol: ' CVE' },
});
numeral.locale('cv-cv' || '');

// ---------------------------------------------------------------------------------------------------------------------

export function fCurrency(value) {
  if (value === '' || value === null || value === undefined) return '';

  const number = Number(value);
  if (Number.isNaN(number)) return '';

  return numeral(number).format('0,0.00$');
}

export function fPercent(value) {
  if (value === '' || value === null || value === undefined) return '';

  const number = Number(value);
  if (Number.isNaN(number)) return '';

  return numeral(number / 100).format('0.00%');
}

export function fNumber(number, cd) {
  const casasDec =
    (cd === 1 && '0,0.0') || (cd === 2 && '0,0.00') || (cd === 3 && '0,0.000') || (cd === 4 && '0,0.0000') || '';
  return numeral(number || 0).format(casasDec);
}

export function fNumber2(number) {
  return replace(numeral(number || 0).format('0.00'), '.00', '');
}

export function fShortenNumber(number) {
  return numeral(number).format('0.0a');
}

export function fData(number) {
  return numeral(number || '').format('0.0 b');
}

// ---------------------------------------------------------------------------------------------------------------------

export function calcPercentagem(valor, total) {
  if (total === 0) return 0;
  return (valor / total) * 100;
}

// ---------------------------------------------------------------------------------------------------------------------

export function converterSegundos(number) {
  let valor = '';
  if (number < 60) valor = `${Math.round(number)} ${number === 1 ? 'segundo' : 'segundos'}`;
  else if (number < 3600) valor = `${Math.round(number / 60)} ${Math.round(number / 60) === 1 ? 'minuto' : 'minutos'}`;
  else if (number < 86400) valor = `${Math.round(number / 3600)} ${Math.round(number / 3600) === 1 ? 'hora' : 'horas'}`;
  else valor = `${Math.round(number / 86400)} ${Math.round(number / 86400) === 1 ? 'dia' : 'dias'}`;

  return valor;
}

export function converterParaOrdinal(numero, f) {
  if (!Number.isInteger(numero)) throw new Error('Introduza um número inteiro.');
  if (numero > 999) throw new Error('Introduza um número número menor que 1000.');
  if (numero < 1) throw new Error('Introduza um número inteiro positivo.');

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
