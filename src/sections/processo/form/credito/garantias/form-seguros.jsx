import { useMemo } from 'react';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { seguroSchema } from './schemaFileds';
import { useSelector } from '../../../../../redux/store';
// components
import {
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../../components/hook-form';
import GridItem from '../../../../../components/GridItem';
import { SemDados } from '../../../../../components/Panel';
import { AddItem, DefaultAction } from '../../../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormSeguros({ prefixo, tipo = false }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: prefixo });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Seguro(s)</Typography>
        <AddItem onClick={() => append(seguroSchema)} dados={{ label: 'Seguro', small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={2}>
        <Seguros fields={fields} remove={remove} prefixo={prefixo} tipo={tipo} />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Seguros({ fields = [], remove, prefixo, tipo = false }) {
  const { tiposSeguros } = useSelector((state) => state.gaji9);
  const segurosList = useMemo(() => tiposSeguros.map((s) => ({ id: s?.id, label: s?.designacao })), [tiposSeguros]);

  return fields?.length ? (
    fields.map((item, index) => (
      <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Grid container spacing={2} justifyContent="center">
            {tipo && (
              <GridItem sm={12} md={4}>
                <RHFAutocompleteObj label="Tipo" name={`${prefixo}[${index}].tipo`} options={segurosList} />
              </GridItem>
            )}
            <GridItem sm={6} md={tipo ? 4 : 6}>
              <RHFAutocompleteSmp
                label="Seguradora"
                name={`${prefixo}[${index}].seguradora`}
                options={['Aliança Seguros', 'Garantia Seguros', 'Impar Seguros']}
              />
            </GridItem>
            <GridItem sm={6} md={tipo ? 4 : 6}>
              <RHFTextField name={`${prefixo}[${index}].apolice`} label="Apólice" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`${prefixo}[${index}].valor`} label="Valor" tipo="CVE" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`${prefixo}[${index}].premio`} label="Prémio" tipo="CVE" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField name={`${prefixo}[${index}].periodicidade`} label="Periodicidade" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`${prefixo}[${index}].cobertura`} label="Cobertura" tipo="%" />
            </GridItem>
          </Grid>
          <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
        </Stack>
      </Card>
    ))
  ) : (
    <SemDados message="Nenhum seguro adicionado..." sx={{ p: 1.5 }} />
  );
}
