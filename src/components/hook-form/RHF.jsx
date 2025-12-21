// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

// ---------------------------------------------------------------------------------------------------------------------

export function RHFNumberField({ name, tipo, small = false, noFormat = false, ...other }) {
  const { control } = useFormContext();

  const formatNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          error={!!error}
          helperText={error?.message}
          size={small ? 'small' : 'medium'}
          value={noFormat ? value : formatNumber(value)}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\s/g, '');
            onChange(rawValue);
          }}
          InputProps={{
            inputProps: { style: { textAlign: 'right' } },
            endAdornment: tipo && <InputAdornment position="end">{tipo}</InputAdornment>,
          }}
          {...other}
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RHFAutocompleteSmp({ name, label, small = false, multiple = false, ...other }) {
  const { control } = useFormContext();
  const { dc = false, ...rest } = other;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          fullWidth
          multiple={multiple}
          disableClearable={!!dc}
          size={small ? 'small' : 'medium'}
          onChange={(event, newValue) => field.onChange(newValue)}
          renderInput={(params) => <TextField {...params} label={label} error={!!error} helperText={error?.message} />}
          {...rest}
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RHFAutocompleteObj({ name, label, small = false, ...other }) {
  const { control } = useFormContext();
  const { dc = false, ...rest } = other;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          fullWidth
          disableClearable={!!dc}
          size={small ? 'small' : 'medium'}
          getOptionLabel={(option) => option?.label}
          onChange={(event, newValue) => field.onChange(newValue)}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label={label} error={!!error} helperText={error?.message} />}
          {...rest}
        />
      )}
    />
  );
}
// ---------------------------------------------------------------------------------------------------------------------

export function RHFRadioGroup({ name, label, options = [], row = false, ...other }) {
  const { control } = useFormContext();

  const normalizedOptions = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" error={!!error} fullWidth>
          <Stack direction={row ? 'row' : 'column'} alignItems={row ? 'center' : 'flex-start'} spacing={row ? 2 : 1}>
            {label && <FormLabel component="legend">{label}</FormLabel>}

            <RadioGroup {...field} row={row} onChange={(event) => field.onChange(event.target.value)} {...other}>
              {normalizedOptions.map((option) => (
                <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
              ))}
            </RadioGroup>
          </Stack>

          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
