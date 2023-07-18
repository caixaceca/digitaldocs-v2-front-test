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
  Stack,
  Alert,
  Table,
  Switch,
  Dialog,
  Tooltip,
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
  FormControlLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import CircleIcon from '@mui/icons-material/Circle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
// utils
import { format, add } from 'date-fns';
import { getFileThumb } from '../../utils/getFileFormat';
import { fNumber, fCurrency } from '../../utils/formatNumber';
// redux
import { createItem, updateItem, deleteItem } from '../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../redux/store';
// hooks
import useToggle, { useToggle1 } from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// components
import {
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocomplete,
  RHFUploadMultiFile,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import { DeleteItem } from '../../components/Actions';
import SvgIconStyle from '../../components/SvgIconStyle';
import DialogConfirmar from '../../components/DialogConfirmar';

// --------------------------------------------------------------------------------------------------------------------------------------------

IntervencaoForm.propTypes = {
  title: PropTypes.string,
  onCancel: PropTypes.func,
  destinos: PropTypes.array,
  processo: PropTypes.object,
  isOpenModal: PropTypes.bool,
  colaboradoresList: PropTypes.array,
};

export function IntervencaoForm({ title, onCancel, destinos, isOpenModal, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { error, isSaving, processo } = useSelector((state) => state.digitaldocs);
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());
  const podeSerAtribuido =
    !processo?.assunto?.includes('Cartão') &&
    !processo?.assunto?.includes('Extrato') &&
    !processo?.assunto?.includes('Declarações');

  const destinosSingulares = [];
  const destinosParalelo = [];
  destinos?.forEach((row) => {
    if (row?.paralelo) {
      destinosParalelo.push(row);
    } else {
      destinosSingulares.push(row);
    }
  });
  const [inParalelo, setInParalelo] = useState(destinosParalelo?.length > 0 && destinosSingulares?.length === 0);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    destinos_par: inParalelo && Yup.array().min(1, 'Escolhe os destinos'),
    observacao: title === 'Devolver' && Yup.string().required('Observação não pode ficar vazio'),
    acao: !inParalelo && Yup.mixed().nullable('Ação não pode ficar vazio').required('Escolhe uma ação'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      perfil: null,
      noperacao: '',
      observacao: '',
      destinos_par: [],
      acao: destinos?.length === 1 ? destinos?.[0] : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, setValue, handleSubmit } = methods;
  const values = watch();

  const aberturaSemEntidadeGerencia =
    values?.acao &&
    !processo?.entidades &&
    title === 'Encaminhar' &&
    processo?.nome?.includes('Gerência') &&
    processo?.assunto === 'Abertura de conta' &&
    !values?.acao?.label?.includes('Atendimento');

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, isOpenModal]);

  const onSubmit = async () => {
    try {
      let haveAnexos = false;
      const formData = [];
      if (inParalelo) {
        values?.destinos_par?.forEach((row) => {
          const destino = destinosParalelo?.find((item) => item?.label === row);
          if (destino) {
            formData?.push({
              perfilIDAfeto: '',
              modo: destino?.modo,
              perfilID: cc?.perfil_id,
              transicaoID: destino?.id,
              noperacao: values.noperacao,
              observacao: values.observacao,
              estado_finalID: destino?.estado_final_id,
            });
          }
        });
      } else {
        formData?.push({
          perfilID: cc?.perfil_id,
          modo: values?.acao?.modo,
          noperacao: values.noperacao,
          observacao: values.observacao,
          transicaoID: values?.acao?.id,
          estado_finalID: values?.acao?.estado_final_id,
          perfilIDAfeto:
            values?.perfil?.id ||
            (values?.acao?.label?.includes('Atendimento') && podeSerAtribuido && criador?.perfil_id) ||
            '',
        });
      }
      const anexos = new FormData();
      if (values?.anexos?.length > 0) {
        haveAnexos = true;
        anexos.append('perfilID', cc?.perfil_id);
        const listaanexo = values.anexos;
        for (let i = 0; i < listaanexo.length; i += 1) {
          anexos.append('anexos', listaanexo[i]);
        }
      }

      dispatch(
        createItem('encaminhar', JSON.stringify(formData), {
          mail,
          anexos,
          haveAnexos,
          id: processo.id,
          msg: 'realizada',
        })
      );
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

  const setValueForm = (fild, newValue) => {
    setValue('perfil', null);
    setValue('acao', fild === 'acao' ? newValue : null);
    setValue('destinos_par', fild === 'destinos_par' ? newValue : []);
  };

  const podeAtribuir =
    ((processo?.nome?.includes('Gerência') && values?.acao?.label?.includes('Atendimento')) ||
      (processo?.nome === 'Devolução AN' && values?.acao?.modo === 'Seguimento') ||
      processo?.nome === 'Diário') &&
    colaboradoresList?.length > 0;

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {destinosParalelo?.length > 0 && destinosSingulares?.length > 0 && (
              <Grid item xs={12} sx={{ mt: -2 }}>
                <FormControlLabel
                  control={<Switch checked={inParalelo} />}
                  label="Envio em paralelo"
                  onChange={(event, newValue) => {
                    setInParalelo(newValue);
                    setValueForm();
                  }}
                  sx={{ width: 1, justifyContent: 'center' }}
                />
              </Grid>
            )}
            {inParalelo ? (
              <Grid item xs={12}>
                <RHFAutocomplete
                  multiple
                  freeSolo
                  label="Destinos"
                  name="destinos_par"
                  disableCloseOnSelect
                  options={destinosParalelo.map((option) => option.label)}
                  onChange={(event, newValue) => setValueForm('destinos_par', newValue)}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginLeft: -8 }} checked={selected} />
                      {option}
                    </li>
                  )}
                />
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Controller
                  name="acao"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      options={destinosSingulares}
                      onChange={(event, newValue) => setValueForm('acao', newValue)}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      getOptionLabel={(option) => option?.label}
                      renderInput={(params) => (
                        <TextField {...params} label="Ação" error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>
            )}
            {aberturaSemEntidadeGerencia ? (
              <Grid item xs={12}>
                <Typography>
                  Processo de <b>Abertura de Conta</b> não pode ser encaminhado sem <b>entidade(s)</b>!
                </Typography>
                <Typography>
                  Por favor edita o processo, adicionando a(s) entidade(s) e depois prossiga com o devido
                  encaminhamento.
                </Typography>
              </Grid>
            ) : (
              <>
                {podeAtribuir && (
                  <Grid item xs={12}>
                    <RHFAutocompleteObject
                      name="perfil"
                      label="Colaborador"
                      options={applySort(colaboradoresList, getComparator('asc', 'label'))}
                    />
                  </Grid>
                )}
                {values?.acao?.hasopnumero && (
                  <Grid item xs={12}>
                    <RHFTextField name="noperacao" required label="Nº de operação" InputProps={{ type: 'number' }} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
                </Grid>
                <Grid item xs={12}>
                  <RHFUploadMultiFile
                    name="anexos"
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                    onRemoveAll={handleRemoveAll}
                  />
                </Grid>
              </>
            )}
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            {aberturaSemEntidadeGerencia ? (
              ''
            ) : (
              <LoadingButton type="submit" variant="contained" loading={isSaving}>
                Enviar
              </LoadingButton>
            )}
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ArquivarForm.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  arquivoAg: PropTypes.bool,
  processo: PropTypes.object,
};

export function ArquivarForm({ open, onCancel, processo, arquivoAg }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { error, isSaving, meusAmbientes } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const deveInformarNConta = () => {
    if (
      processo?.is_interno &&
      processo?.assunto !== 'Encerramento de conta' &&
      (!processo?.limpo || processo?.assunto === 'Receção de faturas / Pagamento de fornecedor')
    ) {
      let i = 0;
      while (i < meusAmbientes?.length) {
        if (meusAmbientes[i]?.id === processo?.estado_atual_id && meusAmbientes[i]?.is_final) {
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
    data_entrada: Yup.date().typeError('Data de entrada não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      observacao: '',
      perfilID: cc?.perfil?.id,
      fluxoID: processo?.fluxo_id,
      conta: processo?.conta || '',
      entidades: processo?.entidades,
      estadoID: processo?.estado_atual_id,
      noperacao: processo?.noperacao || '',
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
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
      let haveA = false;
      const anexos = new FormData();
      if (values?.anexos?.length > 0) {
        haveA = true;
        anexos.append('perfilID', cc?.perfil_id);
        const listaanexo = values.anexos;
        for (let i = 0; i < listaanexo.length; i += 1) {
          anexos.append('anexos', listaanexo[i]);
        }
      }
      dispatch(
        createItem('arquivar', JSON.stringify(formData), { mail, haveA, anexos, id: processo.id, msg: 'arquivado' })
      );
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
            {arquivoAg?.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="body2">
                    Este processo geralmente é encaminhado para outro estado fora da sua U.O.
                  </Typography>
                  <Typography variant="body2">
                    Certifique de que pretendes mesmo o arquivar em vez de encaminhar.
                  </Typography>
                  <Typography sx={{ typography: 'caption', fontWeight: 700 }}>Posssíveis destinos:</Typography>
                  {arquivoAg?.map((row) => (
                    <Stack key={row} direction="row" spacing={0.5} alignItems="center">
                      <CircleIcon sx={{ width: 8, height: 8, ml: 1 }} />
                      <Typography variant="caption">{row}</Typography>
                    </Stack>
                  ))}
                </Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={processo?.assunto !== 'Encerramento de conta' ? 6 : 12}>
              <RHFDatePicker name="data_entrada" label="Data de entrada" disableFuture />
            </Grid>
            {processo?.assunto !== 'Encerramento de conta' && (
              <Grid item xs={12} sm={6}>
                <RHFTextField name="noperacao" label="Nº de operação" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            {deveInformarNConta() && (
              <Grid item xs={12}>
                <RHFTextField name="conta" label="Nº de conta" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
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
  const { mail, cc } = useSelector((state) => state.intranet);
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
        perfilIDCC: cc?.perfil_id,
        estadoID: values?.estadoID?.id,
        observacao: values?.observacao,
      };
      dispatch(updateItem('desarquivar', JSON.stringify(dados), { id: processoID, mail, msg: 'desarquivado' }));
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
  const { mail, cc } = useSelector((state) => state.intranet);

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
      perfil_id: cc?.perfil_id,
      fluxoID: processo?.fluxo_id,
      estado_id: processo?.estado_atual_id,
    }),
    [processo, cc]
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
        dispatch(updateItem('finalizar', JSON.stringify(values), { id: processo?.id, mail, msg: 'finalizado' }));
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
            {selecionados?.length > 0 && (
              <LoadingButton type="submit" variant="soft" loading={isSaving}>
                Finalizar
              </LoadingButton>
            )}
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
  const { mail, cc } = useSelector((state) => state.intranet);
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
      validado: selectedItem?.validado || false,
      descricao: selectedItem?.parecer_obs || '',
      perfilID: selectedItem?.parecer_perfil_id || cc?.perfil_id,
    }),
    [selectedItem, cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
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
      dispatch(updateItem('parecer', formData, { mail, id: selectedItem.id, processoId, msg: 'parecer enviado' }));
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
        perfilId: cc?.perfil_id,
        parecerId: selectedItem?.id,
        msg: 'anexo parecer eliminado',
      })
    );
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>Parecer - {selectedItem?.nome}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteSimple
                name="parecer"
                label="Parecer"
                options={['Favorável', 'Não favorável', 'Favorável parcial']}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField name="descricao" multiline minRows={5} maxRows={10} label="Descrição" />
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

// --------------------------------------------------------------------------------------------------------------------------------------------

Resgatar.propTypes = { fluxiId: PropTypes.number, estadoId: PropTypes.number, processoId: PropTypes.number };

export function Resgatar({ fluxiId, estadoId, processoId }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleResgatar = () => {
    const formData = { estado_id: estadoId, fluxoID: fluxiId, perfil_id: cc?.perfil_id };
    dispatch(updateItem('resgatar', JSON.stringify(formData), { id: processoId, mail, msg: 'resgatado' }));
    onClose();
  };

  return (
    <>
      <Tooltip title="RESGATAR" arrow>
        <Fab color="warning" size="small" variant="soft" onClick={onOpen}>
          <SettingsBackupRestoreOutlinedIcon />
        </Fab>
      </Tooltip>

      <DialogConfirmar
        open={open}
        onClose={onClose}
        isLoading={isSaving}
        handleOk={handleResgatar}
        color="warning"
        title="Resgatar"
        desc="resgatar este processo"
      />
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Cancelar.propTypes = { fluxiId: PropTypes.number, estadoId: PropTypes.number, processoId: PropTypes.number };

export function Cancelar({ fluxiId, estadoId, processoId }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleCancelar = () => {
    const formData = { estadoID: estadoId, fluxoID: fluxiId, perfilID: cc?.perfil_id };
    dispatch(
      updateItem('cancelar', JSON.stringify(formData), {
        mail,
        id: processoId,
        msg: 'cancelado',
        perfilId: cc?.perfil_id,
      })
    );
    onClose();
  };

  return (
    <>
      <Tooltip title="CANCELAR" arrow>
        <Fab color="error" size="small" variant="soft" onClick={onOpen}>
          <CancelOutlinedIcon />
        </Fab>
      </Tooltip>

      <DialogConfirmar
        open={open}
        onClose={onClose}
        isLoading={isSaving}
        handleOk={handleCancelar}
        color="error"
        title="Cancelar"
        desc="cancelar o envio deste processo para parecer"
        descSec="ATENÇÃO: Esta ação é irreversível e eliminará os dados dos parceres enviados neste seguimento."
      />
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AtribuirForm.propTypes = {
  perfilId: PropTypes.number,
  processoID: PropTypes.number,
  colaboradoresList: PropTypes.array,
};

export function AtribuirForm({ processoID, perfilId, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { toggle1: open1, onOpen1, onClose1 } = useToggle1();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { error, done, isSaving } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'atribuido') {
      enqueueSnackbar('Processo atribuído com sucesso', { variant: 'success' });
      onClose();
    } else if (done === 'atribuicao eliminada') {
      enqueueSnackbar('Atribuição eliminada com sucesso', { variant: 'success' });
      onClose1();
      onClose();
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
    perfil: Yup.mixed().nullable('Colaborador não pode ficar vazio').required('Colaborador não pode ficar vazio'),
  });
  const defaultValues = useMemo(
    () => ({ perfil: perfilId ? colaboradoresList?.find((row) => row?.id === perfilId) : null }),
    [colaboradoresList, perfilId]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem('atribuir', '', {
          mail,
          processoID,
          msg: 'atribuido',
          perfilID: cc?.perfil_id,
          perfilIDAfeto: values?.perfil?.id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      dispatch(
        updateItem('atribuir', '', {
          mail,
          processoID,
          perfilIDAfeto: '',
          perfilID: cc?.perfil_id,
          msg: 'atribuicao eliminada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar esta atribução', { variant: 'error' });
    }
  };

  return (
    <>
      <Tooltip title="ATRIBUIR" arrow>
        <Fab color="info" size="small" variant="soft" onClick={onOpen}>
          <PersonAddIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Atribuir processo</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject
                  name="perfil"
                  label="Colaborador"
                  options={applySort(colaboradoresList, getComparator('asc', 'label'))}
                />
              </Grid>
            </Grid>
            <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
              {perfilId && (
                <>
                  <DeleteItem handleDelete={onOpen1} />
                  <DialogConfirmar
                    open={open1}
                    onClose={onClose1}
                    isLoading={isSaving}
                    handleOk={handleDelete}
                    title="Eliminar atribuição"
                    desc="eliminar esta atribuição"
                  />
                </>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <LoadingButton variant="outlined" color="inherit" onClick={onClose}>
                Cancelar
              </LoadingButton>
              <LoadingButton type="submit" variant="soft" color="info" loading={isSaving}>
                Atribuir
              </LoadingButton>
            </DialogActions>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}
