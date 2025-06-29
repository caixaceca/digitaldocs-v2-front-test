// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import FormHelperText from '@mui/material/FormHelperText';
// type
import { UploadMultiFile, UploadSingleFile, UploadSingleFileSimple } from '../upload';

// ---------------------------------------------------------------------------------------------------------------------

export function RHFUploadSingleFile({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;

        return (
          <UploadSingleFile
            file={field.value}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RHFUploadMultiFile({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && field.value?.length === 0;

        return (
          <UploadMultiFile
            files={field.value}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error?.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RHFUploadFileSimple({ name, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;

        return (
          <UploadSingleFileSimple
            file={field.value}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 0.5 }}>
                  {error.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
}
