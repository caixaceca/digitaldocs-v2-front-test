// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// components
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { AddItem, DefaultAction } from '@/components/Actions';
import { RHFTextField, RHFNumberField } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormContas() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'contas' });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">Conta(s) DP</Typography>
        <AddItem
          dados={{ label: 'Conta', small: true }}
          onClick={() => append({ numero_conta: '', percentagem_cobertura: '' })}
        />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={2} justifyContent="center">
        <Contas fields={fields} remove={remove} />
      </Grid>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Contas({ fields = [], remove }) {
  return fields?.length ? (
    fields.map((item, index) => (
      <GridItem md={6} key={item.id}>
        <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
              <RHFTextField label="Nº de conta" name={`contas[${index}].numero_conta`} />
              <RHFNumberField
                tipo="%"
                label="Cobertura"
                sx={{ maxWidth: 130 }}
                name={`contas[${index}].percentagem_cobertura`}
              />
            </Stack>
            <DefaultAction small label="Eliminar" icon="Remover" onClick={() => remove(index)} />
          </Stack>
        </Card>
      </GridItem>
    ))
  ) : (
    <GridItem children={<SemDados message="Nenhuma conta adicionada..." sx={{ p: 1.5 }} />} />
  );
}
