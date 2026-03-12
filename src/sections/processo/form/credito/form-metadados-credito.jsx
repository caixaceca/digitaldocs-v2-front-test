import { useMemo, useEffect, useCallback } from 'react';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import {
  schemaTaxas,
  buildPayload,
  schemaRegime,
  getDefaultsTaxas,
  getDefaultsObjeto,
  getDefaultsRegime,
  getSchemaCondicoes,
  getDefaultsEntidade,
  getDefaultsCondicoes,
} from './metadados-utils';
// redux
import { getFromGaji9 } from '@/redux/slices/gaji9';
import { updateItem } from '@/redux/slices/digitaldocs';
import { useSelector, useDispatch } from '@/redux/store';
import { updateDados, resetDados, backStep } from '@/redux/slices/stepper';
import { getFromParametrizacao, getSuccess } from '@/redux/slices/parametrizacao';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteObj,
} from '@/components/hook-form';
import Steps from '@/components/Steps';
import GridItem from '@/components/GridItem';
import { FormLoading } from '@/components/skeleton';
import { ButtonsStepper } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCreditoForm({ onClose, dados = null, ids }) {
  const dispatch = useDispatch();
  const { activeStep, dadosStepper } = useSelector((state) => state.stepper);
  const { precario, isLoading } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    dispatch(getFromGaji9('tiposImoveis'));
    dispatch(getFromParametrizacao('pesquizar-precario', { ...ids, item: 'precario' }));
  }, [dispatch, ids]);

  const handleClose = useCallback(() => {
    onClose();
    dispatch(resetDados());
    dispatch(getSuccess({ item: 'precario', dados: null }));
  }, [onClose, dispatch]);

  const commonProps = { dados, dadosStepper, dispatch, precario: precario?.precario };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={handleClose}
        title="Outras informações do crédito"
        content={
          <Steps
            sx={{ mt: 4, mb: 3 }}
            activeStep={activeStep}
            steps={['Regime', 'Condições', 'Taxas', 'Objeto', 'Entidade']}
          />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {isLoading ? (
          <FormLoading rows={1} />
        ) : (
          <>
            {activeStep === 0 && <RegimeEspecial {...commonProps} onClose={handleClose} />}
            {activeStep === 1 && <Condicoes {...commonProps} />}
            {activeStep === 2 && <Taxas {...commonProps} />}
            {activeStep === 3 && <Objeto {...commonProps} />}
            {activeStep === 4 && <Entidade {...commonProps} ids={ids} onClose={handleClose} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function RegimeEspecial({ onClose, dados, dispatch, dadosStepper, precario }) {
  const defaultValues = getDefaultsRegime({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(schemaRegime), defaultValues });
  const { control, reset, handleSubmit } = methods;
  const values = useWatch({ control });

  useEffect(() => {
    if (precario) reset(getDefaultsRegime({ dadosStepper, dados, precario }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precario]);

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Regime especial" />
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <GridItem xs={6} md={3} children={<RHFSwitch name="bonificado" label="Bonificado" mt />} />
        <GridItem xs={6} md={3} children={<RHFSwitch name="jovem_bonificado" label="Jovem bonificado" mt />} />
        <GridItem xs={6} md={3} children={<RHFSwitch name="revolving" label="Revolving" mt />} />
        <GridItem xs={6} md={3} children={<RHFSwitch name="credibolsa" label="Credibolsa" mt />} />
        <GridItem sm={6} md={4} children={<RHFSwitch name="isento_comissao" label="Isento de comissão" mt />} />
        <GridItem sm={6} md={4}>
          <RHFSwitch name="tem_isencao_imposto_selo" label="Isento de imposto de selo" mt />
        </GridItem>
        <GridItem sm={6} md={4}>
          <RHFSwitch name="colaborador_empresa_parceira" label="Colaborador de empresa parceira" mt />
        </GridItem>
        {values?.credibolsa && (
          <>
            <GridItem sm={6} md={3}>
              <RHFTextField name="montante_tranches_credibolsa" label="Montante das tranches" />
            </GridItem>
            <GridItem sm={6} md={3} children={<RHFTextField name="nivel_formacao" label="Nível de formação" />} />
            <GridItem sm={6} children={<RHFTextField name="designacao_curso" label="Designação do curso" />} />
            <GridItem sm={6}>
              <RHFTextField name="estabelecimento_ensino" label="Estabelecimento de ensino" />
            </GridItem>
            <GridItem sm={6}>
              <RHFTextField name="localizacao_estabelecimento_ensino" label="Localização" />
            </GridItem>
          </>
        )}
      </Grid>
      <ButtonsStepper onClose={onClose} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Condicoes({ dados, dispatch, dadosStepper, precario }) {
  const defaultValues = getDefaultsCondicoes({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(getSchemaCondicoes(dadosStepper)), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Condições & Ciclo do Crédito" />
      <Grid container spacing={3} sx={{ mt: 3 }} justifyContent="center">
        <GridItem xs={6} md={4}>
          <RHFNumberField name="conta_do_renda" label="Conta DO renda" noFormat />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="capital_max_isento_imposto_selo" label="Capital máx. isento imp. selo" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="numero_prestacao" label="Nº de prestações" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="meses_vencimento" label="Meses de vencimento" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="periodo_carencia" label="Período de carência" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="prazo_utilizacao" label="Prazo de utilização" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFDatePicker name="data_utilizacao" label="Data de utilização" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFDatePicker name="data_vencimento_prestacao1" label="Data 1ª prestação" />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Taxas({ dados, dadosStepper, precario }) {
  const dispatch = useDispatch();
  const defaultValues = getDefaultsTaxas({ dadosStepper, dados, precario });
  const methods = useForm({ resolver: yupResolver(schemaTaxas), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Taxas" />
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <GridItem children={<RHFSwitch name="modo_taxa_equivalente" label="Taxa equivalente" />} />
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_juro_precario" label="Taxa juros precário" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_juro_desconto" label="Taxa juros desconto" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_mora" label="Taxa de mora" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField name="taxa_imposto_selo" label="Taxa de imposto selo" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="taxa_comissao_abertura" label="Taxa comissão abertura" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="taxa_imposto_selo_utilizacao" label="Taxa imp. selo utlização" tipo="%" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField name="taxa_comissao_imobilizacao" label="Taxa comissão imobilização" tipo="%" />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Objeto({ dados, dispatch, dadosStepper }) {
  const { tiposImoveis } = useSelector((state) => state.gaji9);
  const imoveisList = useMemo(() => tiposImoveis.map((i) => ({ id: i?.id, label: i?.tipo })), [tiposImoveis]);

  const defaultValues = getDefaultsObjeto({ dadosStepper, dados, imoveisList });
  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Title title="Objeto do Financiamento" />
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <GridItem sm={6}>
          <RHFAutocompleteObj name="tipo_imovel_id" label="Tipo de imóvel" options={imoveisList} />
        </GridItem>
        <GridItem sm={6}>
          <RHFTextField name="bem_servico_financiado" label="Bem/Serviço financiado" />
        </GridItem>
        <GridItem>
          <RHFTextField name="finalidade_credito_habitacao" label="Finalidade cred. habitação" />
        </GridItem>
      </Grid>
      <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Entidade({ dados, ids, onClose, dispatch, dadosStepper }) {
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = getDefaultsEntidade({ dadosStepper, dados });
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      const payload = buildPayload({ ...dadosStepper, ...values });
      const params = { ...ids, msg: 'Informações atualizadas', fillCredito: true };
      dispatch(updateItem('metadados-credito', JSON.stringify(payload), { ...params, onClose }));
    } catch (error) {
      console.error('Erro ao processar dados para o backend:', error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Title title="Entidade Vendedora / Fornecedora" />
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <GridItem sm={6}>
          <RHFTextField name="nome_empresa_fornecedora" label="Empresa fornecedora" />
        </GridItem>
        <GridItem sm={6}>
          <RHFNumberField name="nib_vendedor_ou_fornecedor" label="NIB vendedor/fornecedor" noFormat />
        </GridItem>
        <GridItem sm={6}>
          <RHFTextField label="Instituição de crédito" name="instituicao_credito_conta_vendedor_ou_fornecedor" />
        </GridItem>
        <GridItem sm={6}>
          <RHFNumberField tipo="CVE" label="Valor a transferir" name="valor_transferir_conta_vendedor_ou_fornecedor" />
        </GridItem>
      </Grid>
      <ButtonsStepper label="Guardar" isSaving={isSaving} onClose={() => dispatch(backStep())} />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Title({ title }) {
  return (
    <Paper
      sx={{ bgcolor: 'background.neutral', color: 'success.main', p: 1.5, textAlign: 'center', typography: 'overline' }}
    >
      {title}
    </Paper>
  );
}
