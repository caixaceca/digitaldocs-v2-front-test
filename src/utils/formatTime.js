import { format, getTime, formatDistanceToNow, formatDistance, add } from 'date-fns';
import { pt } from 'date-fns/locale';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", {
    locale: pt,
  });
}

export function fMonth(date) {
  return format(new Date(date), 'MMMM', {
    locale: pt,
  });
}

export function ptExtenseDate(date) {
  return format(new Date(date), "dd 'de' MMMM", {
    locale: pt,
  });
}

export function ptExtenseMDate(date) {
  return format(new Date(date), "MMMM 'de' yyyy", {
    locale: pt,
  });
}

export function simpleDate(date) {
  return format(new Date(date), 'yyyy/M/dd');
}

export function padraoDate(date) {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function padraoDate_(date) {
  return format(new Date(date), 'MM-dd');
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

export function mdDate(date) {
  return format(new Date(date), "dd 'de' MMMM", {
    addSuffix: true,
    locale: pt,
  });
}

export function mmdDate(date) {
  return format(new Date(date), 'dd MMM', {
    locale: pt,
  });
}

export function ptTime(date) {
  return format(new Date(date), 'HH:mm a');
}

export function ptWeek(date) {
  return format(new Date(date), 'EEEE', {
    addSuffix: true,
    locale: pt,
  });
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: pt,
  });
}

export function fToNowWithOutSufix(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: false,
    locale: pt,
  });
}

export function fDistance(date, date1) {
  return formatDistance(new Date(date), new Date(date1), {
    addSuffix: false,
    locale: pt,
  });
}
