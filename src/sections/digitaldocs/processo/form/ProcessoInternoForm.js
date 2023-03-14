import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Card, TextField, CardContent, Typography, Autocomplete } from '@mui/material';
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

const periodicidades = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];

ProcessoInternoForm.propTypes = {
  assunto: PropTypes.string,
  setAgendado: PropTypes.func,
  setPendente: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoInternoForm({ selectedProcesso, setAgendado, setPendente, assunto }) {
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;
  const { motivosPendencias } = useSelector((state) => state.digitaldocs);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <DadosCliente isInterno assunto={assunto} />
          </CardContent>
        </Card>
      </Grid>
      {(assunto === 'OPE DARH' || assunto === 'Ordem de Pagamento Emitido') && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <RHFSwitch
                    name="agendado"
                    labelPlacement="start"
                    onChange={(event, value) => {
                      setValue('agendado', value);
                      setAgendado(value);
                    }}
                    label={
                      <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Agendar
                      </Typography>
                    }
                    sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
                  />
                </Grid>
                {values.agendado && (
                  <>
                    <Grid item xs={12} sm={6} xl={3}>
                      <Controller
                        name="periodicidade"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Autocomplete
                            {...field}
                            fullWidth
                            onChange={(event, newValue) => field.onChange(newValue)}
                            options={periodicidades?.map((option) => option)}
                            getOptionLabel={(option) => option}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Periodicidade"
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="diadomes" label="Dia do mês" InputProps={{ type: 'number' }} />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <Controller
                        name="data_inicio"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            label="Data de início"
                            value={field.value}
                            onChange={(newValue) => {
                              field.onChange(newValue);
                            }}
                            renderInput={(params) => (
                              <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <Controller
                        name="data_arquivamento"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DatePicker
                            label="Data de término"
                            value={field.value}
                            onChange={(newValue) => {
                              field.onChange(newValue);
                            }}
                            renderInput={(params) => (
                              <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                            )}
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
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
