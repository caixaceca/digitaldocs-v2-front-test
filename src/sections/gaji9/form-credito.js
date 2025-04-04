import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate, fillData } from '../../utils/formatTime';
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
import { SemDados } from '../../components/Panel';
import { shapeMixed } from '../../components/hook-form/yup-shape';
import { DialogTitleAlt, DialogConfirmar } from '../../components/CustomDialog';
import { DefaultAction, DialogButons, ButtonsStepper } from '../../components/Actions';
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
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onClose()}
        title={isEdit ? 'Atualizar crédito' : 'Adicionar crédito'}
        stepper={
          <Steps
            sx={{ mt: 3 }}
            activeStep={activeStep}
            steps={['Identificação', 'Crédito', 'Taxas & Custos', 'Garantias']}
          />
        }
      />
      <DialogContent>
        {activeStep === 0 && (
          <Identificacao
            onCancel={onClose}
            dispatch={dispatch}
            titularesList={titularesList}
            dados={{
              cliente: dadosStepper?.cliente || dados?.cliente || '',
              conta_do: dadosStepper?.conta_do || dados?.conta_do || '',
              conta_do_renda: dadosStepper?.conta_do_renda || dados?.conta_do_renda || '',
              numero_proposta: dadosStepper?.numero_proposta || dados?.numero_proposta || '',
              processo_origem: dadosStepper?.processo_origem || dados?.processo_origem || null,
              aplicacao_origem: dadosStepper?.aplicacao_origem || dados?.aplicacao_origem || null,
              tipo_titular_id:
                dadosStepper?.tipo_titular_id ||
                (dados?.tipo_titular_id && titularesList?.find(({ id }) => id === dados?.tipo_titular_id)) ||
                null,
            }}
          />
        )}
        {activeStep === 1 && (
          <Credito
            dispatch={dispatch}
            componentesList={componentesList}
            dados={{
              montante: dadosStepper?.montante || dados?.montante || '',
              finalidade: dadosStepper?.finalidade || dados?.finalidade || '',
              componente_id:
                dadosStepper?.componente_id ||
                (dados?.componente_id && componentesList?.find(({ id }) => id === dados?.componente_id)) ||
                null,
              meses_vencimento: dadosStepper?.meses_vencimento || dados?.meses_vencimento || '',
              prazo_contratual: dadosStepper?.prazo_contratual || dados?.prazo_contratual || '',
              numero_prestacao: dadosStepper?.numero_prestacao || dados?.numero_prestacao || '',
              valor_premio_seguro: dadosStepper?.valor_premio_seguro || dados?.valor_premio_seguro || null,
              data_vencimento_prestacao1:
                dadosStepper?.data_vencimento_prestacao1 || fillData(dados?.data_vencimento_prestacao1, null),
            }}
          />
        )}
        {activeStep === 2 && (
          <Taxas
            dispatch={dispatch}
            dados={{
              taxa_taeg: dadosStepper?.taxa_taeg || dados?.taxa_taeg || '',
              valor_juro: dadosStepper?.valor_juro || dados?.valor_juro || '',
              custo_total: dadosStepper?.custo_total || dados?.custo_total || '',
              valor_comissao: dadosStepper?.valor_comissao || dados?.valor_comissao || '',
              valor_prestacao: dadosStepper?.valor_prestacao || dados?.valor_prestacao || '',
              isento_comissao: dadosStepper?.isento_comissao || dados?.isento_comissao || false,
              valor_imposto_selo: dadosStepper?.valor_imposto_selo || dados?.valor_imposto_selo || '',
              taxa_juro_precario: dadosStepper?.taxa_juro_precario || dados?.taxa_juro_precario || '',
              taxa_juro_negociado: dadosStepper?.taxa_juro_negociado || dados?.taxa_juro_negociado || '',
              taxa_comissao_abertura: dadosStepper?.taxa_comissao_abertura || dados?.taxa_comissao_abertura || '',
              valor_prestacao_sem_desconto:
                dadosStepper?.valor_prestacao_sem_desconto || dados?.valor_prestacao_sem_desconto || '',
            }}
          />
        )}
        {activeStep === 3 && <Garantias isEdit={isEdit} dados={dados} onCancel={onCancel} />}
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------

