import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { TextField, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// ----------------------------------------------------------------------

RHFAutocomplete.propTypes = { name: PropTypes.string, label: PropTypes.string };

export default function RHFAutocomplete({ name, label, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          renderInput={(params) => <TextField {...params} label={label} error={!!error} helperText={error?.message} />}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

RHFAutocompleteSimple.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.array,
  multiple: PropTypes.bool,
};

export function RHFAutocompleteSimple({ name, options, label, multiple = false, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          fullWidth
          options={options}
          multiple={multiple}
          onChange={(event, newValue) => field.onChange(newValue)}
          renderInput={(params) => <TextField {...params} label={label} error={!!error} helperText={error?.message} />}
        />
      )}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------

RHFAutocompleteObject.propTypes = { name: PropTypes.string, label: PropTypes.string, options: PropTypes.array };

export function RHFAutocompleteObject({ name, options, label }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          fullWidth
          options={options}
          getOptionLabel={(option) => option?.label}
          onChange={(event, newValue) => field.onChange(newValue)}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label={label} error={!!error} helperText={error?.message} />}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

RHFDatePicker.propTypes = { name: PropTypes.string, label: PropTypes.string };

export function RHFDatePicker({ name, label, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          label={label}
          value={field.value}
          onChange={(newValue) => field.onChange(newValue)}
          slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
          {...other}
        />
      )}
    />
  );
}
