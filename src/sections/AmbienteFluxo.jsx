// @mui
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { changeMeuAmbiente, getSuccess } from '../redux/slices/parametrizacao';

// ---------------------------------------------------------------------------------------------------------------------

export function Ambiente({ ...other }) {
  const dispatch = useDispatch();
  const { meusAmbientes, meuAmbiente } = useSelector((state) => state.parametrizacao);

  return (
    <Autocomplete
      fullWidth
      value={meuAmbiente}
      options={meusAmbientes}
      sx={{ width: { md: 200, xl: 250 } }}
      getOptionLabel={(option) => option?.nome}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Estado" />}
      onChange={(event, newValue) => {
        dispatch(changeMeuAmbiente(newValue));
        localStorage.setItem('meuAmbiente', newValue?.id);
      }}
      {...other}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Fluxo({ ...other }) {
  const dispatch = useDispatch();
  const { meusFluxos, meuFluxo } = useSelector((state) => state.parametrizacao);

  return (
    <Autocomplete
      fullWidth
      value={meuFluxo}
      options={meusFluxos}
      sx={{ width: { md: 200, xl: 250 } }}
      getOptionLabel={(option) => option?.assunto}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => <TextField {...params} label="Fluxo" />}
      onChange={(event, newValue) => {
        dispatch(getSuccess({ item: 'meuFluxo', dados: newValue }));
        localStorage.setItem('meuFluxo', newValue?.id);
      }}
      {...other}
    />
  );
}
