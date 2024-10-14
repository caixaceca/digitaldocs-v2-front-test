import PropTypes from 'prop-types';
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

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

RHFAutocomplete.propTypes = { name: PropTypes.string, label: PropTypes.string };

export function RHFAutocomplete({ name, label, ...other }) {
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
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

RHFAutocompleteObject.propTypes = {
  small: PropTypes.bool,
  name: PropTypes.string,
  label: PropTypes.string,
  options: PropTypes.array,
};

export function RHFAutocompleteObject({ name, options, label, small = false, ...other }) {
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
          size={small ? 'small' : 'medium'}
          getOptionLabel={(option) => option?.label}
          onChange={(event, newValue) => field.onChange(newValue)}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label={label} error={!!error} helperText={error?.message} />}
          {...other}
        />
      )}
    />
  );
}

// ----------------------------------------------------------------------

RHFDatePicker.propTypes = {
  small: PropTypes.bool,
  name: PropTypes.string,
  label: PropTypes.string,
  dateTime: PropTypes.bool,
  required: PropTypes.bool,
};

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

// ----------------------------------------------------------------------

RHFDateIF.propTypes = {
  datai: PropTypes.object,
  dataf: PropTypes.object,
  setDatai: PropTypes.func,
  setDataf: PropTypes.func,
  labeli: PropTypes.string,
  labelf: PropTypes.string,
  clearable: PropTypes.bool,
};

export function RHFDateIF({ datai, dataf, setDatai, setDataf, labeli = '', labelf = '', clearable = false }) {
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

// ----------------------------------------------------------------------

RHFNumberField.propTypes = { name: PropTypes.string, tipo: PropTypes.string };

export function RHFNumberField({ name, tipo, ...other }) {
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
          helperText={error?.message}
          InputProps={{
            type: 'number',
            inputProps: { style: { textAlign: 'right' } },
            endAdornment: tipo && (
              <InputAdornment position="end">
                {(tipo === 'dia' && 'dias') ||
                  (tipo === 'moeda' && 'CVE') ||
                  (tipo === 'percentagem' && '%') ||
                  (tipo === 'prestacao' && 'meses')}
              </InputAdornment>
            ),
          }}
          {...other}
        />
      )}
    />
  );
}
