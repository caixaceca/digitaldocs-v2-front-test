import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
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
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fNumber, fCurrency } from '../../../utils/formatNumber';
import { podeSerAtribuido, noEstado } from '../../../utils/validarAcesso';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import {
  getAll,
  selectItem,
  updateItem,
  deleteItem,
  closeModal,
  closeModalAnexo,
} from '../../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../../hooks/useAnexos';
import useToggle from '../../../hooks/useToggle';
import { getComparator, applySort } from '../../../hooks/useTable';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFUploadMultiFile,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../../components/hook-form';
import DialogConfirmar from '../../../components/DialogConfirmar';
import { DefaultAction, DialogButons, AnexosExistente } from '../../../components/Actions';

// --------------------------------------------------------------------------------------------------------------------------------------------

IntervencaoForm.propTypes = { title: PropTypes.string, destinos: PropTypes.array, colaboradoresList: PropTypes.array };

export function IntervencaoForm({ title, destinos, colaboradoresList }) {
  const dispatch = useDispatch();
  const devolucao = title === 'Devolver';
  const { enqueueSnackbar } = useSnackbar();
  const [pendente, setPendente] = useState(false);
  const { toggle: open, onOpen, onClose } = useToggle();
  const destinosParalelo = destinos?.filter((row) => row?.paralelo);
  const destinosSingulares = destinos?.filter((row) => !row?.paralelo);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { motivosPendencias } = useSelector((state) => state.parametrizacao);
  const [inParalelo, setInParalelo] = useState(destinosParalelo?.length > 0 && destinosSingulares?.length === 0);
  const criador = colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase());

  const formSchema = Yup.object().shape({
    estado: !inParalelo && Yup.mixed().required('Escolhe o estado'),
    motivo: pendente && Yup.mixed().required().label('Motivo de pendência'),
    destinos_par: inParalelo && Yup.array(Yup.object({ estado: Yup.mixed().required('Escolhe o estado') })),
    observacao:
      devolucao &&
      Yup.string()
        .required()
        .label(devolucao ? 'Motivo da devolução' : 'Observação'),
  });

  const defaultValues = useMemo(
    () => ({
      mobs: '',
      anexos: [],
      perfil: null,
      motivo: null,
      pender: false,
      noperacao: '',
      observacao: '',
      parecer_favoravel: null,
      pendenteLevantamento: false,
      estado: destinosSingulares?.length === 1 ? destinosSingulares?.[0] : null,
      destinos_par: [
        { estado: null, noperacao: '', observacao: '' },
        { estado: null, noperacao: '', observacao: '' },
      ],
    }),
    [destinosSingulares]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, setValue, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'destinos_par' });
  const destinosFiltered = applyFilter(
    destinosParalelo,
    values?.destinos_par?.map((row) => row?.estado?.id)
  );
  const temNumOperacao = values?.estado?.hasopnumero;
  const gerencia = noEstado(processo?.estado_processo?.estado, ['Gerência', 'Caixa Principal']);

  const aberturaSemEntidadeGerencia =
    gerencia &&
    values?.estado &&
    !processo?.entidade &&
    title === 'Encaminhar' &&
    processo?.assunto === 'Abertura de conta' &&
    !values?.estado?.label?.includes('Atendimento');

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, open]);

  const onSubmit = async () => {
    try {
      if (inParalelo) {
        const formData = [];
        values?.destinos_par?.forEach((row) => {
          formData?.push({ transicao_id: row?.estado?.id, noperacao: row?.noperacao, observacao: row?.observacao });
        });
        dispatch(
          updateItem('encaminhar paralelo', JSON.stringify(formData), {
            mail,
            id: processo.id,
            perfilId: cc?.perfil_id,
            msg: 'Processo encaminhado',
          })
        );
      } else {
        const atribuir =
          values?.perfil?.id ||
          (values?.estado?.label?.includes('Atendimento') &&
            podeSerAtribuido(processo?.assunto) &&
            criador?.perfil_id) ||
          '';
        const formPendencia =
          values?.pendenteLevantamento || values?.pender
            ? {
                pender: true,
                fluxo_id: processo?.fluxo_id,
                mobs: values?.pendenteLevantamento ? 'Para levantamento do pedido' : values?.mobs,
                mpendencia: values?.pendenteLevantamento
                  ? motivosPendencias?.find((row) => row?.motivo === 'Cliente')?.id
                  : values?.motivo?.id,
              }
            : null;
        const colocarPendente = !!formPendencia && !!formPendencia?.mpendencia;

        const formData = new FormData();
        formData.append('noperacao', values?.noperacao);
        formData.append('observacao', values?.observacao);
        formData.append('transicao_id ', values?.estado?.id);
        formData.append('perfil_afeto_id ', colocarPendente ? '' : atribuir);
        if (values?.parecer_favoravel === 'Favorável') {
          formData.append('parecer_favoravel', true);
        }
        if (values?.parecer_favoravel === 'Não favorável') {
          formData.append('parecer_favoravel', false);
        }
        values?.anexos?.forEach((row) => {
          formData.append('anexos', row);
        });

        dispatch(
          updateItem('encaminhar serie', formData, {
            mail,
            colocarPendente,
            id: processo.id,
            perfilId: cc?.perfil_id,
            fluxoId: processo?.fluxo_id,
            pendencia: JSON.stringify(formPendencia),
            atribuir: colocarPendente ? atribuir : '',
            estadoId: values?.estado?.estado_final_id,
            msg: devolucao ? 'Processo devolvido' : 'Processo encaminhado',
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);
  const podeAtribuir =
    (gerencia && values?.estado?.label?.includes('Atendimento')) ||
    processo?.estado_atual === 'Devolução AN' ||
    processo?.estado_atual === 'Diário';

  useEffect(() => {
    if (mail && cc?.perfil_id && values?.estado?.estado_final_id && podeAtribuir) {
      setValue('perfil', null);
      dispatch(
        getFromParametrizacao('colaboradoresEstado', {
          mail,
          perfilId: cc?.perfil_id,
          id: values?.estado?.estado_final_id,
        })
      );
    }
  }, [mail, dispatch, cc?.perfil_id, values?.estado, podeAtribuir, setValue]);

  const handleAdd = () => {
    append({ estado: null, noperacao: '', observacao: '' });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <>
      <DefaultAction color={devolucao ? 'warning' : 'success'} handleClick={onOpen} label={title} />
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            {title} processo
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
              {destinosParalelo?.length > 0 && destinosSingulares?.length > 0 && (
                <FormControlLabel
                  label="Envio em paralelo"
                  sx={{ justifyContent: 'center' }}
                  control={<Switch checked={inParalelo} />}
                  onChange={(event, newValue) => {
                    reset(defaultValues);
                    setInParalelo(newValue);
                  }}
                />
              )}
              {destinosFiltered?.length > 0 && inParalelo && (
                <DefaultAction label="Adicionar" handleClick={handleAdd} />
              )}
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ pt: 1 }}>
              {inParalelo ? (
                fields.map((item, index) => {
                  const hasopnumero = values?.destinos_par?.find((row, _index) => _index === index)?.estado
                    ?.hasopnumero;
                  return (
                    <>
                      <Grid item xs={12} sm={hasopnumero ? 6 : 4} md={hasopnumero ? 3 : 4}>
                        <RHFAutocompleteObject
                          label="Estado"
                          disableClearable
                          options={destinosFiltered}
                          name={`destinos_par[${index}].estado`}
                        />
                      </Grid>
                      {hasopnumero && (
                        <Grid item xs={12} sm={6} md={3}>
                          <RHFNumberField required label="Nº de operação" name={`destinos_par[${index}].noperacao`} />
                        </Grid>
                      )}
                      <Grid item xs={12} sm={hasopnumero ? 12 : 8} md={hasopnumero ? 6 : 8}>
                        <Stack spacing={2} key={item.id} direction="row" alignItems="center" justifyContent="center">
                          <RHFTextField
                            multiline
                            minRows={1}
                            maxRows={2}
                            label="Observação"
                            name={`destinos_par[${index}].observacao`}
                          />
                          {fields?.length > 2 && (
                            <DefaultAction
                              small
                              color="error"
                              label="ELIMINAR"
                              handleClick={() => handleRemove(index)}
                            />
                          )}
                        </Stack>
                      </Grid>
                    </>
                  );
                })
              ) : (
                <>
                  <Grid item xs={12} md={temNumOperacao ? 6 : 8}>
                    <RHFAutocompleteObject
                      name="estado"
                      label="Estado"
                      disableClearable
                      options={destinosSingulares}
                      onChange={(event, newValue) => {
                        setPendente(false);
                        setValue('perfil', null);
                        setValue('pender', false);
                        setValue('estado', newValue);
                      }}
                    />
                  </Grid>
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
                      {temNumOperacao && (
                        <Grid item xs={12} sm={6} md={3}>
                          <RHFNumberField name="noperacao" required label="Nº de operação" />
                        </Grid>
                      )}
                      <Grid item xs={12} sm={temNumOperacao ? 6 : 12} md={temNumOperacao ? 3 : 4}>
                        <RHFAutocompleteSimple
                          label="Parecer"
                          name="parecer_favoravel"
                          options={['Favorável', 'Não favorável']}
                        />
                      </Grid>
                      {podeAtribuir && colaboradoresList?.length > 0 && (
                        <Grid item xs={12}>
                          <RHFAutocompleteObject name="perfil" label="Colaborador" options={colaboradoresList} />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <RHFTextField
                          multiline
                          minRows={4}
                          maxRows={10}
                          name="observacao"
                          label={devolucao ? 'Motivo da devolução' : 'Observação'}
                        />
                      </Grid>
                      {gerencia && values?.estado?.label?.includes('Atendimento') && (
                        <>
                          {(!podeSerAtribuido(processo?.assunto) && title === 'Encaminhar' && (
                            <Grid item xs={12}>
                              <RHFSwitch
                                name="pendenteLevantamento"
                                label="Pendente de levantamento"
                                onChange={(event, newValue) => {
                                  setPendente(false);
                                  setValue('mobs', '');
                                  setValue('pender', false);
                                  setValue('motivo', null);
                                  setValue('pendenteLevantamento', newValue);
                                }}
                              />
                            </Grid>
                          )) ||
                            (podeSerAtribuido(processo?.assunto) && (
                              <>
                                <Grid item xs={12} sm={values.pender ? 4 : 12}>
                                  <RHFSwitch
                                    name="pender"
                                    label="Enviar como pendente"
                                    onChange={(event, newValue) => {
                                      setValue('mobs', '');
                                      setPendente(newValue);
                                      setValue('motivo', null);
                                      setValue('pender', newValue);
                                    }}
                                  />
                                </Grid>
                                {values.pender && (
                                  <>
                                    <Grid item xs={12} sm={8}>
                                      <RHFAutocompleteObject
                                        label="Motivo"
                                        name="motivo"
                                        options={applySort(
                                          motivosPendencias?.map((row) => ({ id: row?.id, label: row?.motivo })),
                                          getComparator('asc', 'label')
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <RHFTextField name="mobs" multiline minRows={2} label="Observação pendência" />
                                    </Grid>
                                  </>
                                )}
                              </>
                            ))}
                        </>
                      )}
                      <Grid item xs={12}>
                        <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Grid>
            <DialogButons
              label="Enviar"
              onCancel={onClose}
              isSaving={isSaving}
              hideSubmit={aberturaSemEntidadeGerencia}
            />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ArquivarForm.propTypes = { arquivoAg: PropTypes.array };

export function ArquivarForm({ arquivoAg }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  const informarConta = useMemo(
    () =>
      !processo?.limpo &&
      !processo?.origem_id &&
      processo?.assunto !== 'Encerramento de conta' &&
      meusAmbientes?.find((row) => row?.id === processo?.estado_atual_id)?.is_final,
    [meusAmbientes, processo]
  );

  const formSchema = Yup.object().shape({
    entidades: informarConta && Yup.string().required('Nº de entidade(s) não pode ficar vazio'),
    conta:
      informarConta &&
      Yup.number().typeError('Introduza o nº de conta do titular').positive('Introduza um nº de conta válido'),
    data_entrada: Yup.date()
      .required('Data de entrada não pode ficar vazio')
      .typeError('Data de entrada não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      observacao: '',
      conta: processo?.conta || '',
      entidades: processo?.entidade,
      noperacao: processo?.numero_operacao || '',
      data_entrada: processo?.data_entrada ? add(new Date(processo?.data_entrada), { hours: 2 }) : null,
    }),
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
        entidades: values?.entidade,
        fluxo_id: processo?.fluxo_id,
        observacao: values?.observacao,
        noperacao: values?.numero_operacao,
        data_entrada: format(values.data_entrada, 'yyyy-MM-dd'),
      };
      const anexos = new FormData();
      if (values?.anexos?.length > 0) {
        anexos.append('perfilID', cc?.perfil_id);
        values.anexos?.forEach((row) => {
          anexos.append('anexos', row);
        });
      }
      dispatch(
        updateItem('arquivar', JSON.stringify(formData), {
          mail,
          anexos,
          id: processo?.id,
          perfilId: cc?.perfil_id,
          msg: 'Processo arquivado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <>
      <DefaultAction color="error" handleClick={onOpen} label="ARQUIVAR" />
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
              <Grid item xs={12} sm={6}>
                <RHFNumberField name="noperacao" label="Nº de operação" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="entidades" label="Nº entidade(s)" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFNumberField name="conta" label="Nº de conta" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
              </Grid>
              <Grid item xs={12}>
                <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
              </Grid>
            </Grid>
            <DialogButons color="error" label="Arquivar" isSaving={isSaving} onCancel={onClose} />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DesarquivarForm.propTypes = { onCancel: PropTypes.func, id: PropTypes.number, colaboradoresList: PropTypes.array };

export function DesarquivarForm({ onCancel, id, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isOpenModalDesariquivar, isSaving, processo } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Estado não pode ficar vazio'),
    perfil: Yup.mixed().required('Colaborador não pode ficar vazio'),
    observacao: Yup.string().required('Observação não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ estado: null, perfil: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModalDesariquivar]);

  useEffect(() => {
    if (mail && cc?.perfil_id && values?.estado?.id) {
      setValue('perfil', null);
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId: cc?.perfil_id, id: values?.estado?.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, cc?.perfil_id, values?.estado?.id]);

  const onSubmit = async () => {
    try {
      const dados = {
        fluxo_id: processo?.fluxo_id,
        perfil_id: values?.perfil?.id,
        estado_id: values?.estado?.id,
        observacao: values?.observacao,
      };
      dispatch(
        updateItem('desarquivar', JSON.stringify(dados), {
          id,
          mail,
          perfilId: cc?.perfil_id,
          msg: 'Processo desarquivado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDesarquivar = () => {
    dispatch(getAll('destinosDesarquivamento', { mail, processoId: id }));
  };

  return (
    <>
      <DefaultAction color="error" label="DESARQUIVAR" handleClick={handleDesarquivar} />
      <Dialog open={isOpenModalDesariquivar} onClose={onCancel} fullWidth maxWidth="sm">
        <DialogTitle>Desarquivar</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject
                  name="estado"
                  label="Estado"
                  options={processo?.destinosDesarquivamento?.map((row) => ({ id: row?.id, label: row?.nome }))}
                />
              </Grid>
              {values?.estado?.id && (
                <Grid item xs={12}>
                  <RHFAutocompleteObject name="perfil" label="Colaborador" options={colaboradoresList} />
                </Grid>
              )}
              <Grid item xs={12}>
                <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
              </Grid>
            </Grid>
            <DialogButons color="error" label="Desarquivar" isSaving={isSaving} onCancel={onCancel} />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function FinalizarForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  useEffect(() => {
    if (open) {
      setSelecionados([]);
    }
  }, [open]);

  const defaultValues = useMemo(() => ({ cativos: [] }), []);
  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      if (selecionados?.length === 0) {
        enqueueSnackbar('Por favor selecionar as contas a serem cativadas', { variant: 'error' });
      } else {
        values.cativos = selecionados.map((row) => row?.id);
        dispatch(
          updateItem('finalizar', JSON.stringify({ cativos: [selecionados.map((row) => row?.id)] }), {
            mail,
            id: processo?.id,
            perfilId: cc?.perfil_id,
            msg: 'Processo finalizado',
          })
        );
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
    <>
      <DefaultAction icon="finalizar" handleClick={onOpen} label="FINALIZAR" />
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
                  {!processo?.cativos ? (
                    <TableRow hover>
                      <TableCell colSpan={3} sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Não foi encontrado nenhuma conta disponível para cativo...
                      </TableCell>
                    </TableRow>
                  ) : (
                    processo?.cativos?.map((row) => {
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
            <DialogButons label="Finalizar" isSaving={isSaving} onCancel={onClose} hideSubmit={!selecionados?.length} />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ParecerForm.propTypes = {
  open: PropTypes.bool,
  estado: PropTypes.bool,
  onCancel: PropTypes.func,
  processoId: PropTypes.number,
};

export function ParecerForm({ open, onCancel, processoId, estado = false }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, selectedAnexoId, isOpenModalAnexo, isSaving } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = selectedItem?.anexos?.filter((row) => row?.ativo);

  const formSchema = Yup.object().shape({
    parecer: Yup.string().required('Parecer não pode ficar vazio'),
    observacao: Yup.string().required('Descrição não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      validado: selectedItem?.validado || false,
      observacao: selectedItem?.observacao || '',
      parecer:
        (selectedItem?.parecer_favoravel === true && 'Favorável') ||
        (selectedItem?.parecer_favoravel === false && 'Não favorável') ||
        null,
    }),
    [selectedItem]
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
      if (estado) {
        await formData.append('observacao', values.observacao);
        await formData.append('estado_id ', selectedItem.estado_id);
        await formData.append('parecer_favoravel', values.parecer === 'Favorável');
        await values?.anexos?.forEach((row) => {
          formData.append('anexos', row);
        });
      } else {
        await formData.append('validado', values?.validado);
        await formData.append('descritivo', values.observacao);
        await formData.append('parecer_favoravel', values.parecer === 'Favorável');
        await values?.anexos?.forEach((row) => {
          formData.append('anexos', row);
        });
      }
      dispatch(
        updateItem(estado ? 'parecer estado' : 'parecer individual', formData, {
          mail,
          processoId,
          id: selectedItem.id,
          msg: 'Parecer enviado',
          perfilId: cc?.perfil_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  const cancelEliminar = () => {
    dispatch(closeModalAnexo());
  };

  const confirmeEliminar = () => {
    dispatch(
      deleteItem('anexoParecer', {
        mail,
        processoId,
        msg: 'Anexo eliminado',
        perfilId: cc?.perfil_id,
        id: Number(selectedAnexoId),
        parecerId: Number(selectedItem?.id),
      })
    );
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>Parecer: {selectedItem?.nome || selectedItem?.estado}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={estado ? 12 : 6}>
              <RHFAutocompleteSimple name="parecer" label="Parecer" options={['Favorável', 'Não favorável']} />
            </Grid>
            {!estado && (
              <Grid item xs={12} sm={6}>
                <RHFSwitch name="validado" label="Parecer final" />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={10} label="Descrição" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile name="anexos" onDrop={dropMultiple} onRemove={removeOne} />
              {anexosAtivos?.length > 0 && (
                <AnexosExistente anexos={anexosAtivos?.map((row) => ({ ...row, name: row?.nome }))} />
              )}
            </Grid>
          </Grid>
          <DialogButons label="Enviar" isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
        <DialogConfirmar
          isSaving={isSaving}
          open={isOpenModalAnexo}
          onClose={cancelEliminar}
          handleOk={confirmeEliminar}
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
    dispatch(
      updateItem('resgatar', null, {
        mail,
        fluxoId,
        estadoId,
        id: processoId,
        perfilId: cc?.perfil_id,
        msg: 'Processo resgatado',
      })
    );
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
  id: PropTypes.number,
  cancelar: PropTypes.bool,
  fluxoId: PropTypes.number,
  estadoId: PropTypes.number,
};

export function Cancelar({ cancelar = false, fluxoId, estadoId, id }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const formSchema = Yup.object().shape({ observacao: Yup.string().required('Observação não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ observacao: '', estado_id: estadoId }), [estadoId]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
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
          updateItem('fechar', JSON.stringify(values), { mail, id, perfilId: cc?.perfil_id, msg: 'Pareceres fechado' })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleCancelar = () => {
    dispatch(
      updateItem('cancelar', JSON.stringify({ estadoID: estadoId, fluxoID: fluxoId, perfilID: cc?.perfil_id }), {
        id,
        mail,
        msg: 'Envio cancelado',
        perfilId: cc?.perfil_id,
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
                  <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
                </Grid>
              </Grid>
              <DialogButons color="warning" label="Fechar" isSaving={isSaving} onCancel={onClose} />
            </FormProvider>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AtribuirForm.propTypes = { dados: PropTypes.object, colaboradoresList: PropTypes.array };

export function AtribuirForm({ dados, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(
    () => ({ perfil: colaboradoresList?.find((row) => row?.id === dados?.perfilId) || null }),
    [colaboradoresList, dados?.perfilId]
  );
  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colaboradoresList]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem('atribuir', '', {
          mail,
          ...dados,
          perfilId: cc?.perfil_id,
          id: values?.perfil?.id || '',
          msg: values?.perfil?.id ? 'Processo atribuído' : 'Atribuição eliminada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const onAtribuir = () => {
    onOpen();
    if (mail && cc?.perfil_id && dados?.estadoId) {
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId: cc?.perfil_id, id: dados?.estadoId }));
    }
  };

  return (
    <>
      <DefaultAction color="info" label="ATRIBUIR" handleClick={() => onAtribuir()} />
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
            <DialogButons label="Atribuir" isSaving={isSaving} onCancel={onClose} />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

export function ColocarPendente() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { motivosPendencias } = useSelector((state) => state.parametrizacao);
  const { processo, isOpenModal, isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    motivo: !processo?.motivo_pendencia_id && Yup.mixed().required('Motivo de pendência não pode ficar vazio'),
  });
  const defaultValues = useMemo(
    () => ({
      mobs: processo?.observacao_motivo_pendencia || '',
      motivo: processo?.motivo_pendencia_id ? { id: processo?.motivo_pendencia_id, label: processo?.motivo } : null,
    }),
    [processo]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
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
            fluxo_id: processo?.fluxo_id,
            mpendencia: values?.motivo?.id || '',
            mobs: values?.motivo?.id && values?.mobs ? values?.mobs : '',
          }),
          {
            mail,
            id: processo?.id,
            perfilId: cc?.perfil_id,
            fluxoId: processo?.fluxo_id,
            msg: 'Processo colocado pendente',
            estadoId: processo?.estado_atual_id || processo?.estado_id,
            atribuir:
              (noEstado(processo?.estado_processo?.estado, ['Atendimento']) && podeSerAtribuido(processo?.assunto)) ||
              !noEstado(processo?.estado_processo?.estado, ['Atendimento', 'Gerência', 'Caixa Principal']),
          }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handlePendente = (item) => {
    dispatch(selectItem(item));
  };

  const onCancel = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <DefaultAction color="inherit" label="PENDENTE" handleClick={() => handlePendente(processo)} />
      <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
        <DialogTitle>Processo pendente</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObject
                label="Motivo"
                name="motivo"
                options={applySort(
                  motivosPendencias?.map((row) => ({ id: row?.id, label: row?.motivo })),
                  getComparator('asc', 'label')
                )}
              />
              <RHFTextField name="mobs" label="Observação" />
            </Stack>
            <DialogButons edit isSaving={isSaving} onCancel={onCancel} />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Abandonar.propTypes = {
  id: PropTypes.number,
  isSaving: PropTypes.bool,
  fluxoId: PropTypes.number,
  estadoId: PropTypes.number,
};

export function Abandonar({ id, fluxoId, estadoId, isSaving }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, cc } = useSelector((state) => state.intranet);
  const handleAbandonar = () => {
    dispatch(
      updateItem('abandonar', null, {
        id,
        mail,
        fluxoId,
        estadoId,
        perfilId: cc?.perfil_id,
        msg: 'Processo abandonado',
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

// ----------------------------------------------------------------------

AtribuirAcessoForm.propTypes = { processoId: PropTypes.number };

export function AtribuirAcessoForm({ processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const colaboradoresList = colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }));

  const formSchema = Yup.object().shape({
    perfilID: Yup.mixed().nullable('Colaborador não pode ficar vazio').required('Colaborador não pode ficar vazio'),
    datalimite: Yup.date().typeError('Introduza a data de término').required('Data de término não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({ perfilID: null, datalimite: null, perfilIDCC: cc?.perfil_id }),
    [cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      values.perfilID = values?.perfilID?.id;
      dispatch(updateItem('dar aceso', JSON.stringify(values), { id: processoId, mail, mensagem: 'Acesso atribuido' }));
      onClose();
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <DefaultAction icon="acesso" label="ATRIBUIR ACESSO" handleClick={onOpen} />
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Atribuir acesso</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject name="perfilID" label="Colaborador" options={colaboradoresList} />
              </Grid>
              <Grid item xs={12}>
                <RHFDatePicker name="datalimite" label="Data de término" />
              </Grid>
            </Grid>
            <DialogButons label="Atribuir" isSaving={isSaving} onCancel={onClose} />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter(destinos, detinosSelct) {
  return destinos?.filter((item) => !detinosSelct.includes(Number(item?.id)));
}
