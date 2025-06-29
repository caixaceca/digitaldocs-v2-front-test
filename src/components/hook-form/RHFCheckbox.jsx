// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

// ---------------------------------------------------------------------------------------------------------------------

export function RHFCheckbox({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Checkbox {...field} checked={field.value} />}
        />
      }
      {...other}
    />
  );
}
