import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import { MenuItem, TextField } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { changeMeuFluxo } from '../../redux/slices/digitaldocs';

// ----------------------------------------------------------------------

Fluxo.propTypes = {
  origem: PropTypes.string,
};

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
    <TextField
      size={origem === 'processo' ? 'small' : 'medium'}
      select
      fullWidth
      value={meuFluxo?.id}
      label="Assunto"
      SelectProps={{ native: false }}
      sx={{ width: origem === 'processo' ? { sm: 200 } : { md: 250, xl: 350 } }}
    >
      {meusFluxos.map((option) => (
        <MenuItem
          key={option.id}
          value={option.id}
          onClick={() => handleChangeFluxo(option)}
          sx={{ minHeight: 30, mx: 1, my: 0.5, borderRadius: 0.75, typography: 'body2' }}
        >
          {option.assunto}
        </MenuItem>
      ))}
    </TextField>
  );
}
