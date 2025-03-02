import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
// utils
import { fillData } from '../../../../utils/formatTime';
import { fluxosGmkt, bancaDigital } from '../../../../utils/validarAcesso';
import { shapeDate, shapeNumber, shapeMixed } from '../../../../components/hook-form/yup-shape';
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
  RHFAutocompleteSmp,
} from '../../../../components/hook-form';
import DadosCliente from '../dados-cliente';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';

// ----------------------------------------------------------------------

FormInfoInterno.propTypes = { dados: PropTypes.object };

export default function FormInfoInterno({ dados }) {
  const dispatch = useDispatch();
  const { isEdit, processo, fluxo, onClose } = dados;
  const { dadosStepper } = useSelector((state) => state.stepper);
  const entidades = useMemo(
    () =>
      (processo?.entidade && processo?.entidade?.split(';')?.map((row) => ({ numero: row }))) ||
      (!isEdit && fluxo?.assunto === 'Abertura de Conta' && [{ numero: '' }]) ||
      [],
    [fluxo?.assunto, isEdit, processo?.entidade]
  );

  const formSchema = Yup.object().shape({
    titular: fluxosGmkt(fluxo?.assunto) && Yup.string().required().label('Descriçãao'),
    noperacao: processo?.numero_operacao && Yup.number().positive().label('Nº de operação'),
    entidades: Yup.array(Yup.object({ numero: Yup.number().positive().integer().label('Nº de entidade') })),
    data_entrada: fluxo?.modelo !== 'Paralelo' && Yup.date().typeError().required().label('Data de entrada'),
    email:
      (fluxo?.assunto === 'Formulário' && Yup.string().required().label('Codificação/Nome')) ||
      (bancaDigital(fluxo?.assunto) && Yup.string().email().required().label('Email')),
    conta:
      !fluxo?.limpo && fluxo?.assunto !== 'Abertura de Conta' && Yup.number().positive().integer().label('Nº de conta'),
    // agendamento
    diadomes: shapeNumber('Dia do mês', true, '', 'agendado'),
    data_inicio: shapeDate('Data de início', true, '', 'agendado'),
    periodicidade: shapeMixed('Periodicidade', true, '', 'agendado'),
    data_arquivamento: shapeDate('Data de término', true, '', 'agendado'),
  });

  const defaultValues = useMemo(
    () => ({
      entidades: dadosStepper?.entidades || entidades,
      conta: dadosStepper?.conta || processo?.conta || '',
      email: dadosStepper?.email || processo?.email || '',
      obs: dadosStepper?.obs || processo?.observacao || '',
      titular: dadosStepper?.titular || processo?.titular || '',
      cliente: dadosStepper?.cliente || processo?.cliente || '',
      diadomes: dadosStepper?.diadomes || processo?.dia_mes || '',
      agendado: dadosStepper?.agendado || processo?.agendado || false,
      noperacao: dadosStepper?.noperacao || processo?.numero_operacao || '',
      periodicidade: dadosStepper?.periodicidade || processo?.periodicidade || null,
      data_inicio: dadosStepper?.data_inicio || fillData(processo?.data_inicio, null),
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      data_arquivamento: dadosStepper?.data_arquivamento || fillData(processo?.data_arquivamento, null),
    }),
    [entidades, dadosStepper, processo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Box sx={{ width: 1 }}>
        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <DadosCliente noperacao={processo?.noperacao} fluxo={fluxo} />
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

        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
        </Card>
      </Box>
      <ButtonsStepper onCancel={() => onClose()} labelCancel="Cancelar" />
    </FormProvider>
  );
}
