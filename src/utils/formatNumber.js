import { replace } from 'lodash';
import numeral from 'numeral';

numeral.register('locale', 'cv-cv', {
  delimiters: {
    thousands: ' ',
    decimal: ',',
  },
  abbreviations: {
    thousand: 'm',
    million: 'M',
    billion: 'b',
    trillion: 't',
  },
  ordinal() {
    return 'º';
  },
  currency: {
    symbol: ' CVE',
  },
});

// ----------------------------------------------------------------------

export function fCurrency(number) {
  numeral.locale('cv-cv' || '');
  return numeral(number).format('0,0.00$');
}

export function fPercent(number) {
  return numeral(number / 100).format('0.00%');
}

export function fPercent3(number) {
  return numeral(number / 100).format('0.000%');
}

export function fNumber(number) {
  numeral.locale('cv-cv' || '');
  return numeral(number).format();
}

export function fNumber2(number) {
  numeral.locale('cv-cv' || '');
  return replace(numeral(number).format('0.00'), '.00', '');
}

export function fShortenNumber(number) {
  numeral.locale('cv-cv' || '');
  return replace(numeral(number).format('0.0a'), '.0', '');
}

export function fData(number) {
  return numeral(number).format('0.0 b');
}

export function converterSegundos(number) {
  let valor = '';
  if (number < 60) {
    valor = `${Math.round(number)} ${number === 1 ? 'segundo' : 'segundos'}`;
  } else if (number < 3600) {
    valor = `${Math.round(number / 60)} ${Math.round(number / 60) === 1 ? 'minuto' : 'minutos'}`;
  } else if (number < 86400) {
    valor = `${Math.round(number / 3600)} ${Math.round(number / 3600) === 1 ? 'hora' : 'horas'}`;
  } else {
    valor = `${Math.round(number / 86400)} ${Math.round(number / 86400) === 1 ? 'dia' : 'dias'}`;
  }
  return valor;
}
