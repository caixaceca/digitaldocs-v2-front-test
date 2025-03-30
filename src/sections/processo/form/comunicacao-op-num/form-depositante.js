import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
// utils
import { fillData } from '../../../../utils/formatTime';
import { shapeText, shapeDate, shapeNumber, shapeMixed } from '../../../../components/hook-form/yup-shape';
// redux
import { updateDados } from '../../../../redux/slices/stepper';
import { useSelector, useDispatch } from '../../../../redux/store';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
// _mock
import { dis, estadosCivis } from '../../../../_mock';

// ----------------------------------------------------------------------

FormDepositante.propTypes = { dados: PropTypes.object };

export default function FormDepositante({ dados }) {
  const { isEdit, processo } = dados;
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    nif: shapeNumber('NIF', false, '', 'is_cliente'),
    mae: shapeText('Nome da Mãe', false, '', 'is_cliente'),
    pai: shapeText('Nome do Pai', false, '', 'is_cliente'),
    profissao: shapeText('Profissão', false, '', 'is_cliente'),
    telefone: shapeText('Nº de telefone', false, '', 'is_cliente'),
    estado_civil: shapeMixed('Estado civil', false, '', 'is_cliente'),
    docid: shapeText('Doc. de identificação', false, '', 'is_cliente'),
    nacionalidade: shapeText('Nacionalidade', false, '', 'is_cliente'),
    ordenador: shapeText('Nome do ordenador', false, '', 'is_cliente'),
    entidade_con: shapeNumber('Nº da entidade', true, '', 'is_cliente'),
    data_nascimento: shapeDate('Data de nascimento', false, '', 'is_cliente'),
    tipo_docid: shapeMixed('Tipo doc. identificação', false, '', 'is_cliente'),
    local_pais_nascimento: shapeText('Local/País de nascimento', false, '', 'is_cliente'),
  });

  const defaultValues = useMemo(
    () => ({
      is_cliente: dadosStepper?.is_cliente || true,
      entidade_con: dadosStepper?.entidade_con || '',
      nif: dadosStepper?.nif || processo?.con?.nif || '',
      pai: dadosStepper?.pai || processo?.con?.pai || '',
      mae: dadosStepper?.mae || processo?.con?.mae || '',
      docid: dadosStepper?.docid || processo?.con?.docid || '',
      morada: dadosStepper?.morada || processo?.con?.morada || '',
      emails: dadosStepper?.emails || processo?.con?.emails || '',
      telefone: dadosStepper?.telefone || processo?.con?.telefone || '',
      ordenador: dadosStepper?.ordenador || processo?.con?.ordenador || '',
      telemovel: dadosStepper?.telemovel || processo?.con?.telemovel || '',
      profissao: dadosStepper?.profissao || processo?.con?.profissao || '',
      nacionalidade: dadosStepper?.nacionalidade || processo?.con?.nacionalidade || '',
      residente: dadosStepper?.residente || (isEdit && processo?.con?.residente) || true,
      local_trabalho: dadosStepper?.local_trabalho || processo?.con?.local_trabalho || '',
      data_nascimento: dadosStepper?.data_nascimento || fillData(processo?.con?.data_nascimento, null),
      local_pais_nascimento: dadosStepper?.local_pais_nascimento || processo?.con?.local_pais_nascimento || '',
      tipo_docid: dadosStepper?.tipo_docid || dis?.find((row) => row?.id === processo?.con?.tipo_docid) || null,
      titular_ordenador: dadosStepper?.titular_ordenador || (isEdit && processo?.con?.titular_ordenador) || true,
      estado_civil:
        dadosStepper?.estado_civil || estadosCivis?.find((row) => row?.id === processo?.con?.estado_civil) || null,
    }),
    [isEdit, dadosStepper, processo]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
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
                  <RHFNumberField noFormat name="entidade_con" label="Nº da entidade" />
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
        </Grid>
      </Card>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}
