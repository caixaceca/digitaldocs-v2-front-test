import numeral from 'numeral';

numeral.register('locale', 'cv-cv', {
  delimiters: { thousands: ' ', decimal: ',' },
  abbreviations: { thousand: 'm', million: 'M', billion: 'b', trillion: 't' },
  ordinal() {
    return 'º';
  },
  currency: { symbol: ' CVE' },
});
numeral.locale('cv-cv');

// ---------------------------------------------------------------------------------------------------------------------

export function fCurrency(value) {
  if (value === '' || value === null || value === undefined) return '';

  const number = Number(value);
  if (Number.isNaN(number)) return '';

  return numeral(number).format('0,0.00$');
}

export function fConto(value, sufixo) {
  if (value === '' || value === null || value === undefined) return '';

  const number = Number(value);
  if (Number.isNaN(number)) return '';

  const contos = number === 0 ? 0 : number / 1000;
  const label = contos > 1 ? 'contos' : 'conto';

  return `${fNumber(contos)}${sufixo ? ` ${label}` : ''}`;
}

export function fPercent(value, cd) {
  if (value === '' || value === null || value === undefined) return '';

  const number = Number(value);
  if (Number.isNaN(number)) return '';

  return numeral(number / 100).format((cd === 3 && '0.000%') || '0.00%');
}

export function fNumber(number, cd) {
  const casasDec =
    (cd === 1 && '0,0.0') || (cd === 2 && '0,0.00') || (cd === 3 && '0,0.000') || (cd === 4 && '0,0.0000') || '';
  return numeral(number || 0).format(casasDec);
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
  if (number < 60) {
    return `${Math.round(number)} ${number === 1 ? 'segundo' : 'segundos'}`;
  }

  if (number < 3600) {
    const min = Math.round(number / 60);
    return `${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  }

  if (number < 86400) {
    const horas = Math.round(number / 3600);
    return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  }

  const dias = Math.round(number / 86400);
  return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}
