// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import TextField from '@mui/material/TextField';

// ---------------------------------------------------------------------------------------------------------------------

export default function RHFTextField({ name, small = false, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          error={!!error}
          size={small ? 'small' : 'medium'}
          helperText={error?.message}
          {...other}
        />
      )}
    />
  );
}
