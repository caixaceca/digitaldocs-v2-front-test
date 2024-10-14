import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

RHFSwitch.propTypes = { name: PropTypes.string, otherSx: PropTypes.object, onChange: PropTypes.func };

export default function RHFSwitch({ name, onChange, otherSx = null, ...other }) {
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
      labelPlacement="start"
      sx={{ mt: { sm: 1 }, ml: 0, width: 1, justifyContent: 'center', ...otherSx }}
      {...other}
    />
  ) : (
    <FormControlLabel
      control={
        <Controller name={name} control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />
      }
      labelPlacement="start"
      sx={{ mt: { sm: 1 }, ml: 0, width: 1, justifyContent: 'center', ...otherSx }}
      {...other}
    />
  );
}
