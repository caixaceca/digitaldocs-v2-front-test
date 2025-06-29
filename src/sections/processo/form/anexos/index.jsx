import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import useAnexos from '../../../../hooks/useAnexos';
// components
import AnexosExistente from './anexos-existente';
import FormDocumentosChecklist from './form-documento-checklist';
import { RHFUploadMultiFile } from '../../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function Anexos({ outros, anexos, solto = false }) {
  const { watch, control, setValue } = useFormContext();
  const values = watch();
  const { fields } = useFieldArray({ control, name: 'checklist' });
  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);
  const outrosExistente = anexos?.filter(({ tipo_id: id, tipo }) => !id || tipo === 'OUTROS');

  return (
    <Stack spacing={3} sx={{ width: 1 }}>
      {fields?.length === 0 && !outros ? (
        <Card sx={{ p: 3, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}>
            Este fluxo não possui Checklist...
          </Typography>
        </Card>
      ) : (
        <>
          {fields?.map((row, docIndex) => (
            <FormDocumentosChecklist
              key={row?.id}
              dados={{
                row,
                solto,
                docIndex,
                anexos: anexos.filter(({ ativo, tipo_id: tid }) => ativo && tid === row?.tipo_id),
              }}
            />
          ))}

          {outros && (
            <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
              <Typography sx={{ pb: 0.5, pl: 0.5, typography: 'overline' }}>Anexos</Typography>
              <RHFUploadMultiFile small name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
              {outrosExistente?.length > 0 && (
                <AnexosExistente noTitle anexos={outrosExistente?.map((row) => ({ ...row, name: row?.nome }))} />
              )}
            </Card>
          )}
        </>
      )}
    </Stack>
  );
}
