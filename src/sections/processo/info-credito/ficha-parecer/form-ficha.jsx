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
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { textParecer } from './parecer';
import { fillData } from '../../../../utils/formatTime';
import { updateFicha } from '../../../../redux/slices/intranet';
import { useSelector, useDispatch } from '../../../../redux/store';
import { resetDados, forwardStep, backStep } from '../../../../redux/slices/stepper';
// components
import {
  RHFSwitch,
  RHFEditor,
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
import { AddItem, DefaultAction, ButtonsStepper, DialogButons } from '../../../../components/Actions';
import { shapeText, shapeNumber, shapeDate, shapeMixed } from '../../../../components/hook-form/yup-shape';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormFicha({ onClose, ficha, credito = null }) {
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
            steps={['Rendimento', 'Despesas', 'Resp. externa', 'Proposta']}
          />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {activeStep === 0 && <Rendimento onClose={onClose1} dados={ficha?.rendimento || null} />}
        {activeStep === 1 && <Despesas dados={ficha?.despesas || []} />}
        {activeStep === 2 && (
          <RespExterna
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
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    nome_conjuge: shapeText('Nome', true, '', 'conjuge'),
    tipo_contrato: Yup.mixed().required().label('Situação laboral'),
    local_trabalho: Yup.string().required().label('Local de trabalho'),
    renda_bruto_mensal: Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal: Yup.number().positive().label('Rendimento liquido'),
    tipo_contrato_conjuge: shapeMixed('Situação laboral', true, '', 'conjuge'),
    local_trabalho_conjuge: shapeText('Local de trabalho', true, '', 'conjuge'),
    data_nascimento_conjuge: shapeDate('Data de nascimento', true, '', 'conjuge'),
    renda_bruto_mensal_conjuge: shapeNumber('Rendimento bruto', true, '', 'conjuge'),
    renda_liquido_mensal_conjuge: shapeNumber('Rendimento liquido', true, '', 'conjuge'),
  });

  const defaultValues = useMemo(
    () => ({
      conjuge: !!dados?.conjuge,
      nome_conjuge: dados?.nome_conjuge || '',
      local_trabalho: dados?.local_trabalho || '',
      tipo_contrato: dados?.tipo_contrato || null,
      renda_bruto_mensal: dados?.renda_bruto_mensal || '',
      renda_liquido_mensal: dados?.renda_liquido_mensal || '',
      tipo_contrato_conjuge: dados?.tipo_contrato_conjuge || null,
      local_trabalho_conjuge: dados?.local_trabalho_conjuge || '',
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
        <GridItem sm={6} md={3}>
          <RHFAutocompleteSmp name="tipo_contrato" label="Situação laboral" options={['Quadro', 'Contratado']} />
        </GridItem>
        <GridItem sm={6} md={3} children={<RHFTextField name="local_trabalho" label="Local de trabalho" />} />
        <GridItem sm={6} md={3}>
          <RHFNumberField tipo="CVE" name="renda_bruto_mensal" label="Rendimento bruto" />
        </GridItem>
        <GridItem sm={6} md={3}>
          <RHFNumberField tipo="CVE" name="renda_liquido_mensal" label="Rendimento liquido" />
        </GridItem>
        <GridItem children={<RHFSwitch name="conjuge" label="Cônjuge" />} />
        {values?.conjuge && (
          <>
            <GridItem sm={9} children={<RHFTextField name="nome_conjuge" label="Nome" />} />
            <GridItem sm={3}>
              <RHFDatePicker name="data_nascimento_conjuge" label="Data de nascimento" disableFuture />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFAutocompleteSmp
                label="Situação laboral"
                name="tipo_contrato_conjuge"
                options={['Quadro', 'Contratado']}
              />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFTextField name="local_trabalho_conjuge" label="Local de trabalho" />
            </GridItem>
            <GridItem sm={6} md={3}>
              <RHFNumberField tipo="CVE" name="renda_bruto_mensal_conjuge" label="Rendimento bruto" />
            </GridItem>
            <GridItem sm={6} md={3}>
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

function Despesas({ dados }) {
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

function RespExterna({ dados }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const shapeDivida = () =>
    Yup.array(
      Yup.object({
        valor: Yup.number().positive().label('Capital inicial'),
        saldo_divida: Yup.number().positive().label('Saldo em dívida'),
        valor_prestacao: Yup.number().positive().label('Valor da prestação'),
      })
    );

  const formSchema = Yup.object().shape({ dividas_externas: shapeDivida(), avales_externas: shapeDivida() });
  const defaultValues = useMemo(() => dados, [dados]);

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(forwardStep());
      dispatch(updateFicha(values));
    } catch (error) {
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

function Dividas({ name }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="flex-end">
        <Typography variant="subtitle1">{name === 'dividas_externas' ? 'Dívidas' : 'Avales/Fianças'}</Typography>
        <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between">
          <AddItem
            onClick={() => append({ valor: '', valor_prestacao: '', saldo_divida: '' })}
            dados={{ small: true }}
          />
        </Stack>
      </Stack>

      {fields.map((item, index) => (
        <Stack key={item.id} alignItems="flex-end">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
            <RHFNumberField tipo="CVE" label="Capital inicial" name={`${name}[${index}].valor`} />
            <RHFNumberField tipo="CVE" label="Saldo em dívida" name={`${name}[${index}].saldo_divida`} />
            <RHFNumberField tipo="CVE" label="Valor da prestação" name={`${name}[${index}].valor_prestacao`} />
            <Stack direction="row" alignItems="center">
              <DefaultAction onClick={() => remove(index)} label="ELIMINAR" small />
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Proposta({ dados, credito, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({
    montante: Yup.number().positive().label('Montante'),
    comissoes: Yup.string().required().label('Comissões'),
    taxa_juro: Yup.number().positive().label('Taxa de juro'),
    origem_taxa: Yup.mixed().required().label('Origem da taxa'),
    taxa_precario: Yup.number().positive().label('Taxa do preçario'),
    prazo_amortizacao: Yup.number().positive().label('Prazo de amortização'),
  });

  const defaultValues = useMemo(
    () => ({
      taxa_juro: dados?.taxa_juro || credito?.taxa_juro || '',
      comissoes: dados?.comissoes || credito?.comissoes || '',
      montante: dados?.montante || credito?.montante_solicitado || '',
      origem_taxa: dados?.origem_taxa || credito?.origem_taxa || null,
      observacao: dados?.observacao || credito?.observacao_proposta || '',
      taxa_precario: dados?.taxa_precario || credito?.taxa_precario || '',
      prazo_utilizacao: dados?.prazo_utilizacao || credito?.prazo_utilizacao || '',
      prazo_amortizacao: dados?.prazo_amortizacao || credito?.prazo_amortizacao || '',
    }),
    [dados, credito]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(updateFicha({ proposta: values }));
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3} justifyContent="center" sx={{ pt: 3 }}>
        <GridItem sm={6} md={4} children={<RHFNumberField tipo="CVE" name="montante" label="Montante" />} />
        <GridItem sm={6} md={4}>
          <RHFNumberField tipo="meses" name="prazo_amortizacao" label="Prazo amortização" />
        </GridItem>
        <GridItem sm={6} md={4}>
          <RHFNumberField tipo="meses" name="prazo_utilizacao" label="Prazo utilização" />
        </GridItem>
        <GridItem sm={6} md={4} children={<RHFNumberField tipo="%" name="taxa_precario" label="Taxa do preçario" />} />
        <GridItem sm={6} md={4} children={<RHFNumberField tipo="%" name="taxa_juro" label="Taxa de juro" />} />
        <GridItem sm={6} md={4}>
          <RHFAutocompleteSmp
            name="origem_taxa"
            label="Origem da taxa"
            options={['Negociada', 'Condições Especiais de Negociação', 'Preçario']}
          />
        </GridItem>
        <GridItem children={<RHFTextField name="comissoes" label="Comissões" />} />
        <GridItem children={<RHFTextField name="observacao" label="Observação" multiline rows={2} />} />
      </Grid>
      <ButtonsStepper onClose={() => dispatch(backStep())} label="Guardar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FormParecer({ ficha, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formSchema = Yup.object().shape({ parecer: Yup.string().required().label('Parecer') });
  const defaultValues = useMemo(() => ({ parecer: textParecer(ficha) || '' }), [ficha]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(updateFicha(values));
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt onClose={onClose} title="Parecer do analista" sx={{ mb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }}>
            <GridItem children={<RHFEditor name="parecer" simple />} />
          </Stack>
          <DialogButons onClose={onClose} edit />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
