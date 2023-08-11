import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Grid, Card, CardContent } from '@mui/material';
// components
import { RHFSwitch, RHFTextField, RHFDatePicker, RHFAutocompleteSimple } from '../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import AnexosExistentes from './AnexosExistentes';
import { Pendencia, ObsNovosAnexos } from './Outros';

// ----------------------------------------------------------------------

ProcessoInternoForm.propTypes = {
  fluxo: PropTypes.object,
  setAgendado: PropTypes.func,
  setPendente: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoInternoForm({ selectedProcesso, setAgendado, setPendente, fluxo }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const hasAnexos = selectedProcesso?.anexos?.length > 0;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <DadosCliente isInterno noperacao={selectedProcesso?.noperacao} fluxo={fluxo} />
          </CardContent>
        </Card>
      </Grid>
      {(fluxo?.assunto === 'OPE DARH' || fluxo?.assunto === 'Transferência Internacional') && (
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
                    label="Agendar"
                  />
                </Grid>
                {values.agendado && (
                  <>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFAutocompleteSimple
                        name="periodicidade"
                        label="Periodicidade"
                        options={['Mensal', 'Trimestral', 'Semestral', 'Anual']}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="diadomes" label="Dia do mês" InputProps={{ type: 'number' }} />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFDatePicker name="data_inicio" label="Data de início" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFDatePicker name="data_arquivamento" label="Data de término" />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
      {fluxo?.is_con && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6}>
                  <RHFSwitch name="titular_ordenador" labelPlacement="start" label="Depositante é o próprio titular" />
                </Grid>
                {!values?.titular_ordenador && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <RHFSwitch name="residente" labelPlacement="start" label="Residente" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="profissao" label="Profissão" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="local_trabalho" label="Local de trabalho" />
                    </Grid>
                    <Grid item xs={12} xl={6}>
                      <RHFTextField name="morada" label="Morada" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="telefone" label="Telefone" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="telemovel" label="Telemóvel" />
                    </Grid>
                    <Grid item xs={12} xl={6}>
                      <RHFTextField name="emails" label="Email(s)" />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Pendencia setPendente={setPendente} />

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
