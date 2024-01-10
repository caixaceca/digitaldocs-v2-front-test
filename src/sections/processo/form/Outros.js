import { useFormContext } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
// hooks
import useAnexos from '../../../hooks/useAnexos';
// components
import { RHFTextField, RHFUploadMultiFile } from '../../../components/hook-form';

// ----------------------------------------------------------------------

export function ObsNovosAnexos() {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <>
      <Grid item xs={12}>
        <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
      </Grid>
      <Grid item xs={12}>
        <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
      </Grid>
    </>
  );
}
