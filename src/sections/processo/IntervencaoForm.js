import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useCallback, useState } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Fab,
  List,
  Grid,
  Table,
  Dialog,
  ListItem,
  TableRow,
  Checkbox,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  Autocomplete,
  ListItemIcon,
  ListItemText,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { format, add } from 'date-fns';
import { getFileThumb } from '../../utils/getFileFormat';
import { fNumber, fCurrency } from '../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import {
  updateItem,
  deleteItem,
  arquivarProcesso,
  finalizarProcesso,
  encaminharProcesso,
  desarquivarProcesso,
} from '../../redux/slices/digitaldocs';
// hooks
import { useToggle1 } from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// components
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';
import { FormProvider, RHFTextField, RHFUploadMultiFile, RHFSwitch } from '../../components/hook-form';

// --------------------------------------------------------------------------------------------------------------------------------------------

IntervencaoForm.propTypes = {
  title: PropTypes.object,
  onCancel: PropTypes.func,
  destinos: PropTypes.array,
  processo: PropTypes.object,
  isOpenModal: PropTypes.object,
};

export function IntervencaoForm({ isOpenModal, title, onCancel, destinos, processo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const IntervencaoSchema = Yup.object().shape({
    observacao: title === 'Devolver' && Yup.string().required('Observação não pode ficar vazio'),
    acao: Yup.mixed().nullable('Ação não pode ficar vazio').required('Ação não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({ anexos: [], noperacao: '', observacao: '', acao: destinos?.length === 1 ? destinos?.[0] : null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(IntervencaoSchema), defaultValues });
  const { reset, watch, control, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, isOpenModal]);

  const onSubmit = async () => {
    try {
      let haveAnexos = false;
      const formData = {
        modo: values?.acao?.modo,
        noperacao: values.noperacao,
        observacao: values.observacao,
        transicaoID: values?.acao?.id,
        perfilID: currentColaborador?.perfil_id,
        estado_finalID: values?.acao?.estado_final_id,
      };
      const formDataAnexos = new FormData();
      if (values?.anexos?.length > 0) {
        haveAnexos = true;
        formDataAnexos.append('perfilID', currentColaborador?.perfil_id);
        const listaanexo = values.anexos;
        for (let i = 0; i < listaanexo.length; i += 1) {
          formDataAnexos.append('anexos', listaanexo[i]);
        }
      }
      dispatch(encaminharProcesso(processo.id, JSON.stringify(formData), haveAnexos, formDataAnexos, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const anexos = values.anexos || [];
      setValue('anexos', [
        ...anexos,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    },
    [setValue, values.anexos]
  );

  const handleRemoveAll = () => {
    setValue('anexos', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.anexos && values.anexos?.filter((_file) => _file !== file);
    setValue('anexos', filteredItems);
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ minWidth: { sm: 600 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="acao"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    options={destinos}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    getOptionLabel={(option) => `${option?.modo} para ${option?.estado_final_label}`}
                    renderInput={(params) => (
                      <TextField {...params} label="Ação" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            {values?.acao?.hasopnumero && (
              <Grid item xs={12}>
                <RHFTextField name="noperacao" required label="Nº de operação" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={8} label="Observação" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile
                name="anexos"
                onDrop={handleDrop}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Enviar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ArquivarForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func, processo: PropTypes.object };

export function ArquivarForm({ open, onCancel, processo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { error, isSaving, meusAmbientes } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const deveInformarNConta = () => {
    if (processo?.is_interno && processo?.assunto !== 'Encerramento de conta') {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.is_final) {
          return true;
        }
        i += 1;
      }
    }
    return false;
  };

  const formSchema = Yup.object().shape({
    conta:
      deveInformarNConta() &&
      Yup.number()
        .typeError('Introduza o nº de conta do titular')
        .positive('O nº de conta não pode ser negativo')
        .required('Introduza o nº de conta do titular'),
    data_entrada: Yup.date()
      .typeError('Data de entrada não pode ficar vazio')
      .required('Data de entrada não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      observacao: '',
      fluxoID: processo?.fluxo_id,
      conta: processo?.conta || '',
      entidades: processo?.entidades,
      estadoID: processo?.estado_atual_id,
      noperacao: processo?.noperacao || '',
      perfilID: currentColaborador?.perfil?.id,
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, open]);

  const onSubmit = async () => {
    try {
      const formData = {
        conta: values?.conta,
        fluxoID: values?.fluxoID,
        estadoID: values?.estadoID,
        perfilID: values?.perfilID,
        entidades: values?.entidades,
        noperacao: values?.noperacao,
        observacao: values?.observacao,
        data_entrada: format(values.data_entrada, 'yyyy-MM-dd'),
      };
      let haveAnexos = false;
      const formDataAnexos = new FormData();
      if (values?.anexos?.length > 0) {
        haveAnexos = true;
        formDataAnexos.append('perfilID', currentColaborador?.perfil_id);
        const listaanexo = values.anexos;
        for (let i = 0; i < listaanexo.length; i += 1) {
          formDataAnexos.append('anexos', listaanexo[i]);
        }
      }
      dispatch(arquivarProcesso(JSON.stringify(formData), processo.id, haveAnexos, formDataAnexos, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const anexos = values.anexos || [];
      setValue('anexos', [
        ...anexos,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    },
    [setValue, values.anexos]
  );

  const handleRemoveAll = () => {
    setValue('anexos', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.anexos && values.anexos?.filter((_file) => _file !== file);
    setValue('anexos', filteredItems);
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Arquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="data_entrada"
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    disableFuture
                    value={field.value}
                    label="Data de entrada"
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            {deveInformarNConta() && (
              <Grid item xs={12}>
                <RHFTextField name="conta" label="Nº de conta" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            {processo?.assunto !== 'Encerramento de conta' && (
              <Grid item xs={12}>
                <RHFTextField name="noperacao" label="Nº de operação" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={8} label="Observação" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile
                name="anexos"
                onDrop={handleDrop}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="soft" color="error" loading={isSaving}>
              Arquivar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DesarquivarForm.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  fluxoID: PropTypes.object,
  processoID: PropTypes.object,
};

export function DesarquivarForm({ open, onCancel, processoID, fluxoID }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { error, isSaving, destinosDesarquivamento } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    observacao: Yup.string().required('Observação não pode ficar vazio'),
    estadoID: Yup.mixed().nullable('Estado não pode ficar vazio').required('Estado não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ estadoID: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      const dados = {
        fluxoID,
        perfilID: null,
        estadoID: values?.estadoID?.id,
        observacao: values?.observacao,
        perfilIDCC: currentColaborador?.perfil_id,
      };
      dispatch(desarquivarProcesso(JSON.stringify(dados), processoID, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <DialogTitle>Desarquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="estadoID"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    getOptionLabel={(option) => option?.nome}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    options={applySort(destinosDesarquivamento, getComparator('asc', 'nome'))}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label="Estado" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="soft" color="error" loading={isSaving}>
              Desarquivar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

FinalizarForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func, processo: PropTypes.object };

export function FinalizarForm({ open, onCancel, processo }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (open) {
      setSelecionados([]);
    }
  }, [open]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const defaultValues = useMemo(
    () => ({
      cativos: [],
      fluxoID: processo?.fluxo_id,
      estado_id: processo?.estado_atual_id,
      perfil_id: currentColaborador?.perfil_id,
    }),
    [processo, currentColaborador]
  );

  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (processo && open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, open]);

  const onSubmit = async () => {
    try {
      if (selecionados?.length === 0) {
        enqueueSnackbar('Por favor selecionar as contas a serem cativadas', { variant: 'error' });
      } else {
        values.cativos = selecionados.map((row) => row?.id);
        dispatch(finalizarProcesso(JSON.stringify(values), processo?.id, mail));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleToggle = (value) => () => {
    const currentIndex = selecionados.indexOf(value);
    const novaLista = [...selecionados];

    if (currentIndex === -1) {
      novaLista.push(value);
    } else {
      novaLista.splice(currentIndex, 1);
    }

    setSelecionados(novaLista);
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Finalizar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <TableContainer sx={{ minWidth: 500, mt: 2, position: 'relative', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Conta</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell align="right">Saldo em CVE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processo?.contasEleitosCativo?.map((row) => {
                  const labelId = `checkbox-list-label-${row}`;
                  return (
                    <TableRow hover key={labelId} onClick={handleToggle(row)}>
                      <TableCell>
                        <Checkbox
                          edge="start"
                          tabIndex={-1}
                          disableRipple
                          sx={{ mt: -0.5 }}
                          checked={selecionados.indexOf(row) !== -1}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                        {row?.conta}
                      </TableCell>
                      <TableCell align="right">
                        {fNumber(row?.saldo)} {row?.moeda}
                      </TableCell>
                      <TableCell align="right">{fCurrency(row?.saldocve)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 1 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="soft" loading={isSaving}>
              Finalizar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ParecerForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func, processoId: PropTypes.number };

export function ParecerForm({ open, onCancel, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [idAnexo, setIdAnexo] = useState('');
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { mail, currentColaborador } = useSelector((state) => state.intranet);
  const { selectedItem, error, done, isSaving } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'parecer enviado') {
      enqueueSnackbar('Parecer enviado com sucesso', { variant: 'success' });
      onCancel();
    } else if (done === 'anexo parecer eliminado') {
      enqueueSnackbar('Anexo eliminado com sucesso', { variant: 'success' });
      setIdAnexo('');
      onClose1();
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
    descricao: Yup.string().required('Descrição não pode ficar vazio'),
    parecer: Yup.string().nullable('Parecer não pode ficar vazio').required('Parecer não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      parecerID: selectedItem?.id || '',
      parecer: selectedItem?.parecer || null,
      descricao: selectedItem?.descricao || '',
      validado: selectedItem?.validado || false,
      perfilID: selectedItem?.parecer_perfil_id || currentColaborador?.perfil_id,
    }),
    [selectedItem, currentColaborador?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, open]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('parecer', values.parecer);
      formData.append('validado', values.validado);
      formData.append('perfilID', values.perfilID);
      formData.append('descricao', values.descricao);
      formData.append('parecerID', values.parecerID);
      if (values.anexos) {
        const listaanexo = values.anexos;
        for (let i = 0; i < listaanexo.length; i += 1) {
          formData.append('anexos', listaanexo[i]);
        }
      }
      dispatch(updateItem('parecer', formData, { mail, id: selectedItem.id, processoId, mensagem: 'parecer enviado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const anexos = values.anexos || [];
      setValue('anexos', [
        ...anexos,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    },
    [setValue, values.anexos]
  );

  const handleRemoveAll = () => {
    setValue('anexos', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.anexos && values.anexos?.filter((_file) => _file !== file);
    setValue('anexos', filteredItems);
  };

  const handleEliminar = (id) => {
    setIdAnexo(id);
    onOpen1();
  };

  const handleCloseEliminar = () => {
    setIdAnexo('');
    onClose1();
  };

  const handleConfirmeEliminar = () => {
    dispatch(
      deleteItem('anexoParecer', {
        mail,
        id: idAnexo,
        parecerId: selectedItem?.id,
        mensagem: 'anexo parecer eliminado',
        perfilId: currentColaborador?.perfil_id,
      })
    );
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Parecer - {selectedItem?.nome}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={8}>
              <Controller
                name="parecer"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    options={['Favorável', 'Não favorável', 'Favorável parcial']}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Parecer" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <RHFSwitch
                name="validado"
                labelPlacement="start"
                label={
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Validar
                  </Typography>
                }
                sx={{ mt: { sm: 1 }, width: 1, justifyContent: 'center' }}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="descricao" multiline minRows={5} maxRows={8} label="Descrição" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile
                name="anexos"
                onDrop={handleDrop}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
              />
              {selectedItem?.anexos?.filter((row) => row?.is_ativo)?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Anexos existentes
                  </Typography>
                  <List disablePadding sx={{ mt: 1 }}>
                    {selectedItem?.anexos
                      ?.filter((item) => item?.is_ativo)
                      .map(
                        (anexo) =>
                          anexo.nome && (
                            <ListItem
                              key={anexo?.anexo}
                              sx={{
                                p: 1,
                                mb: 1,
                                borderRadius: 1,
                                border: (theme) => `solid 1px ${theme.palette.divider}`,
                              }}
                            >
                              <ListItemIcon>{getFileThumb(anexo.nome)}</ListItemIcon>
                              <ListItemText>{anexo.nome}</ListItemText>
                              <Fab
                                size="small"
                                color="error"
                                variant="soft"
                                sx={{ width: 30, height: 30 }}
                                onClick={() => handleEliminar(anexo.id)}
                              >
                                <SvgIconStyle src="/assets/icons/trash.svg" sx={{ width: 20 }} />
                              </Fab>
                            </ListItem>
                          )
                      )}
                  </List>
                </>
              )}
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="soft" loading={isSaving}>
              Enviar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
        <DialogConfirmar
          open={open1}
          isLoading={isSaving}
          onClose={handleCloseEliminar}
          handleOk={handleConfirmeEliminar}
          color="error"
          title="Eliminar"
          desc="eliminar este anexo"
        />
      </DialogContent>
    </Dialog>
  );
}
