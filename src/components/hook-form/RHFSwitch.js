import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Switch, FormControlLabel } from '@mui/material';

// ----------------------------------------------------------------------

RHFSwitch.propTypes = { name: PropTypes.string, onChange: PropTypes.func };

export default function RHFSwitch({ name, onChange, ...other }) {
  const { control } = useFormContext();

  return onChange ? (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Switch {...field} onChange={onChange} checked={field.value} />}
        />
      }
      sx={{ mt: { sm: 1 }, ml: 0, width: 1, justifyContent: 'center' }}
      {...other}
    />
  ) : (
    <FormControlLabel
      control={
        <Controller name={name} control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />
      }
      sx={{ mt: { sm: 1 }, ml: 0, width: 1, justifyContent: 'center' }}
      {...other}
    />
  );
}
