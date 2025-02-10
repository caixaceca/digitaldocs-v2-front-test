import * as Yup from 'yup';
import { add } from 'date-fns';
import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate } from '../../utils/formatTime';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { updateDados, resetDados } from '../../redux/slices/stepper';
import { getFromGaji9, getDocumento, createItem, updateItem } from '../../redux/slices/gaji9';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import Steps from '../../components/Steps';
import GridItem from '../../components/GridItem';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons, ButtonsStepper } from '../../components/Actions';
//
import { listaTitrulares, listaGarantias, listaProdutos } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

CreditForm.propTypes = { dados: PropTypes.object, onCancel: PropTypes.func, isEdit: PropTypes.bool };

export default function CreditForm({ dados = null, onCancel, isEdit = false }) {
  const dispatch = useDispatch();
  const { dadosStepper, activeStep } = useSelector((state) => state.stepper);
  const { componentes, tiposTitulares } = useSelector((state) => state.gaji9);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);

  const onClose = () => {
    onCancel();
    dispatch(resetDados());
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        title={isEdit ? 'Atualizar crédito' : 'Adicionar crédito'}
        subtitle={
          <Steps activeStep={activeStep} steps={['Cliente', 'Crédito', 'Taxas & Custos', 'Garantias']} sx={{ mt: 3 }} />
        }
      />
      <DialogContent>
        {activeStep === 0 && (
          <Cliente
            onCancel={onClose}
            dispatch={dispatch}
            titularesList={titularesList}
            dados={{
              cliente: dadosStepper?.cliente || dados?.cliente || '',
              conta_do: dadosStepper?.conta_do || dados?.conta_do || '',
              morada_cliente: dadosStepper?.morada_cliente || dados?.morada_cliente || '',
              tipo_titular_id:
                dadosStepper?.tipo_titular_id ||
                (dados?.tipo_titular_id && titularesList?.find(({ id }) => id === dados?.tipo_titular_id)) ||
                null,
              morada_eletronico_cliente:
                dadosStepper?.morada_eletronico_cliente || dados?.morada_eletronico_cliente || '',
            }}
          />
        )}
        {activeStep === 1 && (
          <Credito
            dispatch={dispatch}
            componentesList={componentesList}
            dados={{
              moeda: dadosStepper?.moeda || dados?.moeda || '',
              montante: dadosStepper?.montante || dados?.montante || '',
              finalidade: dadosStepper?.finalidade || dados?.finalidade || '',
              componente_id:
                dadosStepper?.componente_id ||
                (dados?.componente_id && componentesList?.find(({ id }) => id === dados?.componente_id)) ||
                null,
              numero_proposta: dadosStepper?.numero_proposta || dados?.numero_proposta || '',
              processo_origem: dadosStepper?.processo_origem || dados?.processo_origem || '',
              meses_vencimento: dadosStepper?.meses_vencimento || dados?.meses_vencimento || '',
              prazo_contratual: dadosStepper?.prazo_contratual || dados?.prazo_contratual || '',
              numero_prestacao: dadosStepper?.numero_prestacao || dados?.numero_prestacao || '',
              aplicacao_origem: dadosStepper?.aplicacao_origem || dados?.aplicacao_origem || null,
              valor_premio_seguro: dadosStepper?.valor_premio_seguro || dados?.valor_premio_seguro || '',
              data_vencimento_prestacao1:
                dadosStepper?.data_vencimento_prestacao1 ||
                (dados?.data_vencimento_prestacao1 && add(new Date(dados?.data_vencimento_prestacao1), { hours: 2 })) ||
                null,
            }}
          />
        )}
        {activeStep === 2 && (
          <Taxas
            dispatch={dispatch}
            dados={{
              taeg: dadosStepper?.taeg || dados?.taeg || '',
              valor_juro: dadosStepper?.valor_juro || dados?.valor_juro || '',
              custo_total: dadosStepper?.custo_total || dados?.custo_total || '',
              valor_comissao: dadosStepper?.valor_comissao || dados?.valor_comissao || '',
              valor_prestacao: dadosStepper?.valor_prestacao || dados?.valor_prestacao || '',
              valor_prestacao1: dadosStepper?.valor_prestacao1 || dados?.valor_prestacao1 || '',
              comissao_abertura: dadosStepper?.comissao_abertura || dados?.comissao_abertura || '',
              valor_imposto_selo: dadosStepper?.valor_imposto_selo || dados?.valor_imposto_selo || '',
              taxa_juro_precario: dadosStepper?.taxa_juro_precario || dados?.taxa_juro_precario || '',
              taxa_juro_desconto: dadosStepper?.taxa_juro_desconto || dados?.taxa_Juro_desconto || '',
              taxa_juro_negociado: dadosStepper?.taxa_juro_negociado || dados?.taxa_juro_negociado || '',
            }}
          />
        )}
        {activeStep === 3 && <Garantias isEdit={isEdit} id={dados?.id} onCancel={onCancel} />}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------

Cliente.propTypes = {
  dados: PropTypes.object,
  dispatch: PropTypes.func,
  onCancel: PropTypes.func,
  titularesList: PropTypes.array,
};

function Cliente({ dados, onCancel, dispatch, titularesList = [] }) {
  const formSchema = Yup.object().shape({
    tipo_titular_id: Yup.mixed().required().label('Titular'),
    morada_cliente: Yup.string().required().label('Endereço'),
    conta_do: Yup.number().min(0).required().label('Conta Do'),
    cliente: Yup.number().min(0).required().label('Nº de cliente'),
    morada_eletronico_cliente: Yup.string().email().required().label('Email'),
  });

  const defaultValues = useMemo(() => dados, [dados]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Grid container spacing={3} sx={{ pt: 1 }}>
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Nº de cliente" name="cliente" />} />
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Conta DO" name="conta_do" />} />
        <GridItem
          sm={4}
          children={
            <RHFAutocompleteObj
              disableClearable
              name="tipo_titular_id"
              label="Tipo de titular"
              options={titularesList}
            />
          }
        />
        <GridItem children={<RHFTextField name="morada_eletronico_cliente" label="Email" />} />
        <GridItem children={<RHFTextField name="morada_cliente" label="Endereço" />} />
      </Grid>
      <ButtonsStepper onCancel={onCancel} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ----------------------------------------------------------

Credito.propTypes = { dados: PropTypes.object, dispatch: PropTypes.func, componentesList: PropTypes.array };

function Credito({ dados, dispatch, componentesList = [] }) {
  const formSchema = Yup.object().shape({
    moeda: Yup.string().required().label('Moeda'),
    finalidade: Yup.string().required().label('Finalidade'),
    componente_id: Yup.mixed().required().label('Componente'),
    montante: Yup.number().min(0).required().label('Montante'),
    aplicacao_origem: Yup.mixed().required().label('Aplicação de origem'),
    numero_proposta: Yup.number().min(0).required().label('Nº de proposta'),
    numero_prestacao: Yup.number().min(0).required().label('Nº de prestação'),
    prazo_contratual: Yup.number().min(0).required().label('Praso contratual'),
    valor_premio_seguro: Yup.number().min(0).required().label('Prêmio do seguro'),
    data_vencimento_prestacao1: Yup.date().typeError().required().label('Venc. 1ª prestação'),
  });

  const defaultValues = useMemo(() => dados, [dados]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Grid container spacing={3} sx={{ pt: 1 }}>
        <GridItem children={<RHFAutocompleteObj name="componente_id" label="Componente" options={componentesList} />} />
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Montante" name="montante" />} />
        <GridItem xs={6} sm={2} children={<RHFTextField label="Moeda" name="moeda" />} />
        <GridItem sm={6} children={<RHFTextField name="finalidade" label="Finalidade" />} />
        <GridItem xs={6} md={3} children={<RHFNumberField label="Prêmio do seguro" name="valor_premio_seguro" />} />
        <GridItem xs={6} md={3} children={<RHFNumberField label="Nº de prestação" name="numero_prestacao" />} />
        <GridItem xs={6} md={3} children={<RHFNumberField label="Prazo contratual" name="prazo_contratual" />} />
        <GridItem
          xs={6}
          md={3}
          children={<RHFDatePicker name="data_vencimento_prestacao1" label="Venc. 1ª prestação" />}
        />
        <GridItem xs={6} md={3} children={<RHFNumberField label="Meses de vencimento" name="meses_vencimento" />} />
        <GridItem xs={6} md={3} children={<RHFNumberField label="Nº de proposta" name="numero_proposta" />} />
        <GridItem xs={6} md={3} children={<RHFNumberField label="Processo de origem" name="processo_origem" />} />
        <GridItem
          xs={6}
          md={3}
          children={
            <RHFAutocompleteSmp label="Aplicação de origem" name="aplicacao_origem" options={['DDOCS', 'CREDIBOX']} />
          }
        />
      </Grid>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ----------------------------------------------------------

Taxas.propTypes = { dados: PropTypes.object, dispatch: PropTypes.func };

function Taxas({ dados, dispatch }) {
  const formSchema = Yup.object().shape({
    taeg: Yup.number().min(0).required().label('TAEG'),
    valor_comissao: Yup.number().min(0).required().label('Comissão'),
    custo_total: Yup.number().min(0).required().label('Custo total'),
    valor_juro: Yup.number().min(0).required().label('Valor do juro'),
    valor_prestacao: Yup.number().min(0).required().label('Valor da prestação'),
    valor_imposto_selo: Yup.number().min(0).required().label('Imposto de selo'),
    taxa_juro_precario: Yup.number().min(0).required().label('Taxa juro precário'),
    taxa_juro_desconto: Yup.number().min(0).required().label('Taxa juro desconto'),
    comissao_abertura: Yup.number().min(0).required().label('Comissão de abertura'),
    valor_prestacao1: Yup.number().min(0).required().label('Valor da 1ª prestação'),
    taxa_juro_negociado: Yup.number().min(0).required().label('Taxa juro negociado'),
  });

  const defaultValues = useMemo(() => dados, [dados]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(() => dispatch(updateDados({ forward: true, dados: values })))}
    >
      <Grid container spacing={3} sx={{ pt: 1 }}>
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Taxa juro negociado" name="taxa_juro_negociado" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Taxa juro precário" name="taxa_juro_precario" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Taxa juro desconto" name="taxa_juro_desconto" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="TAEG" name="taeg" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Comissão" name="valor_comissao" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Comissão de abertura" name="comissao_abertura" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Imposto selo" name="valor_imposto_selo" />} />
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Valor do juro" name="valor_juro" />} />
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Custo total" name="custo_total" />} />
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Valor da prestação" name="valor_prestacao" />} />
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Valor da 1ª prestação" name="valor_prestacao1" />} />
      </Grid>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ----------------------------------------------------------

Garantias.propTypes = { isEdit: PropTypes.bool, id: PropTypes.number, onCancel: PropTypes.func };

function Garantias({ isEdit, id = 0, onCancel }) {
  const dispatch = useDispatch();
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving, tiposGarantias } = useSelector((state) => state.gaji9);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);

  const formSchema = Yup.object().shape({
    garantias: Yup.array(Yup.object({ tipo_garantia_id: Yup.mixed().required().label('Garantia') })),
  });

  const defaultValues = useMemo(() => ({ garantias: dadosStepper?.garantias || [] }), [dadosStepper]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const params = useMemo(
    () => ({
      id,
      msg: `Crédito ${isEdit ? 'atualizado' : 'adicionado'}`,
      afterSuccess: () => {
        onCancel();
        dispatch(resetDados());
      },
    }),
    [dispatch, isEdit, onCancel, id]
  );

  const onSubmit = async () => {
    const formData = {
      ...dadosStepper,
      componente_id: dadosStepper?.componente_id?.id,
      tipo_titular_id: dadosStepper?.tipo_titular_id?.id,
      data_vencimento_prestacao1: formatDate(dadosStepper?.data_vencimento_prestacao1, 'yyyy-MM-dd'),
      ...(values?.garantias?.length > 0
        ? { garantias: values?.garantias?.map((row) => ({ ...row, tipo_garantia_id: row?.tipo_garantia_id?.id })) }
        : {}),
    };
    if (isEdit) {
      dispatch(updateItem('credito', JSON.stringify(formData), params));
    } else {
      dispatch(createItem('credito', JSON.stringify(formData), params));
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {fields?.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', fontStyle: 'italic', p: 3, bgcolor: 'background.neutral', borderRadius: 1 }}
          >
            Ainda não foi adicionada nenhuma garantia...
          </Typography>
        ) : (
          <Stack spacing={3} sx={{ pt: 1 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <Stack sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                    <GridItem md={4}>
                      <RHFAutocompleteObj
                        label="Garantia"
                        options={garantiasList}
                        name={`garantias[${index}].tipo_garantia_id`}
                      />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFNumberField label="Valor da garantia" name={`garantias[${index}].valor_garantia`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFNumberField label="Conta DP" name={`garantias[${index}].conta_dp`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFTextField label="Tipo imóvel" name={`garantias[${index}].tipo_imovel`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFTextField label="Nº registo predial" name={`garantias[${index}].num_registo_predial`} />
                    </GridItem>
                    <GridItem md={4}>
                      <RHFTextField label="Nº matriz predial" name={`garantias[${index}].num_matriz_predial`} />
                    </GridItem>
                    <GridItem md={6}>
                      <RHFTextField label="Conservatória" name={`garantias[${index}].conservatoria`} />
                    </GridItem>
                    <GridItem md={6}>
                      <RHFTextField label="Freguesia" name={`garantias[${index}].freguesia`} />
                    </GridItem>
                    <GridItem children={<RHFTextField label="Nota" name={`garantias[${index}].nota`} />} />
                  </Grid>
                </Stack>
                <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
              </Stack>
            ))}
          </Stack>
        )}

        <Stack direction="row" justifyContent="center">
          <DefaultAction
            small
            button
            label="Garantia"
            icon="adicionar"
            handleClick={() =>
              append({
                nota: '',
                conta_dp: '',
                freguesia: '',
                tipo_imovel: '',
                conservatoria: '',
                valor_garantia: '',
                tipo_garantia_id: null,
                num_matriz_predial: '',
                num_registo_predial: '',
              })
            }
          />
        </Stack>
      </Stack>
      <ButtonsStepper
        isSaving={isSaving}
        label={isEdit ? 'Guardar' : 'Adicionar'}
        onCancel={() => dispatch(updateDados({ backward: true, dados: values }))}
      />
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

FiadoresForm.propTypes = { id: PropTypes.number, onCancel: PropTypes.func };

export function FiadoresForm({ id, onCancel }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    fiadores: Yup.array(
      Yup.object({
        descricao: Yup.string().required().label('Descrição'),
        numero_ordem: Yup.number().min(0).required().label('Nº ordem'),
        numero_entidade: Yup.number().min(0).required().label('Nº de entidade'),
      })
    ),
  });

  const defaultValues = useMemo(() => ({ fiadores: [{ numero_entidade: '', numero_ordem: 1, designacao: '' }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'fiadores' });

  const params = useMemo(
    () => ({ id, item: 'credito', getSuccess: true, msg: 'Fiadores adicionados', afterSuccess: () => onCancel() }),
    [onCancel, id]
  );

  const onSubmit = async () => {
    dispatch(createItem('fiadores', JSON.stringify(values?.fiadores?.map((row) => row)), params));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar fiadores"
        action={
          <AddItem
            small
            label="Fiador"
            handleClick={() => append({ numero_entidade: '', numero_ordem: fields?.length + 1, designacao: '' })}
          />
        }
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={2}>
                    <RHFNumberField
                      label="Nº ordem"
                      sx={{ width: { xs: 200, sm: 90 } }}
                      name={`fiadores[${index}].numero_ordem`}
                    />
                    <RHFNumberField
                      label="Nº de entidade"
                      sx={{ width: { sm: 150 } }}
                      name={`fiadores[${index}].numero_entidade`}
                    />
                  </Stack>
                  <RHFTextField label="Descrição" name={`fiadores[${index}].descricao`} />
                </Stack>
                {fields?.length > 1 && (
                  <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                )}
              </Stack>
            ))}
          </Stack>
          <DialogButons isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PropostaForm.propTypes = { onCancel: PropTypes.func };

export function PropostaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ proposta: Yup.number().positive().integer().label('Nº de proposta') });
  const defaultValues = useMemo(() => ({ proposta: '', credibox: false }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(getFromGaji9('proposta', { ...values }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitleAlt sx={{ mb: 2 }} title="Carregar proposta" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="row" spacing={3} sx={{ pt: 1 }}>
            <RHFNumberField label="Nº de proposta" name="proposta" />
            <Stack>
              <RHFSwitch name="credibox" label="Credibox" />
            </Stack>
          </Stack>
          <DialogButons isSaving={isSaving} onCancel={onCancel} label="Carregar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PreviewForm.propTypes = { credito: PropTypes.object, onCancel: PropTypes.func };

export function PreviewForm({ credito, onCancel }) {
  const dispatch = useDispatch();
  const { isSaving, minutasPublicas } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ minuta: Yup.mixed().required().label('Minuta') });
  const defaultValues = useMemo(() => ({ minuta: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    dispatch(getFromGaji9('minutasPublicas'));
  }, [dispatch]);

  const onSubmit = async () => {
    dispatch(getDocumento('contrato', { creditoId: credito?.id, minutaId: values?.minuta?.id, item: 'previewFile' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitleAlt sx={{ mb: 2 }} title="Previsualizar contrato" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }}>
            <RHFAutocompleteObj
              name="minuta"
              label="Minuta"
              disableClearable
              options={minutasPublicas
                // ?.filter((row) => row?.componente_id === credito?.componente_id)
                ?.map(({ id, titulo, subtitulo }) => ({ id, label: `${titulo} - ${subtitulo}` }))}
            />
          </Stack>
          <DialogButons isSaving={isSaving} onCancel={onCancel} label="Previsualizar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
