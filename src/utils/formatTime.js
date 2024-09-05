import { format, formatDistanceToNow, formatDistance, formatDistanceStrict, add } from 'date-fns';
import { pt } from 'date-fns/locale';

// ----------------------------------------------------------------------

export function formatDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';
  return date ? format(add(new Date(date), { hours: 2 }), fm, { locale: pt }) : '';
}

export function fDate(date) {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: pt });
}

export function padraoDate(date) {
  return format(add(new Date(date), { hours: 2 }), 'yyyy-MM-dd', { locale: pt });
}

export function fMShortYear(date) {
  return format(add(new Date(date), { hours: 2 }), 'MMM yyyy', { locale: pt });
}

export function fMonthYear(date) {
  return format(add(new Date(date), { hours: 2 }), "MMMM 'de' yyyy", { locale: pt });
}

export function fYear(date) {
  return format(add(new Date(date), { hours: 2 }), 'yyyy', { locale: pt });
}

export function ptDateTime(date) {
  return format(new Date(date), 'dd/MM/yyyy - HH:mm', { locale: pt });
}

export function ptDate(date) {
  return format(add(new Date(date), { hours: 2 }), 'dd/MM/yyyy', { locale: pt });
}

export function ptTime(date) {
  return format(new Date(date), 'HH:mm', { locale: pt });
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt })?.includes('daqui a')
    ? 'agora'
    : formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt })?.replace('aproximadamente', 'aprox.');
}

export function fDistance(date, date1) {
  return formatDistance(new Date(date), new Date(date1), { addSuffix: false, locale: pt });
}

export function dataMaior(date, date1) {
  const x = new Date(date);
  const y = new Date(date1);
  return x.getTime() - y.getTime() > 0;
}

export function dataPadrao(data) {
  return `${data?.toString()?.substr(0, 4)}-${data?.toString()?.substr(0, 6)?.substr(4)}-${data
    ?.toString()
    ?.substr(6)}`;
}

export function dataPadraoPt(data) {
  return `${data?.toString()?.substr(6)}/${data?.toString()?.substr(0, 6)?.substr(4)}/${data
    ?.toString()
    ?.substr(0, 4)}`;
}

export function formatDistanceStrict_(date, date1) {
  return formatDistanceStrict(new Date(date), new Date(date1), { unit: 'year', locale: pt });
}

export function getDataLS(label, data) {
  return localStorage.getItem(label) ? add(new Date(localStorage.getItem(label)), { hours: 2 }) : data;
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
