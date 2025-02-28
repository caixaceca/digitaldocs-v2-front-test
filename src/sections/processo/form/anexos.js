import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
// hooks
import useAnexos from '../../../hooks/useAnexos';
// components
import { AnexosExistente } from '../../../components/Actions';
import { RHFUploadMultiFile } from '../../../components/hook-form';

// ----------------------------------------------------------------------

Anexos.propTypes = { outros: PropTypes.bool, checklist: PropTypes.array, anexos: PropTypes.array };

export default function Anexos({ outros, checklist = [], anexos = [] }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <Box sx={{ width: 1 }}>
      {anexos?.length > 0 && (
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <AnexosExistente anexos={anexos?.map((row) => ({ ...row, name: row?.nome }))} mt={0} anexo />
        </Card>
      )}
      {checklist?.length > 0 && (
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Typography variant="overline">Checklist</Typography>
          {/* <RHFUploadMultiFile small name="anexos" onDrop={dropMultiple} onRemove={removeOne} /> */}
        </Card>
      )}
      {outros && (
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Typography sx={{ pb: 0.5, pl: 0.5, typography: 'overline' }}>Outros anexos</Typography>
          <RHFUploadMultiFile small name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
        </Card>
      )}
    </Box>
  );
}
