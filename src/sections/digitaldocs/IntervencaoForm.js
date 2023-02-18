import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useCallback, useState } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Grid,
  Table,
  Dialog,
  TableRow,
  Checkbox,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// utils
import { format, add } from 'date-fns';
import { fNumber, fCurrency } from '../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import {
  resetItem,
  arquivarProcesso,
  finalizarProcesso,
  encaminharProcesso,
  desarquivarProcesso,
} from '../../redux/slices/digitaldocs';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { FormProvider, RHFTextField, RHFUploadMultiFile } from '../../components/hook-form';

// ----------------------------------------------------------------------

IntervencaoForm.propTypes = {
  title: PropTypes.object,
  onCancel: PropTypes.func,
  destinos: PropTypes.array,
  processo: PropTypes.object,
  isOpenModal: PropTypes.object,
};

export function IntervencaoForm({ isOpenModal, title, onCancel, destinos, processo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);

  useEffect(() => {
    if (done === 'realizada') {
      enqueueSnackbar('Intervenção realizada com sucesso', { variant: 'success' });
      dispatch(resetItem('processo'));
      navigate(PATH_DIGITALDOCS.processos.root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

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
    () => ({
      anexos: [],
      noperacao: '',
      observacao: '',
      acao: destinos?.length === 1 ? destinos?.[0] : null,
    }),
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
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={destinos?.map((option) => option)}
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isLoading, meuAmbiente, meusAmbientes } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'arquivado') {
      enqueueSnackbar('Processo arquivado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.processos.root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const deveInformarNConta = () => {
    if (processo?.is_interno) {
      if (meuAmbiente?.id === -1) {
        let i = 0;
        while (i < meusAmbientes?.length) {
          if (meusAmbientes[i]?.is_final) {
            return true;
          }
          i += 1;
        }
      } else if (meuAmbiente?.is_final) {
        return true;
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
    data_entrada: Yup.date().typeError('Data de entrada não pode ficar vazio').required('Data não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
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
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, open]);

  const onSubmit = async () => {
    try {
      values.data_entrada = ('data_entrada', format(values.data_entrada, 'yyyy-MM-dd'));
      dispatch(arquivarProcesso(JSON.stringify(values), processo.id, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
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
            {deveInformarNConta() && (
              <Grid item xs={12}>
                <RHFTextField name="conta" label="Nº de conta" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="noperacao" label="Nº de operação" InputProps={{ type: 'number' }} />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={8} label="Observação" />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="soft" color="error" loading={isLoading}>
              Arquivar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

DesarquivarForm.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  fluxoID: PropTypes.object,
  processoID: PropTypes.object,
};

export function DesarquivarForm({ open, onCancel, processoID, fluxoID }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);
  const { done, error, isSaving, destinosDesarquivamento } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'desarquivado') {
      enqueueSnackbar('Processo desarquivado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.arquivo.root);
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
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={applySort(destinosDesarquivamento, getComparator('asc', 'nome'))?.map((option) => option)}
                    getOptionLabel={(option) => option?.nome}
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { done, error, isLoading } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);

  useEffect(() => {
    if (open) {
      setSelecionados([]);
    }
  }, [open]);

  useEffect(() => {
    if (done === 'finalizado') {
      enqueueSnackbar('Processo finalizado com sucesso', { variant: 'success' });
      navigate(PATH_DIGITALDOCS.processos.root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

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
            <LoadingButton type="submit" variant="soft" loading={isLoading}>
              Finalizar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
