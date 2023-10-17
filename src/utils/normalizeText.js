import { format } from 'date-fns';
// @mui
import { Typography } from '@mui/material';

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
  const newText = (
    <>
      {text.split('\n').map((str) => (
        <p key={str}>{str}</p>
      ))}
    </>
  );
  return newText;
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

export function noDados() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      Não identificado
    </Typography>
  );
}

// ----------------------------------------------------------------------

export function setItemValue(newValue, setItem, localS, id) {
  setItem(newValue);
  if (localS) {
    localStorage.setItem(localS, (newValue && id && newValue?.id) || (newValue && newValue) || '');
  }
}

export function setDataUtil(newValue, setData, localSI, resetDate, localSIF) {
  setData(newValue);
  localStorage.setItem(localSI, dataValido(newValue) ? format(newValue, 'yyyy-MM-dd') : '');
  if (resetDate) {
    resetDate(dataValido(newValue) ? new Date() : null);
    localStorage.setItem(localSIF, dataValido(newValue) ? format(new Date(), 'yyyy-MM-dd') : '');
  }
}

export function dataValido(data) {
  return !!(data && data?.toString() !== 'Invalid Date');
}

// ----------------------------------------------------------------------

export function errorMsg(error) {
  return (
    error.response?.data?.error ||
    error.response?.data?.errop ||
    error?.error?.[0]?.message ||
    error?.error?.[1]?.message ||
    error.response?.data?.mensagem ||
    error.response?.mensagem ||
    error.response?.data ||
    error?.mensagem ||
    error?.message ||
    error?.error ||
    'Ocorreu um erro...'
  );
}
