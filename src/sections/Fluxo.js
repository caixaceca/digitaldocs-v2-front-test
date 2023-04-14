import { useCallback } from 'react';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { changeMeuFluxo } from '../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

export default function Fluxo() {
  const dispatch = useDispatch();
  const { meusFluxos, meuFluxo } = useSelector((state) => state.digitaldocs);

  const handleChangeFluxo = useCallback(
    (value) => {
      dispatch(changeMeuFluxo(value));
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
