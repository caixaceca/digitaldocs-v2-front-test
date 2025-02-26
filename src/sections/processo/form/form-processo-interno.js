import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { useFormContext } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
// components
import {
  RHFSwitch,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../components/hook-form';
import GridItem from '../../../components/GridItem';
//
import Outros from './outros';
import DadosCliente from './dados-cliente';
// _mock
import { dis, estadosCivis } from '../../../_mock';

// ----------------------------------------------------------------------

ProcessoInternoForm.propTypes = { fluxo: PropTypes.object, processo: PropTypes.object };

export default function ProcessoInternoForm({ processo, fluxo }) {
  const { watch, setValue } = useFormContext();
  const values = watch();
  const anexosAtivos = useMemo(() => processo?.anexos?.filter((row) => row?.ativo), [processo?.anexos]);

  return (
    <Box sx={{ width: 1 }}>
      <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
        <DadosCliente isInterno noperacao={processo?.noperacao} fluxo={fluxo} />
      </Card>
      {(fluxo?.assunto === 'OPE DARH' || fluxo?.assunto === 'Transferência Internacional') && (
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3}>
            <GridItem children={<RHFSwitch name="agendado" label="Agendar" otherSx={{ mt: 0 }} />} />
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
        </Card>
      )}
      {fluxo?.iscon && (
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <Grid container spacing={3} justifyContent="center">
            <GridItem sm={values?.titular_ordenador ? 6 : 4}>
              <RHFSwitch
                name="titular_ordenador"
                onChange={(event, value) => {
                  setValue('is_cliente', value);
                  setValue('titular_ordenador', value);
                }}
                label="Depositante é o próprio titular"
              />
            </GridItem>
            {!values?.titular_ordenador && (
              <GridItem sm={4} children={<RHFSwitch name="is_cliente" label="Cliente da Caixa" />} />
            )}
            <GridItem sm={values?.titular_ordenador ? 6 : 4}>
              <RHFSwitch name="residente" label="Beneficiária residente" />
            </GridItem>
            {values?.is_cliente && (
              <GridItem>
                <Grid container spacing={3} justifyContent="center">
                  <GridItem sm={6} xl={3}>
                    <RHFNumberField name="entidade_con" label="Nº da entidade" />
                  </GridItem>
                </Grid>
              </GridItem>
            )}
            {!values?.titular_ordenador && !values?.is_cliente && (
              <>
                <GridItem sm={6} children={<RHFTextField name="ordenador" label="Nome" />} />
                <GridItem sm={6} xl={3}>
                  <RHFAutocompleteObj name="tipo_docid" label="Tipo doc. identificação" options={dis} />
                </GridItem>
                <GridItem sm={6} xl={3} children={<RHFTextField name="docid" label="Nº doc. identificação" />} />
                <GridItem sm={6} xl={3} children={<RHFTextField name="nif" label="NIF" />} />
                <GridItem sm={6} xl={3}>
                  <RHFAutocompleteObj name="estado_civil" label="Estado civil" options={estadosCivis} />
                </GridItem>
                <GridItem sm={6} xl={3}>
                  <RHFDatePicker name="data_nascimento" label="Data de nascimento" disableFuture />
                </GridItem>
                <GridItem sm={6} xl={3} children={<RHFTextField name="telefone" label="Telefone" />} />
                <GridItem sm={6} xl={3} children={<RHFTextField name="telemovel" label="Telemóvel" />} />
                <GridItem sm={6} xl={9} children={<RHFTextField name="emails" label="Email(s)" />} />
                <GridItem sm={6} children={<RHFTextField name="pai" label="Nome do Pai" />} />
                <GridItem sm={6} children={<RHFTextField name="mae" label="Nome da Mãe" />} />
                <GridItem sm={6} xl={3} children={<RHFTextField name="nacionalidade" label="Nacionalidade" />} />
                <GridItem xl={3}>
                  <RHFTextField name="local_pais_nascimento" label="Local/País de nascimento" />
                </GridItem>
                <GridItem xl={6} children={<RHFTextField name="morada" label="Morada" />} />
              </>
            )}
            <GridItem sm={6} children={<RHFTextField name="profissao" label="Profissão" />} />
            <GridItem sm={6} children={<RHFTextField name="local_trabalho" label="Local de trabalho" />} />
            <GridItem>
              <RHFTextField name="origem_fundo" label="Origem do fundo" multiline minRows={2} maxRows={4} />
            </GridItem>
            <GridItem>
              <RHFTextField name="finalidade_fundo" label="Finalidade do fundo" multiline minRows={2} maxRows={4} />
            </GridItem>
          </Grid>
        </Card>
      )}

      <Outros anexos={anexosAtivos} />
    </Box>
  );
}
