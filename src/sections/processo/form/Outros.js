import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
// hooks
import useAnexos from '../../../hooks/useAnexos';
// components
import { AnexosExistente } from '../../../components/Actions';
import { RHFTextField, RHFUploadMultiFile } from '../../../components/hook-form';

// ----------------------------------------------------------------------

Outros.propTypes = { anexos: PropTypes.array };

export default function Outros({ anexos = [] }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
        </Grid>
        <Grid item xs={12}>
          <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
        </Grid>
        {anexos?.length > 0 && (
          <Grid item xs={12}>
            <AnexosExistente anexos={anexos?.map((row) => ({ ...row, name: row?.nome }))} mt={0} anexo />
          </Grid>
        )}
      </Grid>
    </Card>
  );
}
