import { parse, format, isValid } from 'date-fns';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// utils
import { setDataUtil } from '@/utils/formatTime';

// ---------------------------------------------------------------------------------------------------------------------

export function RHFDatePicker({
  name,
  label = '',
  small = false,
  required = false,
  dateTime = false,
  timePicker = false,
  ...other
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const slotProps = {
          textField: {
            required,
            error: !!error,
            fullWidth: true,
            helperText: error?.message,
            size: small ? 'small' : 'medium',
          },
        };

        if (timePicker) {
          const parsed =
            field.value && typeof field.value === 'string'
              ? parse(field.value, 'HH:mm', new Date())
              : field.value instanceof Date && isValid(field.value)
                ? field.value
                : null;

          return (
            <TimePicker
              label={label}
              value={parsed}
              onChange={(newValue) => field.onChange(newValue && isValid(newValue) ? format(newValue, 'HH:mm') : null)}
              slotProps={slotProps}
              {...other}
            />
          );
        }

        if (dateTime) {
          return (
            <DateTimePicker
              label={label}
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
              slotProps={slotProps}
              {...other}
            />
          );
        }

        return (
          <DatePicker
            label={label}
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            slotProps={slotProps}
            {...other}
          />
        );
      }}
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
  const { datai, dataf, setDatai, setDataf, labeli = '', labelf = '', clearable = false, small = true } = options;

  return (
    <Stack direction="row" spacing={1}>
      <DatePicker
        value={datai}
        label="Data inicial"
        maxDate={new Date()}
        slotProps={{ ...datePickerConf(clearable, small) }}
        onChange={(newValue) => setDataUtil(newValue, setDatai, labeli, setDataf, labelf, dataf)}
      />
      <DatePicker
        value={dataf}
        minDate={datai}
        disabled={!datai}
        label="Data final"
        maxDate={new Date()}
        slotProps={{ ...datePickerConf(clearable, small) }}
        onChange={(newValue) => setDataUtil(newValue, setDataf, labelf, '', '', '')}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

const datePickerConf = (clearable, small) => ({
  field: { clearable },
  textField: {
    fullWidth: true,
    size: small ? 'small' : 'meddium',
    sx: {
      width: clearable ? 170 : 150,
      '&.MuiTextField-root .MuiIconButton-root': { padding: 0.5 },
      '&.MuiTextField-root .clearButton': { padding: 0.25, opacity: 0.5 },
    },
  },
});
