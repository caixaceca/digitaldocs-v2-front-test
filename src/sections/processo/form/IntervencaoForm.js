import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { format, add } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
import DialogContentText from '@mui/material/DialogContentText';
// utils
import { fNumber, fCurrency } from '../../../utils/formatNumber';
import { paraLevantamento, noEstado, findColaboradores } from '../../../utils/validarAcesso';
// redux
import { useSelector, useDispatch } from '../../../redux/store';
import { getFromParametrizacao } from '../../../redux/slices/parametrizacao';
import { getAll, updateItem, selectItem, selectAnexo, closeModal } from '../../../redux/slices/digitaldocs';
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

// --- ENCAMINHAR/DEVOLVER PROCESSO ------------------------------------------------------------------------------------

Encaminhar.propTypes = {
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  destinos: PropTypes.array,
  colaboradoresList: PropTypes.array,
};

export function Encaminhar({ title, destinos, gerencia = false, colaboradoresList = [] }) {
  const devolucao = title === 'DEVOLVER';
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <DefaultAction color={devolucao ? 'warning' : 'success'} handleClick={onOpen} label={title} />
      {open && (
        <EncaminharForm
          open={open}
          title={title}
          onClose={onClose}
          destinos={destinos}
          gerencia={gerencia}
          colaboradoresList={colaboradoresList}
        />
      )}
    </>
  );
}

EncaminharForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  gerencia: PropTypes.bool,
  destinos: PropTypes.array,
  colaboradoresList: PropTypes.array,
};

function EncaminharForm({ title, destinos, gerencia = false, colaboradoresList = [], open, onClose }) {
  const dispatch = useDispatch();
  const devolucao = title === 'DEVOLVER';
  const { enqueueSnackbar } = useSnackbar();
  const [pendente, setPendente] = useState(false);
  const destinosParalelo = destinos?.filter((row) => row?.paralelo);
  const destinosSingulares = destinos?.filter((row) => !row?.paralelo);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { motivosPendencias } = useSelector((state) => state.parametrizacao);
  const [inParalelo, setInParalelo] = useState(destinosParalelo?.length > 0 && destinosSingulares?.length === 0);
  const cliente = useMemo(() => motivosPendencias?.find((row) => row?.label === 'Cliente'), [motivosPendencias]);
  const criador = useMemo(
    () => colaboradores?.find((row) => row?.perfil?.mail?.toLowerCase() === processo?.criador?.toLowerCase()),
    [colaboradores, processo?.criador]
  );

  const formSchema = Yup.object().shape({
    estado: !inParalelo && Yup.mixed().required('Escolhe o estado'),
    motivo: pendente && Yup.mixed().required().label('Motivo de pendência'),
    observacao: devolucao && Yup.string().required().label('Motivo da devolução'),
    destinos_par: inParalelo && Yup.array(Yup.object({ estado: Yup.mixed().required('Escolhe o estado') })),
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

  const destinosFiltered = useMemo(
    () =>
      applyFilter(
        destinosParalelo,
        values?.destinos_par?.map((row) => row?.estado?.id)
      ),
    [destinosParalelo, values?.destinos_par]
  );
  const temNumOperacao = useMemo(() => values?.estado?.hasopnumero, [values?.estado?.hasopnumero]);
  const aberturaSemEntidadeGerencia = useMemo(
    () =>
      gerencia &&
      values?.estado &&
      !processo?.entidade &&
      title === 'ENCAMINHAR' &&
      processo?.assunto === 'Abertura de conta' &&
      !values?.estado?.label?.includes('Atendimento'),
    [gerencia, processo?.assunto, processo?.entidade, title, values?.estado]
  );

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
            perfilId,
            id: processo.id,
            msg: 'Processo encaminhado',
          })
        );
      } else {
        const atribuir =
          values?.perfil?.id ||
          (values?.estado?.label?.includes('Atendimento') &&
            !paraLevantamento(processo?.assunto) &&
            criador?.perfil_id) ||
          '';
        const formPendencia = values?.pender
          ? { pender: true, mobs: values?.mobs, fluxo_id: processo?.fluxo_id, mpendencia: values?.motivo?.id }
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
        await values?.anexos?.forEach((row) => {
          formData.append('anexos', row);
        });

        dispatch(
          updateItem('encaminhar serie', formData, {
            mail,
            perfilId,
            colocarPendente,
            id: processo.id,
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
    if (mail && perfilId && values?.estado?.estado_final_id && podeAtribuir && open === true) {
      setValue('perfil', null);
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: values?.estado?.estado_final_id }));
    }
  }, [mail, dispatch, perfilId, values?.estado, open, podeAtribuir, setValue]);

  const handleAdd = () => {
    append({ estado: null, noperacao: '', observacao: '' });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
          {title?.charAt(0).toUpperCase() + title?.slice(1)?.toLowerCase()} processo
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
            {destinosFiltered?.length > 0 && inParalelo && <DefaultAction label="Adicionar" handleClick={handleAdd} />}
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            {inParalelo ? (
              fields.map((item, index) => {
                const hasopnumero = values?.destinos_par?.find((row, _index) => _index === index)?.estado?.hasopnumero;
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
                          <DefaultAction small color="error" label="ELIMINAR" handleClick={() => handleRemove(index)} />
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
                            {paraLevantamento(processo?.assunto) && (
                              <Grid item xs={12} sm={4}>
                                <RHFSwitch
                                  name="pendenteLevantamento"
                                  label="Pendente de levantamento"
                                  onChange={(event, newValue) => {
                                    setValue('pendenteLevantamento', newValue);
                                    setValue('mobs', newValue ? 'Para levantamento do pedido' : '');
                                    setValue('motivo', newValue ? { id: cliente?.id, label: cliente?.motivo } : null);
                                  }}
                                />
                              </Grid>
                            )}
                            <Grid item xs={12} sm={paraLevantamento(processo?.assunto) ? 4 : 8}>
                              <RHFAutocompleteObject
                                label="Motivo"
                                name="motivo"
                                options={motivosPendencias}
                                readOnly={values?.pendenteLevantamento}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <RHFTextField
                                name="mobs"
                                label="Observação pendência"
                                inputProps={{ readOnly: values?.pendenteLevantamento }}
                              />
                            </Grid>
                          </>
                        )}
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
  );
}

// --- ARQUIVAR PROCESSO -----------------------------------------------------------------------------------------------

Arquivar.propTypes = { naoFinal: PropTypes.array };

export function Arquivar({ naoFinal }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <DefaultAction color="error" handleClick={onOpen} label="ARQUIVAR" />
      {open && <ArquivarForm naoFinal={naoFinal} open={open} onClose={onClose} />}
    </>
  );
}

