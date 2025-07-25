// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// utils
import { setDataUtil } from '../../utils/formatTime';

// ---------------------------------------------------------------------------------------------------------------------

export function RHFNumberField({ name, tipo, noFormat = false, ...other }) {
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

export function RHFAutocompleteSmp({ name, label, multiple = false, ...other }) {
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

export function RHFDatePicker({ name, label = '', small = false, required = false, dateTime = false, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) =>
        dateTime ? (
          <DateTimePicker
            label={label}
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            slotProps={{
              textField: { error, helperText: error?.message, fullWidth: true, size: small ? 'small' : 'medium' },
            }}
            {...other}
          />
        ) : (
          <DatePicker
            label={label}
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            slotProps={{
              textField: {
                error,
                required,
                fullWidth: true,
                helperText: error?.message,
                size: small ? 'small' : 'medium',
              },
            }}
            {...other}
          />
        )
      }
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RHFDataEntrada({ name, label = '', ...other }) {
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
          slotProps={{ textField: { error, fullWidth: true, helperText: error?.message } }}
          shouldDisableDate={(date) => {
            const day = date.getDay();
            return day === 0 || day === 6;
          }}
          {...other}
        />
      )}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RHFDateIF({ options }) {
  const { datai, dataf, setDatai, setDataf, labeli = '', labelf = '', clearable = false } = options;

  return (
    <Stack direction="row" spacing={1}>
      <DatePicker
        value={datai}
        label="Data inicial"
        maxDate={new Date()}
        slotProps={{ ...datePickerConf(clearable) }}
        onChange={(newValue) => setDataUtil(newValue, setDatai, labeli, setDataf, labelf, dataf)}
      />
      <DatePicker
        value={dataf}
        minDate={datai}
        disabled={!datai}
        label="Data final"
        maxDate={new Date()}
        slotProps={{ ...datePickerConf(clearable) }}
        onChange={(newValue) => setDataUtil(newValue, setDataf, labelf, '', '', '')}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const datePickerConf = (clearable) => ({
  field: { clearable },
  textField: {
    size: 'small',
    fullWidth: true,
    sx: {
      width: clearable ? 170 : 150,
      '&.MuiTextField-root .MuiIconButton-root': { padding: 0.5 },
      '&.MuiTextField-root .clearButton': { padding: 0.25, opacity: 0.5 },
    },
  },
});
