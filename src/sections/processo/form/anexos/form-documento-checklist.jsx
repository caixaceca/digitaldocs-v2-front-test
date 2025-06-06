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
import AnexosExistente from './anexos-existente';
import GridItem from '../../../../components/GridItem';
import { DefaultAction } from '../../../../components/Actions';
import { RHFDatePicker, RHFNumberField, RHFUploadFileSimple } from '../../../../components/hook-form';

// ----------------------------------------------------------------------

FormDocumentosChecklist.propTypes = { dados: PropTypes.object };

export default function FormDocumentosChecklist({ dados }) {
  const { control, setValue } = useFormContext();
  const { docIndex, row, anexos, solto } = dados;
  const { fields, append, remove } = useFieldArray({ control, name: `checklist.${docIndex}.anexos` });

  const handleDrop = useCallback(
    (name, acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) setValue(name, Object.assign(file, { preview: URL.createObjectURL(file) }));
    },
    [setValue]
  );

  return (
    <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ pb: 1 }}>
        <Typography sx={{ pl: 0.5, typography: 'overline' }}>{row?.designacao}</Typography>
        <DefaultAction
          small
          button
          variant="text"
          label="Adicionar"
          onClick={() => append({ file: null, data_emissao: null, data_validade: null, numero_entidade: null })}
        />
      </Stack>
      {fields?.length === 0 && anexos?.length === 0 ? (
        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}>
          <Typography variant="body2" sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}>
            Nenhum documento adicionado...
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {fields.map((item, index) => (
            <Stack key={item.id} spacing={1} direction="row" alignItems="center" justifyContent="center">
              <Box sx={{ width: 1 }}>
                <Grid container spacing={2}>
                  <GridItem md={(row?.obriga_prazo_validade && 6) || (row?.identificador && 3) || 12}>
                    <RHFUploadFileSimple
                      name={`checklist.${docIndex}.anexos.${index}.file`}
                      onDrop={(file) => handleDrop(`checklist.${docIndex}.anexos.${index}.file`, file)}
                    />
                  </GridItem>
                  {(row?.identificador || row?.obriga_prazo_validade) && (
                    <GridItem md={row?.obriga_prazo_validade ? 6 : 3}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {row?.identificador && (
                          <RHFNumberField
                            noFormat
                            label="Nº entidade"
                            name={`checklist.${docIndex}.anexos.${index}.numero_entidade`}
                          />
                        )}
                        {row?.obriga_prazo_validade && (
                          <>
                            <RHFDatePicker
                              disableFuture
                              label="Emissão"
                              name={`checklist.${docIndex}.anexos.${index}.data_emissao`}
                            />
                            <RHFDatePicker
                              disablePast
                              label="Validade"
                              name={`checklist.${docIndex}.anexos.${index}.data_validade`}
                            />
                          </>
                        )}
                      </Stack>
                    </GridItem>
                  )}
                </Grid>
              </Box>
              {(solto || !row?.obrigatorio || anexos?.length > 0 || (row?.obrigatorio && fields?.length > 1)) && (
                <DefaultAction label="ELIMINAR" small onClick={() => remove(index)} />
              )}
            </Stack>
          ))}
          {anexos?.length > 0 && (
            <AnexosExistente noTitle anexos={anexos?.map((row) => ({ ...row, name: row?.nome }))} />
          )}
        </Stack>
      )}
    </Card>
  );
}
