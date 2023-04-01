import { useCallback } from 'react';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Grid } from '@mui/material';
// components
import { RHFTextField, RHFUploadMultiFile } from '../../../components/hook-form';
// utils

// ----------------------------------------------------------------------

export default function ObsNovosAnexos() {
  const { watch, setValue } = useFormContext();
  const values = watch();

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const anexos = values.anexos || [];
      setValue('anexos', [
        ...anexos,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    },
    [setValue, values.anexos]
  );

  const handleRemoveAll = () => {
    setValue('anexos', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.anexos && values.anexos?.filter((_file) => _file !== file);
    setValue('anexos', filteredItems);
  };

  return (
    <>
      <Grid item xs={12}>
        <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
      </Grid>
      <Grid item xs={12}>
        <RHFUploadMultiFile name="anexos" onDrop={handleDrop} onRemove={handleRemove} onRemoveAll={handleRemoveAll} />
      </Grid>
    </>
  );
}
