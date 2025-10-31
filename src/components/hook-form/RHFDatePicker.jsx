// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// utils
import { setDataUtil } from '../../utils/formatTime';

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
