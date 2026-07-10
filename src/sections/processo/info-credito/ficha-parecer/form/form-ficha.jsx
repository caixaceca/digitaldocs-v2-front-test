import * as Yup from 'yup';
import { useMemo, useCallback } from 'react';
import { useSnackbar } from 'notistack';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
// utils
import { textParecer } from '../parecer';
import { fillData } from '@/utils/formatTime';
import { updateFicha } from '@/redux/slices/intranet';
import { dispatch, useSelector } from '@/redux/store';
import { resetDados, forwardStep, backStep } from '@/redux/slices/stepper';
// components
import {
  RHFSwitch,
  RHFEditor,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
} from '@/components/hook-form';
import Steps from '@/components/Steps';
import GridItem from '@/components/GridItem';
import { SemDados } from '@/components/Panel';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { AddItem, DefaultAction, ButtonsStepper, DialogButons } from '@/components/Actions';
import { shapeText, shapeNumberZero, shapeDate, shapeMixed } from '@/components/hook-form/yup-shape';

import { SituacaoLaboral, Dividas, shapeDivida } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormFicha({ onClose, ficha, credito = null }) {
  const { activeStep } = useSelector((state) => state.stepper);

  const onClose1 = useCallback(() => {
    onClose();
    dispatch(resetDados());
  }, [onClose]);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onClose1()}
        title="Informação adicional"
        content={
          <Steps sx={{ mt: 3 }} activeStep={activeStep} steps={['Rendimento', 'Despesas', 'Resp. externa', 'Outros']} />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {activeStep === 0 && <Rendimento onClose={onClose1} dados={ficha?.rendimento || null} />}
        {activeStep === 1 && <Despesas dados={ficha?.despesas || []} />}
        {activeStep === 2 && (
          <RespExternaProponente
            dados={{ dividas_externas: ficha?.dividas_externas || [], avales_externas: ficha?.avales_externas || [] }}
          />
        )}
        {activeStep === 3 && <Proposta dados={ficha?.proposta || null} credito={credito} onClose={onClose1} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Rendimento({ dados, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    nome_conjuge: shapeText('conjuge', [true], 'Nome'),
    situacao_laboral: Yup.mixed().required().label('Situação laboral'),
    entidade_patronal: Yup.string().required().label('Local de trabalho'),
    renda_bruto_mensal: Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal: Yup.number().positive().label('Rendimento liquido'),
    data_nascimento_conjuge: shapeDate('conjuge', [true], 'Data de nascimento'),
    situacao_laboral_conjuge: shapeMixed('conjuge', [true], 'Situação laboral'),
    entidade_patronal_conjuge: shapeText('conjuge', [true], 'Local de trabalho'),
    renda_bruto_mensal_conjuge: shapeNumberZero('Rendimento bruto', [true], 'conjuge'),
    renda_liquido_mensal_conjuge: shapeNumberZero('Rendimento liquido', [true], 'conjuge'),
  });

  const defaultValues = useMemo(
    () => ({
      conjuge: !!dados?.conjuge,
      nome_conjuge: dados?.nome_conjuge || '',
      entidade_patronal: dados?.entidade_patronal || '',
      situacao_laboral: dados?.situacao_laboral || null,
      renda_bruto_mensal: dados?.renda_bruto_mensal || '',
      renda_liquido_mensal: dados?.renda_liquido_mensal || '',
      entidade_patronal_conjuge: dados?.entidade_patronal_conjuge || '',
      situacao_laboral_conjuge: dados?.situacao_laboral_conjuge || null,
      renda_bruto_mensal_conjuge: dados?.renda_bruto_mensal_conjuge || '',
      renda_liquido_mensal_conjuge: dados?.renda_liquido_mensal_conjuge || '',
      data_nascimento_conjuge: fillData(dados?.data_nascimento_conjuge, null),
    }),
    [dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async () => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha({ rendimento: values }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} justifyContent="center" sx={{ pt: 3 }}>
        <SituacaoLaboral />
        <GridItem children={<RHFSwitch name="conjuge" label="Cônjuge" />} />
        {values?.conjuge && (
          <>
            <GridItem sm={9} children={<RHFTextField name="nome_conjuge" label="Nome" />} />
            <GridItem sm={3}>
              <RHFDatePicker name="data_nascimento_conjuge" label="Data de nascimento" disableFuture />
            </GridItem>
            <SituacaoLaboral prefixo="_conjuge" />
          </>
        )}
      </Grid>
      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Despesas({ dados }) {
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
  const { control, handleSubmit } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'despesas' });

  const onSubmit = async (values) => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha(values));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
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
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RespExternaProponente({ dados }) {
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({ dividas_externas: shapeDivida(), avales_externas: shapeDivida() });
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues: dados });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha(values));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Dividas name="dividas_externas" />
      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
      <Dividas name="avales_externas" />
      <ButtonsStepper onClose={() => dispatch(backStep())} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Proposta({ dados, credito, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    comissoes: Yup.string().required().label('Comissões'),
    origem_taxa: Yup.mixed().required().label('Origem da taxa'),
  });

  const defaultValues = useMemo(
    () => ({
      outros: dados?.outros || '',
      comissoes: dados?.comissoes || credito?.comissoes || 'Em vigor',
      origem_taxa: dados?.origem_taxa || credito?.origem_taxa || null,
    }),
    [dados, credito]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const nomesGarantias = credito?.garantias
    .map((g) => (g.subtipo_garantia ? `${g.tipo_garantia} - ${g.subtipo_garantia}` : g.tipo_garantia))
    .join(', ');

  const onSubmit = async (values) => {
    try {
      dispatch(updateFicha({ proposta: { ...values, nomesGarantias } }));
      onClose();
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} justifyContent="center" sx={{ pt: 3 }}>
        <GridItem sm={6} md={4}>
          <RHFAutocompleteSmp
            name="origem_taxa"
            label="Origem da taxa"
            options={['Negociada', 'Condições Especiais de Negociação', 'Preçário']}
          />
        </GridItem>
        <GridItem children={<RHFTextField name="comissoes" label="Comissões" />} />
        <GridItem children={<RHFTextField name="outros" label="Observação" />} />
      </Grid>
      <ButtonsStepper onClose={() => dispatch(backStep())} label="Guardar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FormParecer({ ficha, onClose }) {
  const formSchema = Yup.object().shape({ parecer: Yup.string().required().label('Parecer') });
  const defaultValues = useMemo(() => ({ parecer: ficha?.parecer || textParecer(ficha) || '' }), [ficha]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit, reset } = methods;

  const onSubmit = (values) => {
    dispatch(updateFicha(values));
    onClose();
  };

  const onReset = () => {
    dispatch(updateFicha({ parecer: '' }));
    reset({ parecer: textParecer(ficha) });
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt
        sx={{ mb: 2 }}
        onClose={onClose}
        title="Parecer do analista"
        action={<DefaultAction small button label="Parecer base" onClick={() => onReset()} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }}>
            <RHFEditor name="parecer" simple />
          </Stack>
          <DialogButons onClose={onClose} edit />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
