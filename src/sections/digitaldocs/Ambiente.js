import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { changeMeuAmbiente } from '../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

Ambiente.propTypes = { origem: PropTypes.string };

export default function Ambiente({ origem = '' }) {
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
      sx={{ width: { md: 200, xl: 220 } }}
      size={origem === 'processo' ? 'small' : 'medium'}
      onChange={(event, newValue) => handleChangeAmbiente(newValue)}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option) => option?.nome}
      renderInput={(params) => <TextField {...params} label="Ambiente" margin="none" />}
    />
  );
}
