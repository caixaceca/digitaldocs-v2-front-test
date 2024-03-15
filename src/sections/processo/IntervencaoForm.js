import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import DialogTitle from '@mui/material/DialogTitle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FormControlLabel from '@mui/material/FormControlLabel';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
// utils
import { format, add } from 'date-fns';
import { podeSerAtribuido } from '../../utils/validarAcesso';
import { fNumber, fCurrency } from '../../utils/formatNumber';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem, closeModal } from '../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../hooks/useAnexos';
import useToggle, { useToggle1 } from '../../hooks/useToggle';
import { getComparator, applySort } from '../../hooks/useTable';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocomplete,
  RHFUploadMultiFile,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import DialogConfirmar from '../../components/DialogConfirmar';
import { DefaultAction, DialogButons, AnexosExistente } from '../../components/Actions';

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
  const [pendente, setPendente] = useState(false);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { motivosPendencias } = useSelector((state) => state.parametrizacao);
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());

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

  const formSchema = Yup.object().shape({
    destinos_par: inParalelo && Yup.array().min(1, 'Escolhe os destinos'),
    mpendencia: pendente && Yup.mixed().required('Motivo de pendência não pode ficar vazio'),
    observacao: title === 'Devolver' && Yup.string().required('Observação não pode ficar vazio'),
    estado: !inParalelo && Yup.mixed().nullable('Estado não pode ficar vazio').required('Escolhe um estado'),
  });

  const defaultValues = useMemo(
    () => ({
      mobs: '',
      anexos: [],
      perfil: null,
      pender: false,
      noperacao: '',
      observacao: '',
      destinos_par: [],
      mpendencia: null,
      pendenteLevantamento: false,
      estado: destinos?.length === 1 ? destinos?.[0] : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  const aberturaSemEntidadeGerencia =
    values?.estado &&
    !processo?.entidade &&
    title === 'Encaminhar' &&
    processo?.assunto === 'Abertura de conta' &&
    processo?.estado_atual?.includes('Gerência') &&
    !values?.estado?.label?.includes('Atendimento');

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, isOpenModal]);

  const onSubmit = async () => {
    try {
      const formData = [];
      let haveAnexos = false;
      let formPendencia = null;
      const atribuir =
        values?.perfil?.id ||
        (values?.estado?.label?.includes('Atendimento') && podeSerAtribuido(processo?.assunto) && criador?.perfil_id) ||
        '';
      if (values?.pendenteLevantamento || values?.pender) {
        formPendencia = {
          pender: true,
          fluxo_id: processo?.fluxo_id,
          mobs: values?.pendenteLevantamento ? 'Para levantamento do pedido' : values?.mobs,
          mpendencia: values?.pendenteLevantamento
            ? motivosPendencias?.find((row) => row?.motivo === 'Cliente')?.id
            : values?.mpendencia?.id,
        };
      }
      const colocarPendente = (values?.pendenteLevantamento || values?.pender) && formPendencia?.mpendencia;

      if (inParalelo) {
        values?.destinos_par?.forEach((row) => {
          const destino = destinosParalelo?.find((item) => item?.label === row);
          if (destino) {
            formData?.push({
              perfil_afeto_id: '',
              transicao_id: destino?.id,
              observacao: values.observacao || '',
              noperacao: values.numero_operacao || '',
            });
          }
        });
      } else {
        formData?.push({
          transicao_id: values?.estado?.id,
          observacao: values.observacao || '',
          noperacao: values.numero_operacao || '',
          perfil_afeto_id: colocarPendente ? '' : atribuir,
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
        updateItem('encaminhar', JSON.stringify(formData), {
          mail,
          anexos,
          haveAnexos,
          colocarPendente,
          id: processo.id,
          perfilId: cc?.perfil_id,
          fluxoId: processo?.fluxo_id,
          pendencia: JSON.stringify(formPendencia),
          atribuir: colocarPendente ? atribuir : '',
          estadoId: values?.estado?.estado_final_id,
          msg: title === 'Devolver' ? 'devolvida' : 'encaminhada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  const setValueForm = (fild, newValue) => {
    setValue('perfil', null);
    setValue('estado', fild === 'estado' ? newValue : null);
    setValue('destinos_par', fild === 'destinos_par' ? newValue : []);
  };

  const segAt = values?.estado?.label?.includes('Atendimento');
  const onGerencia =
    processo?.estado_atual?.includes('Gerência') || processo?.estado_atual?.includes('Caixa Principal');

  const podeAtribuir =
    ((onGerencia && segAt) ||
      (processo?.estado_atual === 'Devolução AN' && values?.estado?.modo === 'Seguimento' && !segAt) ||
      processo?.estado_atual === 'Diário') &&
    colaboradoresList?.length > 0;

  const podeColocarPendente = onGerencia && segAt;

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
                <RHFAutocompleteObject
                  name="estado"
                  label="Estado"
                  options={destinosSingulares}
                  onChange={(event, newValue) => {
                    setPendente(false);
                    setValue('pender', false);
                    setValueForm('estado', newValue);
                  }}
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
                    <RHFAutocompleteObject name="perfil" label="Colaborador" options={colaboradoresList} />
                  </Grid>
                )}
                {values?.estado?.hasopnumero && (
                  <Grid item xs={12}>
                    <RHFNumberField name="noperacao" required label="Nº de operação" />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
                </Grid>
                <Grid item xs={12}>
                  <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
                </Grid>
                {(podeColocarPendente && !podeSerAtribuido(processo?.assunto) && title === 'Encaminhar' && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 0.5, pb: 1 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <RHFSwitch
                            name="pendenteLevantamento"
                            label="Pendente de levantamento"
                            onChange={(event, value) => {
                              setPendente(false);
                              setValue('mobs', '');
                              setValue('pender', false);
                              setValue('mpendencia', null);
                              setValue('pendenteLevantamento', value);
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                )) ||
                  (podeColocarPendente && podeSerAtribuido(processo?.assunto) && (
                    <Grid item xs={12}>
                      <Card sx={{ p: values.pender ? 1.5 : 0.5 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={values.pender ? 4 : 12}>
                            <RHFSwitch
                              name="pender"
                              label="Pendente"
                              onChange={(event, value) => {
                                setPendente(value);
                                setValue('mobs', '');
                                setValue('pender', value);
                                setValue('mpendencia', null);
                              }}
                            />
                          </Grid>
                          {values.pender && (
                            <>
                              <Grid item xs={8}>
                                <RHFAutocompleteObject
                                  label="Motivo"
                                  name="mpendencia"
                                  options={applySort(
                                    motivosPendencias?.map((row) => ({ id: row?.id, label: row?.motivo })),
                                    getComparator('asc', 'label')
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <RHFTextField name="mobs" label="Observação pendência" />
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
              </>
            )}
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important' }}>
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
  arquivoAg: PropTypes.array,
  processo: PropTypes.object,
};

export function ArquivarForm({ open, onCancel, processo, arquivoAg }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);

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
      Yup.number().typeError('Introduza o nº de conta do titular').positive('Introduza um nº de conta válido'),
    data_entrada: Yup.date()
      .typeError('Data de entrada não pode ficar vazio')
      .required('Data de entrada não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      observacao: '',
      perfilID: cc?.perfil?.id,
      fluxoID: processo?.fluxo_id,
      conta: processo?.conta || '',
      entidades: processo?.entidade,
      estadoID: processo?.estado_atual_id,
      noperacao: processo?.numero_operacao || '',
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
        entidades: values?.entidade,
        observacao: values?.observacao,
        noperacao: values?.numero_operacao,
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

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

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
                    Normalmente, este processo é encaminhado para outro estado fora da sua Unidade Orgânica,
                    certifique-se de que realmente pretende arquivá-lo em vez de encaminhá-lo.
                  </Typography>
                  <Typography sx={{ typography: 'caption', fontWeight: 700, mt: 1 }}>Posssíveis destinos:</Typography>
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
                <RHFNumberField name="noperacao" label="Nº de operação" />
              </Grid>
            )}
            {deveInformarNConta() && (
              <Grid item xs={12}>
                <RHFNumberField name="conta" label="Nº de conta" />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
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
  const { isSaving, destinosDesarquivamento } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    observacao: Yup.string().required('Observação não pode ficar vazio'),
    estadoID: Yup.mixed().nullable('Estado não pode ficar vazio').required('Estado não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ estadoID: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
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
              <RHFAutocompleteObject
                name="estadoID"
                label="Estado"
                options={applySort(
                  destinosDesarquivamento?.map((row) => ({ id: row?.id, label: row?.nome })),
                  getComparator('asc', 'nome')
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

FinalizarForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func };

export function FinalizarForm({ open, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (open) {
      setSelecionados([]);
    }
  }, [open]);

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
      <DialogTitle>Seleciona as contas a serem cativadas</DialogTitle>
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
                {!processo?.contasEleitosCativo ? (
                  <TableRow hover>
                    <TableCell colSpan={3} sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Não foi encontrado nenhuma conta disponível para cativo...
                    </TableCell>
                  </TableRow>
                ) : (
                  processo?.contasEleitosCativo?.map((row) => {
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
                        <TableCell align="right">{fCurrency(row?.saldo_cve)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
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
  const { selectedItem, done, isSaving } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (done === 'anexo parecer eliminado') {
      enqueueSnackbar('Anexo eliminado com sucesso', { variant: 'success' });
      setIdAnexo('');
      onClose1();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

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
      perfilID: selectedItem?.perfil_id || cc?.perfil_id,
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
      dispatch(updateItem('parecer', formData, { mail, id: selectedItem.id, processoId, msg: 'Parecer enviado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

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
      <DialogTitle>Parecer - {selectedItem?.estado_atual?.replace(' - P/S/P', '')}</DialogTitle>
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
              <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
              {selectedItem?.anexos?.filter((row) => row?.is_ativo)?.length > 0 && (
                <AnexosExistente
                  onOpen={handleEliminar}
                  anexos={selectedItem?.anexos
                    ?.filter((item) => item?.is_ativo)
                    .map((row) => ({ id: row?.id, name: row?.nome }))}
                />
              )}
            </Grid>
          </Grid>
          <DialogButons label="Enviar" isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
        <DialogConfirmar
          open={open1}
          isSaving={isSaving}
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

Resgatar.propTypes = { fluxoId: PropTypes.number, estadoId: PropTypes.number, processoId: PropTypes.number };

export function Resgatar({ fluxoId, estadoId, processoId }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc } = useSelector((state) => state.intranet);

  const handleResgatar = () => {
    const formData = { estado_id: estadoId, fluxoID: fluxoId, perfil_id: cc?.perfil_id };
    dispatch(updateItem('resgatar', JSON.stringify(formData), { id: processoId, mail, msg: 'Processo resgatado' }));
    onClose();
  };

  return (
    <>
      <DefaultAction label="RESGATAR" icon="resgatar" handleClick={onOpen} color="warning" />
      <DialogConfirmar
        open={open}
        onClose={onClose}
        isSaving={isSaving}
        handleOk={handleResgatar}
        color="warning"
        title="Resgatar"
        desc="resgatar este processo"
      />
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Cancelar.propTypes = {
  cancelar: PropTypes.bool,
  fluxoId: PropTypes.number,
  estadoId: PropTypes.number,
  processoId: PropTypes.number,
};

export function Cancelar({ cancelar = false, fluxoId, estadoId, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(
    () => ({ descricao: '', perfilID: cc?.perfil?.id, estado_colaborador_id: estadoId }),
    [cc?.perfil?.id, estadoId]
  );
  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      if (cc?.perfil?.id && estadoId) {
        dispatch(
          updateItem('fechar', JSON.stringify(values), {
            mail,
            id: processoId,
            perfilId: cc?.perfil_id,
            msg: cancelar ? 'Envio cancelado' : 'Pareceres fechado',
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleCancelar = () => {
    dispatch(
      updateItem('cancelar', JSON.stringify({ estadoID: estadoId, fluxoID: fluxoId, perfilID: cc?.perfil_id }), {
        mail,
        id: processoId,
        perfilId: cc?.perfil_id,
        msg: cancelar ? 'Envio cancelado' : 'Pareceres fechado',
      })
    );
    onClose();
  };

  return (
    <>
      <Tooltip title={cancelar ? 'CANCELAR' : 'FECHAR'} arrow>
        <Fab color={cancelar ? 'error' : 'warning'} size="small" variant="soft" onClick={onOpen}>
          {cancelar ? <BlockIcon /> : <CloseIcon />}
        </Fab>
      </Tooltip>

      {cancelar ? (
        <DialogConfirmar
          open={open}
          onClose={onClose}
          isSaving={isSaving}
          handleOk={handleCancelar}
          color="error"
          title="Cancelar envio do processo"
          desc="cancelar o envio deste processo para parecer"
          descSec="ATENÇÃO: Esta ação é irreversível e eliminará os dados dos parceres enviados neste seguimento."
        />
      ) : (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
          <DialogTitle>Fechar processo para parecer</DialogTitle>
          <DialogContent>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <RHFTextField name="descricao" multiline minRows={4} maxRows={6} label="Observação" />
                </Grid>
              </Grid>
              <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
                <Box sx={{ flexGrow: 1 }} />
                <LoadingButton variant="outlined" color="inherit" onClick={onClose}>
                  Cancelar
                </LoadingButton>
                <LoadingButton type="submit" variant="soft" color="warning" loading={isSaving}>
                  Fechar
                </LoadingButton>
              </DialogActions>
            </FormProvider>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AtribuirForm.propTypes = {
  fluxoId: PropTypes.number,
  perfilId: PropTypes.number,
  processoID: PropTypes.number,
  colaboradoresList: PropTypes.array,
};

export function AtribuirForm({ processoID, perfilId, fluxoId, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);

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
          fluxoId,
          processoID,
          perfilID: cc?.perfil_id,
          msg: 'Processo atribuído',
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
          fluxoId,
          processoID,
          perfilIDAfeto: '',
          perfilID: cc?.perfil_id,
          msg: 'Atribuição eliminada',
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
            <DialogButons
              label="Atribuir"
              isSaving={isSaving}
              onCancel={onClose}
              handleDelete={handleDelete}
              desc={perfilId ? 'eliminar esta atribuição' : ''}
            />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ColocarPendente.propTypes = { from: PropTypes.string };

export function ColocarPendente({ from }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [levantamento, setLevantamento] = useState(false);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { motivosPendencias } = useSelector((state) => state.parametrizacao);
  const { selectedItem, isOpenModal, isSaving } = useSelector((state) => state.digitaldocs);
  const pendencia = motivosPendencias?.find((row) => Number(row?.id) === Number(selectedItem?.mpendencia)) || null;

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const formSchema = Yup.object().shape({
    mpendencia: !levantamento && Yup.mixed().required('Motivo de pendência não pode ficar vazio'),
  });
  const defaultValues = useMemo(
    () => ({
      pendenteLevantamento: false,
      mobs: selectedItem?.mobs || '',
      mpendencia: pendencia ? { id: pendencia?.id, label: pendencia?.motivo } : null,
      atribuir: !selectedItem?.estado_atual?.includes('Gerência') && podeSerAtribuido(selectedItem?.assunto),
    }),
    [selectedItem, pendencia]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'pendencia',
          JSON.stringify({
            pender: true,
            fluxo_id: selectedItem?.fluxo_id,
            mobs: values?.pendenteLevantamento ? 'Para levantamento do pedido' : values?.mobs,
            mpendencia: values?.pendenteLevantamento
              ? motivosPendencias?.find((row) => row?.motivo === 'Cliente')?.id
              : values?.mpendencia?.id,
          }),
          {
            mail,
            from,
            id: selectedItem?.id,
            perfilId: cc?.perfil_id,
            atribuir: values?.atribuir,
            aceitar: !selectedItem?.preso,
            fluxoId: selectedItem?.fluxo_id,
            estadoId: selectedItem?.estado_atual_id || selectedItem?.estado_id,
            msg: 'Processo adicionado a listagem de pendentes',
          }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
      <DialogTitle>Processo pendente</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {!values?.atribuir && (
              <Grid item xs={12}>
                <RHFSwitch
                  name="pendenteLevantamento"
                  label="Pendente de levantamento"
                  onChange={(event, value) => {
                    setLevantamento(value);
                    setValue('pendenteLevantamento', value);
                  }}
                />
              </Grid>
            )}
            {!values?.pendenteLevantamento && (
              <>
                <Grid item xs={12}>
                  <RHFAutocompleteObject
                    label="Motivo"
                    name="mpendencia"
                    options={applySort(
                      motivosPendencias?.map((row) => ({ id: row?.id, label: row?.motivo })),
                      getComparator('asc', 'label')
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="mobs" label="Observação" />
                </Grid>
              </>
            )}
          </Grid>
          <DialogButons edit isSaving={isSaving} onCancel={handleCloseModal} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Abandonar.propTypes = { processo: PropTypes.object, isSaving: PropTypes.bool };

export function Abandonar({ isSaving, processo }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const handleAbandonar = () => {
    dispatch(
      updateItem('abandonar', null, {
        id: processo?.id,
        mail,
        perfilId: cc?.perfil_id,
        msg: 'Processo abandonado',
        fluxoId: processo?.fluxo_id,
        estadoId: processo?.estado_atual_id || processo?.ultimo_estado_id,
      })
    );
  };

  return (
    <>
      <DefaultAction color="warning" icon="abandonar" handleClick={onOpen} label="ABANDONAR" />
      <DialogConfirmar
        open={open}
        onClose={onClose}
        isSaving={isSaving}
        handleOk={handleAbandonar}
        color="warning"
        title="Abandonar"
        desc="abandonar este processo"
      />
    </>
  );
}