ArquivarForm.propTypes = { naoFinal: PropTypes.array, open: PropTypes.bool, onClose: PropTypes.func };

function ArquivarForm({ naoFinal, open, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { meusAmbientes } = useSelector((state) => state.parametrizacao);
  const { isSaving, processo } = useSelector((state) => state.digitaldocs);

  const informarConta = useMemo(
    () =>
      !processo?.limpo &&
      !processo?.origem_id &&
      processo?.assunto !== 'Encerramento de conta' &&
      meusAmbientes?.find((row) => row?.id === processo?.estado_atual_id)?.isfinal,
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
      entidades: processo?.entidade || '',
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
      await values?.anexos?.forEach((row) => {
        anexos.append('anexos', row);
      });

      dispatch(
        updateItem('arquivar', JSON.stringify(formData), {
          mail,
          anexos,
          perfilId,
          id: processo?.id,
          msg: 'Processo arquivado',
          estadoId: processo?.estado_atual_id,
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Arquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {naoFinal?.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="body2">
                    Geralmente, este processo é encaminhado para outro estado fora da sua Unidade Orgânica.
                    Certifique-se de que pretende realmente arquivá-lo em vez de o encaminhar.
                  </Typography>
                  <Typography sx={{ typography: 'caption', fontWeight: 700, mt: 1 }}>Posssíveis destinos:</Typography>
                  {naoFinal?.map((row) => (
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
  );
}

// --- DESARQUIVAR PROCESSO --------------------------------------------------------------------------------------------

Desarquivar.propTypes = { id: PropTypes.number, colaboradoresList: PropTypes.array };

export function Desarquivar({ id, colaboradoresList }) {
  const dispatch = useDispatch();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isOpenModal1 } = useSelector((state) => state.digitaldocs);

  return (
    <>
      <DefaultAction
        color="error"
        label="DESARQUIVAR"
        handleClick={() => dispatch(getAll('destinosDesarquivamento', { mail, id, perfilId }))}
      />
      {isOpenModal1 && <DesarquivarForm id={id} colaboradoresList={colaboradoresList} />}
    </>
  );
}

DesarquivarForm.propTypes = { id: PropTypes.number, colaboradoresList: PropTypes.array };

function DesarquivarForm({ id, colaboradoresList }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isOpenModal1, isSaving, processo } = useSelector((state) => state.digitaldocs);

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
  }, [isOpenModal1]);

  useEffect(() => {
    if (mail && perfilId && values?.estado?.id) {
      setValue('perfil', null);
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: values?.estado?.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, dispatch, perfilId, values?.estado?.id]);

  const onSubmit = async () => {
    try {
      const dados = {
        fluxo_id: processo?.fluxo_id,
        perfil_id: values?.perfil?.id,
        estado_id: values?.estado?.id,
        observacao: values?.observacao,
      };
      dispatch(updateItem('desarquivar', JSON.stringify(dados), { id, mail, perfilId, msg: 'Processo desarquivado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal1} onClose={() => dispatch(closeModal())} fullWidth maxWidth="sm">
      <DialogTitle>Desarquivar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject
                name="estado"
                label="Estado"
                options={(processo?.destinosDesarquivamento || [])?.map((row) => ({ id: row?.id, label: row?.nome }))}
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
          <DialogButons color="error" label="Desarquivar" isSaving={isSaving} onCancel={() => dispatch(closeModal())} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- RESTAURAR PROCESSO DO HISTÓRICO ---------------------------------------------------------------------------------

Restaurar.propTypes = { id: PropTypes.number };

export function Restaurar({ id }) {
  const dispatch = useDispatch();
  const { selectedAnexoId } = useSelector((state) => state.digitaldocs);

  return (
    <>
      <DefaultAction color="error" label="RESTAURAR" handleClick={() => dispatch(selectAnexo(id))} />
      {!!selectedAnexoId && <RestaurarForm id={id} />}
    </>
  );
}

RestaurarForm.propTypes = { id: PropTypes.number };

function RestaurarForm({ id }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedAnexoId, isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(() => ({ estado: null, perfil: null, observacao: '' }), []);
  const methods = useForm({ defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnexoId]);

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem('restaurar', JSON.stringify({ observacao: values?.observacao }), {
          id,
          mail,
          perfilId,
          msg: 'Processo restaurado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={!!selectedAnexoId} onClose={() => dispatch(selectAnexo(null))} fullWidth maxWidth="sm">
      <DialogTitle>Restaurar</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 3 }}>
            <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
            <DialogButons
              color="error"
              label="Restaurar"
              isSaving={isSaving}
              onCancel={() => dispatch(selectAnexo(null))}
            />
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

Finalizar.propTypes = { id: PropTypes.number, cativos: PropTypes.array };

export function Finalizar({ id, cativos = [] }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <DefaultAction handleClick={onOpen} label="FINALIZAR" />
      {open && <FinalizarForm open={open} onClose={onClose} id={id} cativos={cativos} />}
    </>
  );
}

FinalizarForm.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  cativos: PropTypes.array,
};

function FinalizarForm({ id, cativos, open, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);

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
            id,
            mail,
            perfilId,
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
                {cativos?.length === 0 ? (
                  <TableRow hover>
                    <TableCell colSpan={3} sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Não foi encontrado nenhuma conta disponível para cativo...
                    </TableCell>
                  </TableRow>
                ) : (
                  cativos?.map((row) => {
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
  );
}

// --- PARECER INDIVIDUAL/ESTADO ---------------------------------------------------------------------------------------

ParecerForm.propTypes = {
  estado: PropTypes.bool,
  onCancel: PropTypes.func,
  openModal: PropTypes.bool,
  processoId: PropTypes.number,
};

export function ParecerForm({ openModal, onCancel, processoId, estado = false }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, selectedAnexoId, isSaving } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = useMemo(() => selectedItem?.anexos?.filter((row) => row?.ativo), [selectedItem?.anexos]);
  const isEdit =
    selectedItem?.parecer_em && (selectedItem?.parecer_favoravel === true || selectedItem?.parecer_favoravel === false);

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
        (isEdit && selectedItem?.parecer_favoravel === true && 'Favorável') ||
        (isEdit && selectedItem?.parecer_favoravel === false && 'Não favorável') ||
        null,
    }),
    [selectedItem, isEdit]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, openModal]);

  const enviarParecer = async (formData) => {
    dispatch(
      updateItem(estado ? 'parecer estado' : 'parecer individual', formData, {
        mail,
        perfilId,
        processoId,
        id: selectedItem.id,
        msg: 'Parecer enviado',
      })
    );
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      await values?.anexos?.forEach((row) => formData.append('anexos', row));
      await formData.append('parecer_favoravel', values.parecer === 'Favorável');
      await formData.append(estado ? 'observacao' : 'descritivo', values.observacao);
      await formData.append(estado ? 'estado_id' : 'validado', estado ? selectedItem.estado_id : values.validado);
      enviarParecer(formData);
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const eliminarParecer = async () => {
    const formData = new FormData();
    await formData.append('estado_id ', selectedItem.estado_id);
    enviarParecer(formData);
  };

  const { dropMultiple, removeOne } = useAnexos('', 'anexos', setValue, values?.anexos);

  const eliminarAnexo = () => {
    dispatch(
      updateItem('anexo', null, {
        mail,
        perfilId,
        processoId,
        msg: 'Anexo eliminado',
        anexo: selectedAnexoId,
        individual: estado ? 'false' : 'true',
        parecerId: estado ? '' : selectedItem?.id,
        estadoId: estado ? selectedItem?.id : selectedItem?.processo_estado_id,
      })
    );
  };

  return (
    <Dialog open={openModal} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>Parecer</DialogTitle>
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
                <AnexosExistente anexos={anexosAtivos?.map((row) => ({ ...row, name: row?.nome }))} anexo />
              )}
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            label="Enviar"
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={() => eliminarParecer()}
            desc={isEdit ? 'eliminar o parecer' : ''}
          />
        </FormProvider>

        <DialogConfirmar
          isSaving={isSaving}
          open={!!selectedAnexoId}
          handleOk={eliminarAnexo}
          desc="eliminar este anexo"
          onClose={() => dispatch(selectAnexo(null))}
        />
      </DialogContent>
    </Dialog>
  );
}

// --- RESGATAR PROCESSO -----------------------------------------------------------------------------------------------

Resgatar.propTypes = { fluxoId: PropTypes.number, estadoId: PropTypes.number, processoId: PropTypes.number };

export function Resgatar({ fluxoId, estadoId, processoId }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const resgatarClick = () => {
    dispatch(
      updateItem('resgatar', null, { mail, fluxoId, estadoId, perfilId, id: processoId, msg: 'Processo resgatado' })
    );
    onClose();
  };

  return (
    <>
      <DefaultAction label="RESGATAR" handleClick={onOpen} color="warning" />
      <DialogConfirmar
        open={open}
        onClose={onClose}
        isSaving={isSaving}
        handleOk={() => resgatarClick()}
        color="warning"
        title="Resgatar"
        desc="resgatar este processo"
      />
    </>
  );
}

// --- CANCELAR/FECHAR PROCESSO EM PARALELO ----------------------------------------------------------------------------

Cancelar.propTypes = { id: PropTypes.number, estadoId: PropTypes.number, fechar: PropTypes.bool };

export function Cancelar({ id, estadoId, fechar = false }) {
  const { toggle: open, onOpen, onClose } = useToggle();

  return (
    <>
      <DefaultAction label={fechar ? 'FECHAR' : 'RESGATAR'} color="warning" handleClick={onOpen} />
      {open && <CancelarForm open={open} onClose={onClose} id={id} estadoId={estadoId} fechar={fechar} />}
    </>
  );
}

CancelarForm.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.number,
  fechar: PropTypes.bool,
  onClose: PropTypes.func,
  estadoId: PropTypes.number,
};

export function CancelarForm({ id, estadoId, fechar = false, open, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const formSchema = Yup.object().shape({ observacao: Yup.string().required('Observação não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ observacao: fechar ? '' : 'Resgatar envio em paralelo.', estado_id: estadoId }),
    [estadoId, fechar]
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
        updateItem('cancelar', JSON.stringify(values), {
          id,
          mail,
          fechar,
          perfilId,
          msg: fechar ? 'Pareceres fechado' : 'Processo resgatado',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={fechar ? 'sm' : 'xs'}>
      <DialogTitle>{fechar ? 'Fechar' : 'Resgatar'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              {fechar ? (
                <RHFTextField name="observacao" multiline minRows={4} maxRows={6} label="Observação" />
              ) : (
                <DialogContentText>Tens a certeza de que pretendes resgatar este processo?</DialogContentText>
              )}
            </Grid>
          </Grid>
          <DialogButons color="warning" onCancel={onClose} isSaving={isSaving} label={fechar ? 'Fechar' : 'Ok'} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- ATRIBUIR/AFETAR PROCESSO ----------------------------------------------------------------------------------------

Atribuir.propTypes = { dados: PropTypes.object };

export function Atribuir({ dados }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, perfilId } = useSelector((state) => state.intranet);

  const atribuirClick = () => {
    onOpen();
    if (mail && perfilId && dados?.estadoId) {
      dispatch(getFromParametrizacao('colaboradoresEstado', { mail, perfilId, id: dados?.estadoId }));
    }
  };

  return (
    <>
      <DefaultAction color="info" label="ATRIBUIR" handleClick={() => atribuirClick()} />
      {open && <AtribuirForm dados={dados} onClose={onClose} />}
    </>
  );
}

AtribuirForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

function AtribuirForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);
  const colaboradoresList = useMemo(
    () => findColaboradores(colaboradores, colaboradoresEstado),
    [colaboradores, colaboradoresEstado]
  );

  const defaultValues = useMemo(
    () => ({ perfil: colaboradoresList?.find((row) => row?.id === dados?.perfilIdA) || null }),
    [colaboradoresList, dados?.perfilIdA]
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
          perfilId,
          ...dados,
          id: values?.perfil?.id || '',
          msg: values?.perfil?.id ? 'Processo atribuído' : 'Atribuição eliminada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
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
  );
}

// --- COLOCAR PROCESSO PENDENTE ---------------------------------------------------------------------------------------

export function ColocarPendente() {
  const dispatch = useDispatch();
  const { processo, isOpenModal } = useSelector((state) => state.digitaldocs);

  return (
    <>
      <DefaultAction color="inherit" label="PENDENTE" handleClick={() => dispatch(selectItem(processo))} />
      {isOpenModal && <ColocarPendenteForm />}
    </>
  );
}

function ColocarPendenteForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);
  const { motivosPendencias } = useSelector((state) => state.parametrizacao);
  const cliente = useMemo(() => motivosPendencias?.find((row) => row?.label === 'Cliente'), [motivosPendencias]);

  const formSchema = Yup.object().shape({ motivo: Yup.mixed().required('Motivo de pendência não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ pendenteLevantamento: false, mobs: '', motivo: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'pendencia',
          JSON.stringify({
            pender: !!values?.motivo?.id,
            fluxo_id: processo?.fluxo_id,
            mpendencia: values?.motivo?.id || '',
            mobs: values?.motivo?.id && values?.mobs ? values?.mobs : '',
          }),
          {
            mail,
            perfilId,
            id: processo?.id,
            fluxoId: processo?.fluxo_id,
            msg: 'Processo colocado pendente',
            estadoId: processo?.estado_atual_id || processo?.estado_id,
            atribuir:
              (noEstado(processo?.estado_processo?.estado, ['Atendimento']) && !paraLevantamento(processo?.assunto)) ||
              !noEstado(processo?.estado_processo?.estado, ['Atendimento', 'Gerência', 'Caixa Principal']),
          }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const onCancel = () => {
    dispatch(closeModal());
  };

  const eliminarPendencia = () => {
    dispatch(
      updateItem(
        'pendencia',
        JSON.stringify({ pender: false, fluxo_id: processo?.fluxo_id, mpendencia: '', mobs: '' }),
        { mail, perfilId, id: processo?.id, fluxoId: processo?.fluxo_id, msg: 'Pendência eliminada' }
      )
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Processo pendente</DialogTitle>
      <DialogContent>
        {processo?.motivo_pendencia_id && processo?.motivo ? (
          <Stack direction="column" spacing={1} sx={{ pt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ color: 'text.secondary' }}>Motivo:</Typography>
              <Typography>{processo?.motivo}</Typography>
            </Stack>
            {processo?.observacao_motivo_pendencia && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Observação:</Typography>
                <Typography>{processo?.observacao_motivo_pendencia}</Typography>
              </Stack>
            )}
            <Stack direction="row" sx={{ pt: 2 }} justifyContent="end">
              <DefaultAction color="error" button handleClick={() => eliminarPendencia()} label="Eliminar" />
            </Stack>
          </Stack>
        ) : (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
              {paraLevantamento(processo?.assunto) && processo?.estado_atual?.includes('Atendimento') && (
                <RHFSwitch
                  name="pendenteLevantamento"
                  label="Pendente de levantamento"
                  onChange={(event, newValue) => {
                    setValue('pendenteLevantamento', newValue);
                    setValue('mobs', newValue ? 'Para levantamento do pedido' : '');
                    setValue('motivo', newValue ? { id: cliente?.id, label: cliente?.motivo } : null);
                  }}
                />
              )}
              <RHFAutocompleteObject
                name="motivo"
                label="Motivo"
                options={motivosPendencias}
                readOnly={values?.pendenteLevantamento}
              />
              <RHFTextField name="mobs" label="Observação" inputProps={{ readOnly: values?.pendenteLevantamento }} />
            </Stack>
            <DialogButons edit isSaving={isSaving} onCancel={onCancel} />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- DOMICILIAR PROCESSO ---------------------------------------------------------------------------------------------

Domiciliar.propTypes = { id: PropTypes.number, estadoId: PropTypes.number };

export function Domiciliar({ id, estadoId }) {
  const { toggle: open, onOpen, onClose } = useToggle();
  return (
    <>
      <DefaultAction color="warning" label="DOMICILIAR" handleClick={() => onOpen()} />
      {open && <DomiciliarForm id={id} estadoId={estadoId} onClose={onClose} />}
    </>
  );
}

DomiciliarForm.propTypes = { id: PropTypes.number, onClose: PropTypes.func, estadoId: PropTypes.number };

function DomiciliarForm({ id, estadoId, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { estados } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({
    estado: Yup.mixed().required('Estado não pode ficar vazio'),
    uo: Yup.mixed().required('Unidade orgânica não pode ficar vazio'),
    observacao: Yup.string().required('Observação não pode ficar vazio'),
  });
  const defaultValues = useMemo(() => ({ uo: null, estado: null, observacao: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(
        updateItem(
          'domiciliar',
          JSON.stringify({
            estado_id: estadoId,
            uo_destino_id: values?.uo?.id,
            observacao: values?.observacao,
            estado_destino_id: values?.estado?.id,
          }),
          { mail, perfilId, id, msg: 'Processo domiciliado' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Domiciliar processo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObject
              name="uo"
              label="Unidade orgânica"
              onChange={(event, newValue) => {
                setValue('estado', null);
                setValue('uo', newValue);
              }}
              options={uos?.map((row) => ({ id: row?.id, label: row?.label }))}
            />
            {values?.uo?.id && (
              <RHFAutocompleteObject
                name="estado"
                label="Estado"
                options={estados
                  ?.filter((item) => item?.uo_id === values?.uo?.id)
                  ?.map((row) => ({ id: row?.id, label: row?.nome }))}
              />
            )}
            <RHFTextField name="observacao" multiline rows={3} label="Observação" />
          </Stack>
          <DialogButons color="warning" label="Enviar" isSaving={isSaving} onCancel={() => onClose()} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- ABANDONAR PROCESSO ----------------------------------------------------------------------------------------------

Abandonar.propTypes = {
  id: PropTypes.number,
  isSaving: PropTypes.bool,
  fluxoId: PropTypes.number,
  estadoId: PropTypes.number,
};

export function Abandonar({ id, fluxoId, estadoId, isSaving }) {
  const dispatch = useDispatch();
  const { toggle: open, onOpen, onClose } = useToggle();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const abandonarClick = () => {
    dispatch(updateItem('abandonar', null, { id, mail, fluxoId, estadoId, perfilId, msg: 'Processo abandonado' }));
  };

  return (
    <>
      <DefaultAction color="warning" icon="abandonar" handleClick={onOpen} label="ABANDONAR" />
      {open && (
        <DialogConfirmar
          open
          onClose={onClose}
          isSaving={isSaving}
          handleOk={() => abandonarClick()}
          color="warning"
          title="Abandonar"
          desc="abandonar este processo"
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter(destinos, detinosSelct) {
  return destinos?.filter((item) => !detinosSelct.includes(Number(item?.id)));
}
