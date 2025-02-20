import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
// components
import {
  RHFSwitch,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../components/hook-form';
//
import Outros from './Outros';
import DadosCliente from './DadosCliente';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoInternoForm.propTypes = { fluxo: PropTypes.object, processo: PropTypes.object };

export default function ProcessoInternoForm({ processo, fluxo }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const anexosAtivos = useMemo(() => processo?.anexos?.filter((row) => row?.ativo), [processo?.anexos]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <DadosCliente isInterno noperacao={processo?.noperacao} fluxo={fluxo} />
          </CardContent>
        </Card>
      </Grid>
      {(fluxo?.assunto === 'OPE DARH' || fluxo?.assunto === 'Transferência Internacional') && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <RHFSwitch name="agendado" label="Agendar" otherSx={{ mt: 0 }} />
                </Grid>
                {values.agendado && (
                  <>
                    <Grid item xs={6} md={3}>
                      <RHFAutocompleteSmp
                        name="periodicidade"
                        label="Periodicidade"
                        options={['Mensal', 'Trimestral', 'Semestral', 'Anual']}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <RHFNumberField name="diadomes" label="Dia do mês" />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <RHFDatePicker name="data_inicio" label="Data de início" />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <RHFDatePicker
                        label="Data de término"
                        name="data_arquivamento"
                        minDate={values.data_inicio}
                        disabled={!values.data_inicio}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
      {fluxo?.iscon && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={values?.titular_ordenador ? 6 : 4}>
                  <RHFSwitch
                    name="titular_ordenador"
                    onChange={(event, value) => {
                      setValue('is_cliente', value);
                      setValue('titular_ordenador', value);
                    }}
                    label="Depositante é o próprio titular"
                  />
                </Grid>
                {!values?.titular_ordenador && (
                  <Grid item xs={12} sm={4}>
                    <RHFSwitch name="is_cliente" label="Cliente da Caixa" />
                  </Grid>
                )}
                <Grid item xs={12} sm={values?.titular_ordenador ? 6 : 4}>
                  <RHFSwitch name="residente" label="Titular da conta beneficiária é residente" />
                </Grid>
                {values?.is_cliente && (
                  <Grid item xs={12}>
                    <Grid container spacing={3} justifyContent="center">
                      <Grid item xs={12} sm={6} xl={3}>
                        <RHFNumberField name="entidade_con" label="Nº da entidade" />
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                {!values?.titular_ordenador && !values?.is_cliente && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <RHFTextField name="ordenador" label="Nome" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFAutocompleteObj name="tipo_docid" label="Tipo doc. identificação" options={dis} />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="docid" label="Nº doc. identificação" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="nif" label="NIF" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFAutocompleteObj name="estado_civil" label="Estado civil" options={estadosCivis} />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFDatePicker name="data_nascimento" label="Data de nascimento" disableFuture />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="telefone" label="Telefone" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={3}>
                      <RHFTextField name="telemovel" label="Telemóvel" />
                    </Grid>
                    <Grid item xs={12} sm={6} xl={9}>
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
                      <RHFTextField name="local_pais_nascimento" label="Local/País de nascimento" />
                    </Grid>
                    <Grid item xs={12} xl={6}>
                      <RHFTextField name="morada" label="Morada" />
                    </Grid>
                  </>
                )}
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

      <Outros anexos={anexosAtivos} />
    </Grid>
  );
}
