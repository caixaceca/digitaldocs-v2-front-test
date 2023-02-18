import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Card, TextField, CardContent, Autocomplete, InputAdornment } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../../../hooks/useTable';
// redux
import { useSelector } from '../../../../redux/store';
// components
import { RHFTextField } from '../../../../components/hook-form';
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

const canais = ['Email', 'Correspondência'];

// ----------------------------------------------------------------------

ProcessoExternoForm.propTypes = {
  operacao: PropTypes.string,
  setOperacao: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoExternoForm({ operacao, setOperacao, selectedProcesso }) {
  const { control, setValue } = useFormContext();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;
  const { origens } = useSelector((state) => state.digitaldocs);
  const origensList = origens.map((row) => ({ id: row?.id, label: `${row?.designacao} - ${row?.seguimento}` }));

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
                <Controller
                  control={control}
                  name="data_entrada"
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      disableFuture
                      value={field.value}
                      label="Data de entrada"
                      onChange={(newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="canal"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      onChange={(event, newValue) => field.onChange(newValue)}
                      options={canais.map((option) => option)}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField {...params} label="Canal de entrada" error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="origem_id"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      onChange={(event, newValue) => field.onChange(newValue)}
                      options={applySort(origensList, getComparator('asc', 'label'))?.map((option) => option)}
                      getOptionLabel={(option) => option?.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Origem" error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
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
                      options={operacoes.map((option) => option)}
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
