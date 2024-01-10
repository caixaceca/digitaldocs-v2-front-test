import { format } from 'date-fns';
// @mui
import Typography from '@mui/material/Typography';

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

export function noDados(vazio) {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      {vazio ? '--' : 'Não identificado'}
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
    error.response?.data?.error ||
    error.response?.data?.errop ||
    error?.error?.[0]?.message ||
    error?.error?.[1]?.message ||
    error.response?.data?.mensagem ||
    error.response?.data?.erro ||
    error.response?.mensagem ||
    error.response?.data ||
    error?.mensagem ||
    error?.[0]?.msg ||
    error?.message ||
    error?.error ||
    'Ocorreu um erro...'
  );
}
