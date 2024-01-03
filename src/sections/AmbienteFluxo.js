import { useCallback } from 'react';
// @mui
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { changeMeuAmbiente, changeMeuFluxo } from '../redux/slices/parametrizacao';

// ----------------------------------------------------------------------

export function Ambiente() {
  const dispatch = useDispatch();
  const { meusAmbientes, meuAmbiente } = useSelector((state) => state.parametrizacao);

  const handleChangeAmbiente = useCallback(
    (newValue) => {
      dispatch(changeMeuAmbiente(newValue));
      localStorage.setItem('meuAmbiente', newValue?.id);
    },
    [dispatch]
  );

  return (
    <Autocomplete
      fullWidth
      disableClearable
      value={meuAmbiente}
      options={meusAmbientes}
      sx={{ width: { md: 200, xl: 250 } }}
      getOptionLabel={(option) => option?.nome}
      onChange={(event, newValue) => handleChangeAmbiente(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Ambiente" margin="none" />}
    />
  );
}

// ----------------------------------------------------------------------

export function Fluxo() {
  const dispatch = useDispatch();
  const { meusFluxos, meuFluxo } = useSelector((state) => state.parametrizacao);

  const handleChangeFluxo = useCallback(
    (newValue) => {
      dispatch(changeMeuFluxo(newValue));
    },
    [dispatch]
  );

  return (
    <Autocomplete
      fullWidth
      disableClearable
      value={meuFluxo}
      options={meusFluxos}
      sx={{ width: { md: 200, xl: 250 } }}
      getOptionLabel={(option) => option?.assunto}
      onChange={(event, newValue) => handleChangeFluxo(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Fluxo" margin="none" />}
    />
  );
}
