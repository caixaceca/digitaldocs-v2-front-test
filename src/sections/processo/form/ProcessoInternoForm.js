import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Grid, Card, CardContent } from '@mui/material';
// components
import { RHFSwitch, RHFTextField, RHFDatePicker, RHFAutocompleteSimple } from '../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import { ObsNovosAnexos } from './Outros';
import AnexosExistentes from './AnexosExistentes';
// _mock
import { tiposDoc, estadosCivil } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoInternoForm.propTypes = {
  fluxo: PropTypes.object,
  setTitular: PropTypes.func,
  setAgendado: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoInternoForm({ selectedProcesso, setAgendado, setTitular, fluxo }) {
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
                  <RHFSwitch
                    name="titular_ordenador"
                    onChange={(event, value) => {
                      setValue('titular_ordenador', value);
                      setTitular(value);
                    }}
                    label="Depositante é o próprio titular"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFSwitch name="residente" label="Titular da conta beneficiária é residente" />
                </Grid>
                {!values?.titular_ordenador && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="ordenador" label="Nome" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFAutocompleteSimple name="tipo_docid" label="Tipo doc. identificação" options={tiposDoc} />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="docid" label="Nº do doc. identificação" />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFAutocompleteSimple name="estado_civil" label="Estado civil" options={estadosCivil} />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFDatePicker name="data_nascimento" label="Data de nascimento" />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFTextField name="telefone" label="Telefone" />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFTextField name="telemovel" label="Telemóvel" />
                </Grid>
                {!values?.titular_ordenador && (
                  <Grid item xs={12} sm={6} xl={3}>
                    <RHFTextField name="nif" label="NIF" />
                  </Grid>
                )}
                <Grid item xs={12} sm={values?.titular_ordenador ? 12 : 6} xl={values?.titular_ordenador ? 12 : 9}>
                  <RHFTextField name="emails" label="Email(s)" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="pai" label="Nome do Pai" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="mae" label="Nome da Mãe" />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFTextField name="nacionalidade" label="Nacionalidade" />
                </Grid>
                <Grid item xs={12} xl={3}>
                  <RHFTextField name="local_pais_nascimento" label="Local e País de nascimento" />
                </Grid>
                <Grid item xs={12} xl={6}>
                  <RHFTextField name="morada" label="Morada" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="profissao" label="Profissão" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="local_trabalho" label="Local de trabalho" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="origem_fundo" label="Origem do fundo" multiline minRows={2} maxRows={4} />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="finalidade_fundo" label="Finalidade do fundo" multiline minRows={2} maxRows={4} />
                </Grid>
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
