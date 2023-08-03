import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import { Grid, Card, CardContent } from '@mui/material';
// components
import {
  RHFSwitch,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSimple,
} from '../../../components/hook-form';
//
import DadosCliente from './DadosCliente';
import AnexosExistentes from './AnexosExistentes';
import { Pendencia, ObsNovosAnexos } from './Outros';
// _mock
import { dis } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoInternoForm.propTypes = {
  fluxo: PropTypes.object,
  setProprio: PropTypes.func,
  setAgendado: PropTypes.func,
  setPendente: PropTypes.func,
  selectedProcesso: PropTypes.object,
};

export default function ProcessoInternoForm({ selectedProcesso, setAgendado, setPendente, setProprio, fluxo }) {
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
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <RHFSwitch
                    name="proprio"
                    labelPlacement="start"
                    onChange={(event, value) => {
                      setValue('proprio', value);
                      setProprio(value);
                    }}
                    label="Depositante é o próprio beneficiário"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <RHFNumberField
                    name="valor"
                    label="Valor"
                    tipo="moeda"
                    inputProps={{ style: { textAlign: 'right' } }}
                  />
                </Grid>
                {!values.proprio && (
                  <>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFAutocompleteSimple
                        name="tipo_docid"
                        label="Documento de identificação"
                        options={dis?.map((row) => row?.label)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="doc_id" label="Nº do documento" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="nif" label="NIF" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="nacionalidade" label="Nacionalidade" />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFTextField name="estado_civil" label="Estado civil" />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFTextField name="profissao" label="Profissão" />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <RHFDatePicker name="data_nascimento" label="Data de nascimento" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="nome_mae" label="Nome do mãe" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="nome_pai" label="Nome da pai" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="morada" label="Morada" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="local_trabalho" label="Local de trabalho" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="contactos" label="Contato(s)" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="emails" label="Email(s)" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <RHFSwitch name="residente" labelPlacement="start" label="Residente" />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <RHFTextField name="local_pais_nascimento" label="Local e País de nascimento" />
                </Grid>
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
