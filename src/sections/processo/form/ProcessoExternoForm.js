import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Grid, Card, TextField, CardContent, Typography, Autocomplete, InputAdornment } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import {
  RHFSwitch,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import ObsNovosAnexos from './ObsNovosAnexos';
import AnexosExistentes from './AnexosExistentes';

// ----------------------------------------------------------------------

const operacoes = [
  'Cativo/Penhora',
  'Pedido de Informação',
  'Pedido de Levantamento de Cativo/Penhora',
  'Pedido de Extrato Bancário',
  'Outras',
];

// ----------------------------------------------------------------------

ProcessoExternoForm.propTypes = {
  operacao: PropTypes.string,
  setOperacao: PropTypes.func,
  setPendente: PropTypes.func,
  origensList: PropTypes.array,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoExternoForm({ operacao, setOperacao, setPendente, selectedProcesso, origensList }) {
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;
  const { motivosPendencias } = useSelector((state) => state.digitaldocs);

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
                <Controller
                  name="operacao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      onChange={(event, value) => {
                        setValue('operacao', value);
                        setOperacao(value);
                      }}
                      options={operacoes}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField {...params} label="Operação" error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              {operacao === 'Cativo/Penhora' && (
                <Grid item xs={12} sm={6} md={3}>
                  <RHFTextField
                    name="valor"
                    label="Valor"
                    placeholder="0.00"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">CVE</InputAdornment>,
                      inputProps: { max: 999999999999999 },
                      type: 'number',
                    }}
                  />
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
              <Grid item xs={12}>
                <RHFSwitch
                  name="ispendente"
                  labelPlacement="start"
                  onChange={(event, value) => {
                    setValue('ispendente', value);
                    setPendente(value);
                  }}
                  label={
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                      Pendente
                    </Typography>
                  }
                  sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
                />
              </Grid>
              {values.ispendente && (
                <>
                  <Grid item xs={12} sm={4}>
                    <RHFAutocompleteObject
                      name="mpendencia"
                      label="Motivo"
                      options={applySort(
                        motivosPendencias?.map((row) => ({ id: row?.id, label: row?.motivo })),
                        getComparator('asc', 'label')
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <RHFTextField name="mobs" label="Observação" />
                  </Grid>
                </>
              )}
            </Grid>
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
