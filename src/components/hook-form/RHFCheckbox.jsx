// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

// ---------------------------------------------------------------------------------------------------------------------

export function RHFCheckbox({ name, label, ...other }) {
  const { control } = useFormContext();
  const small = other?.size === 'small';

  return (
    <FormControlLabel
      sx={{ whiteSpace: 'nowrap', pr: 0.5 }}
      label={<Typography variant={small ? 'caption' : 'body2'}>{label}</Typography>}
      control={
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <Checkbox
              ref={ref}
              onBlur={onBlur}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              {...other}
            />
          )}
        />
      }
    />
  );
}
