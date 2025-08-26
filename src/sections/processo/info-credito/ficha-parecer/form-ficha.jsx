import * as Yup from 'yup';
import { useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fillData } from '../../../../utils/formatTime';
import { updateFicha } from '../../../../redux/slices/intranet';
import { useSelector, useDispatch } from '../../../../redux/store';
import { resetDados, forwardStep, backStep } from '../../../../redux/slices/stepper';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
} from '../../../../components/hook-form';
import Steps from '../../../../components/Steps';
import GridItem from '../../../../components/GridItem';
import { SemDados } from '../../../../components/Panel';
import { DialogTitleAlt } from '../../../../components/CustomDialog';
import { AddItem, DefaultAction, ButtonsStepper } from '../../../../components/Actions';
import { shapeText, shapeNumber, shapeDate } from '../../../../components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormFicha({ onClose, ficha }) {
  const dispatch = useDispatch();
  const { activeStep } = useSelector((state) => state.stepper);

  const onClose1 = useCallback(() => {
    onClose();
    dispatch(resetDados());
  }, [onClose, dispatch]);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onClose1()}
        title="Informação adicional"
        content={
          <Steps
            sx={{ mt: 3 }}
            activeStep={activeStep}
            steps={['Rendimento', 'Despesas', 'Responsabilidades', 'Proposta', 'Outros']}
          />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {activeStep === 0 && <Rendimento onClose={onClose1} dados={ficha?.rendimento || null} />}
        {activeStep === 1 && <Despesas dados={ficha?.despesas || []} />}
        {activeStep === 2 && <Despesas dados={ficha?.despesas || []} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Rendimento({ dados, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    nome_conjuge: shapeText('Nome', true, '', 'conjuge'),
    tipo_contrato: Yup.mixed().required().label('Situação laboral'),
    renda_bruto_mensal: Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal: Yup.number().positive().label('Rendimento liquido'),
    data_nascimento_conjuge: shapeDate('Data de nascimento', true, '', 'conjuge'),
    renda_bruto_mensal_conjuge: shapeNumber('Rendimento bruto', true, '', 'conjuge'),
    renda_liquido_mensal_conjuge: shapeNumber('Rendimento liquido', true, '', 'conjuge'),
  });

  const defaultValues = useMemo(
    () => ({
      conjuge: !!dados?.conjuge,
      nome_conjuge: dados?.nome_conjuge || '',
      tipo_contrato: dados?.tipo_contrato || null,
      renda_bruto_mensal: dados?.renda_bruto_mensal || '',
      renda_liquido_mensal: dados?.renda_liquido_mensal || '',
      renda_bruto_mensal_conjuge: dados?.renda_bruto_mensal_conjuge || '',
      renda_liquido_mensal_conjuge: dados?.renda_liquido_mensal_conjuge || '',
      data_nascimento_conjuge: fillData(dados?.data_nascimento_conjuge, null),
    }),
    [dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha({ rendimento: values }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} justifyContent="center" sx={{ pt: 3 }}>
        <GridItem sm={4}>
          <RHFAutocompleteSmp name="tipo_contrato" label="Situação laboral" options={['Quadro', 'Contratado']} />
        </GridItem>
        <GridItem sm={4} children={<RHFNumberField tipo="CVE" name="renda_bruto_mensal" label="Rendimento bruto" />} />
        <GridItem sm={4}>
          <RHFNumberField tipo="CVE" name="renda_liquido_mensal" label="Rendimento liquido" />
        </GridItem>
        <GridItem children={<RHFSwitch name="conjuge" label="Cônjuge" />} />
        {values?.conjuge && (
          <>
            <GridItem children={<RHFTextField name="nome_conjuge" label="Nome" />} />
            <GridItem sm={4} children={<RHFDatePicker name="data_nascimento_conjuge" label="Data de nascimento" />} />
            <GridItem sm={4}>
              <RHFNumberField tipo="CVE" name="renda_bruto_mensal_conjuge" label="Rendimento bruto" />
            </GridItem>
            <GridItem sm={4}>
              <RHFNumberField tipo="CVE" name="renda_liquido_mensal_conjuge" label="Rendimento liquido" />
            </GridItem>
          </>
        )}
      </Grid>
      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Despesas({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    despesas: Yup.array(
      Yup.object({
        despesa: Yup.string().required().label('Despesa'),
        valor: Yup.number().positive().required().label('Valor'),
      })
    ),
  });
  const defaultValues = useMemo(() => ({ despesas: dados || [] }), [dados]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'despesas' });

  const onSubmit = async () => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={3} sx={{ mt: 3 }}>
          {fields?.length === 0 && <SemDados message="Ainda não foi adicionada nenhuma despesa..." />}
          {fields.map((item, index) => (
            <Stack direction="row" key={item.id} spacing={2} alignItems="center">
              <Stack direction="row" sx={{ width: 1 }} spacing={2}>
                <RHFTextField name={`despesas[${index}].despesa`} label="Despesa" />
                <RHFNumberField name={`despesas[${index}].valor`} label="Valor" tipo="CVE" sx={{ width: '50%' }} />
              </Stack>
              <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
            </Stack>
          ))}
          <Stack direction="row" justifyContent="center">
            <AddItem dados={{ small: true, label: 'Despesa' }} onClick={() => append({ despesa: '', valor: '' })} />
          </Stack>
        </Stack>
        <ButtonsStepper onClose={() => dispatch(backStep())} />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Responsabilidades({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    dividas_fora: Yup.array(
      Yup.object({
        valor: Yup.number().positive().label('Capital inicial'),
        valor_prestacao: Yup.number().positive().label('Prestação'),
        saldo_divida: Yup.number().positive().label('Saldo em dívida'),
      })
    ),
    avales_fiancas_fora: Yup.array(
      Yup.object({
        valor: Yup.number().positive().label('Capital inicial'),
        valor_prestacao: Yup.number().positive().label('Prestação'),
        saldo_divida: Yup.number().positive().label('Saldo em dívida'),
      })
    ),
  });
  const defaultValues = useMemo(
    () => ({ dividas_fora: dados?.dividas || [], avales_fiancas_fora: dados?.fiancas || [] }),
    [dados]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'despesas' });

  const onSubmit = async () => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha(values));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" spacing={3} sx={{ mt: 3 }}>
          {fields?.length === 0 && <SemDados message="Ainda não foi adicionada nenhuma despesa..." />}
          {fields.map((item, index) => (
            <Stack direction="row" key={item.id} spacing={2} alignItems="center">
              <Stack direction="row" sx={{ width: 1 }} spacing={2}>
                <RHFTextField name={`despesas[${index}].despesa`} label="Despesa" />
                <RHFNumberField name={`despesas[${index}].valor`} label="Valor" tipo="CVE" sx={{ width: '50%' }} />
              </Stack>
              <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
            </Stack>
          ))}
          <Stack direction="row" justifyContent="center">
            <AddItem dados={{ small: true, label: 'Despesa' }} onClick={() => append({ despesa: '', valor: '' })} />
          </Stack>
        </Stack>
        <ButtonsStepper onClose={() => dispatch(backStep())} />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Dividas({ name }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {name === 'dividas_caixa' || name === 'dividas_outros' ? 'Dívidas' : 'Avales/Fianças'}
        </Typography>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
          <AddItem button onClick={() => append({ valor: '', valor_prestacao: '', saldo_divida: '' })} small />
        </Stack>
      </Stack>

      {fields.map((item, index) => (
        <Stack key={item.id} alignItems="flex-end">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFNumberField tipo="CVE" label="Capital inicial" name={`${name}[${index}].capital_inicial`} />
            <RHFNumberField tipo="CVE" label="Saldo em dívida" name={`${name}[${index}].capital_em_divida`} />
            <RHFNumberField tipo="CVE" label="Serviço mensal da dívida" name={`${name}[${index}].valor_prestacao`} />
            <Stack direction="row" alignItems="center">
              <DefaultAction onClick={() => remove(index)} options={{ small: true }} />
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
