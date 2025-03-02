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

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch {...field} onChange={onChange ?? field.onChange} checked={field.value ?? false} />
          )}
        />
      }
      labelPlacement="start"
      sx={{ mt: { sm: 1 }, ml: 0, width: 1, justifyContent: 'center', ...otherSx }}
      {...other}
    />
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FilterSwitch.propTypes = {
  value: PropTypes.bool,
  label: PropTypes.string,
  localS: PropTypes.string,
  setValue: PropTypes.func,
};

export function FilterSwitch({ label, value, setValue, localS = '' }) {
  return (
    <FormControlLabel
      label={label}
      sx={{ pr: 2, justifyContent: 'center' }}
      control={
        <Switch
          checked={value}
          onChange={(event, value) => {
            setValue(value);
            if (localS) {
              localStorage.setItem(localS, value === true ? 'true' : 'false');
            }
          }}
        />
      }
    />
  );
}
