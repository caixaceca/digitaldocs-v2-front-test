// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// components
import GridItem from '../../../../../components/GridItem';
import { SemDados } from '../../../../../components/Panel';
import { RHFTextField } from '../../../../../components/hook-form';
import { AddItem, DeleteBox } from '../../../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormEntidades({ label, name }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Stack sx={{ flexGrow: 1, pt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="overline">{label}(s)</Typography>
        <AddItem onClick={() => append({ numero: '' })} dados={{ label, small: true }} />
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={2} justifyContent="center">
        <Entidades fields={fields} remove={remove} prefixo={name} />
      </Grid>
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Entidades({ fields = [], remove, prefixo }) {
  return fields.length ? (
    fields.map((item, index) => (
      <GridItem sm={6} md={4} lg={3} key={item.id}>
        <RHFTextField
          label="Nº de entidade"
          name={`${prefixo}[${index}].numero`}
          InputProps={{
            type: 'number',
            endAdornment: (
              <InputAdornment position="end">
                <DeleteBox onClick={() => remove(index)} />
              </InputAdornment>
            ),
          }}
        />
      </GridItem>
    ))
  ) : (
    <GridItem children={<SemDados message="Nenhuma entidade adicionada..." sx={{ p: 1.5 }} />} />
  );
}
