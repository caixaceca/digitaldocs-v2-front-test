import PropTypes from 'prop-types';
// form
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// components
import {
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../components/hook-form';
import { Entidades } from './dados-cliente';
import GridItem from '../../../components/GridItem';

// ----------------------------------------------------------------------

ProcessoExternoForm.propTypes = { origensList: PropTypes.array };

export default function ProcessoExternoForm({ origensList }) {
  const { watch, control } = useFormContext();
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'entidades' });

  return (
    <Box sx={{ width: 1 }}>
      <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={3}>
          <GridItem xs={12} sm={6} children={<RHFTextField name="referencia" label="Referência" />} />
          <GridItem xs={12} sm={6}>
            <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
          </GridItem>
          <GridItem xs={12} sm={6}>
            <RHFAutocompleteSmp name="canal" label="Canal de entrada" options={['Email', 'Correspondência']} />
          </GridItem>
          <GridItem xs={12} sm={6}>
            <RHFAutocompleteObj
              label="Origem"
              name="origem_id"
              options={applySort(origensList, getComparator('asc', 'label'))}
            />
          </GridItem>
          <GridItem xs={12} md={6} children={<RHFTextField name="titular" label="Titular" />} />
          <GridItem
            xs={12}
            sm={values.operacao === 'Cativo/Penhora' ? 6 : 12}
            md={values.operacao === 'Cativo/Penhora' ? 3 : 6}
          >
            <RHFAutocompleteSmp
              name="operacao"
              label="Operação"
              options={[
                'Cativo/Penhora',
                'Pedido de Informação',
                'Cancelamento/Levantamento de Cativo/Penhora',
                'Pedido de Extrato Bancário',
                'Outras',
              ]}
            />
          </GridItem>
          {values.operacao === 'Cativo/Penhora' && (
            <GridItem xs={12} sm={6} md={3} children={<RHFNumberField name="valor" tipo="moeda" label="Valor" />} />
          )}
        </Grid>
      </Card>

      <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={3}>
          <GridItem xs={12} sm={6} lg={3} children={<RHFTextField name="docidp" label="Nº de identificação 1" />} />
          <GridItem xs={12} sm={6} lg={3} children={<RHFTextField name="docids" label="Nº de identificação 2" />} />
          <GridItem xs={12} sm={6} lg={3} children={<RHFNumberField name="cliente" label="Nº de cliente" />} />
          <GridItem xs={12} sm={6} lg={3} children={<RHFNumberField name="conta" label="Nº de conta" />} />
          <Entidades fields={fields} append={append} remove={remove} />
        </Grid>
      </Card>

      <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
      </Card>
    </Box>
  );
}
