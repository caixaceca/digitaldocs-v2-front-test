import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Card, TextField, Typography, CardContent, Autocomplete, InputAdornment } from '@mui/material';
// hooks
import { getComparator, applySort } from '../../../hooks/useTable';
// redux
import { useSelector } from '../../../redux/store';
// components
import { RHFTextField, RHFSwitch } from '../../../components/hook-form';
//
import ObsNovosAnexos from './ObsNovosAnexos';
import AnexosExistentes from './AnexosExistentes';
// _mock
import { segmentos, escaloes, situacoes } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoCreditoForm.propTypes = {
  isEdit: PropTypes.bool,
  setPendente: PropTypes.func,
  setAprovado: PropTypes.func,
  setContratado: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoCreditoForm({ isEdit, setPendente, setAprovado, setContratado, selectedProcesso }) {
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;
  const { linhas, motivosPendencias } = useSelector((state) => state.digitaldocs);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  control={control}
                  name="data_entrada"
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      disableFuture
                      value={field.value}
                      label="Data de entrada"
                      onChange={(newValue) => field.onChange(newValue)}
                      slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField
                  name="montante_solicitado"
                  label="Montante solicitado"
                  placeholder="0.00"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">CVE</InputAdornment>,
                    inputProps: { max: 999999999999999 },
                    type: 'number',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="segmento"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      onChange={(event, newValue) => field.onChange(newValue)}
                      options={segmentos}
                      renderInput={(params) => (
                        <TextField {...params} label="Segmento" error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name="linha_id"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      options={linhas}
                      getOptionLabel={(option) => option?.linha}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      renderInput={(params) => (
                        <TextField {...params} label="Linha de crédito" error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="titular" label="Proponente" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField name="cliente" label="Nº de cliente" InputProps={{ type: 'number' }} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <RHFTextField name="numero_proposta" label="Nº de proposta" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFTextField name="setor_atividade" label="Setor de atividade" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFTextField name="finalidade" label="Finalidade" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="situacao_final_mes"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      onChange={(event, newValue) => field.onChange(newValue)}
                      options={situacoes}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Situação final do mês"
                          error={!!error}
                          helperText={error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {isEdit && (
        <>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={3} justifyContent="center">
                  <Grid item xs={12}>
                    <RHFSwitch
                      name="aprovado"
                      labelPlacement="start"
                      onChange={(event, value) => {
                        setValue('aprovado', value);
                        setAprovado(value);
                      }}
                      label={
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          Aprovado
                        </Typography>
                      }
                      sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
                    />
                  </Grid>
                  {values.aprovado && (
                    <>
                      <Grid item xs={12} sm={6} md={3}>
                        <Controller
                          control={control}
                          name="data_aprovacao"
                          render={({ field, fieldState: { error } }) => (
                            <DatePicker
                              disableFuture
                              value={field.value}
                              label="Data de aprovação"
                              onChange={(newValue) => field.onChange(newValue)}
                              slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <RHFTextField
                          name="montante_aprovado"
                          label="Montante aprovado"
                          placeholder="0.00"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">CVE</InputAdornment>,
                            inputProps: { max: 999999999999999 },
                            type: 'number',
                          }}
                        />
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
                  <Grid item xs={12}>
                    <RHFSwitch
                      name="contratado"
                      labelPlacement="start"
                      onChange={(event, value) => {
                        setValue('contratado', value);
                        setContratado(value);
                      }}
                      label={
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          Contratado
                        </Typography>
                      }
                      sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
                    />
                  </Grid>
                  {values.contratado && (
                    <>
                      <Grid item xs={12} sm={6} md={3}>
                        <Controller
                          control={control}
                          name="data_contratacao"
                          render={({ field, fieldState: { error } }) => (
                            <DatePicker
                              disableFuture
                              value={field.value}
                              label="Data de contratação"
                              onChange={(newValue) => field.onChange(newValue)}
                              slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <RHFTextField
                          name="montante_contratado"
                          label="Montante contratado"
                          placeholder="0.00"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">CVE</InputAdornment>,
                            inputProps: { max: 999999999999999 },
                            type: 'number',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <RHFTextField name="prazo_amortizacao" label="Prazo de amortização" />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <RHFTextField
                          name="taxa_juro"
                          label="Taxa de juro"
                          placeholder="0.00"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            type: 'number',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Controller
                          name="escalao_decisao"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Autocomplete
                              {...field}
                              fullWidth
                              onChange={(event, newValue) => field.onChange(newValue)}
                              options={escaloes}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Escalão de decisão"
                                  error={!!error}
                                  helperText={error?.message}
                                />
                              )}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <RHFTextField name="garantia" label="Garantia" />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
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
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
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
                          getOptionLabel={(option) => option?.motivo}
                          onChange={(event, newValue) => field.onChange(newValue)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          options={applySort(motivosPendencias, getComparator('asc', 'motivo'))}
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
