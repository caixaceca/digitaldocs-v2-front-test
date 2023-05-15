import { format, formatDistanceToNow, formatDistance, add } from 'date-fns';
import { pt } from 'date-fns/locale';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
    locale: pt,
  });
}

export function padraoDate(date) {
  return format(add(new Date(date), { hours: 2 }), 'yyyy-MM-dd', {
    locale: pt,
  });
}

export function padraoMYDate(date) {
  return format(add(new Date(date), { hours: 2 }), 'yyyy-MM', {
    locale: pt,
  });
}

export function fMShortYear(date) {
  return format(add(new Date(date), { hours: 2 }), 'MMM yyyy', {
    locale: pt,
  });
}

export function fMonthYear(date) {
  return format(add(new Date(date), { hours: 2 }), "MMMM 'de' yyyy", {
    locale: pt,
  });
}

export function fYear(date) {
  return format(add(new Date(date), { hours: 2 }), 'yyyy', {
    locale: pt,
  });
}

export function fDateTime(date) {
  return format(new Date(date), 'dd/MM/yyyy - HH:mm a', {
    locale: pt,
  });
}

export function ptDateTime(date) {
  return format(new Date(date), 'dd/MM/yyyy - HH:mm', {
    locale: pt,
  });
}

export function ptDate(date) {
  return format(add(new Date(date), { hours: 2 }), 'dd/MM/yyyy', {
    locale: pt,
  });
}

export function ptTime(date) {
  return format(new Date(date), 'HH:mm', {
    locale: pt,
  });
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: pt,
  });
}

export function fDistance(date, date1) {
  return formatDistance(new Date(date), new Date(date1), {
    addSuffix: false,
    locale: pt,
  });
}
