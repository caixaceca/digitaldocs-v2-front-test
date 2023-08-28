import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
// @mui
import {
  Fab,
  Grid,
  Alert,
  Stack,
  Button,
  Dialog,
  Tooltip,
  Typography,
  DialogTitle,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// utils
import { emailIpf } from '../../utils/validarAcesso';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import { DialogButons } from '../../components/Actions';
import SvgIconStyle from '../../components/SvgIconStyle';
// _mock
import { codacessos, objetos, _concelhos } from '../../_mock';

// --------------------------------------------------------------------------------------------------------------------------------------------

FluxoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function FluxoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { done, error, isSaving, fluxoId, selectedItem } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      if (done === 'Fluxo eliminado') {
        onCancel();
      } else {
        onCancel();
        navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/fluxo/${fluxoId}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    modelo: Yup.string().required('Modelo não pode ficar vazio'),
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
      modelo: selectedItem?.modelo || '',
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      is_con: selectedItem?.is_con || false,
      is_ativo: selectedItem?.is_ativo || true,
      observacao: selectedItem?.observacao || '',
      is_interno: selectedItem?.is_interno || false,
      is_credito: selectedItem?.is_credito || false,
    }),
    [selectedItem, cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem) {
        dispatch(updateItem('fluxo', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Fluxo atualizado' }));
      } else {
        dispatch(createItem('fluxo', JSON.stringify(values), { mail, msg: 'Fluxo atualizado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('fluxo', { mail, id: selectedItem.id, msg: 'Fluxo eliminado', perfilId: cc?.perfil_id }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar fluxo' : 'Adicionar fluxo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="assunto" label="Assunto" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteSimple name="modelo" label="Modelo" options={['Série', 'Paralelo']} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RHFSwitch name="is_interno" labelPlacement="start" label="Interno" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RHFSwitch name="is_ativo" labelPlacement="start" label="Ativo" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch name="is_con" labelPlacement="start" label="Com. Operação Numerário" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RHFSwitch name="is_credito" labelPlacement="start" label="Crédito" />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RHFSwitch name="limpo" labelPlacement="start" label="Limpo" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={3} maxRows={5} label="Observação" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar este fluxo'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ClonarFluxoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function ClonarFluxoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { done, error, isSaving, fluxoId, itemSelected } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'fluxo clonado') {
      onCancel();
      navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/fluxo/${fluxoId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    modelo: Yup.string().required('Modelo não pode ficar vazio'),
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
      is_con: itemSelected?.is_con,
      modelo: itemSelected?.modelo || '',
      limpo: itemSelected?.limpo || false,
      assunto: itemSelected?.assunto || '',
      is_ativo: itemSelected?.is_ativo || true,
      observacao: itemSelected?.observacao || '',
      is_interno: itemSelected?.is_interno || false,
      is_credito: itemSelected?.is_credito || false,
    }),
    [itemSelected, cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (itemSelected) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemSelected]);

  const onSubmit = async () => {
    try {
      if (itemSelected) {
        dispatch(
          createItem('clonar fluxo', JSON.stringify(values), {
            mail,
            msg: 'fluxo clonado',
            perfilId: cc?.perfil_id,
            transicoes: itemSelected?.transicoes?.filter((option) => option?.modo !== 'desarquivamento'),
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Clonar fluxo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: -1 }}>
            <Grid item xs={12}>
              <Alert severity="info">
                Ao clonar este fluxo, será criado uma cópia deste, replicando o seu conteúdo e as transições associadas
                para um novo fluxo. Pondendo, posteriormente, editar o conteúdo e as transições.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="assunto" label="Assunto" />
            </Grid>
          </Grid>
          <DialogButons label="Clonar" isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

EstadoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function EstadoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { done, error, isSaving, estadoId, selectedItem } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      if (done === 'Estado eliminado') {
        onCancel();
      } else {
        onCancel();
        navigate(`${PATH_DIGITALDOCS.parametrizacao.root}/estado/${estadoId}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const uosList = uos.map((row) => ({ id: row?.id, label: row?.label }));
  const uoSelect = uosList?.find((row) => row.id === selectedItem?.uo_id) || null;

  const formSchema = Yup.object().shape({
    nome: Yup.string().required('Nome não pode ficar vazio'),
    uo_id: Yup.mixed()
      .nullable('Unidade orgânica não pode ficar vazio')
      .required('Unidade orgânica não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      uo_id: uoSelect,
      perfilID: cc?.perfil_id,
      nome: selectedItem?.nome || '',
      email: selectedItem?.email || '',
      is_final: selectedItem?.is_final || false,
      observacao: selectedItem?.observacao || '',
      is_decisao: selectedItem?.is_decisao || false,
      is_inicial: selectedItem?.is_inicial || false,
    }),
    [selectedItem, cc, uoSelect]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      values.uo_id = values?.uo_id?.id;
      if (selectedItem) {
        dispatch(updateItem('estado', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Estado atualizado' }));
      } else {
        dispatch(createItem('estado', JSON.stringify(values), { mail, msg: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('estado', { mail, id: selectedItem.id, perfilId: cc?.perfil_id, msg: 'Estado eliminado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="nome" label="Nome" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="email" label="Email" />
            </Grid>
            <Grid item xs={12}>
              <RHFAutocompleteObject
                name="uo_id"
                label="Unidade orgânica"
                options={applySort(uosList, getComparator('asc', 'label'))}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch name="is_inicial" labelPlacement="start" label="Inicial" />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch name="is_final" labelPlacement="start" label="Final" />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch name="is_decisao" labelPlacement="start" label="Decisão" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={2} maxRows={4} label="Observação" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar este estado'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AcessoForm.propTypes = { onCancel: PropTypes.func, perfilId: PropTypes.number, isOpenModal: PropTypes.bool };

export function AcessoForm({ isOpenModal, perfilId, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { done, error, isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    objeto: Yup.mixed().nullable('Objeto pode ficar vazio').required('Objeto pode ficar vazio'),
    acesso: Yup.mixed().nullable('Acesso não pode ficar vazio').required('Acesso não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: Number(perfilId),
      perfilIDCC: cc?.perfil?.id,
      datalimite: selectedItem?.datalimite || null,
      objeto: selectedItem?.objeto ? objetos?.find((row) => row?.id === selectedItem?.objeto) : null,
      acesso: selectedItem?.acesso ? codacessos?.find((row) => row?.id === selectedItem?.acesso) : null,
    }),
    [selectedItem, cc?.perfil?.id, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      values.objeto = values.objeto.id;
      values.acesso = values.acesso.id;
      if (isEdit) {
        dispatch(updateItem('acesso', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Acesso atualizado' }));
      } else {
        dispatch(createItem('acesso', JSON.stringify(values), { mail, msg: 'Acesso atribuido' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('acesso', { mail, id: selectedItem.id, msg: 'Acesso eliminado', perfilId: cc?.perfil_id }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedItem ? 'Editar acesso' : 'Adicionar acesso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject name="objeto" label="Objeto" options={objetos} />
            </Grid>
            <Grid item xs={12}>
              <RHFAutocompleteObject name="acesso" label="Acesso" options={codacessos} />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="datalimite"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    label="Data"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar este acesso'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

MotivoPendenciaForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function MotivoPendenciaForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const perfilId = cc?.perfil_id;
  const isEdit = !!selectedItem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({ motivo: Yup.string().required('Motivo não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ motivo: selectedItem?.motivo || '', obs: selectedItem?.obs || '' }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(
          updateItem('motivo pendencia', JSON.stringify(values), {
            mail,
            perfilId,
            id: selectedItem.id,
            msg: 'Motivo atualizado',
          })
        );
      } else {
        dispatch(createItem('motivo pendencia', JSON.stringify(values), { mail, perfilId, msg: 'Motivo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('motivo pendencia', { mail, perfilId, id: selectedItem.id, msg: 'Motivo eliminado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="motivo" label="Motivo" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="obs" label="Observação" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar este motivo'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

OrigemForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function OrigemForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [findConcelhos, setFindConcelhos] = useState([]);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    tipo: Yup.string().required('Tipo não pode ficar vazio'),
    ilha: Yup.string().required('Ilha não pode ficar vazio'),
    cidade: Yup.string().required('Concelho não pode ficar vazio'),
    designacao: Yup.string().required('Designação não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
      tipo: selectedItem?.tipo || '',
      ilha: selectedItem?.ilha || '',
      email: selectedItem?.email || '',
      cidade: selectedItem?.cidade || '',
      codigo: selectedItem?.codigo || '',
      telefone: selectedItem?.telefone || '',
      seguimento: selectedItem?.seguimento || '',
      observacao: selectedItem?.observacao || '',
      designacao: selectedItem?.designacao || '',
    }),
    [selectedItem, cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(updateItem('origem', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Origem atualizada' }));
      } else {
        dispatch(createItem('origem', JSON.stringify(values), { mail, msg: 'Origem adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('origem', { mail, id: selectedItem.id, msg: 'Origem eliminada', perfilId: cc?.perfil_id }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  useEffect(() => {
    setFindConcelhos(_concelhos.filter((_concelho) => _concelho?.ilha === values?.ilha));
  }, [values?.ilha]);

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar origem' : 'Adicionar origem'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="designacao" label="Designação" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="seguimento" label="Segmento" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="codigo" label="Código" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteSimple name="tipo" label="Tipo" options={['Fiscal', 'Judicial']} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteSimple
                name="ilha"
                label="Ilha"
                options={[...new Set(_concelhos.map((obj) => obj.ilha))]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteSimple
                name="cidade"
                label="Concelho"
                options={[...new Set(findConcelhos.map((obj) => obj.concelho))]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="email" label="Email" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField name="telefone" label="Telefone" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={2} maxRows={4} label="Observação" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar esta origem'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

LinhaForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function LinhaForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({ linha: Yup.string().required('Linha não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ linha: selectedItem?.linha || '', descricao: selectedItem?.descricao || '' }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(
          updateItem('linha', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Linha de crédito atualizada' })
        );
      } else {
        dispatch(createItem('linha', JSON.stringify(values), { mail, msg: 'Linha de crédito adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('linha', {
          mail,
          perfilID: cc?.perfil_id,
          linhaID: selectedItem.id,
          msg: 'Linha de crédito eliminada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar linha de crédito' : 'Adicionar linha de crédito'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="linha" label="Linha" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="descricao" multiline minRows={2} maxRows={4} label="Descrição" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar esta linha de crédito'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TransicaoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func, fluxoId: PropTypes.number };

export function TransicaoForm({ isOpenModal, onCancel, fluxoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, estados, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;
  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    prazoemdias: Yup.string().required('Prazo não pode ficar vazio'),
    estado_inicial_id: Yup.mixed()
      .nullable('Estado inicial não pode ficar vazio')
      .required('Estado inicial não pode ficar vazio'),
    estado_final_id: Yup.mixed()
      .nullable('Estado final não pode ficar vazio')
      .required('Estado final não pode ficar vazio'),
    modo: Yup.mixed().nullable('Modo não pode ficar vazio').required('Modo não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      modo: selectedItem?.modo || null,
      perfilIDCC: cc?.perfil_id,
      to_alert: selectedItem?.to_alert || false,
      fluxo_id: selectedItem?.fluxo_id || fluxoId,
      prazoemdias: selectedItem?.prazoemdias || 0,
      hasopnumero: selectedItem?.hasopnumero || false,
      is_paralelo: selectedItem?.is_paralelo || false,
      arqhasopnumero: selectedItem?.arqhasopnumero || false,
      is_after_devolucao: selectedItem?.is_after_devolucao || false,
      estado_final_id: estadosList?.find((row) => row.id === selectedItem?.estado_final_id) || null,
      estado_inicial_id: estadosList?.find((row) => row.id === selectedItem?.estado_inicial_id) || null,
    }),
    [fluxoId, selectedItem, cc?.perfil_id, estadosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      values.estado_final_id = values?.estado_final_id?.id;
      values.estado_inicial_id = values?.estado_inicial_id?.id;
      if (selectedItem) {
        dispatch(
          updateItem('transicao', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Transição atualizada' })
        );
      } else {
        dispatch(createItem('transicao', JSON.stringify(values), { mail, msg: 'Transição adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('transicao', { mail, id: selectedItem.id, msg: 'Transição eliminada', perfilId: cc?.perfil_id })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteObject
                name="estado_inicial_id"
                label="Estado de origem"
                options={applySort(estadosList, getComparator('asc', 'label'))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteObject
                name="estado_final_id"
                label="Estado de destino"
                options={applySort(estadosList, getComparator('asc', 'label'))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutocompleteSimple name="modo" label="Modo" options={['Seguimento', 'Devolução']} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField
                label="Prazo"
                name="prazoemdias"
                InputProps={{ endAdornment: <InputAdornment position="end">dias</InputAdornment>, type: 'number' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch name="is_after_devolucao" labelPlacement="start" label="Depois de devolução" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <RHFSwitch name="to_alert" labelPlacement="start" label="Notificar" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <RHFSwitch name="is_paralelo" labelPlacement="start" label="Paralelo" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch name="hasopnumero" labelPlacement="start" label="Indicar nº de operação" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch name="arqhasopnumero" labelPlacement="start" label="Nº de operação no arquivo" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && 'eliminar esta transição'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

EstadosPerfilForm.propTypes = { onCancel: PropTypes.func, perfilId: PropTypes.number, isOpenModal: PropTypes.bool };

export function EstadosPerfilForm({ isOpenModal, perfilId, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { estados, done, error, isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;

  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));
  const estado = estadosList.find((row) => row.id === selectedItem?.estado_id) || null;

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`${done} com sucesso`, { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({ estado_id: Yup.mixed().required('Estado orgânica não pode ficar vazio') });

  const defaultValues = useMemo(
    () => ({
      estado_id: estado,
      perfil_id: Number(perfilId),
      perfil_id_cc: cc?.perfil?.id,
      data_limite: selectedItem?.data_limite ? new Date(selectedItem?.data_limite) : null,
      data_inicial: selectedItem?.data_inicial ? new Date(selectedItem?.data_inicial) : null,
    }),
    [selectedItem, cc?.perfil?.id, estado, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedItem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedItem, isOpenModal]);

  const onSubmit = async () => {
    try {
      values.estado_id = values?.estado_id?.id;
      if (isEdit) {
        dispatch(
          updateItem('estadoPerfil', JSON.stringify(values), { mail, id: selectedItem.id, msg: 'Estado atualizado' })
        );
      } else {
        dispatch(createItem('estadoPerfil', JSON.stringify(values), { mail, msg: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('estadoPerfil', { mail, id: selectedItem.id, msg: 'Estado eliminado', perfilId: cc?.perfil_id })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedItem ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject
                name="estado_id"
                label="Estado"
                options={applySort(estadosList, getComparator('asc', 'label'))}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="data_inicial"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    fullWidth
                    value={field.value}
                    label="Data de início"
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="data_limite"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    fullWidth
                    value={field.value}
                    label="Data de término"
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            {isEdit && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">Os estados atríbuidos não podem ser eliminados.</Typography>
                  <Typography variant="body2">Para desativar o estado, preencha a data de término.</Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
          <DialogButons
            edit={isEdit && emailIpf(mail)}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit && emailIpf(mail) && 'eliminar esta transição'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

PerfisEstadoForm.propTypes = { onCancel: PropTypes.func, estado: PropTypes.object, isOpenModal: PropTypes.bool };

export function PerfisEstadoForm({ isOpenModal, estado, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const colaboradoresNA = applyFilter1(colaboradores, estado?.perfis);

  useEffect(() => {
    if (done === 'Perfis adicionados') {
      enqueueSnackbar('Perfis adicionados com sucesso', { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const defaultValues = useMemo(() => ({ perfis: [{ perfil: null, data_limite: null, data_inicial: null }] }), []);
  const methods = useForm({ defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const perfisByCategoria = applyFilter(colaboradoresNA, values?.perfis);

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal]);

  const onSubmit = async () => {
    try {
      const formData = { estado_id: estado?.id, perfil_id_cc: cc?.perfil?.id, perfis: [] };
      values?.perfis?.forEach((row) => {
        formData?.perfis?.push({
          perfil_id: row?.perfil?.id,
          data_inicial: row?.data_inicial,
          data_limite: row?.data_limite,
        });
      });
      dispatch(createItem('perfisEstado', JSON.stringify(formData), { mail, msg: 'Perfis adicionados' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };
  const { fields, append, remove } = useFieldArray({ control, name: 'perfis' });

  const handleAdd = () => {
    append({ perfil: null, data_limite: null, data_inicial: null });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{`Adicionar colaborador ao estado » ${estado?.nome}`}</DialogTitle>
      <DialogContent sx={{ minWidth: { md: 820, sm: 520 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {fields.map((item, index) => (
              <Grid item xs={12} key={item.id}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocompleteObject
                      name={`perfis[${index}].perfil`}
                      label="Colaborador"
                      options={perfisByCategoria}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack alignItems="flex-end">
                      <Stack direction="row" spacing={1}>
                        <Controller
                          control={control}
                          name={`perfis[${index}].data_inicial`}
                          render={({ field }) => (
                            <DateTimePicker
                              fullWidth
                              label="Data de início"
                              value={field.value}
                              onChange={(newValue) => field.onChange(newValue)}
                              slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`perfis[${index}].data_limite`}
                          render={({ field }) => (
                            <DateTimePicker
                              fullWidth
                              label="Data de término"
                              value={field.value}
                              onChange={(newValue) => field.onChange(newValue)}
                              slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                            />
                          )}
                        />
                        {values.perfis.length > 1 && (
                          <Stack direction="row" alignItems="center">
                            <Tooltip title="Remover" arrow>
                              <Fab color="error" size="small" variant="soft" onClick={() => handleRemove(index)}>
                                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 20 }} />
                              </Fab>
                            </Tooltip>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            {perfisByCategoria.length > 0 && (
              <Grid item xs={12}>
                <Button size="small" variant="soft" startIcon={<AddCircleIcon />} onClick={handleAdd}>
                  Colaborador
                </Button>
              </Grid>
            )}
          </Grid>
          <DialogButons isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

function applyFilter(colaboradores, perfisSelect) {
  perfisSelect?.forEach((row) => {
    colaboradores = colaboradores.filter((colab) => colab?.perfil_id !== row?.perfil?.id);
  });
  const perfisFiltered = colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }));
  return perfisFiltered;
}

function applyFilter1(colaboradores, perfisSelect) {
  perfisSelect?.forEach((row) => {
    colaboradores = colaboradores.filter((colab) => colab?.perfil_id !== row?.perfil_id);
  });
  return colaboradores;
}