Identificacao.propTypes = {
  dados: PropTypes.object,
  dispatch: PropTypes.func,
  onCancel: PropTypes.func,
  titularesList: PropTypes.array,
};

function Identificacao({ dados, onCancel, dispatch, titularesList = [] }) {
  const formSchema = Yup.object().shape({
    tipo_titular_id: Yup.mixed().required().label('Titular'),
    cliente: Yup.number().min(0).required().label('Nº de cliente'),
    conta_do: Yup.number().min(0).required().label('Conta DO crédito'),
    aplicacao_origem: Yup.mixed().required().label('Aplicação de origem'),
    conta_do_renda: Yup.number().min(0).required().label('Conta DO débito'),
    numero_proposta: Yup.number().min(0).required().label('Nº de proposta'),
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
        <GridItem xs={12} sm={4} children={<RHFNumberField noFormat label="Nº de cliente" name="cliente" />} />
        <GridItem xs={12} sm={4} children={<RHFNumberField noFormat label="Conta DO crédito" name="conta_do" />} />
        <GridItem xs={12} sm={4} children={<RHFNumberField noFormat label="Conta DO débito" name="conta_do_renda" />} />
        <GridItem xs={6} md={3}>
          <RHFAutocompleteObj dc name="tipo_titular_id" label="Tipo de titular" options={titularesList} />
        </GridItem>
        <GridItem xs={6} md={3} children={<RHFNumberField noFormat label="Nº de proposta" name="numero_proposta" />} />
        <GridItem xs={6} md={3}>
          <RHFAutocompleteSmp dc label="Aplicação de origem" name="aplicacao_origem" options={['DDOCS', 'CREDIBOX']} />
        </GridItem>
        <GridItem xs={6} md={3}>
          <RHFNumberField noFormat label="ID processo origem" name="processo_origem" />
        </GridItem>
      </Grid>
      <ButtonsStepper onCancel={onCancel} labelCancel="Cancelar" />
    </FormProvider>
  );
}

// ----------------------------------------------------------

Credito.propTypes = { dados: PropTypes.object, dispatch: PropTypes.func, componentesList: PropTypes.array };

function Credito({ dados, dispatch, componentesList = [] }) {
  const formSchema = Yup.object().shape({
    finalidade: Yup.string().required().label('Finalidade'),
    componente_id: Yup.mixed().required().label('Componente'),
    montante: Yup.number().min(0).required().label('Montante'),
    numero_prestacao: Yup.number().min(0).required().label('Nº de prestação'),
    prazo_contratual: Yup.number().min(0).required().label('Praso contratual'),
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
        <GridItem xs={6} md={4} children={<RHFNumberField label="Montante" name="montante" tipo="CVE" />} />
        <GridItem xs={6} md={4}>
          <RHFNumberField label="Prêmio do seguro" name="valor_premio_seguro" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFDatePicker name="data_vencimento_prestacao1" label="Venc. 1ª prestação" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField label="Nº de prestação" name="numero_prestacao" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField label="Prazo contratual" name="prazo_contratual" tipo="meses" />
        </GridItem>
        <GridItem xs={6} md={4}>
          <RHFNumberField label="Meses de vencimento" name="meses_vencimento" tipo="meses" />
        </GridItem>
        <GridItem children={<RHFTextField name="finalidade" label="Finalidade" />} />
      </Grid>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ----------------------------------------------------------

Taxas.propTypes = { dados: PropTypes.object, dispatch: PropTypes.func };

function Taxas({ dados, dispatch }) {
  const formSchema = Yup.object().shape({
    taxa_taeg: Yup.number().min(0).required().label('Taxa TAEG'),
    custo_total: Yup.number().min(0).required().label('Custo total TAEG'),
    valor_juro: Yup.number().min(0).required().label('Valor total de juros'),
    valor_prestacao: Yup.number().min(0).required().label('Valor da prestação'),
    taxa_juro_precario: Yup.number().min(0).required().label('Taxa juro precário'),
    valor_comissao: Yup.number().min(0).required().label('Valor total de comissões'),
    taxa_juro_negociado: Yup.number().min(0).required().label('Taxa juro negociado'),
    valor_imposto_selo: Yup.number().min(0).required().label('Valor total de imposto selo'),
    taxa_comissao_abertura: Yup.number().min(0).required().label('Taxa comissão de abertura'),
    valor_prestacao_sem_desconto: Yup.number().min(0).required().label('Valor prestação sem desconto'),
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
        <GridItem children={<RHFSwitch name="isento_comissao" label="Isento de comissão" />} />
        <GridItem xs={6} sm={3}>
          <RHFNumberField label="Taxa juro negociado" name="taxa_juro_negociado" tipo="%" />
        </GridItem>
        <GridItem xs={6} sm={3}>
          <RHFNumberField label="Taxa juro precário" name="taxa_juro_precario" tipo="%" />
        </GridItem>
        <GridItem xs={6} sm={3} children={<RHFNumberField label="Taxa TAEG" name="taxa_taeg" tipo="%" />} />
        <GridItem xs={6} sm={3}>
          <RHFNumberField label="Taxa comissão de abertura" name="taxa_comissao_abertura" tipo="%" />
        </GridItem>
        <GridItem xs={6} sm={4}>
          <RHFNumberField label="Valor total de imposto selo" name="valor_imposto_selo" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} sm={4}>
          <RHFNumberField label="Valor total de comissões" name="valor_comissao" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} sm={4}>
          <RHFNumberField label="Valor total de juros" name="valor_juro" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} sm={4} children={<RHFNumberField label="Custo total TAEG" name="custo_total" tipo="CVE" />} />
        <GridItem xs={6} sm={4}>
          <RHFNumberField label="Valor da prestação" name="valor_prestacao" tipo="CVE" />
        </GridItem>
        <GridItem xs={6} sm={4}>
          <RHFNumberField label="Valor prestação sem desconto" name="valor_prestacao_sem_desconto" tipo="CVE" />
        </GridItem>
      </Grid>
      <ButtonsStepper onCancel={() => dispatch(updateDados({ backward: true, dados: values }))} />
    </FormProvider>
  );
}

// ----------------------------------------------------------

Garantias.propTypes = { isEdit: PropTypes.bool, dados: PropTypes.object, onCancel: PropTypes.func };

function Garantias({ isEdit, dados, onCancel }) {
  const dispatch = useDispatch();
  const [item, setItem] = useState(null);
  const { dadosStepper } = useSelector((state) => state.stepper);
  const { isSaving, tiposGarantias } = useSelector((state) => state.gaji9);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const garantiasEx = useMemo(
    () =>
      dados?.garantias?.map(({ tipo_id: id, tipo, nota }) => ({ garantia: { id, label: tipo }, nota })) || [
        { garantia: null, nota: '' },
      ],
    [dados?.garantias]
  );

  const formSchema = Yup.object().shape({
    garantias: Yup.array(Yup.object({ garantia: Yup.mixed().required().label('Garantia') })),
  });

  const defaultValues = useMemo(
    () => ({ garantias: dadosStepper?.garantias || garantiasEx }),
    [dadosStepper, garantiasEx]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async () => {
    const params = {
      id: dados?.id,
      getItem: isEdit ? 'credito' : '',
      msg: `Crédito ${isEdit ? 'atualizado' : 'adicionado'}`,
      afterSuccess: () => {
        onCancel();
        dispatch(resetDados());
      },
    };
    const formData = {
      ...dadosStepper,
      taxa_imposto_selo: 0,
      componente_id: dadosStepper?.componente_id?.id,
      tipo_titular_id: dadosStepper?.tipo_titular_id?.id,
      data_vencimento_prestacao1: formatDate(dadosStepper?.data_vencimento_prestacao1, 'yyyy-MM-dd'),
      ...(values?.garantias?.length > 0
        ? {
            garantias: values?.garantias?.map((row) => ({
              nota: row?.nota,
              tipo_garantia_id: row?.garantia?.id,
              conta_dp: null,
              freguesia: null,
              tipo_imovel: null,
              conservatoria: null,
              valor_garantia: null,
              num_matriz_predial: null,
              num_registo_predial: null,
            })),
          }
        : null),
    };
    dispatch((isEdit ? updateItem : createItem)('credito', JSON.stringify(formData), params));
  };

  const eliminarGarantia = async () => {
    await remove(item);
    setItem(null);
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {fields?.length === 0 ? (
            <SemDados message="Ainda não foi adicionada nenhuma garantia..." />
          ) : (
            <Stack spacing={3} sx={{ pt: 1 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {fields.map((item, index) => (
                <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                  <Stack sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                      <GridItem sm={4}>
                        <RHFAutocompleteObj
                          label="Garantia"
                          options={garantiasList}
                          name={`garantias[${index}].garantia`}
                        />
                      </GridItem>
                      <GridItem sm={8} children={<RHFTextField label="Nota" name={`garantias[${index}].nota`} />} />
                    </Grid>
                  </Stack>
                  {fields?.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => setItem(index)} />}
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
              onClick={() => append({ nota: '', garantia: null })}
            />
          </Stack>
        </Stack>
        <ButtonsStepper
          isSaving={isSaving}
          label={isEdit ? 'Guardar' : 'Adicionar'}
          onCancel={() => dispatch(updateDados({ backward: true, dados: values }))}
        />
      </FormProvider>
      {item !== null && (
        <DialogConfirmar handleOk={eliminarGarantia} desc="eliminar esta alínea" onClose={() => setItem(null)} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

IntervenienteForm.propTypes = { id: PropTypes.number, dados: PropTypes.array, onCancel: PropTypes.func };

export function IntervenienteForm({ id, dados, onCancel }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    entidade: Yup.number().min(0).required().label('Nº de entidade'),
    responsabilidade: Yup.mixed().required().label('Responsabilidade'),
    entidade_representada: shapeMixed('Entidade representada', 'Procurador', '', 'responsabilidade'),
  });

  const defaultValues = useMemo(() => ({ responsabilidade: null, entidade: null, entidade_representada: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    const params = { id, getItem: 'credito', msg: 'Interveniente adicionado', afterSuccess: () => onCancel() };
    dispatch(
      createItem(
        'intervenientes',
        JSON.stringify([
          {
            designacao: '',
            numero_ordem: null,
            numero_entidade: values?.entidade,
            fiador: values?.responsabilidade === 'Fiador',
            avalista: values?.responsabilidade === 'Avalista',
            representante: values?.responsabilidade === 'Procurador',
            entidade_representada: values.responsabilidade === 'Procurador' ? values.entidade_representada.id : '',
          },
        ]),
        params
      )
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitleAlt sx={{ mb: 2 }} title="Adicionar interveniente" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" spacing={3} sx={{ pt: 1 }}>
            <RHFNumberField noFormat label="Nº de entidade" name="entidade" />
            <RHFAutocompleteSmp
              dc
              name="responsabilidade"
              label="Responsabilidade"
              options={['Avalista', 'Fiador', 'Procurador']}
            />
            {values.responsabilidade === 'Procurador' && (
              <RHFAutocompleteSmp
                dc
                name="entidade_representada"
                label="Entidade representada"
                options={dados?.map(({ numero_entidade: ne, nome }) => ({ id: ne, label: nome }))}
              />
            )}
          </Stack>
          <DialogButons isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

DataContrato.propTypes = { creditoId: PropTypes.number, onCancel: PropTypes.func };

export function DataContrato({ creditoId, onCancel }) {
  const dispatch = useDispatch();
  const { selectedItem, isSaving } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    data_entrega: Yup.date().typeError().required().label('Data de entrega ao cliente'),
  });

  const defaultValues = useMemo(
    () => ({
      data_entrega: selectedItem?.data_entrega ? new Date(selectedItem?.data_entrega) : null,
      data_recebido: selectedItem?.data_recebido ? new Date(selectedItem?.data_recebido) : null,
    }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const preencheData = (data, dataRef) =>
    !dataRef || (data && formatDate(data, "yyyy-MM-dd'T'HH:mm:ss") !== formatDate(dataRef, "yyyy-MM-dd'T'HH:mm:ss"))
      ? JSON.stringify({ data })
      : null;

  const onSubmit = async () => {
    dispatch(
      updateItem(
        'datas contrato',
        {
          data_entrega: preencheData(values?.data_entrega, selectedItem?.data_entrega),
          data_recebido: preencheData(values?.data_recebido, selectedItem?.data_recebido),
        },
        {
          creditoId,
          patch: true,
          msg: 'Datas atualizado',
          codigo: selectedItem?.codigo,
          afterSuccess: () => onCancel(),
        }
      )
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitleAlt sx={{ mb: 2 }} title="Atualizar datas do contrato" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFDatePicker dateTime disableFuture name="data_entrega" label="Data de entrega ao cliente" />
            <RHFDatePicker
              dateTime
              disableFuture
              name="data_recebido"
              disabled={!values?.data_entrega}
              minDateTime={values?.data_entrega}
              label="Data de receção do cliente"
            />
          </Stack>
          <DialogButons edit isSaving={isSaving} onCancel={onCancel} />
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
    dispatch(getFromGaji9('proposta', { ...values, msg: 'Proposta carregada', afterSuccess: () => onCancel() }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitleAlt sx={{ mb: 2 }} title="Carregar proposta" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="row" spacing={3} sx={{ pt: 1 }}>
            <RHFNumberField noFormat label="Nº de proposta" name="proposta" />
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

PreviewForm.propTypes = { item: PropTypes.string, onCancel: PropTypes.func };

export function PreviewForm({ item, onCancel }) {
  const dispatch = useDispatch();
  const { isLoadingDoc, credito, minutasPublicas, representantes } = useSelector((state) => state.gaji9);

  useEffect(() => {
    dispatch(getFromGaji9('representantes', { notLoading: true }));
    dispatch(getFromGaji9('minutasPublicas', { notLoading: true }));
  }, [dispatch]);

  const representantesList = useMemo(
    () =>
      representantes
        ?.filter(({ balcao }) => balcao === credito?.balcao_domicilio)
        ?.map(({ id, nome }) => ({ id, label: nome })),
    [credito?.balcao_domicilio, representantes]
  );

  const minutasList = useMemo(
    () =>
      minutasPublicas
        ?.filter(
          ({ componente_id: cp, tipo_titular_id: tt }) =>
            cp === credito?.componente_id && tt === credito?.tipo_titular_id
        )
        ?.map(({ id, titulo, subtitulo }) => ({ id, label: `${titulo} - ${subtitulo}` })),
    [credito?.componente_id, credito?.tipo_titular_id, minutasPublicas]
  );

  const formSchema = Yup.object().shape({
    minuta: Yup.mixed().required().label('Minuta'),
    representante: Yup.mixed().required().label('Representante'),
  });
  const defaultValues = useMemo(
    () => ({
      cache: false,
      minuta: minutasList?.length === 1 ? minutasList[0] : null,
      representante: representantesList?.length === 1 ? representantesList[0] : null,
    }),
    [minutasList, representantesList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutasList, representantesList]);

  const onSubmit = async () => {
    const params = { creditoId: credito?.id, minutaId: values?.minuta?.id, representanteId: values?.representante?.id };
    dispatch(
      getDocumento(item, {
        ...params,
        cache: !values?.cache,
        titulo: `${item === 'preview-contrato' ? 'Pré-visualização de ' : ''}Contrato: Cliente ${credito?.cliente}`,
      })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitleAlt sx={{ mb: 2 }} title={`${item === 'preview-contrato' ? 'Pré-visualizar' : 'Gerar'} contrato`} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {item === 'gerar-contrato' && (
              <Alert severity="warning">
                <Typography variant="body2">
                  Ao gerar o contrato, este será finalizado e não poderá ser modificado.
                </Typography>
                <Typography variant="body2">
                  Se deseja apenas visualizar o contrato antes de confirmar a geração, utilize o botão de
                  Pré-visualização.
                </Typography>
              </Alert>
            )}
            <RHFAutocompleteObj dc name="minuta" label="Minuta" options={minutasList} />
            <RHFAutocompleteObj dc name="representante" label="Representante" options={representantesList} />
            <RHFSwitch name="cache" label="Forçar atualização dos dados da banca" />
          </Stack>
          <DialogButons
            onCancel={onCancel}
            isSaving={isLoadingDoc}
            label={item === 'preview-contrato' ? 'Pré-visualizar' : 'Gerar'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
