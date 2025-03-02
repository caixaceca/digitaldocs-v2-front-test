import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fillData } from '../../utils/formatTime';
import { fluxoFixo } from '../../utils/validarAcesso';
import { transicoesList } from '../../utils/formatObject';
// hooks
import { applySort, getComparator } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
// components
import {
  RHFEditor,
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
//
import PesosDecisao from './PesosDecisao';
import { listaPerfis } from './applySortFilter';
import { ItemComponent } from './ParametrizacaoForm';

// --------------------------------------------------------------------------------------------------------------------------------------------

FluxoForm.propTypes = { onCancel: PropTypes.func };

export function FluxoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);
  const readOnly = isEdit && fluxoFixo(selectedItem?.assunto);

  const formSchema = Yup.object().shape({
    modelo: Yup.mixed().required().label('Modelo'),
    assunto: Yup.string().required().label('Assunto'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: perfilId,
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      modelo: selectedItem?.modelo || null,
      is_con: selectedItem?.is_con || false,
      observacao: selectedItem?.observacao || '',
      is_interno: selectedItem?.is_interno || false,
      is_credito: selectedItem?.is_credito || false,
      is_ativo: isEdit ? selectedItem?.is_ativo : true,
      credito_funcionario: selectedItem?.credito_funcionario || false,
    }),
    [selectedItem, isEdit, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const params = { id: selectedItem?.id, msg: `Fluxo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('fluxo', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar fluxo' : 'Adicionar fluxo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <GridItem>
                <RHFTextField name="assunto" label="Assunto" InputProps={{ readOnly }} />
                {readOnly && (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    *O nome do fluxo não pode ser alterado, está em uso para validações na aplicação.
                  </Typography>
                )}
              </GridItem>
              <GridItem
                sm={6}
                children={<RHFAutocompleteSmp name="modelo" label="Modelo" options={['Série', 'Paralelo']} />}
              />
              <GridItem xs={6} sm={isEdit ? 3 : 6} children={<RHFSwitch name="is_interno" label="Interno" />} />
              {isEdit && <GridItem xs={6} sm={3} children={<RHFSwitch name="is_ativo" label="Ativo" />} />}
              <GridItem xs={6} children={<RHFSwitch name="is_credito" label="Crédito" />} />
              <GridItem xs={6} children={<RHFSwitch name="credito_funcionario" label="Crédito colaborador" />} />
              <GridItem xs={6} children={<RHFSwitch name="limpo" label="Limpo" />} />
              <GridItem xs={6} children={<RHFSwitch name="is_con" label="Com. Op. Numerário" />} />
              <GridItem children={<RHFTextField name="observacao" multiline rows={3} label="Observação" />} />
            </Grid>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ClonarFluxoForm.propTypes = { onCancel: PropTypes.func };

export function ClonarFluxoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ assunto: Yup.string().required().label('Assunto') });

  const defaultValues = useMemo(
    () => ({
      is_ativo: true,
      observacao: '',
      perfilID: perfilId,
      is_con: selectedItem?.is_con,
      modelo: selectedItem?.modelo || '',
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      is_interno: selectedItem?.is_interno || false,
      is_credito: selectedItem?.is_credito || false,
      credito_funcionario: selectedItem?.credito_funcionario || false,
    }),
    [selectedItem, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      dispatch(
        createItem('clonar fluxo', JSON.stringify(values), {
          msg: 'Fluxo clonado',
          transicoes: selectedItem?.transicoes?.filter((option) => option?.modo !== 'desarquivamento'),
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Clonar fluxo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <Alert severity="info">
              Ao clonar este fluxo, será criada uma cópia que replicará o seu conteúdo e as transições associadas para
              um novo fluxo.
            </Alert>
            <RHFTextField name="assunto" label="Assunto" />
          </Stack>
          <DialogButons label="Clonar" isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TransicaoForm.propTypes = { onCancel: PropTypes.func, fluxoId: PropTypes.number };

export function TransicaoForm({ onCancel, fluxoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, estados, isEdit, isSaving } = useSelector((state) => state.parametrizacao);
  const estadosList = useMemo(() => estados.map((row) => ({ id: row?.id, label: row?.nome })), [estados]);

  const formSchema = Yup.object().shape({
    modo: Yup.mixed().required().label('Modo'),
    origem: Yup.mixed().required().label('Origem'),
    destino: Yup.mixed().required().label('Destino'),
    prazoemdias: Yup.number().min(0).typeError().label('Prazo'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilIDCC: perfilId,
      modo: selectedItem?.modo || null,
      fluxo_id: selectedItem?.fluxo_id || fluxoId,
      prazoemdias: selectedItem?.prazoemdias || 0,
      hasopnumero: selectedItem?.hasopnumero || false,
      is_paralelo: selectedItem?.is_paralelo || false,
      requer_parecer: selectedItem?.requer_parecer || false,
      arqhasopnumero: selectedItem?.arqhasopnumero || false,
      to_alert: selectedItem ? selectedItem?.to_alert : true,
      is_after_devolucao: selectedItem?.is_after_devolucao || false,
      destino: estadosList?.find((row) => row.id === selectedItem?.estado_final_id) || null,
      origem: estadosList?.find((row) => row.id === selectedItem?.estado_inicial_id) || null,
    }),
    [fluxoId, selectedItem, perfilId, estadosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const formData = { ...values, estado_final_id: values?.destino?.id, estado_inicial_id: values?.origem?.id };
      const params = { item1: 'fluxo', msg: `Transição ${isEdit ? 'atualizada' : 'adicionada'}`, id: selectedItem.id };
      dispatch((isEdit ? updateItem : createItem)('transicoes', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('transicoes', { item1: 'fluxo', id: selectedItem.id, msg: 'Transição eliminada' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{selectedItem ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <GridItem sm={6} children={<RHFAutocompleteObj name="origem" label="Origem" options={estadosList} />} />
              <GridItem sm={6} children={<RHFAutocompleteObj name="destino" label="Destino" options={estadosList} />} />
              <GridItem
                sm={6}
                children={<RHFAutocompleteSmp name="modo" label="Modo" options={['Seguimento', 'Devolução']} />}
              />
              <GridItem sm={6} children={<RHFNumberField label="Prazo" name="prazoemdias" tipo="dias" />} />
              <GridItem sm={4} children={<RHFSwitch name="is_paralelo" label="Paralelo" />} />
              <GridItem sm={4} children={<RHFSwitch name="requer_parecer" label="Requer parecer" />} />
              <GridItem sm={4} children={<RHFSwitch name="is_after_devolucao" label="Depois de devolução" />} />
              <GridItem sm={4} children={<RHFSwitch name="to_alert" label="Notificar" />} />
              <GridItem sm={4} children={<RHFSwitch name="hasopnumero" label="Indicar nº de operação" />} />
              <GridItem sm={4} children={<RHFSwitch name="arqhasopnumero" label="Nº de operação no arquivo" />} />
            </Grid>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar esta transição' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ChecklistForm.propTypes = { fluxo: PropTypes.object, onCancel: PropTypes.func };

export function ChecklistForm({ fluxo, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem, estados, documentos } = useSelector((state) => state.parametrizacao);
  const listaTransicoes = useMemo(
    () =>
      applySort(
        transicoesList(fluxo?.transicoes, estados)?.map((row) => ({
          id: row?.id,
          label: `${row?.modo}${row?.is_after_devolucao ? ' (DD)' : ''}: ${row?.estado_inicial} » ${row?.estado_final}`,
        })),
        getComparator('desc', 'label')
      ),
    [fluxo?.transicoes, estados]
  );

  const formSchema = Yup.object().shape({
    tipo_documento: isEdit && Yup.mixed().required().label('Documento'),
    documentos: !isEdit && Yup.array(Yup.object({ tipo_documento: Yup.mixed().required().label('Documento') })),
  });

  const defaultValues = useMemo(
    () => ({
      ativo: isEdit ? selectedItem?.ativo : true,
      obrigatorio: isEdit ? selectedItem?.obrigatorio : false,
      transicao: listaTransicoes?.find((row) => row?.id === selectedItem?.transicao_id) || null,
      documentos: isEdit ? [] : [{ tipo_documento: null, transicao: null, obrigatorio: false }],
      tipo_documento: documentos?.find((row) => row?.id === selectedItem?.tipo_documento_id) || null,
    }),
    [isEdit, selectedItem, listaTransicoes, documentos]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'documentos' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const docs = (dados) => ({
        ativo: dados?.ativo,
        obrigatorio: dados?.obrigatorio,
        transicao_id: dados?.transicao?.id,
        tipo_documento_id: dados?.tipo_documento?.id,
      });
      const formData = isEdit
        ? docs(values)
        : { fluxo_id: fluxo?.id, documentos: values?.documentos?.map((row) => docs(row)) };
      const params = { id: selectedItem?.id, msg: isEdit ? 'Documento atualizado' : 'Documento adicionados' };
      dispatch((isEdit ? updateItem : createItem)('checklist', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar documento' : 'Adicionar documentos'}
          {!isEdit && (
            <AddItem small handleClick={() => append({ tipo_documento: null, transicao: null, obrigatorio: false })} />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            {isEdit ? (
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <GridItem>
                  <RHFAutocompleteObj label="Documento" options={documentos} name="tipo_documento" />
                </GridItem>
                <GridItem>
                  <RHFAutocompleteObj name="transicao" label="Transição" options={listaTransicoes} />
                </GridItem>
                <GridItem sm={6} children={<RHFSwitch name="obrigatorio" label="Obrigatório" />} />
                <GridItem sm={6} children={<RHFSwitch name="ativo" label="Ativo" />} />
              </Grid>
            ) : (
              <Stack spacing={2} sx={{ pt: 3 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                {fields.map((item, index) => (
                  <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <RHFAutocompleteObj
                          label="Documento"
                          options={documentos}
                          name={`documentos[${index}].tipo_documento`}
                        />
                        <RHFSwitch name={`documentos[${index}].obrigatorio`} label="Obrigatório" sx={{ width: 180 }} />
                      </Stack>
                      <RHFAutocompleteObj
                        label="Transição"
                        options={listaTransicoes}
                        name={`documentos[${index}].transicao`}
                      />
                    </Stack>
                    {values.documentos.length > 1 && (
                      <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

RegraTransicaoForm.propTypes = { transicao: PropTypes.number, onCancel: PropTypes.func };

export function RegraTransicaoForm({ transicao, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, estado } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(() => listaPerfis(estado?.perfis, colaboradores), [colaboradores, estado?.perfis]);

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil: Yup.mixed().required().label('Colaborador'),
        percentagem: Yup.number().positive().typeError().label('Percentagem'),
      })
    ),
  });

  const defaultValues = useMemo(() => ({ destribuir: false, pesos: [] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      dispatch(
        createItem(
          'regrasTransicao',
          JSON.stringify(values?.pesos?.map((row) => ({ perfil_id: row?.perfil?.id, percentagem: row?.percentagem }))),
          { transicaoId: transicao?.id, msg: 'Regra adicionada', estadoId: estado?.id }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar regras' : 'Adicionar regras'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Transicao item={estado?.nome} transicao={transicao?.label} />
              <GridItem children={<PesosDecisao perfisList={perfisList} />} />
            </Grid>
            <DialogButons isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

NotificacaoForm.propTypes = { fluxo: PropTypes.object, transicao: PropTypes.object, onCancel: PropTypes.func };

export function NotificacaoForm({ fluxo, transicao, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    via: Yup.mixed().required().label('Via'),
    corpo: Yup.string().required().label('Corpo'),
    assunto: Yup.string().required().label('Assunto'),
  });

  const defaultValues = useMemo(
    () => ({
      via: selectedItem?.via || null,
      corpo: selectedItem?.corpo || '',
      assunto: selectedItem?.assunto || '',
      transicao_id: selectedItem?.transicao_id || transicao?.id,
    }),
    [selectedItem, transicao?.id]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const params = { id: selectedItem?.id, msg: `Notificação ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('notificacoes', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar notificação' : 'Adicionar notificação'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Transicao item={fluxo?.assunto} transicao={transicao?.label} fluxo />
            <GridItem sm={4} children={<RHFAutocompleteSmp name="via" label="Via" options={['Email', 'SMS']} />} />
            <GridItem sm={8} children={<RHFTextField name="assunto" label="Assunto" />} />
            <GridItem children={<RHFEditor simple name="corpo" />} />
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            desc={isEdit ? 'eliminar esta notificação' : ''}
            handleDelete={() =>
              dispatch(deleteItem('notificacao', { id: selectedItem?.id, msg: 'Notificação eliminada' }))
            }
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DestinatarioForm.propTypes = { id: PropTypes.number, selectedItem: PropTypes.object, onCancel: PropTypes.func };

export function DestinatarioForm({ id, onCancel, selectedItem }) {
  const isEdit = selectedItem?.id;
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.parametrizacao);
  const { colaboradores } = useSelector((state) => state.intranet);
  const perfisList = useMemo(
    () => colaboradores?.map((row) => ({ id: row?.id, label: row?.perfil?.displayName, email: row?.perfil?.mail })),
    [colaboradores]
  );

  const formSchema = Yup.object().shape({
    perfil: isEdit && Yup.mixed().required().label('Colaborador'),
    destinatarios: !isEdit && Yup.array(Yup.object({ perfil: Yup.mixed().required().label('Colaborador') })),
  });

  const defaultValues = useMemo(
    () => ({
      telefone: selectedItem?.telefone || '',
      data_inicio: fillData(selectedItem?.data_inicio, null),
      data_termino: fillData(selectedItem?.data_termino, null),
      perfil: isEdit
        ? perfisList?.find((row) => row?.email?.toLowerCase() === selectedItem?.email?.toLowerCase())
        : null,
      destinatarios: isEdit ? [] : [{ perfil: null, data_inicio: null, data_termino: null, telefone: '' }],
    }),
    [selectedItem, isEdit, perfisList]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'destinatarios' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const destinatario = (dados) => ({
        telefone: dados?.telefone,
        email: dados?.perfil?.email,
        data_inicio: dados?.data_inicio ? format(dados.data_inicio, 'yyyy-MM-dd') : null,
        data_termino: dados?.data_termino ? format(dados.data_termino, 'yyyy-MM-dd') : null,
      });
      const formData = isEdit ? destinatario(values) : values?.destinatarios?.map((row) => destinatario(row));
      const params = {
        id: selectedItem?.id || id,
        msg: isEdit ? 'Destinatário atualizado' : 'Destinatários adicionados',
      };

      dispatch(
        (isEdit ? updateItem : createItem)(isEdit ? 'destinatarios' : 'destinatario', JSON.stringify(formData), params)
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth={isEdit ? 'sm' : 'lg'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar destinatário' : 'Adicionar destinatários'}
          {!isEdit && (
            <AddItem
              small
              handleClick={() => append({ perfil: null, data_inicio: null, data_termino: null, telefone: '' })}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {isEdit ? (
              <>
                <GridItem children={<RHFAutocompleteObj label="Colaborador" options={perfisList} name="perfil" />} />
                <GridItem children={<RHFTextField label="Telefone" name="telefone" />} />
                <GridItem sm={6} children={<RHFDatePicker label="Data de início" name="data_inicio" />} />
                <GridItem sm={6} children={<RHFDatePicker label="Data de fim" name="data_termino" />} />
              </>
            ) : (
              fields.map((item, index) => (
                <Grid item xs={12} key={item.id}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <RHFAutocompleteObj
                        label="Colaborador"
                        options={perfisList}
                        name={`destinatarios[${index}].perfil`}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <RHFTextField label="Telefone" name={`destinatarios[${index}].telefone`} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
                        <RHFDatePicker label="Data de início" name={`destinatarios[${index}].data_inicio`} />
                        <RHFDatePicker label="Data de fim" name={`destinatarios[${index}].data_termino`} />
                        {values.destinatarios.length > 1 && (
                          <DefaultAction color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              ))
            )}
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            desc={isEdit ? 'eliminar esta destinatário' : ''}
            handleDelete={() =>
              dispatch(deleteItem('destinatarios', { id: selectedItem?.id, msg: 'Destinatário eliminado' }))
            }
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Transicao.propTypes = { item: PropTypes.string, transicao: PropTypes.string, fluxo: PropTypes.bool };

export function Transicao({ item, transicao, fluxo = false }) {
  return (
    <Grid item xs={12}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>{fluxo ? 'Fluxo:' : 'Estado:'}</Typography>
        <Typography>{item}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>Transição:</Typography>
        <Typography>{transicao}</Typography>
      </Stack>
    </Grid>
  );
}
