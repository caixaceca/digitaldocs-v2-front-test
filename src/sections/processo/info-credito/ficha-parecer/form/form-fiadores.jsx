import * as Yup from 'yup';
import { useMemo, useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogContent from '@mui/material/DialogContent';
// utils
import { dispatch, useSelector } from '@/redux/store';
import { updateFicha } from '@/redux/slices/intranet';
import { resetDados, updateDados, backStep } from '@/redux/slices/stepper';
// components
import Steps from '@/components/Steps';
import { ButtonsStepper } from '@/components/Actions';
import { FormProvider } from '@/components/hook-form';
import { DialogTitleAlt } from '@/components/CustomDialog';
//
import { Dividas, SituacaoLaboral, shapeDivida } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormFiadores({ onClose, dados, fiadores }) {
  const { activeStep, dadosStepper } = useSelector((state) => state.stepper);

  const onClose1 = useCallback(() => {
    onClose();
    dispatch(resetDados());
  }, [onClose]);

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onClose1()}
        title={`Informação do fiado - ${dados.nome_entidade}`}
        content={<Steps sx={{ mt: 3 }} activeStep={activeStep} steps={['Rendimento', 'Resp. externa']} />}
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {activeStep === 0 && <Rendimento onClose={onClose1} dados={{ ...dados, ...dadosStepper }} />}
        {activeStep === 1 && (
          <RespExterna dados={{ ...dados, ...dadosStepper }} fiadores={fiadores} onClose={onClose1} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Rendimento({ dados, onClose }) {
  const formSchema = Yup.object().shape({
    situacao_laboral: Yup.mixed().required().label('Situação laboral'),
    entidade_patronal: Yup.string().required().label('Local de trabalho'),
    renda_bruto_mensal: Yup.number().positive().label('Rendimento bruto'),
    renda_liquido_mensal: Yup.number().positive().label('Rendimento liquido'),
  });

  const defaultValues = useMemo(
    () => ({
      entidade_patronal: dados?.entidade_patronal || '',
      situacao_laboral: dados?.situacao_laboral || null,
      renda_bruto_mensal: dados?.renda_bruto_mensal || '',
      renda_liquido_mensal: dados?.renda_liquido_mensal || '',
    }),
    [dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    dispatch(updateDados({ forward: true, dados: values }));
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2} justifyContent="center" sx={{ pt: 3 }}>
        <SituacaoLaboral />
      </Grid>
      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function RespExterna({ dados, fiadores, onClose }) {
  const formSchema = Yup.object().shape({ dividas_externas: shapeDivida(), avales_externas: shapeDivida() });
  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { dividas_externas: dados?.dividas_externas || [], avales_externas: dados?.avales_externas || [] },
  });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    const fiadoresAtualizados = fiadores.map((f) => {
      if (f.numero_entidade === dados.numero_entidade) return { ...dados, ...values };
      return f;
    });
    dispatch(updateFicha({ fiadores: fiadoresAtualizados }));
    onClose();
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Dividas name="dividas_externas" />
      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
      <Dividas name="avales_externas" />
      <ButtonsStepper onClose={() => dispatch(backStep())} label="Guardar" />
    </FormProvider>
  );
}
