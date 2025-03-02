import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import { DefaultAction } from '../../../../components/Actions';
import { RHFDatePicker, RHFNumberField, RHFUploadFileSimple } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

FormDocumentosChecklist.propTypes = { docIndex: PropTypes.number, dados: PropTypes.object };

export default function FormDocumentosChecklist({ docIndex, dados }) {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `checklist.${docIndex}.anexos` });

  const handleDrop = useCallback(
    (name, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) setValue(name, Object.assign(file, { preview: URL.createObjectURL(file) }));
    },
    [setValue]
  );

  return (
    <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ pb: 1 }}>
        <Typography sx={{ pl: 0.5, typography: 'overline' }}>{dados?.designacao}</Typography>
        <DefaultAction
          small
          button
          label="Adicionar"
          handleClick={() => append({ file: null, data_emissao: null, data_validade: null, numero_entidade: '' })}
        />
      </Stack>
      {fields?.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ textAlign: 'center', fontStyle: 'italic', p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
        >
          Sem nenhum documento...
        </Typography>
      ) : (
        <Stack spacing={2}>
          {fields.map((item, index) => (
            <Stack key={item.id} spacing={1} direction="row" alignItems="center" justifyContent="center">
              <Box sx={{ width: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <RHFUploadFileSimple
                      name={`checklist.${docIndex}.anexos.${index}.file`}
                      onDrop={(file) => handleDrop(`checklist.${docIndex}.anexos.${index}.file`, file)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <RHFNumberField
                        label="Nº entidade"
                        name={`checklist.${docIndex}.anexos.${index}.numero_entidade`}
                      />
                      <RHFDatePicker
                        disablePast
                        label="Emissão"
                        name={`checklist.${docIndex}.anexos.${index}.data_emissao`}
                      />
                      <RHFDatePicker
                        disablePast
                        label="Validade"
                        name={`checklist.${docIndex}.anexos.${index}.data_validade`}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              <DefaultAction
                label="ELIMINAR"
                small
                handleClick={() => remove(index)}
                disabled={dados?.obrigatorio && fields?.length < 2}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}
