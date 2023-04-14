import { useCallback } from 'react';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { changeMeuAmbiente } from '../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

export default function Ambiente() {
  const dispatch = useDispatch();
  const { meusAmbientes, meuAmbiente } = useSelector((state) => state.digitaldocs);

  const handleChangeAmbiente = useCallback(
    (value) => {
      dispatch(changeMeuAmbiente(value));
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
