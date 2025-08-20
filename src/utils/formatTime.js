import {
  add,
  format,
  isSameYear,
  isSameMonth,
  formatDistance,
  formatDistanceToNow,
  formatDistanceStrict,
} from 'date-fns';
import { pt } from 'date-fns/locale';

// ---------------------------------------------------------------------------------------------------------------------

export function formatDate(date, newFormat) {
  if (!date) return '';
  const fm = newFormat || 'dd-MMM-yyyy';
  return date ? format(add(new Date(date), { hours: 2 }), fm, { locale: pt }) : '';
}

export function fMonthYear(date) {
  if (!date) return '';
  return format(add(new Date(date), { hours: 2 }), "MMMM 'de' yyyy", { locale: pt });
}

export function fYear(date) {
  if (!date) return '';
  return format(add(new Date(date), { hours: 2 }), 'yyyy', { locale: pt });
}

export function ptDateTime(date) {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy - HH:mm', { locale: pt });
}

export function ptDate(date) {
  if (!date) return '';
  return format(add(new Date(date), { hours: 2 }), 'dd/MM/yyyy', { locale: pt });
}

export function ptTime(date) {
  if (!date) return '';
  return format(new Date(date), 'HH:mm', { locale: pt });
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt })?.includes('daqui a')
    ? 'agora'
    : formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt })?.replace('aproximadamente', 'aprox.');
}

export function fDistance(date, date1) {
  return formatDistance(new Date(date), new Date(date1), { addSuffix: false, locale: pt })?.replace(
    'aproximadamente',
    'aprox.'
  );
}

export function dataMaior(date, date1) {
  const x = new Date(date);
  const y = new Date(date1);
  return x.getTime() - y.getTime() > 0;
}

export function dataLabel(dataInicial, dataFinal) {
  const isSameYears =
    dataInicial && dataFinal
      ? isSameYear(add(new Date(dataInicial), { hours: 2 }), add(new Date(dataFinal), { hours: 2 }))
      : false;
  const isSameMonths =
    dataInicial && dataFinal
      ? isSameMonth(add(new Date(dataInicial), { hours: 2 }), add(new Date(dataFinal), { hours: 2 }))
      : false;
  return (
    (dataInicial === dataFinal && formatDate(dataFinal, "dd 'de' MMMM 'de' yyyy")) ||
    (isSameYears &&
      isSameMonths &&
      `${formatDate(dataInicial, 'dd')} - ${formatDate(dataFinal, "dd 'de' MMMM 'de' yyyy")}`) ||
    (isSameYears &&
      `${formatDate(dataInicial, "dd 'de' MMMM")} - ${formatDate(dataFinal, "dd 'de' MMMM 'de' yyyy")}`) ||
    `${formatDate(dataInicial, "dd 'de' MMMM 'de' yyyy")} - ${formatDate(dataFinal, "dd 'de' MMMM 'de' yyyy")}`
  );
}

export function ultimoDiaDoMes(data) {
  const primeiroDiaProximoMes = new Date(data.getFullYear(), data.getMonth() + 1, 1);
  const ultimoDiaMesAtual = new Date(primeiroDiaProximoMes - 1);
  return ultimoDiaMesAtual.getDate();
}

export function getDataLS(label, data) {
  return localStorage.getItem(label) ? add(new Date(localStorage.getItem(label)), { hours: 2 }) : data;
}

export function setDataUtil(newValue, setData, localSI, resetDate, localSIF, valueF) {
  setData(newValue);
  if (localSI) localStorage.setItem(localSI, dataValido(newValue) ? format(newValue, 'yyyy-MM-dd') : '');
  if (resetDate) {
    if (newValue && dataValido(newValue) && newValue > valueF) {
      resetDate(new Date());
      if (localSIF) localStorage.setItem(localSIF, format(new Date(), 'yyyy-MM-dd'));
    } else if (!newValue) {
      resetDate(null);
      if (localSIF) localStorage.setItem(localSIF, '');
    }
  }
}

export function dataValido(date) {
  const d = new Date(date);
  return d instanceof Date && !Number.isNaN(d.getTime());
}

export function fillData(data, defaultDate) {
  return data ? add(new Date(data), { hours: 2 }) : defaultDate;
}

export function getIdade(date, date1) {
  return formatDistanceStrict(new Date(date), new Date(date1), { unit: 'year', roundingMethod: 'floor', locale: pt });
}

export function diferencaAnos(data) {
  const anos = formatDate(new Date(), 'yyyy') - formatDate(data, 'yyyy');
  return `${anos} ano${anos > 1 ? 's' : ''}`;
}

export function normalizeData(dateString) {
  if (!dateString) return '';

  const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;

  if (ddmmyyyyRegex.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }

  return dateString;
}
