import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { formatDate, fillData } from '../../utils/formatTime';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromGaji9, getDocumento, createItem, updateItem } from '../../redux/slices/gaji9';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
  RHFTextField,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import { DialogButons } from '../../components/Actions';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { shapeMixed } from '../../components/hook-form/yup-shape';
//
import { listaTitrulares } from './applySortFilter';

// ---------------------------------------------------------------------------------------------------------------------

CreditoForm.propTypes = { onClose: PropTypes.func };

export default function CreditoForm({ onClose }) {
  const dispatch = useDispatch();
  const { credito, tiposTitulares, isSaving } = useSelector((state) => state.gaji9);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);

  const formSchema = Yup.object().shape({
    finalidade: Yup.string().required().label('Finalidade'),
    taxa_taeg: Yup.number().min(0).required().label('Taxa TAEG'),
    tipo_titular_id: Yup.mixed().required().label('Tipo de titular'),
    conta_do_renda: Yup.number().min(0).required().label('Conta DO débito'),
    valor_juro: Yup.number().min(0).required().label('Valor total de juros'),
    taxa_imposto_selo: Yup.number().min(0).required().label('Taxa imposto de selo'),
    prazo_contratual: Yup.number().positive(0).required().label('Prazo contratual'),
    valor_comissao: Yup.number().min(0).required().label('Valor total de comissões'),
    taxa_juro_precario: Yup.number().min(0).required().label('Taxa de juros preçario'),
    taxa_juro_desconto: Yup.number().min(0).required().label('Taxa de juros desconto'),
    valor_imposto_selo: Yup.number().min(0).required().label('Valor total de imposto selo'),
    taxa_comissao_abertura: Yup.number().min(0).required().label('Taxa comissão de abertura'),
    data_vencimento_prestacao1: Yup.date().typeError().required().label('Venc. 1ª prestação'),
    valor_prestacao_sem_desconto: Yup.number().min(0).required().label('Valor prestação sem desconto'),
  });

  const defaultValues = useMemo(
    () => ({
      taxa_taeg: credito?.taxa_taeg ?? '',
      finalidade: credito?.finalidade ?? '',
      valor_juro: credito?.valor_juro ?? '',
      isento_comissao: !!credito?.isento_comissao,
      valor_comissao: credito?.valor_comissao ?? '',
      conta_do_renda: credito?.conta_do_renda ?? '',
      meses_vencimento: credito?.meses_vencimento ?? 0,
      prazo_contratual: credito?.prazo_contratual ?? '',
      taxa_imposto_selo: credito?.taxa_imposto_selo ?? 0,
      valor_imposto_selo: credito?.valor_imposto_selo ?? '',
      valor_premio_seguro: credito?.valor_premio_seguro ?? 0,
      taxa_juro_precario: credito?.taxa_juro_precario ?? '',
      taxa_juro_desconto: credito?.taxa_juro_desconto ?? '',
      taxa_comissao_abertura: credito?.taxa_comissao_abertura ?? '',
      valor_prestacao_sem_desconto: credito?.valor_prestacao_sem_desconto ?? '',
      data_vencimento_prestacao1: fillData(credito?.data_vencimento_prestacao1, null),
      tipo_titular_id: titularesList?.find(({ id }) => id === credito?.tipo_titular_id) ?? null,
    }),
    [credito, titularesList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credito, titularesList]);

  const onSubmit = async () => {
    const formData = {
      ...values,
      tipo_titular_id: values?.tipo_titular_id?.id,
      data_vencimento_prestacao1: formatDate(values?.data_vencimento_prestacao1, 'yyyy-MM-dd'),
    };
    const params = { getItem: 'credito', id: credito?.id, msg: 'Crédito atualizado' };
    dispatch(updateItem('credito', JSON.stringify(formData), params));
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt title="Editar dados crédito" onClose={onClose} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <GridItem xs={6} md={4}>
              <RHFAutocompleteObj dc name="tipo_titular_id" label="Tipo de titular" options={titularesList} />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField noFormat label="Conta DO débito" name="conta_do_renda" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFDatePicker name="data_vencimento_prestacao1" label="Venc. 1ª prestação" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Prêmio do seguro" name="valor_premio_seguro" tipo="CVE" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Valor total de juros" name="valor_juro" tipo="CVE" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Valor prestação sem desconto" name="valor_prestacao_sem_desconto" tipo="CVE" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Valor total de imposto selo" name="valor_imposto_selo" tipo="CVE" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Valor total de comissões" name="valor_comissao" tipo="CVE" />
            </GridItem>
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Meses de vencimento" name="meses_vencimento" tipo="meses" />
            </GridItem>
            <GridItem xs={6} md={4} children={<RHFNumberField label="Taxa TAEG" name="taxa_taeg" tipo="%" />} />
            <GridItem xs={6} md={4}>
              <RHFNumberField label="Prazo contratual" name="prazo_contratual" tipo="meses" />
            </GridItem>
            <GridItem xs={6} md={4} children={<RHFSwitch name="isento_comissao" label="Isento de comissão" />} />
            <GridItem xs={6} md={3}>
              <RHFNumberField label="Taxa de juros preçario" name="taxa_juro_precario" tipo="%" />
            </GridItem>
            <GridItem xs={6} md={3}>
              <RHFNumberField label="Taxa de juros desconto" name="taxa_juro_desconto" tipo="%" />
            </GridItem>
            <GridItem xs={6} md={3}>
              <RHFNumberField label="Taxa comissão de abertura" name="taxa_comissao_abertura" tipo="%" />
            </GridItem>
            <GridItem xs={6} md={3}>
              <RHFNumberField label="Taxa imposto de selo" name="taxa_imposto_selo" tipo="%" />
            </GridItem>
            <GridItem children={<RHFTextField label="Finalidade" name="finalidade" multiline rows={3} />} />
          </Grid>
          <DialogButons edit isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

IntervenienteForm.propTypes = { id: PropTypes.number, dados: PropTypes.array, onClose: PropTypes.func };

export function IntervenienteForm({ id, dados, onClose }) {
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
    const params = { id, getItem: 'credito', msg: 'Interveniente adicionado', onClose };
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
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
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
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

DataContrato.propTypes = { creditoId: PropTypes.number, onClose: PropTypes.func };

export function DataContrato({ creditoId, onClose }) {
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
    const params = { msg: 'Datas atualizado', codigo: selectedItem?.codigo, onClose };
    const datas = {
      data_entrega: values?.data_entrega ? preencheData(values?.data_entrega, selectedItem?.data_entrega) : null,
      data_recebido: values?.data_recebido ? preencheData(values?.data_recebido, selectedItem?.data_recebido) : null,
    };
    dispatch(updateItem('datas contrato', datas, { creditoId, patch: true, ...params }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
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
          <DialogButons edit isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PropostaForm.propTypes = { onClose: PropTypes.func };

export function PropostaForm({ onClose }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ proposta: Yup.number().positive().integer().label('Nº de proposta') });
  const defaultValues = useMemo(() => ({ proposta: '', credibox: false }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(getFromGaji9('proposta', { ...values, msg: 'Proposta carregada', onClose }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitleAlt sx={{ mb: 2 }} title="Carregar proposta" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="row" spacing={3} sx={{ pt: 1 }}>
            <RHFNumberField noFormat label="Nº de proposta" name="proposta" />
            <Stack>
              <RHFSwitch name="credibox" label="Credibox" />
            </Stack>
          </Stack>
          <DialogButons isSaving={isLoading} onClose={onClose} label="Carregar" />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PreviewForm.propTypes = { item: PropTypes.string, onClose: PropTypes.func };

export function PreviewForm({ item, onClose }) {
  const dispatch = useDispatch();
  const { isLoadingDoc, credito, minutaContrato, representsBalcao } = useSelector((state) => state.gaji9);
  const { id, balcao_domicilio: balcao, cliente = '' } = credito;

  useEffect(() => {
    dispatch(getFromGaji9('representsBalcao', { balcao, notLoading: true, reset: { val: [] } }));
    dispatch(getFromGaji9('minutaContrato', { notLoading: true, id, reset: { val: null } }));
  }, [dispatch, balcao, id]);

  const representsBalcaoList = useMemo(
    () => representsBalcao?.map(({ id, nome }) => ({ id, label: nome })),
    [representsBalcao]
  );

  const formSchema = Yup.object().shape({ representante: Yup.mixed().required().label('Representante') });
  const defaultValues = useMemo(
    () => ({ cache: false, representante: representsBalcaoList?.length === 1 ? representsBalcaoList[0] : null }),
    [representsBalcaoList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutaContrato, representsBalcao]);

  const onSubmit = async () => {
    const params = { creditoId: id, minutaId: minutaContrato?.id, representanteId: values?.representante?.id };
    dispatch(
      getDocumento(item, {
        ...params,
        cache: !values?.cache,
        titulo: `${item === 'preview-contrato' ? 'Pré-visualização de ' : ''}Contrato: Cliente ${cliente}`,
      })
    );
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt sx={{ mb: 2 }} title={`${item === 'preview-contrato' ? 'Pré-visualizar' : 'Gerar'} contrato`} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
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

            <Stack>
              <Typography sx={{ color: 'text.secondary' }}>Minuta:</Typography>
              {minutaContrato ? (
                <>
                  <Typography variant="subtitle2">{minutaContrato?.titulo}</Typography>
                  <Typography variant="subtitle2">{minutaContrato?.subtitulo}</Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.error', opacity: 0.75, fontStyle: 'italic' }}>
                  *Não foi possível localizar qualquer minuta aplicável ao crédito.
                </Typography>
              )}
            </Stack>
            <RHFAutocompleteObj dc name="representante" label="Representante" options={representsBalcaoList} />
            <RHFSwitch name="cache" label="Forçar atualização dos dados da banca" />
          </Stack>
          <DialogButons
            onClose={onClose}
            isSaving={isLoadingDoc}
            hideSubmit={!minutaContrato || !values?.representante?.id}
            label={item === 'preview-contrato' ? 'Pré-visualizar' : 'Gerar'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
