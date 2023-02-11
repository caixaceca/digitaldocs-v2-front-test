import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, Card, TextField, MenuItem, CardContent, Typography } from '@mui/material';
// components
import { RHFTextField, RHFSwitch, RHFSelect } from '../../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import ObsNovosAnexos from './ObsNovosAnexos';
import AnexosExistentes from './AnexosExistentes';

// ----------------------------------------------------------------------

const periodicidades = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];

ProcessoInternoForm.propTypes = {
  assunto: PropTypes.string,
  setAgendado: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoInternoForm({ selectedProcesso, setAgendado, assunto }) {
  const { control, watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;

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
                      <RHFSelect name="periodicidade" label="Periodicidade" SelectProps={{ native: false }}>
                        {periodicidades.map((option) => (
                          <MenuItem
                            key={option}
                            value={option}
                            sx={{ minHeight: 30, mx: 1, my: 0.5, borderRadius: 0.75, typography: 'body2' }}
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </RHFSelect>
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
