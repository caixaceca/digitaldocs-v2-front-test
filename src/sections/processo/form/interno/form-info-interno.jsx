import * as Yup from 'yup';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
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
//
import { entidadesList, submitDados } from '../utils-form-processo';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormInfoInterno({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, processo, fluxo, estado, onClose } = dados;

  const { cc, uos } = useSelector((state) => state.intranet);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    noperacao: processo?.numero_operacao && Yup.number().positive().required().label('Nº de operação'),
    entidades: Yup.array(Yup.object({ numero: Yup.number().positive().integer().label('Nº de entidade') })),
    data_entrada: fluxo?.modelo !== 'Paralelo' && Yup.date().typeError().required().label('Data de entrada'),
    titular: (fluxosGmkt(fluxo?.assunto) || fluxo?.assunto === 'Diário') && Yup.string().required().label('Descriçãao'),
    email:
      (fluxo?.assunto === 'Formulário' && Yup.string().required().label('Codificação/Nome')) ||
      (bancaDigital(fluxo?.assunto) && Yup.string().email().required().label('Email')),
    conta:
      !fluxo?.limpo &&
      fluxo?.assunto !== 'Abertura de Conta' &&
      Yup.number().positive().integer().required().label('Nº de conta'),
    // agendamento
    diadomes: shapeNumber('Dia do mês', true, '', 'agendado'),
    data_inicio: shapeDate('Data de início', true, '', 'agendado'),
    periodicidade: shapeMixed('Periodicidade', true, '', 'agendado'),
    data_arquivamento: shapeDate('Data de término', true, '', 'agendado'),
  });

  const defaultValues = useMemo(
    () => ({
      fluxo_id: fluxo?.id,
      email: dadosStepper?.email || processo?.email || '',
      obs: dadosStepper?.obs || processo?.observacao || '',
      conta: dadosStepper?.conta || processo?.conta || null,
      cliente: dadosStepper?.cliente || processo?.cliente || '',
      diadomes: dadosStepper?.diadomes || processo?.dia_mes || '',
      agendado: dadosStepper?.agendado || processo?.agendado || false,
      noperacao: dadosStepper?.noperacao || processo?.numero_operacao || null,
      periodicidade: dadosStepper?.periodicidade || processo?.periodicidade || null,
      data_inicio: dadosStepper?.data_inicio || fillData(processo?.data_inicio, null),
      data_entrada: dadosStepper?.data_entrada || fillData(processo?.data_entrada, null),
      entidades: dadosStepper?.entidades || entidadesList(isEdit, processo?.entidade, fluxo?.assunto),
      data_arquivamento: dadosStepper?.data_arquivamento || fillData(processo?.data_arquivamento, null),
      balcao: processo?.balcao || uos?.find(({ id }) => Number(id) === Number(estado?.uo_id))?.balcao || cc?.uo_balcao,
      titular:
        dadosStepper?.titular ||
        processo?.titular ||
        (fluxo?.assunto === 'Diário' && `Diário ${format(new Date(), 'dd/MM/yyyy')} - `) ||
        '',
    }),
    [isEdit, dadosStepper, processo, uos, fluxo, cc?.uo_balcao, estado?.uo_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, dadosStepper, processo, uos, fluxo, cc?.uo_balcao, estado?.uo_id]);

  const onSubmit = async () => {
    submitDados({ ...values, fluxo }, isEdit, processo?.id, dispatch, enqueueSnackbar, onClose);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ width: 1 }}>
        <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <DadosCliente noperacao={processo?.numero_operacao} fluxo={fluxo} />
        </Card>
        {(fluxo?.assunto === 'OPE DARH' || fluxo?.assunto === 'Transferência Internacional') && (
          <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
            <Grid container spacing={3}>
              <GridItem children={<RHFSwitch name="agendado" label="Agendar" mt />} />
              {values.agendado && (
                <>
                  <GridItem xs={6} md={3}>
                    <RHFAutocompleteSmp
                      name="periodicidade"
                      label="Periodicidade"
                      options={['Mensal', 'Trimestral', 'Semestral', 'Anual']}
                    />
                  </GridItem>
                  <GridItem xs={6} md={3} children={<RHFNumberField name="diadomes" label="Dia do mês" />} />
                  <GridItem xs={6} md={3} children={<RHFDatePicker name="data_inicio" label="Data de início" />} />
                  <GridItem xs={6} md={3}>
                    <RHFDatePicker
                      label="Data de término"
                      name="data_arquivamento"
                      minDate={values.data_inicio}
                      disabled={!values.data_inicio}
                    />
                  </GridItem>
                </>
              )}
            </Grid>
          </Card>
        )}

        <Card sx={{ mt: 3, p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
          <RHFTextField name="obs" multiline minRows={3} maxRows={5} label="Observação" />
        </Card>
      </Box>
      <ButtonsStepper isSaving={isSaving} onClose={onClose} labelCancel="Cancelar" label={isEdit ? 'Guardar' : ''} />
    </FormProvider>
  );
}
