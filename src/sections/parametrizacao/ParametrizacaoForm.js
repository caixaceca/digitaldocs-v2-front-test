import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
// @mui
import {
  Box,
  Fab,
  Grid,
  Stack,
  Button,
  Dialog,
  Tooltip,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFTextField, RHFSwitch } from '../../components/hook-form';
// hooks
import useToggle from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';
// _mock
import { codacessos, objetos, _concelhos } from '../../_mock';

// --------------------------------------------------------------------------------------------------------------------------------------------

FluxoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function FluxoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { done, error, isSaving, selectedFluxo } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedFluxo;

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
    modelo: Yup.string().required('Modelo não pode ficar vazio'),
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      modelo: selectedFluxo?.modelo || '',
      assunto: selectedFluxo?.assunto || '',
      perfilID: currentColaborador?.perfil_id,
      observacao: selectedFluxo?.observacao || '',
      is_interno: selectedFluxo?.is_interno || false,
      is_credito: selectedFluxo?.is_credito || false,
    }),
    [selectedFluxo, currentColaborador?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedFluxo) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedFluxo]);

  const onSubmit = async () => {
    try {
      if (selectedFluxo) {
        dispatch(
          updateItem('fluxo', JSON.stringify(values), { mail, id: selectedFluxo.id, mensagem: 'Fluxo atualizado' })
        );
      } else {
        dispatch(createItem('fluxo', JSON.stringify(values), { mail, mensagem: 'Fluxo atualizado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('fluxo', {
          mail,
          id: selectedFluxo.id,
          mensagem: 'Fluxo eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedFluxo ? 'Editar fluxo' : 'Adicionar fluxo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFTextField name="assunto" label="Assunto" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="modelo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={['Série', 'Paralelo']}
                    renderInput={(params) => (
                      <TextField {...params} label="Modelo" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RHFSwitch
                name="is_interno"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Interno
                  </Typography>
                }
                sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <RHFSwitch
                name="is_credito"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Crédito
                  </Typography>
                }
                sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={3} maxRows={5} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar fluxo" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar fluxo"
                  desc="eliminar este fluxo"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

EstadoForm.propTypes = { isOpenModal: PropTypes.bool, onCancel: PropTypes.func };

export function EstadoForm({ isOpenModal, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador, uos } = useSelector((state) => state.intranet);
  const { done, error, isSaving, selectedEstado } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedEstado;

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

  const uosList = uos.map((row) => ({ id: row?.id, label: row?.label }));
  const uoSelect = uosList?.find((row) => row.id === selectedEstado?.uo_id) || null;

  const formSchema = Yup.object().shape({
    nome: Yup.string().required('Nome não pode ficar vazio'),
    uo_id: Yup.mixed()
      .nullable('Unidade orgânica não pode ficar vazio')
      .required('Unidade orgânica não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      uo_id: uoSelect,
      nome: selectedEstado?.nome || '',
      email: selectedEstado?.email || '',
      perfilID: currentColaborador?.perfil_id,
      is_final: selectedEstado?.is_final || false,
      observacao: selectedEstado?.observacao || '',
      is_decisao: selectedEstado?.is_decisao || false,
      is_inicial: selectedEstado?.is_inicial || false,
    }),
    [selectedEstado, currentColaborador, uoSelect]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedEstado) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedEstado, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (selectedEstado) {
        values.uo_id = values?.uo_id?.id;
        dispatch(
          updateItem('estado', JSON.stringify(values), { mail, id: selectedEstado.id, mensagem: 'Estado atualizado' })
        );
      } else {
        values.uo_id = values?.uo_id?.id;
        dispatch(createItem('estado', JSON.stringify(values), { mail, mensagem: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('estado', {
          mail,
          id: selectedEstado.id,
          mensagem: 'Estado eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedEstado ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
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
              <Controller
                name="uo_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(uosList, getComparator('asc', 'label'))}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Unidade orgânica" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch
                name="is_inicial"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Inicial
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch
                name="is_final"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Final
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch
                name="is_decisao"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Decisão
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={2} maxRows={4} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar estado" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar estado"
                  desc="eliminar este estado"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
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
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { done, error, isSaving, selectedAcesso } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedAcesso;

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
      perfilIDCC: currentColaborador?.perfil?.id,
      datalimite: selectedAcesso?.datalimite || null,
      objeto: selectedAcesso?.objeto ? objetos?.find((row) => row?.id === selectedAcesso?.objeto) : null,
      acesso: selectedAcesso?.acesso ? codacessos?.find((row) => row?.id === selectedAcesso?.acesso) : null,
    }),
    [selectedAcesso, currentColaborador?.perfil?.id, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedAcesso) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedAcesso, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        values.objeto = values.objeto.id;
        values.acesso = values.acesso.id;
        dispatch(
          updateItem('acesso', JSON.stringify(values), { mail, id: selectedAcesso.id, mensagem: 'Acesso atualizado' })
        );
      } else {
        values.objeto = values.objeto.id;
        values.acesso = values.acesso.id;
        dispatch(createItem('acesso', JSON.stringify(values), { mail, mensagem: 'Acesso atribuido' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('acesso', {
          mail,
          id: selectedAcesso.id,
          mensagem: 'Acesso eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedAcesso ? 'Editar acesso' : 'Adicionar acesso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="objeto"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    options={objetos}
                    getOptionLabel={(option) => option?.label}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Objeto" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="acesso"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    options={codacessos}
                    getOptionLabel={(option) => option?.label}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Acesso" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
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
                    renderInput={(params) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar acesso" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar acesso"
                  desc="eliminar este acesso"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
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
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { selectedItem, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const perfilId = currentColaborador?.perfil_id;
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
            mensagem: 'Motivo atualizado',
          })
        );
      } else {
        dispatch(
          createItem('motivo pendencia', JSON.stringify(values), { mail, perfilId, mensagem: 'Motivo adicionado' })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('motivo pendencia', { mail, perfilId, id: selectedItem.id, mensagem: 'Motivo eliminado' }));
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
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar motivo" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar motivo"
                  desc="eliminar este motivo"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
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
  const { toggle: open, onOpen, onClose } = useToggle();
  const [findConcelhos, setFindConcelhos] = useState([]);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { selectedOrigem, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedOrigem;

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
      tipo: selectedOrigem?.tipo || '',
      ilha: selectedOrigem?.ilha || '',
      email: selectedOrigem?.email || '',
      cidade: selectedOrigem?.cidade || '',
      codigo: selectedOrigem?.codigo || '',
      perfilID: currentColaborador?.perfil_id,
      telefone: selectedOrigem?.telefone || '',
      seguimento: selectedOrigem?.seguimento || '',
      observacao: selectedOrigem?.observacao || '',
      designacao: selectedOrigem?.designacao || '',
    }),
    [selectedOrigem, currentColaborador?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedOrigem) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedOrigem, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(
          updateItem('origem', JSON.stringify(values), { mail, id: selectedOrigem.id, mensagem: 'Origem atualizada' })
        );
      } else {
        dispatch(createItem('origem', JSON.stringify(values), { mail, mensagem: 'Origem adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('origem', {
          mail,
          id: selectedOrigem.id,
          mensagem: 'Origem eliminada',
          perfilId: currentColaborador?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  useEffect(() => {
    setFindConcelhos(_concelhos.filter((_concelho) => _concelho?.ilha === values?.ilha));
  }, [values?.ilha]);

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedOrigem ? 'Editar origem' : 'Adicionar origem'}</DialogTitle>
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
              <Controller
                name="tipo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={['Fiscal', 'Judicial']}
                    renderInput={(params) => (
                      <TextField {...params} label="Tipo" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="ilha"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={[...new Set(_concelhos.map((obj) => obj.ilha))]}
                    renderInput={(params) => (
                      <TextField {...params} label="Ilha" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cidade"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={[...new Set(findConcelhos.map((obj) => obj.concelho))]}
                    renderInput={(params) => (
                      <TextField {...params} label="Concelho" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
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
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar origem" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar origem"
                  desc="eliminar esta origem"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
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
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { selectedTransicao, estados, done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedTransicao;
  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));

  useEffect(() => {
    if (done) {
      enqueueSnackbar(`Transição ${done} com sucesso`, { variant: 'success' });
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
      modo: selectedTransicao?.modo || null,
      perfilIDCC: currentColaborador?.perfil_id,
      to_alert: selectedTransicao?.to_alert || false,
      fluxo_id: selectedTransicao?.fluxo_id || fluxoId,
      prazoemdias: selectedTransicao?.prazoemdias || '',
      hasopnumero: selectedTransicao?.hasopnumero || false,
      is_paralelo: selectedTransicao?.is_paralelo || false,
      arqhasopnumero: selectedTransicao?.arqhasopnumero || false,
      is_after_devolucao: selectedTransicao?.is_after_devolucao || false,
      estado_final_id: estadosList?.find((row) => row.id === selectedTransicao?.estado_final_id) || null,
      estado_inicial_id: estadosList?.find((row) => row.id === selectedTransicao?.estado_inicial_id) || null,
    }),
    [fluxoId, selectedTransicao, currentColaborador?.perfil_id, estadosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedTransicao) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedTransicao, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (selectedTransicao) {
        values.estado_final_id = values?.estado_final_id?.id;
        values.estado_inicial_id = values?.estado_inicial_id?.id;
        dispatch(
          updateItem('transicao', JSON.stringify(values), {
            mail,
            id: selectedTransicao.id,
            mensagem: 'Transição atualizada',
          })
        );
      } else {
        values.estado_final_id = values?.estado_final_id?.id;
        values.estado_inicial_id = values?.estado_inicial_id?.id;
        dispatch(createItem('transicao', JSON.stringify(values), { mail, mensagem: 'Transição adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('transicao', {
          mail,
          id: selectedTransicao.id,
          mensagem: 'Transição eliminada',
          perfilId: currentColaborador?.perfil_id,
        })
      );
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedTransicao ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="estado_inicial_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(estadosList, getComparator('asc', 'label'))}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Estado de origem" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="estado_final_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(estadosList, getComparator('asc', 'label'))}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Estado de destino" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="modo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={['Seguimento', 'Devolução']}
                    renderInput={(params) => (
                      <TextField {...params} label="Modo" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFTextField
                name="prazoemdias"
                label="Prazo"
                InputProps={{ endAdornment: <InputAdornment position="end">dias</InputAdornment>, type: 'number' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="is_after_devolucao"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Depois de devolução
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="to_alert"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Notificar
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="hasopnumero"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Indicar nº de operação
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="arqhasopnumero"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Nº de operação no arquivo
                  </Typography>
                }
                sx={{ justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFSwitch
                name="is_paralelo"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Paralelo
                  </Typography>
                }
                sx={{ width: 1, justifyContent: 'center' }}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar fluxo" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar transição"
                  desc="eliminar esta transição"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
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
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { estados, done, error, isSaving, selectedMeuEstado } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedMeuEstado;

  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));
  const estado = estadosList.find((row) => row.id === selectedMeuEstado?.estado_id) || null;

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
    estado_id: Yup.mixed()
      .nullable('Estado orgânica não pode ficar vazio')
      .required('Estado orgânica não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      estado_id: estado,
      perfil_id: Number(perfilId),
      perfil_id_cc: currentColaborador?.perfil?.id,
      data_limite: selectedMeuEstado?.data_limite ? new Date(selectedMeuEstado?.data_limite) : null,
      data_inicial: selectedMeuEstado?.data_inicial ? new Date(selectedMeuEstado?.data_inicial) : null,
    }),
    [selectedMeuEstado, currentColaborador?.perfil?.id, estado, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && selectedMeuEstado) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedMeuEstado, isOpenModal]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        values.estado_id = values?.estado_id?.id;
        dispatch(
          updateItem('meuEstado', JSON.stringify(values), {
            mail,
            id: selectedMeuEstado.id,
            mensagem: 'Estado atualizado',
          })
        );
      } else {
        values.estado_id = values?.estado_id?.id;
        dispatch(createItem('meuEstado', JSON.stringify(values), { mail, mensagem: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('meuEstado', {
          mail,
          id: selectedMeuEstado.id,
          mensagem: 'Estado eliminado',
          perfilId: currentColaborador?.perfil_id,
        })
      );
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedMeuEstado ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="estado_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(estadosList, getComparator('asc', 'label'))}
                    getOptionLabel={(option) => option?.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Estado" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="data_inicial"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    disablePast
                    label="Data de início"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
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
                    disablePast
                    label="Data de término"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            {isEdit && (
              <>
                <Tooltip title="Eliminar estado" arrow>
                  <Fab color="error" size="small" variant="soft" onClick={onOpen}>
                    <SvgIconStyle src="/assets/icons/trash.svg" />
                  </Fab>
                </Tooltip>
                <DialogConfirmar
                  open={open}
                  onClose={onClose}
                  isLoading={isSaving}
                  handleOk={handleDelete}
                  title="Eliminar estado"
                  desc="eliminar este estado"
                />
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              {!isEdit ? 'Adicionar' : 'Guardar'}
            </LoadingButton>
          </DialogActions>
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
  const { mail, currentColaborador, colaboradores } = useSelector((state) => state.intranet);
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

  const defaultValues = useMemo(
    () => ({
      perfis: [{ perfil: null, data_limite: null, data_inicial: null }],
    }),
    []
  );

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
      const formData = { estado_id: estado?.id, perfil_id_cc: currentColaborador?.perfil?.id, perfis: [] };
      values?.perfis?.forEach((row) => {
        formData?.perfis?.push({
          perfil_id: row?.perfil?.id,
          data_inicial: row?.data_inicial,
          data_limite: row?.data_limite,
        });
      });
      dispatch(createItem('perfisEstado', JSON.stringify(formData), { mail, mensagem: 'Perfis adicionados' }));
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
                    <Controller
                      name={`perfis[${index}].perfil`}
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          fullWidth
                          options={perfisByCategoria}
                          getOptionLabel={(option) => option?.label}
                          onChange={(event, newValue) => field.onChange(newValue)}
                          renderInput={(params) => <TextField required fullWidth {...params} label="Colaborador" />}
                        />
                      )}
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
                              disablePast
                              label="Data de início"
                              value={field.value}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                              }}
                              renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`perfis[${index}].data_limite`}
                          render={({ field }) => (
                            <DateTimePicker
                              fullWidth
                              disablePast
                              label="Data de término"
                              value={field.value}
                              onChange={(newValue) => {
                                field.onChange(newValue);
                              }}
                              renderInput={(params) => <TextField {...params} fullWidth />}
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
          <DialogActions sx={{ pb: '0px !important', px: '0px !important' }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Adicionar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function applyFilter(colaboradores, perfisSelect) {
  perfisSelect?.forEach((row) => {
    colaboradores = colaboradores.filter((colab) => colab?.perfil_id !== row?.perfil?.id);
  });

  const perfisFiltered = colaboradores?.map((row) => ({
    id: row?.perfil_id,
    label: row?.perfil?.displayName,
  }));

  return perfisFiltered;
}

function applyFilter1(colaboradores, perfisSelect) {
  perfisSelect?.forEach((row) => {
    colaboradores = colaboradores.filter((colab) => colab?.perfil_id !== row?.perfil_id);
  });

  return colaboradores;
}
