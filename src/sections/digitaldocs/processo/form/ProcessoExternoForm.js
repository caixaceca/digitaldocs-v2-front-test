import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Card, TextField, CardContent, Typography, Autocomplete, InputAdornment } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../../../hooks/useTable';
// redux
import { useSelector } from '../../../../redux/store';
// components
import { RHFTextField, RHFSwitch } from '../../../../components/hook-form';
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
  setPendente: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoExternoForm({ operacao, setOperacao, setPendente, selectedProcesso }) {
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;
  const { origens, motivosPendencias } = useSelector((state) => state.digitaldocs);
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
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
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
                    <Controller
                      name="mpendencia"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <Autocomplete
                          {...field}
                          fullWidth
                          onChange={(event, newValue) => field.onChange(newValue)}
                          options={applySort(motivosPendencias, getComparator('asc', 'motivo'))?.map(
                            (option) => option
                          )}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          getOptionLabel={(option) => option?.motivo}
                          renderInput={(params) => (
                            <TextField {...params} label="Motivo" error={!!error} helperText={error?.message} />
                          )}
                        />
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
