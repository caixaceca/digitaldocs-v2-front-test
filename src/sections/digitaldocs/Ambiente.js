import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import { MenuItem, TextField } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { changeMeuAmbiente } from '../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

Ambiente.propTypes = {
  origem: PropTypes.string,
};

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
    <TextField
      select
      fullWidth
      label="Ambiente"
      value={meuAmbiente?.id}
      SelectProps={{ native: false }}
      sx={{ width: { md: 200, xl: 220 } }}
      size={origem === 'processo' ? 'small' : 'medium'}
    >
      {meusAmbientes.map((option) => (
        <MenuItem
          key={option.id}
          value={option.id}
          onClick={() => handleChangeAmbiente(option)}
          sx={{ minHeight: 30, mx: 1, my: 0.5, borderRadius: 0.75, typography: 'body2' }}
        >
          {option.nome}
        </MenuItem>
      ))}
    </TextField>
  );
}
