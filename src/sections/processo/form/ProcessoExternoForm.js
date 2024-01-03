import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// components
import {
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import { ObsNovosAnexos } from './Outros';
import AnexosExistentes from './AnexosExistentes';

// ----------------------------------------------------------------------

ProcessoExternoForm.propTypes = {
  operacao: PropTypes.string,
  setOperacao: PropTypes.func,
  origensList: PropTypes.array,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoExternoForm({ operacao, setOperacao, selectedProcesso, origensList }) {
  const { setValue } = useFormContext();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="referencia" label="Referência" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteSimple name="canal" label="Canal de entrada" options={['Email', 'Correspondência']} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteObject
                  name="origem_id"
                  label="Origem"
                  options={applySort(origensList, getComparator('asc', 'label'))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="titular" label="Titular" />
              </Grid>
              <Grid item xs={12} sm={operacao === 'Cativo/Penhora' ? 6 : 12} md={operacao === 'Cativo/Penhora' ? 3 : 6}>
                <RHFAutocompleteSimple
                  name="operacao"
                  label="Operação"
                  options={[
                    'Cativo/Penhora',
                    'Pedido de Informação',
                    'Cancelamento/Levantamento de Cativo/Penhora',
                    'Pedido de Extrato Bancário',
                    'Outras',
                  ]}
                  onChange={(event, newValue) => {
                    setValue('operacao', newValue);
                    setOperacao(newValue);
                  }}
                />
              </Grid>
              {operacao === 'Cativo/Penhora' && (
                <Grid item xs={12} sm={6} md={3}>
                  <RHFNumberField name="valor" tipo="moeda" label="Valor" />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <DadosCliente />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <ObsNovosAnexos />
              {hasAnexos && (
                <Grid item xs={12}>
                  <AnexosExistentes anexos={selectedProcesso.anexos} processoId={selectedProcesso.id} />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
