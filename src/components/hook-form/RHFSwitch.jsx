// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// ---------------------------------------------------------------------------------------------------------------------

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
      sx={{ mt: { sm: !other?.mt ? 1 : 0 }, ml: 0, width: 1, justifyContent: 'center', ...otherSx }}
      {...other}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

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
            if (localS) localStorage.setItem(localS, value === true ? 'true' : 'false');
          }}
        />
      }
    />
  );
}
