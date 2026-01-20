import * as Yup from 'yup';
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
import { formatDate, fillData } from '../../../../utils/formatTime';
// redux
import { getFromGaji9 } from '../../../../redux/slices/gaji9';
import { updateItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { updateDados, resetDados, backStep } from '../../../../redux/slices/stepper';
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
import { DialogTitleAlt } from '../../../../components/CustomDialog';
import { shapeText } from '../../../../components/hook-form/yup-shape';

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
            steps={['Regime', 'Condicões', 'Taxas', 'Objeto', 'Entidade']}
          />
        }
      />
      <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
        {activeStep === 0 && <RegimeEspecial onClose={onClose1} dados={dados} />}
        {activeStep === 1 && <Condicoes dados={dados} />}
        {activeStep === 2 && <Taxas dados={dados} />}
        {activeStep === 3 && <Objeto dados={dados} />}
        {activeStep === 4 && <Entidade onClose={onClose1} ids={ids} dados={dados} />}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function RegimeEspecial({ onClose, dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    nivel_formacao: shapeText('Nível de formação', true, '', 'credibolsa'),
    designacao_curso: shapeText('Designação do curso', true, '', 'credibolsa'),
    localizacao_estabelecimento_ensino: shapeText('Localização', true, '', 'credibolsa'),
    estabelecimento_ensino: shapeText('Estabelecimento de ensino', true, '', 'credibolsa'),
    montante_tranches_credibolsa: shapeText('Montante das tranches', true, '', 'credibolsa'),
  });

  const defaultValues = useMemo(
    () => ({
      revolving: dadosStepper?.revolving || dados?.revolving || false,
      bonificado: dadosStepper?.bonificado || dados?.bonificado || false,
      jovem_bonificado: dadosStepper?.jovem_bonificado || dados?.jovem_bonificado || false,
      credibolsa: dadosStepper?.credibolsa || Number(dados?.montante_tranches_credibolsa) > 0,
      colaborador_empresa_parceira:
        dadosStepper?.colaborador_empresa_parceira || dados?.colaborador_empresa_parceira || false,
      //
      nivel_formacao: dadosStepper?.nivel_formacao || dados?.nivel_formacao || '',
      designacao_curso: dadosStepper?.designacao_curso || dados?.designacao_curso || '',
      estabelecimento_ensino: dadosStepper?.estabelecimento_ensino || dados?.estabelecimento_ensino || '',
      montante_tranches_credibolsa:
        dadosStepper?.montante_tranches_credibolsa || dados?.montante_tranches_credibolsa || '',
      localizacao_estabelecimento_ensino:
        dados?.localizacao_estabelecimento_ensino || dados?.localizacao_estabelecimento_ensino || '',
      //
      isento_comissao: dadosStepper?.isento_comissao || dados?.isento_comissao || false,
      tem_isencao_imposto_selo: dadosStepper?.tem_isencao_imposto_selo || dados?.tem_isencao_imposto_selo || false,
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <>
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
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Condicoes({ dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    data_vencimento_prestacao1: Yup.date().required().label('Data 1ª prestação'),
    numero_prestacao: Yup.number().positive().integer().required().label('Nº de prestações'),
  });

  const defaultValues = useMemo(
    () => ({
      conta_do_renda: dadosStepper?.conta_do_renda || dados?.conta_do_renda || '',
      periodo_carencia: dadosStepper?.periodo_carencia || dados?.periodo_carencia || '',
      meses_vencimento: dadosStepper?.meses_vencimento || dados?.meses_vencimento || '',
      prazo_utilizacao: dadosStepper?.prazo_utilizacao || dados?.prazo_utilizacao || '',
      data_utilizacao: dadosStepper?.data_utilizacao || fillData(dados?.data_utilizacao, null),
      numero_prestacao: dadosStepper?.numero_prestacao || dados?.numero_prestacao || dados?.prazo || '',
      capital_max_isento_imposto_selo:
        dadosStepper?.capital_max_isento_imposto_selo || dados?.capital_max_isento_imposto_selo || '',
      data_vencimento_prestacao1:
        dadosStepper?.data_vencimento_prestacao1 || fillData(dados?.data_vencimento_prestacao1, null),
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <>
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
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Taxas({ dados }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);

  const formSchema = Yup.object().shape({
    taxa_juro_desconto: Yup.number().min(0).max(100).required().label('Taxa de juros desconto'),
    taxa_imposto_selo: Yup.number().positive().max(100).required().label('Taxa de imposto selo'),
    taxa_juro_precario: Yup.number().positive().max(100).required().label('Taxa de juros precário'),
    taxa_comissao_abertura: Yup.number().min(0).max(100).required().label('Taxa de comissão abertura'),
    taxa_comissao_imobilizacao: Yup.number().min(0).max(100).required().label('Taxa de comissão imobilização'),
    taxa_imposto_selo_utilizacao: Yup.number().min(0).max(100).required().label('Taxa imp. selo utilização'),
  });

  const defaultValues = useMemo(
    () => ({
      taxa_tan: dadosStepper?.taxa_tan || dados?.taxa_tan || '',
      taxa_imposto_selo: dadosStepper?.taxa_imposto_selo || dados?.taxa_imposto_selo || 3.5,
      taxa_juro_desconto: dadosStepper?.taxa_juro_desconto || dados?.taxa_juro_desconto || 0,
      taxa_juro_precario: dadosStepper?.taxa_juro_precario || dados?.taxa_juro_precario || 11,
      taxa_comissao_abertura: dadosStepper?.taxa_comissao_abertura || dados?.taxa_comissao_abertura || 1.75,
      taxa_comissao_imobilizacao: dadosStepper?.taxa_comissao_imobilizacao || dados?.taxa_comissao_imobilizacao || 0,
      taxa_imposto_selo_utilizacao:
        dadosStepper?.taxa_imposto_selo_utilizacao || dados?.taxa_imposto_selo_utilizacao || 0.5,
    }),
    [dadosStepper, dados]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
      >
        <Title title="Taxas" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <GridItem xs={6} md={3}>
            <RHFNumberField name="taxa_tan" label="TAN" tipo="%" />
          </GridItem>
          <GridItem xs={6} md={3}>
            <RHFNumberField name="taxa_imposto_selo" label="Taxa de imposto selo" tipo="%" />
          </GridItem>
          <GridItem xs={6} md={3}>
            <RHFNumberField name="taxa_juro_precario" label="Taxa juros precário" tipo="%" />
          </GridItem>
          <GridItem xs={6} md={3}>
            <RHFNumberField name="taxa_juro_desconto" label="Taxa juros desconto" tipo="%" />
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
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Objeto({ dados }) {
  const dispatch = useDispatch();
  const { tiposImoveis } = useSelector((state) => state.gaji9);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const imoveisList = useMemo(() => tiposImoveis.map((i) => ({ id: i?.id, label: i?.tipo })), [tiposImoveis]);

  useEffect(() => {
    dispatch(getFromGaji9('tiposImoveis'));
  }, [dispatch]);

  const defaultValues = useMemo(
    () => ({
      bem_servico_financiado: dadosStepper?.bem_servico_financiado || dados?.bem_servico_financiado || '',
      tipo_imovel_id: dadosStepper?.tipo_imovel_id || imoveisList?.find((i) => i.id === dados?.tipo_imovel_id) || null,
      finalidade_credito_habitacao:
        dadosStepper?.finalidade_credito_habitacao || dados?.finalidade_credito_habitacao || '',
    }),
    [dadosStepper, imoveisList, dados]
  );

  const methods = useForm({ defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <>
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
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Entidade({ dados, ids, onClose }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(
    () => ({
      nome_empresa_fornecedora: dadosStepper?.nome_empresa_fornecedora || dados?.nome_empresa_fornecedora || '',
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
  const { handleSubmit } = methods;

  // const onSubmit = async (values) => {
  //   try {
  //     const rawData = { ...dadosStepper, ...values };

  //     const dataFormatted = {
  //       taxa_imposto_selo: String(rawData.taxa_imposto_selo || '0'),
  //       taxa_juro_precario: String(rawData.taxa_juro_precario || '0'),
  //       taxa_comissao_abertura: String(rawData.taxa_comissao_abertura || '0'),
  //       taxa_imposto_selo_utilizacao: String(rawData.taxa_imposto_selo_utilizacao || '0'),

  //       tipo_imovel_id: rawData.tipo_imovel_id?.id || rawData.tipo_imovel_id || undefined,
  //       conta_do_renda: rawData.conta_do_renda ? Number(rawData.conta_do_renda) : undefined,
  //       meses_vencimento: rawData.meses_vencimento ? Number(rawData.meses_vencimento) : undefined,
  //       numero_prestacao: rawData.numero_prestacao ? Number(rawData.numero_prestacao) : undefined,
  //       periodo_carencia: rawData.periodo_carencia ? Number(rawData.periodo_carencia) : undefined,
  //       prazo_utilizacao: rawData.prazo_utilizacao ? Number(rawData.prazo_utilizacao) : undefined,

  //       taxa_tan: rawData.taxa_tan ? String(rawData.taxa_tan) : undefined,
  //       taxa_taeg: rawData.taxa_taeg ? String(rawData.taxa_taeg) : undefined,
  //       taxa_juro_desconto: rawData.taxa_juro_desconto ? String(rawData.taxa_juro_desconto) : undefined,
  //       capital_max_isento_imposto_selo: rawData.capital_max_isento_imposto_selo
  //         ? String(rawData.capital_max_isento_imposto_selo)
  //         : undefined,
  //       nivel_formacao: rawData.nivel_formacao || undefined,
  //       designacao_curso: rawData.designacao_curso || undefined,
  //       estabelecimento_ensino: rawData.estabelecimento_ensino || undefined,
  //       localizacao_estabelecimento_ensino: rawData.localizacao_estabelecimento_ensino || undefined,
  //       bem_servico_financiado: rawData.bem_servico_financiado || undefined,
  //       nome_empresa_fornecedora: rawData.nome_empresa_fornecedora || undefined,
  //       nib_vendedor_ou_fornecedor: rawData.nib_vendedor_ou_fornecedor || undefined,
  //       finalidade_credito_habitacao: rawData.finalidade_credito_habitacao || undefined,
  //       instituicao_credito_conta_vendedor_ou_fornecedor:
  //         rawData.instituicao_credito_conta_vendedor_ou_fornecedor || undefined,
  //       montante_tranches_credibolsa: rawData.montante_tranches_credibolsa
  //         ? String(rawData.montante_tranches_credibolsa)
  //         : undefined,
  //       valor_transferir_conta_vendedor_ou_fornecedor: rawData.valor_transferir_conta_vendedor_ou_fornecedor
  //         ? String(rawData.valor_transferir_conta_vendedor_ou_fornecedor)
  //         : undefined,

  //       data_vencimento_prestacao1: rawData.data_vencimento_prestacao1
  //         ? formatDate(rawData.data_vencimento_prestacao1, 'yyyy-MM-dd')
  //         : undefined,
  //       data_utilizacao: rawData.data_utilizacao ? formatDate(rawData.data_utilizacao, 'yyyy-MM-dd') : undefined,

  //       revolving: rawData.revolving,
  //       bonificado: rawData.bonificado,
  //       isento_comissao: rawData.isento_comissao,
  //       jovem_bonificado: rawData.jovem_bonificado,
  //       tem_isencao_imposto_selo: rawData.tem_isencao_imposto_selo,
  //       colaborador_empresa_parceira: rawData.colaborador_empresa_parceira,
  //     };

  //     const payload = Object.fromEntries(
  //       // eslint-disable-next-line no-unused-vars
  //       Object.entries(dataFormatted).filter(([_, value]) => value !== undefined && value !== '')
  //     );

  //     const params = { ...ids, msg: 'Informações atualizadas', fillCredito: true };
  //     dispatch(updateItem('metadados-credito', JSON.stringify(payload), { ...params, onClose }));
  //   } catch (error) {
  //     console.error('Erro no envio dos dados:', error);
  //   }
  // };

  const onSubmit = async (values) => {
    try {
      const rawData = { ...dadosStepper, ...values };

      const dataFormatted = {
        taxa_taeg: '0',
        valor_juro: '0',
        custo_total: '0',
        valor_comissao: '0',
        valor_prestacao: '0',
        valor_imposto_selo: '0',
        valor_prestacao_sem_desconto: '0',

        numero_prestacao: Number(rawData.numero_prestacao || 0),
        conta_do_renda: rawData.conta_do_renda ? Number(rawData.conta_do_renda) : undefined,
        meses_vencimento: rawData.meses_vencimento ? Number(rawData.meses_vencimento) : undefined,
        periodo_carencia: rawData.periodo_carencia ? Number(rawData.periodo_carencia) : undefined,
        prazo_utilizacao: rawData.prazo_utilizacao ? Number(rawData.prazo_utilizacao) : undefined,
        tipo_imovel_id: rawData.tipo_imovel_id?.id ? Number(rawData.tipo_imovel_id?.id) : undefined,

        taxa_imposto_selo: String(rawData.taxa_imposto_selo || '0'),
        taxa_juro_precario: String(rawData.taxa_juro_precario || '0'),
        taxa_juro_desconto: String(rawData.taxa_juro_desconto || '0'),
        taxa_comissao_abertura: String(rawData.taxa_comissao_abertura || '0'),
        taxa_tan: rawData.taxa_tan ? String(rawData.taxa_tan?.replace(',', '.') || '0') : undefined,
        taxa_imposto_selo_utilizacao: String(rawData.taxa_imposto_selo_utilizacao || '0'),
        taxa_comissao_imobilizacao: rawData.taxa_comissao_imobilizacao
          ? String(rawData.taxa_comissao_imobilizacao)
          : undefined,

        capital_max_isento_imposto_selo: rawData.capital_max_isento_imposto_selo
          ? String(rawData.capital_max_isento_imposto_selo)
          : undefined,
        valor_transferir_conta_vendedor_ou_fornecedor: rawData.valor_transferir_conta_vendedor_ou_fornecedor
          ? String(rawData.valor_transferir_conta_vendedor_ou_fornecedor)
          : undefined,

        revolving: Boolean(rawData.revolving),
        bonificado: Boolean(rawData.bonificado),
        isento_comissao: Boolean(rawData.isento_comissao),
        jovem_bonificado: Boolean(rawData.jovem_bonificado),
        tem_isencao_imposto_selo: Boolean(rawData.tem_isencao_imposto_selo),
        colaborador_empresa_parceira: Boolean(rawData.colaborador_empresa_parceira),

        data_vencimento_prestacao1: rawData.data_vencimento_prestacao1
          ? formatDate(rawData.data_vencimento_prestacao1, 'yyyy-MM-dd')
          : '',
        data_utilizacao: rawData.data_utilizacao ? formatDate(rawData.data_utilizacao, 'yyyy-MM-dd') : '',

        bem_servico_financiado: String(rawData.bem_servico_financiado || ''),
        nome_empresa_fornecedora: String(rawData.nome_empresa_fornecedora || ''),
        nib_vendedor_ou_fornecedor: String(rawData.nib_vendedor_ou_fornecedor || ''),
        finalidade_credito_habitacao: String(rawData.finalidade_credito_habitacao || ''),
        instituicao_credito_conta_vendedor_ou_fornecedor: String(
          rawData.instituicao_credito_conta_vendedor_ou_fornecedor || ''
        ),

        nivel_formacao: rawData?.credibolsa ? String(rawData.nivel_formacao) : '',
        designacao_curso: rawData?.credibolsa ? String(rawData.designacao_curso) : '',
        estabelecimento_ensino: rawData?.credibolsa ? String(rawData.estabelecimento_ensino) : '',
        localizacao_estabelecimento_ensino: rawData?.credibolsa ? rawData.localizacao_estabelecimento_ensino : '',
        montante_tranches_credibolsa: rawData?.credibolsa ? String(rawData.montante_tranches_credibolsa) : undefined,
      };

      const payload = Object.fromEntries(
        Object.entries(dataFormatted).filter(([, value]) => value !== undefined && value !== '')
      );

      const params = { ...ids, msg: 'Informações atualizadas', fillCredito: true };
      dispatch(updateItem('metadados-credito', JSON.stringify(payload), { ...params, onClose }));
    } catch (error) {
      console.error('Erro ao processar dados para o backend:', error);
    }
  };

  return (
    <>
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
            <RHFNumberField
              tipo="CVE"
              label="Valor a transferir"
              name="valor_transferir_conta_vendedor_ou_fornecedor"
            />
          </GridItem>
        </Grid>
        <ButtonsStepper label="Guardar" isSaving={isSaving} onClose={() => dispatch(backStep())} />
      </FormProvider>
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
