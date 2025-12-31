// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { tituloSchema } from './schemaFileds';
// components
import FormSeguros from './form-seguros';
import GridItem from '../../../../../components/GridItem';
import { SemDados } from '../../../../../components/Panel';
import { AddItem, DefaultAction } from '../../../../../components/Actions';
import { RHFTextField, RHFNumberField } from '../../../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormTitulos() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'titulos' });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Título(s)</Typography>
        <AddItem onClick={() => append(tituloSchema)} dados={{ label: 'Título', small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={3}>
        <Titulos fields={fields} remove={remove} />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Titulos({ fields = [], remove }) {
  return fields?.length ? (
    fields.map((item, index) => (
      <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <GridItem sm={4}>
              <RHFTextField name={`titulos[${index}].codigo`} label="Código" />
            </GridItem>
            <GridItem sm={4}>
              <RHFNumberField name={`titulos[${index}].numero_cliente`} label="Nº de cliente" noFormat />
            </GridItem>
            <GridItem sm={4}>
              <RHFNumberField name={`titulos[${index}].percentagem_cobertura`} label="Cobertura" tipo="%" />
            </GridItem>
            <GridItem children={<FormSeguros prefixo={`titulos[${index}].seguros`} tipo />} />
          </Grid>
          <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
        </Stack>
      </Card>
    ))
  ) : (
    <SemDados message="Nenhum título adicionado..." sx={{ p: 1.5 }} />
  );
}
