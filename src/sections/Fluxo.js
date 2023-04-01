import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../redux/store';
import { changeMeuFluxo } from '../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

Fluxo.propTypes = { origem: PropTypes.string };

export default function Fluxo({ origem }) {
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
      size={origem === 'processo' ? 'small' : 'medium'}
      onChange={(event, newValue) => handleChangeFluxo(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option) => option?.assunto}
      sx={{ width: origem === 'processo' ? { sm: 200 } : { md: 250, xl: 300 } }}
      renderInput={(params) => <TextField {...params} label="Fluxo" margin="none" />}
    />
  );
}
