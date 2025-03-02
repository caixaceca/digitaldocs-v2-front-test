import PropTypes from 'prop-types';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
// hooks
import useAnexos from '../../../../hooks/useAnexos';
// components
import AnexosExistente from './anexos-existente';
import FormDocumentosChecklist from './form-documento-checklist';
import { RHFUploadMultiFile } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

Anexos.propTypes = { outros: PropTypes.bool, anexos: PropTypes.array };

export default function Anexos({ outros, anexos }) {
  const { watch, control, setValue } = useFormContext();
  const values = watch();
  const { fields } = useFieldArray({ control, name: 'checklist' });
  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <Box sx={{ width: 1 }}>
      {anexos?.length > 0 && (
        <Card sx={{ p: 1, mt: 3, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <AnexosExistente anexos={anexos?.map((row) => ({ ...row, name: row?.nome }))} />
        </Card>
      )}
      {fields?.length === 0 && !outros ? (
        <Card sx={{ p: 5, mt: 3, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic' }}>
            Este fluxo não possui Checklist...
          </Typography>
        </Card>
      ) : (
        <>
          {fields?.map((row, docIndex) => (
            <FormDocumentosChecklist key={row?.id} dados={row} docIndex={docIndex} />
          ))}

          {outros && (
            <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
              <Typography sx={{ pb: 0.5, pl: 0.5, typography: 'overline' }}>Outros anexos</Typography>
              <RHFUploadMultiFile small name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
