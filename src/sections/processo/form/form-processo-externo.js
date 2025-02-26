import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
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
//
import Outros from './outros';
import DadosCliente from './dados-cliente';

// ----------------------------------------------------------------------

ProcessoExternoForm.propTypes = { origensList: PropTypes.array, processo: PropTypes.object };

export default function ProcessoExternoForm({ processo, origensList }) {
  const { watch } = useFormContext();
  const values = watch();
  const anexosAtivos = useMemo(() => processo?.anexos?.filter((row) => row?.ativo), [processo?.anexos]);

  return (
    <Box sx={{ width: 1 }}>
      <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <RHFTextField name="referencia" label="Referência" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFAutocompleteSmp name="canal" label="Canal de entrada" options={['Email', 'Correspondência']} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <RHFAutocompleteObj
              label="Origem"
              name="origem_id"
              options={applySort(origensList, getComparator('asc', 'label'))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RHFTextField name="titular" label="Titular" />
          </Grid>
          <Grid
            item
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
          </Grid>
          {values.operacao === 'Cativo/Penhora' && (
            <Grid item xs={12} sm={6} md={3}>
              <RHFNumberField name="valor" tipo="moeda" label="Valor" />
            </Grid>
          )}
        </Grid>
      </Card>

      <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <DadosCliente />
      </Card>

      <Outros anexos={anexosAtivos} />
    </Box>
  );
}
