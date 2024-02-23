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
      sx={{ width: { md: 200, xl: 250 } }}
      getOptionLabel={(option) => option?.nome}
      onChange={(event, newValue) => handleChangeAmbiente(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Ambiente" margin="none" />}
      options={[{ id: -1, nome: 'Todos' }, ...meusAmbientes?.filter((row) => row?.id !== -1)]}
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
      sx={{ width: { md: 200, xl: 250 } }}
      getOptionLabel={(option) => option?.assunto}
      onChange={(event, newValue) => handleChangeFluxo(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Fluxo" margin="none" />}
      options={[{ id: -1, assunto: 'Todos' }, ...meusFluxos?.filter((row) => row?.id !== -1)]}
    />
  );
}
