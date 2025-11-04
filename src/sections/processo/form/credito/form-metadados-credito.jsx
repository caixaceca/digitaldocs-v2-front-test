import * as Yup from 'yup';
import { useMemo, useEffect, useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import CardActions from '@mui/material/CardActions';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate, fillData } from '../../../../utils/formatTime';
// redux
import { getFromGaji9 } from '../../../../redux/slices/gaji9';
import { updateItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { updateDados, resetDados, backStep, gotoStep } from '../../../../redux/slices/stepper';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import Steps from '../../../../components/Steps';
import GridItem from '../../../../components/GridItem';
import { ButtonsStepper } from '../../../../components/Actions';
import MetadadosCredito from '../../info-credito/metadados-credito';
import { DialogTitleAlt } from '../../../../components/CustomDialog';

// ---------------------------------------------------------------------------------------------------------------------

export default function MetadadosCreditoForm({ onClose, dados = null, ids }) {
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
        title="Outras informações do crédito"
        content={
          <Steps
            sx={{ mt: 4, mb: 3 }}
            activeStep={activeStep}
            steps={['Identificação', 'Condições', 'Custos', 'Bem/Imóvel', 'Entidade', 'Resumo']}
          />
        }
      />
      {activeStep === 5 ? (
        <Resumo onClose={onClose1} ids={ids} />
      ) : (
        <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
          {activeStep === 0 && <Identificacao onClose={onClose1} dados={dados} />}
          {activeStep === 1 && <Condicoes dados={dados} />}
          {activeStep === 2 && <Custos dados={dados} />}
          {activeStep === 3 && <Imovel dados={dados} />}
          {activeStep === 4 && <Entidade dados={dados} />}
        </DialogContent>
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Identificacao({ onClose, dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    data_vencimento_prestacao1: Yup.date().required().label('Data 1ª prestação'),
  });

  const defaultValues = useMemo(
    () => ({
      revolving: dadosStepper?.revolving || dados?.revolving || false,
      bonificado: dadosStepper?.bonificado || dados?.bonificado || false,
      credibolsa: dadosStepper?.credibolsa || dados?.credibolsa || false,
      isento_comissao: dadosStepper?.isento_comissao || dados?.isento_comissao || false,
      jovem_bonificado: dadosStepper?.jovem_bonificado || dados?.jovem_bonificado || false,
      colaborador_empresa_parceira:
        dadosStepper?.colaborador_empresa_parceira || dados?.colaborador_empresa_parceira || false,
      nivel_formacao: dadosStepper?.nivel_formacao || dados?.nivel_formacao || '',
      conta_do_renda: dadosStepper?.conta_do_renda || dados?.conta_do_renda || '',
      designacao_curso: dadosStepper?.designacao_curso || dados?.designacao_curso || '',
      estabelecimento_ensino: dadosStepper?.estabelecimento_ensino || dados?.estabelecimento_ensino || '',
      montante_tranches_credibolsa: dados?.montante_tranches_credibolsa || dados?.montante_tranches_credibolsa || '',
      finalidade_credito_habitacao:
        dadosStepper?.finalidade_credito_habitacao || dados?.finalidade_credito_habitacao || '',
      localizacao_estabelecimento_ensino:
        dados?.localizacao_estabelecimento_ensino || dados?.localizacao_estabelecimento_ensino || '',
      data_vencimento_prestacao1:
        dadosStepper?.data_vencimento_prestacao1 || fillData(dados?.data_vencimento_prestacao1, null),
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Title title="Identificação e Contexto do Crédito" />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <GridItem sm={6} md={4} children={<RHFSwitch name="bonificado" label="Bonificado" mt />} />
          <GridItem sm={6} md={4} children={<RHFSwitch name="jovem_bonificado" label="Jovem bonificado" mt />} />
          <GridItem sm={6} md={4} children={<RHFSwitch name="revolving" label="Revolving" mt />} />
          <GridItem sm={6} md={4} children={<RHFSwitch name="isento_comissao" label="Isento da comissão" mt />} />
          <GridItem sm={6} md={4}>
            <RHFSwitch name="colaborador_empresa_parceira" label="Colaborador de empresa parceira" mt />
          </GridItem>
          <GridItem sm={6} md={4} children={<RHFSwitch name="credibolsa" label="Credibolsa" mt />} />
          <GridItem sm={6} md={3} children={<RHFNumberField name="conta_do_renda" label="Conta do renda" noFormat />} />
          <GridItem sm={6} md={3}>
            <RHFDatePicker name="data_vencimento_prestacao1" label="Data 1ª prestação" />
          </GridItem>
          <GridItem md={6}>
            <RHFTextField name="finalidade_credito_habitacao" label="Finalidade cred. habitação" />
          </GridItem>
          {values?.credibolsa && (
            <>
              <GridItem sm={6} md={3}>
                <RHFTextField name="montante_tranches_credibolsa" label="Tranches credibolsa" />
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
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Condicoes({ dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    taxa_taeg: Yup.number().positive().required().label('Taxa TAEG'),
    taxa_imposto_selo: Yup.number().positive().max(100).required().label('Taxa de imposto selo'),
    taxa_juro_precario: Yup.number().positive().max(100).required().label('Taxa de juros precário'),
    numero_prestacao: Yup.number().positive().max(100).integer().required().label('Nº de prestações'),
    // meses_vencimento: Yup.number().positive().integer().required().label('Meses de vencimento'),
    // prazo_utilizacao: Yup.number().positive().integer().required().label('Prazo de utilização'),
    taxa_juro_desconto: Yup.number().min(0).max(100).required().label('Taxa de juros desconto'),
    taxa_comissao_abertura: Yup.number().min(0).max(100).required().label('Taxa de comissão abertura'),
    taxa_comissao_imobilizacao: Yup.number().min(0).max(100).required().label('Taxa de comissão imobilização'),
  });

  const defaultValues = useMemo(
    () => ({
      taxa_taeg: dadosStepper?.taxa_taeg || dados?.taxa_taeg || 0,
      numero_prestacao: dadosStepper?.numero_prestacao || dados?.numero_prestacao || '',
      meses_vencimento: dadosStepper?.meses_vencimento || dados?.meses_vencimento || '',
      prazo_utilizacao: dadosStepper?.prazo_utilizacao || dados?.prazo_utilizacao || '',
      taxa_imposto_selo: dadosStepper?.taxa_imposto_selo || dados?.taxa_imposto_selo || 3.5,
      taxa_juro_desconto: dadosStepper?.taxa_juro_desconto || dados?.taxa_juro_desconto || 0,
      taxa_juro_precario: dadosStepper?.taxa_juro_precario || dados?.taxa_juro_precario || 11,
      taxa_comissao_abertura: dadosStepper?.taxa_comissao_abertura || dados?.taxa_comissao_abertura || 1.75,
      taxa_comissao_imobilizacao: dados?.taxa_comissao_imobilizacao || dados?.taxa_comissao_imobilizacao || 0,
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Title title="Condições & Taxas" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="numero_prestacao" label="Nº de prestação" tipo="meses" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="meses_vencimento" label="Meses de vencimento" tipo="meses" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="prazo_utilizacao" label="Prazo de utilização" tipo="meses" />
          </GridItem>
          <GridItem sm={6} md={4} children={<RHFNumberField name="taxa_taeg" label="Taxa TAEG" tipo="%" />} />
          <GridItem sm={6} md={4}>
            <RHFNumberField name="taxa_imposto_selo" label="Taxa de imposto selo" tipo="%" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="taxa_juro_precario" label="Taxa de juros precário" tipo="%" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="taxa_juro_desconto" label="Taxa de juros desconto" tipo="%" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="taxa_comissao_abertura" label="Taxa de comissão abertura" tipo="%" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="taxa_comissao_imobilizacao" label="Taxa de comissão imobilização" tipo="%" />
          </GridItem>
        </Grid>
        <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Custos({ dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    // custo_total: Yup.number().min(0).required().label('Custo total'),
    valor_juro: Yup.number().min(0).required().label('Valor de juros'),
    valor_comissao: Yup.number().min(0).required().label('Valor de comissão'),
    valor_prestacao: Yup.number().positive().required().label('Valor de prestação'),
    valor_imposto_selo: Yup.number().positive().required().label('Valor de imposto selo'),
    valor_prestacao_sem_desconto: Yup.number().positive().required().label('Valor prestação s/ desconto'),
  });

  const defaultValues = useMemo(
    () => ({
      custo_total: 0,
      // custo_total: dados?.custo_total || dados?.custo_total || 0,
      valor_juro: dadosStepper?.valor_juro || dados?.valor_juro || 0,
      valor_comissao: dadosStepper?.valor_comissao || dados?.valor_comissao || 0,
      valor_prestacao: dadosStepper?.valor_prestacao || dados?.valor_prestacao || '',
      valor_imposto_selo: dadosStepper?.valor_imposto_selo || dados?.valor_imposto_selo || 0,
      valor_prestacao_sem_desconto:
        dadosStepper?.valor_prestacao_sem_desconto || dados?.valor_prestacao_sem_desconto || '',
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Title title="Custos & Calcúlos" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="valor_prestacao" label="Valor de prestação" tipo="CVE" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="valor_prestacao_sem_desconto" label="Valor prestação s/ desconto" tipo="CVE" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField name="valor_comissao" label="Valor de comissão" tipo="CVE" />
          </GridItem>
          <GridItem sm={6} md={4} children={<RHFNumberField name="valor_juro" label="Valor de juros" tipo="CVE" />} />
          <GridItem sm={6} md={4}>
            <RHFNumberField name="valor_imposto_selo" label="Valor de imposto selo" tipo="CVE" />
          </GridItem>
          <GridItem sm={6} md={4}>
            <RHFNumberField disabled name="custo_total" label="Custo total" tipo="CVE" />
          </GridItem>
        </Grid>
        <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Imovel({ dados }) {
  const dispatch = useDispatch();
  const { tiposImoveis } = useSelector((state) => state.gaji9);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const imoveisList = useMemo(() => tiposImoveis.map((i) => ({ id: i?.id, label: i?.tipo })), [tiposImoveis]);

  useEffect(() => {
    dispatch(getFromGaji9('tiposImoveis'));
  }, [dispatch]);

  const defaultValues = useMemo(
    () => ({
      tipo_imovel_id: dados?.tipo_imovel_id || imoveisList?.find((i) => i.id === dadosStepper?.tipo_imovel_id) || null,
      bem_servico_financiado: dadosStepper?.bem_servico_financiado || dados?.bem_servico_financiado || '',
    }),
    [dadosStepper, imoveisList, dados]
  );

  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Title title="Imóvel / Bem Financiado" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <GridItem sm={6}>
            <RHFAutocompleteObj name="tipo_imovel_id" label="Tipo de imóvel" options={imoveisList} />
          </GridItem>
          <GridItem sm={6}>
            <RHFNumberField name="bem_servico_financiado" label="Bem/Serviço financiado" />
          </GridItem>
        </Grid>
        <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Entidade({ dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const defaultValues = useMemo(
    () => ({
      nome_empresa_fornecedora: dados?.nome_empresa_fornecedora || dados?.nome_empresa_fornecedora || '',
      nib_vendedor_ou_fornecedor: dadosStepper?.nib_vendedor_ou_fornecedor || dados?.nib_vendedor_ou_fornecedor || '',
      instituicao_credito_conta_vendedor_ou_fornecedor:
        dadosStepper?.instituicao_credito_conta_vendedor_ou_fornecedor ||
        dados?.instituicao_credito_conta_vendedor_ou_fornecedor ||
        '',
      valor_transferir_conta_vendedor_ou_fornecedor:
        dadosStepper?.valor_transferir_conta_vendedor_ou_fornecedor ||
        dados?.valor_transferir_conta_vendedor_ou_fornecedor ||
        '',
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Title title="Entidade Vendedora / Fornecedora" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <GridItem sm={6}>
            <RHFTextField name="nome_empresa_fornecedora" label="Nome da empresa fornecedora" />
          </GridItem>
          <GridItem sm={6}>
            <RHFNumberField name="nib_vendedor_ou_fornecedor" label="NIB vendedor/fornecedor" noFormat />
          </GridItem>
          <GridItem sm={6}>
            <RHFTextField
              label="Instituição de crédito da conta"
              name="instituicao_credito_conta_vendedor_ou_fornecedor"
            />
          </GridItem>
          <GridItem sm={6}>
            <RHFNumberField
              tipo="CVE"
              label="Valor a transferir"
              name="valor_transferir_conta_vendedor_ou_fornecedor"
            />
          </GridItem>
        </Grid>
        <ButtonsStepper onClose={() => dispatch(updateDados({ backward: true, dados: values }))} />
      </FormProvider>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Resumo({ onClose, ids }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const handleSubmit = async () => {
    const formData = {
      ...dadosStepper,
      tipo_imovel_id: dadosStepper?.tipo_imovel_id?.id,
      data_vencimento_prestacao1: formatDate(dadosStepper?.data_vencimento_prestacao1, 'yyyy-MM-dd'),
      bem_servico_financiado: dadosStepper?.tipo_imovel_id?.id ? (dadosStepper?.bem_servico_financiado ?? '') : '',
    };
    const params = { ...ids, msg: 'Informações atualizadas', fillCredito: true };
    dispatch(updateItem('metadados-credito', JSON.stringify(formData), { ...params, onClose }));
  };

  return (
    <>
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        <MetadadosCredito dados={dadosStepper} action={(step) => dispatch(gotoStep(step))} />
      </DialogContent>
      <CardActions sx={{ p: 3, pt: 0 }}>
        <ButtonsStepper
          label="Guardar"
          isSaving={isSaving}
          handleSubmit={handleSubmit}
          onClose={() => dispatch(backStep())}
        />
      </CardActions>
    </>
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
