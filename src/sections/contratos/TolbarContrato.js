import { useState, useEffect } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// redux
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getFromBanka, getSuccess } from '../../redux/slices/banka';
// components
import { SearchAdornment } from '../../components/Actions';
import { SearchAutocomplete } from '../../components/SearchToolbar';

// ----------------------------------------------------------------------

export default function TolbarContrato() {
  const dispatch = useDispatch();
  const { mail } = useSelector((state) => state.intranet);
  const { numProposta } = useSelector((state) => state.banka);
  const [tipo, setTipo] = useState(localStorage.getItem('tipoC') || null);
  const [modelo, setModelo] = useState(localStorage.getItem('modeloC') || null);
  const [numero, setNumero] = useState(numProposta);

  useEffect(() => {
    if (mail) {
      dispatch(getFromBanka('contrato', { mail, tipo, modelo }));
    }
  }, [dispatch, mail, tipo, modelo]);

  const changeNumero = () => {
    dispatch(getSuccess({ item: 'numEntidade', dados: numero }));
  };
  return (
    <Card sx={{ p: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1}>
        <SearchAutocomplete
          value={tipo}
          size="small"
          label="Tipo"
          valuel="tipoC"
          disableClearable
          setValue={setTipo}
          dados={['Contrato particular de crédito']}
        />
        <SearchAutocomplete
          size="small"
          value={modelo}
          label="Modelo"
          valuel="modeloC"
          disableClearable
          setValue={setModelo}
          dados={['Credicaixa garantido por fiança']}
        />
        <TextField
          fullWidth
          size="small"
          value={numero}
          label="Nº de proposta"
          sx={{ maxWidth: { sm: 200 } }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              changeNumero();
            }
          }}
          onChange={(event) => setNumero(event.target.value)}
          InputProps={{ endAdornment: numero && <SearchAdornment small handleClick={changeNumero} /> }}
        />
      </Stack>
    </Card>
  );
}
