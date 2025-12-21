// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// components
import FormSeguros from './form-seguros';
import FormEntidades from './form-entidades';
import GridItem from '../../../../../components/GridItem';
import { SemDados } from '../../../../../components/Panel';
import { AddItem, DefaultAction } from '../../../../../components/Actions';
import { RHFTextField, RHFNumberField } from '../../../../../components/hook-form';
//
import { veiculoSchema } from './schemaFileds';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormVeiculos() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'veiculos' });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Veículo(s)</Typography>
        <AddItem onClick={() => append(veiculoSchema)} dados={{ label: 'Veículo', small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack spacing={3}>
        <Veiculos fields={fields} remove={remove} />
      </Stack>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Veiculos({ fields = [], remove }) {
  return fields?.length ? (
    fields.map((item, index) => (
      <Card key={item.id} sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Grid container spacing={2} justifyContent="center">
            <GridItem sm={6} md={3}>
              <RHFTextField name={`veiculos[${index}].marca`} label="Marca" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField name={`veiculos[${index}].modelo`} label="Modelo" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField name={`veiculos[${index}].matricula`} label="Matrícula" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField name={`veiculos[${index}].nura`} label="NURA" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`veiculos[${index}].ano_fabrico`} label="Ano de fabricação" noFormat />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`veiculos[${index}].valor`} label="Valor" tipo="CVE" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`veiculos[${index}].pvt`} label="Valor PVT" tipo="CVE" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField name={`veiculos[${index}].cobertura`} label="Cobertura" tipo="%" />
            </GridItem>
            <GridItem children={<FormEntidades label="Dono" name={`veiculos[${index}].donos`} />} />
            <GridItem children={<FormSeguros prefixo={`veiculos[${index}].seguros`} tipo />} />
          </Grid>
          <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
        </Stack>
      </Card>
    ))
  ) : (
    <SemDados message="Nenhum veículo adicionado..." sx={{ p: 1.5 }} />
  );
}
