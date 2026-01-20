import * as Yup from 'yup';
import { format } from 'date-fns';
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
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromParametrizacao, createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
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
import { ItemComponent } from './ParametrizacaoForm';

// ---------------------------------------------------------------------------------------------------------------------

export function FluxoForm({ onClose }) {
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
      credito_funcionario: false,
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      modelo: selectedItem?.modelo || null,
      is_con: selectedItem?.is_con || false,
      observacao: selectedItem?.observacao || '',
      is_credito: selectedItem?.is_credito || false,
      is_ativo: isEdit ? selectedItem?.is_ativo : true,
      is_interno: isEdit ? selectedItem?.is_interno : true,
    }),
    [selectedItem, isEdit, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      const msg = `Fluxo ${isEdit ? 'atualizado' : 'adicionado'}`;
      const params = { id: selectedItem?.id, msg, getItem: 'selectedItem', onClose };
      dispatch((isEdit ? updateItem : createItem)('fluxo', JSON.stringify(values), params));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar fluxo' : 'Adicionar fluxo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ pt: 3 }}>
              <GridItem>
                <RHFTextField name="assunto" label="Assunto" InputProps={{ readOnly }} />
                {readOnly && (
                  <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'info.main' }}>
                    *O assunto não pode ser alterado, está em uso para validações na aplicação.
                  </Typography>
                )}
              </GridItem>
              <GridItem
                sm={6}
                children={<RHFAutocompleteSmp name="modelo" label="Modelo" options={['Série', 'Paralelo']} />}
              />
              <GridItem xs={6} sm={isEdit ? 3 : 6} children={<RHFSwitch name="is_interno" label="Interno" mt />} />
              {isEdit && <GridItem xs={6} sm={3} children={<RHFSwitch name="is_ativo" label="Ativo" mt />} />}
              <GridItem xs={4} children={<RHFSwitch name="is_credito" label="Crédito" />} />
              <GridItem xs={4} children={<RHFSwitch name="limpo" label="Limpo" />} />
              <GridItem xs={4} children={<RHFSwitch name="is_con" label="CON" />} />
              <GridItem children={<RHFTextField name="observacao" multiline rows={3} label="Observação" />} />
            </Grid>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ClonarFluxoForm({ onClose }) {
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
      credito_funcionario: false,
      is_con: selectedItem?.is_con,
      modelo: selectedItem?.modelo || '',
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      is_interno: selectedItem?.is_interno || false,
      is_credito: selectedItem?.is_credito || false,
    }),
    [selectedItem, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (selectedItem) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    try {
      const transicoes = selectedItem?.transicoes?.filter((option) => option?.modo !== 'desarquivamento');
      dispatch(createItem('clonar fluxo', JSON.stringify(values), { msg: 'Fluxo clonado', transicoes, onClose }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
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
          <DialogButons label="Clonar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TransicaoForm({ onClose, fluxoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, estados, isEdit, isSaving } = useSelector((state) => state.parametrizacao);
  const estadosList = useMemo(() => estados.map(({ id, nome }) => ({ id, label: nome })), [estados]);

  const formSchema = Yup.object().shape({
    modo: Yup.mixed().required().label('Modo'),
    estado_final_id: Yup.mixed().required().label('Destino'),
    estado_inicial_id: Yup.mixed().required().label('Origem'),
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
      estado_final_id: estadosList?.find(({ id }) => id === selectedItem?.estado_final_id) || null,
      estado_inicial_id: estadosList?.find(({ id }) => id === selectedItem?.estado_inicial_id) || null,
    }),
    [fluxoId, selectedItem, perfilId, estadosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    try {
      const id = isEdit ? selectedItem?.id : fluxoId;
      const params = { item1: 'fluxo', msg: `Transição ${isEdit ? 'atualizada' : 'adicionada'}`, id, onClose };
      const ids = { estado_final_id: values?.estado_final_id?.id, estado_inicial_id: values?.estado_inicial_id?.id };
      const formData = isEdit ? { ...values, ...ids } : [{ ...values, ...ids }];

      dispatch((isEdit ? updateItem : createItem)('transicoes', JSON.stringify(formData), params));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Grid container spacing={3} sx={{ pt: 3 }}>
              <GridItem sm={6}>
                <RHFAutocompleteObj name="estado_inicial_id" label="Origem" options={estadosList} />
              </GridItem>
              <GridItem sm={6}>
                <RHFAutocompleteObj name="estado_final_id" label="Destino" options={estadosList} />
              </GridItem>
              <GridItem sm={6}>
                <RHFAutocompleteSmp name="modo" label="Modo" options={['Seguimento', 'Devolução']} />
              </GridItem>
              <GridItem sm={6} children={<RHFNumberField label="Prazo" name="prazoemdias" tipo="dias" />} />
              <GridItem sm={4} children={<RHFSwitch name="is_paralelo" label="Paralelo" />} />
              <GridItem sm={4} children={<RHFSwitch name="requer_parecer" label="Requer parecer" />} />
              <GridItem sm={4} children={<RHFSwitch name="is_after_devolucao" label="Depois devolução" />} />
              <GridItem sm={4} children={<RHFSwitch name="to_alert" label="Notificar" />} />
              <GridItem sm={4} children={<RHFSwitch name="hasopnumero" label="Indicar nº de operação" />} />
              <GridItem sm={4} children={<RHFSwitch name="arqhasopnumero" label="Nº de operação no arquivo" />} />
            </Grid>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ChecklistForm({ fluxo, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem, estados, documentos } = useSelector((state) => state.parametrizacao);

  useEffect(() => {
    dispatch(getFromParametrizacao('documentos'));
  }, [dispatch]);

  const listaTransicoes = useMemo(
    () => transicoesList(fluxo?.transicoes, estados, true, true),
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
      transicao: listaTransicoes?.find(({ id }) => id === selectedItem?.transicao_id) || null,
      documentos: isEdit ? [] : [{ tipo_documento: null, transicao: null, obrigatorio: false }],
      tipo_documento: documentos?.find(({ id }) => id === selectedItem?.tipo_documento_id) || null,
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
        obrigatorio: dados?.obrigatorio,
        transicao_id: dados?.transicao?.id,
        ativo: isEdit ? dados?.ativo : true,
        tipo_documento_id: dados?.tipo_documento?.id,
      });
      const getItem = isEdit ? '' : 'checklist';
      const formData = isEdit
        ? docs(values)
        : { fluxo_id: fluxo?.id, documentos: values?.documentos?.map((row) => docs(row)) };
      const params = { id: selectedItem?.id, msg: `Documento ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
      dispatch((isEdit ? updateItem : createItem)('checklist', JSON.stringify(formData), { ...params, getItem }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar documento' : 'Adicionar documentos'}
          {!isEdit && (
            <AddItem
              dados={{ small: true }}
              onClick={() => append({ tipo_documento: null, transicao: null, obrigatorio: false })}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            {isEdit ? (
              <Grid container spacing={3} sx={{ pt: 3 }}>
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
                      <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function NotificacaoForm({ fluxo, transicao, onClose }) {
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
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    try {
      const params = { id: selectedItem?.id, msg: `Notificação ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('notificacoes', JSON.stringify(values), { ...params, onClose }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar notificação' : 'Adicionar notificação'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <Transicao item={fluxo?.assunto} transicao={transicao?.label} fluxo />
            <GridItem sm={4} children={<RHFAutocompleteSmp name="via" label="Via" options={['Email', 'SMS']} />} />
            <GridItem sm={8} children={<RHFTextField name="assunto" label="Assunto" />} />
            <GridItem children={<RHFEditor simple name="corpo" />} />
          </Grid>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DestinatarioForm({ id, onClose, selectedItem }) {
  const isEdit = selectedItem?.id;
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.parametrizacao);
  const colaboradoresList = useMemo(
    () => colaboradores?.map(({ id, nome, email }) => ({ id, label: nome, email })),
    [colaboradores]
  );

  const formSchema = Yup.object().shape({
    colaborador: isEdit && Yup.mixed().required().label('Colaborador'),
    destinatarios: !isEdit && Yup.array(Yup.object({ colaborador: Yup.mixed().required().label('Colaborador') })),
  });

  const defaultValues = useMemo(
    () => ({
      telefone: selectedItem?.telefone || '',
      data_inicio: fillData(selectedItem?.data_inicio, null),
      data_termino: fillData(selectedItem?.data_termino, null),
      destinatarios: isEdit ? [] : [{ colaborador: null, data_inicio: null, data_termino: null, telefone: '' }],
      colaborador: isEdit
        ? colaboradoresList?.find(({ email }) => email?.toLowerCase() === selectedItem?.email?.toLowerCase())
        : null,
    }),
    [selectedItem, isEdit, colaboradoresList]
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
        email: dados?.colaborador?.email,
        data_inicio: dados?.data_inicio ? format(dados.data_inicio, 'yyyy-MM-dd') : null,
        data_termino: dados?.data_termino ? format(dados.data_termino, 'yyyy-MM-dd') : null,
      });
      const formData = isEdit ? destinatario(values) : values?.destinatarios?.map((row) => destinatario(row));
      const params = { id: selectedItem?.id || id, msg: `Destinatário ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('destinatarios', JSON.stringify(formData), { ...params, onClose }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={isEdit ? 'sm' : 'sm'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar destinatário' : 'Adicionar destinatários'}
          {!isEdit && (
            <AddItem
              dados={{ small: true }}
              onClick={() => append({ colaborador: null, data_inicio: null, data_termino: null, telefone: '' })}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          {isEdit ? (
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObj label="Colaborador" options={colaboradoresList} name="colaborador" />
              <RHFTextField label="Telefone" name="telefone" />
              <Stack direction="row" spacing={3}>
                <RHFDatePicker label="Data de início" name="data_inicio" />
                <RHFDatePicker label="Data de fim" name="data_termino" />
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 3 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {fields.map((item, index) => (
                <Stack key={item.id} direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  <Stack spacing={2} sx={{ width: '90%', flexGrow: 1 }}>
                    <RHFAutocompleteObj
                      label="Colaborador"
                      options={colaboradoresList}
                      name={`destinatarios[${index}].colaborador`}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <RHFTextField label="Telefone" name={`destinatarios[${index}].telefone`} />
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { sm: '60%' } }}>
                        <RHFDatePicker label="Data de início" name={`destinatarios[${index}].data_inicio`} />
                        <RHFDatePicker label="Data de fim" name={`destinatarios[${index}].data_termino`} />
                      </Stack>
                    </Stack>
                  </Stack>
                  {values.destinatarios.length > 1 && (
                    <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
                  )}
                </Stack>
              ))}
            </Stack>
          )}
          <DialogButons
            edit={isEdit}
            onClose={onClose}
            isSaving={isSaving}
            desc={isEdit ? 'eliminar esta destinatário' : ''}
            handleDelete={() =>
              dispatch(deleteItem('destinatarios', { id: selectedItem?.id, msg: 'Destinatário eliminado', onClose }))
            }
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Transicao({ item, transicao, fluxo = false }) {
  return (
    <GridItem>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>{fluxo ? 'Fluxo:' : 'Estado:'}</Typography>
        <Typography>{item}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>Transição:</Typography>
        <Typography>{transicao}</Typography>
      </Stack>
    </GridItem>
  );
}
