import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import DialogContentText from '@mui/material/DialogContentText';
// utils
import { fNumber, fCurrency } from '../../../../utils/formatNumber';
import { paraLevantamento, findColaboradores } from '../../../../utils/validarAcesso';
// redux
import { useSelector, useDispatch } from '../../../../redux/store';
import { getSuccess, getInfoProcesso, updateItem, deleteItem, closeModal } from '../../../../redux/slices/digitaldocs';
// hooks
import useAnexos from '../../../../hooks/useAnexos';
import { getComparator, applySort } from '../../../../hooks/useTable';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFUploadMultiFile,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../../../components/hook-form';
import { DialogConfirmar } from '../../../../components/CustomDialog';
import { DefaultAction, DialogButons } from '../../../../components/Actions';
//
import AnexosExistente from '../anexos/anexos-existente';
import { Confidencialidade, confidenciaIds } from './encaminhar';

const vsv = { shouldValidate: true, shouldDirty: true, shouldTouch: true };

// --- FINALIZAR NOTAS EXTERNAS ----------------------------------------------------------------------------------------

FinalizarForm.propTypes = { id: PropTypes.number, onClose: PropTypes.func, cativos: PropTypes.array };

export function FinalizarForm({ id, cativos, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [selecionados, setSelecionados] = useState([]);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(() => ({ cativos: [] }), []);
  const methods = useForm({ defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async () => {
    try {
      if (selecionados?.length === 0) {
        enqueueSnackbar('Por favor selecionar as contas a serem cativadas', { variant: 'error' });
      } else {
        dispatch(
          updateItem('finalizar', JSON.stringify({ cativos: [selecionados.map((row) => row?.id)] }), {
            id,
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
    if (currentIndex === -1) novaLista.push(value);
    else novaLista.splice(currentIndex, 1);
    setSelecionados(novaLista);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
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

ParecerForm.propTypes = { estado: PropTypes.bool, onCancel: PropTypes.func, processoId: PropTypes.number };

export function ParecerForm({ onCancel, processoId, estado = false }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
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
    if (selectedItem) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const enviarParecer = async (formData) => {
    dispatch(
      updateItem(estado ? 'parecer estado' : 'parecer individual', formData, {
        mdf: true,
        processoId,
        id: selectedItem?.id,
        msg: 'Parecer enviado',
        afterSuccess: () => onCancel(),
      })
    );
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      values?.anexos?.forEach((row) => formData.append('anexos', row));
      formData.append('parecer_favoravel', values.parecer === 'Favorável');
      formData.append(estado ? 'observacao' : 'descritivo', values.observacao);
      formData.append(estado ? 'estado_id' : 'validado', estado ? selectedItem.estado_id : values.validado);
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
        processoId,
        individual: !estado,
        msg: 'Anexo eliminado',
        anexo: selectedAnexoId,
        parecerId: estado ? '' : selectedItem?.id,
        estadoId: estado ? selectedItem?.id : selectedItem?.processo_estado_id,
      })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>Parecer</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={estado ? 12 : 6}>
              <RHFAutocompleteSmp name="parecer" label="Parecer" options={['Favorável', 'Não favorável']} />
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
          <DialogButons
            edit={isEdit}
            label="Enviar"
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={() => eliminarParecer()}
            desc={isEdit ? 'eliminar o parecer' : ''}
          />
        </FormProvider>

        {!!selectedAnexoId && (
          <DialogConfirmar
            isSaving={isSaving}
            handleOk={eliminarAnexo}
            desc="eliminar este anexo"
            onClose={() => dispatch(getSuccess({ item: 'selectedAnexoId', dados: null }))}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- RESGATAR PROCESSO -----------------------------------------------------------------------------------------------

ResgatarForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

export function ResgatarForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      color="warning"
      title="Resgatar"
      desc="resgatar este processo"
      handleOk={() =>
        dispatch(getInfoProcesso('resgatar', { ...dados, msg: 'Processo resgatado', afterSuccess: () => onClose() }))
      }
    />
  );
}

// --- CANCELAR/FECHAR PROCESSO EM PARALELO ----------------------------------------------------------------------------

CancelarForm.propTypes = {
  id: PropTypes.number,
  fechar: PropTypes.bool,
  onClose: PropTypes.func,
  estadoId: PropTypes.number,
};

export function CancelarForm({ id, estadoId, fechar = false, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const formSchema = Yup.object().shape({ observacao: Yup.string().required('Observação não pode ficar vazio') });
  const defaultValues = useMemo(
    () => ({ observacao: fechar ? '' : 'Resgatar envio em paralelo.', estado_id: estadoId }),
    [estadoId, fechar]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const parmas = { id, fechar, msg: fechar ? 'Pareceres fechado' : 'Processo resgatado' };
      dispatch(updateItem('cancelar', JSON.stringify(values), { ...parmas, afterSuccess: () => onClose() }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={fechar ? 'sm' : 'xs'}>
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

AtribuirForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

export function AtribuirForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { colaboradores } = useSelector((state) => state.intranet);
  const { colaboradoresEstado } = useSelector((state) => state.parametrizacao);
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
          <RHFAutocompleteObj
            name="perfil"
            sx={{ pt: 3 }}
            label="Colaborador"
            options={applySort(colaboradoresList, getComparator('asc', 'label'))}
          />
          <DialogButons label="Atribuir" isSaving={isSaving} onCancel={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --- LIBERTAR PROCESSO -----------------------------------------------------------------------------------------------

LibertarForm.propTypes = { dados: PropTypes.func, onClose: PropTypes.func };

export function LibertarForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  return (
    <DialogConfirmar
      color="warning"
      title="Libertar"
      onClose={onClose}
      isSaving={isSaving}
      desc="libertar este processo"
      handleOk={() => dispatch(deleteItem('libertar', { msg: 'Processo libertado', ...dados }))}
    />
  );
}

// --- COLOCAR PROCESSO PENDENTE ---------------------------------------------------------------------------------------

export function ColocarPendenteForm() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { processo, isSaving } = useSelector((state) => state.digitaldocs);
  const { motivosPendencia } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ motivo: Yup.mixed().required('Motivo de pendência não pode ficar vazio') });
  const defaultValues = useMemo(() => ({ pendenteLevantamento: false, mobs: '', motivo: null }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = (action) => {
    try {
      const params = { id: processo?.id, fluxoId: processo?.fluxo_id, afterSuccess: () => dispatch(closeModal()) };
      dispatch(
        updateItem(
          'pendencia',
          JSON.stringify({
            pender: action !== 'eliminar',
            fluxo_id: processo?.fluxo_id,
            mobs: action === 'eliminar' ? '' : values?.mobs,
            mpendencia: action === 'eliminar' ? '' : values?.motivo?.id,
          }),
          { ...params, msg: action === 'eliminar' ? 'Pendência eliminada' : 'Processo colocado pendente' }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(closeModal())} fullWidth maxWidth="sm">
      <DialogTitle>Processo pendente</DialogTitle>
      <DialogContent>
        {processo?.pendente && processo?.motivo_pendencia_id && processo?.motivo ? (
          <Stack direction="column" spacing={1} sx={{ pt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ color: 'text.secondary', width: '85px', textAlign: 'right' }}>Motivo:</Typography>
              <Typography>{processo?.motivo}</Typography>
            </Stack>
            {processo?.observacao_motivo_pendencia && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ color: 'text.secondary' }}>Observação:</Typography>
                <Typography>{processo?.observacao_motivo_pendencia}</Typography>
              </Stack>
            )}
            <Stack direction="row" sx={{ pt: 3 }} justifyContent="end">
              <DefaultAction color="error" button handleClick={() => onSubmit('eliminar')} label="Eliminar" />
            </Stack>
          </Stack>
        ) : (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" spacing={3} sx={{ pt: 3 }}>
              {paraLevantamento(processo?.assunto) && processo?.estado_atual?.includes('Atendimento') && (
                <RHFSwitch
                  name="pendenteLevantamento"
                  label="Pendente de levantamento"
                  onChange={(event, newVal) => {
                    setValue('pendenteLevantamento', newVal, vsv);
                    setValue('mobs', newVal ? 'Para levantamento do pedido' : '', vsv);
                    setValue('motivo', newVal ? motivosPendencia?.find(({ label }) => label === 'Cliente') : null, vsv);
                  }}
                />
              )}
              <RHFAutocompleteObj
                name="motivo"
                label="Motivo"
                options={motivosPendencia}
                disabled={values?.pendenteLevantamento}
                onChange={(event, newVal) => setValue('motivo', newVal, vsv)}
              />
              <RHFTextField name="mobs" label="Observação" disabled={values?.pendenteLevantamento} />
            </Stack>
            <DialogButons edit isSaving={isSaving} onCancel={() => dispatch(closeModal())} />
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- DOMICILIAR PROCESSO ---------------------------------------------------------------------------------------------

DomiciliarForm.propTypes = { id: PropTypes.number, onClose: PropTypes.func, estadoId: PropTypes.number };

export function DomiciliarForm({ id, estadoId, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { uos } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.digitaldocs);
  const { estados } = useSelector((state) => state.parametrizacao);

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
      const formData = {
        estado_id: estadoId,
        uo_destino_id: values?.uo?.id,
        observacao: values?.observacao,
        estado_destino_id: values?.estado?.id,
      };
      dispatch(updateItem('domiciliar', JSON.stringify(formData), { id, msg: 'Processo domiciliado' }));
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
            <RHFAutocompleteObj
              name="uo"
              label="Unidade orgânica"
              options={uos?.map(({ id, label }) => ({ id, label }))}
              onChange={(event, newValue) => {
                setValue('estado', null);
                setValue('uo', newValue);
              }}
            />
            {values?.uo?.id && (
              <RHFAutocompleteObj
                name="estado"
                label="Estado"
                options={estados
                  ?.filter(({ uo_id: uoId }) => uoId === values?.uo?.id)
                  ?.map(({ id, nome }) => ({ id, label: nome }))}
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

// --- FINALIZAR PROCESSO ----------------------------------------------------------------------------------------------

FinalizarOPForm.propTypes = { id: PropTypes.number, isSaving: PropTypes.bool, onClose: PropTypes.func };

export function FinalizarOPForm({ id, isSaving, onClose }) {
  const dispatch = useDispatch();

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      color="success"
      title="Finalizar"
      desc="finalizar este processo"
      handleOk={() =>
        dispatch(updateItem('finalizar', JSON.stringify({ cativos: [] }), { id, msg: 'Processo finalizado' }))
      }
    />
  );
}

// --- CONFIDENCILAIDADES ----------------------------------------------------------------------------------------------

ConfidencialidadesForm.propTypes = { processoId: PropTypes.number };

export function ConfidencialidadesForm({ processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);

  const defaultValues = useMemo(
    () => ({
      confidencial: true,
      perfis_incluidos: confidencialidadesIds(selectedItem?.criterios, 'perfil_incluido_id', '', colaboradores),
      perfis_excluidos: confidencialidadesIds(selectedItem?.criterios, 'perfil_excluido_id', '', colaboradores),
      estados_incluidos: confidencialidadesIds(selectedItem?.criterios, 'estado_incluido_id', 'estado_incluido', []),
      estados_excluidos: confidencialidadesIds(selectedItem?.criterios, 'estado_excluido_id', 'estado_excluido', []),
    }),
    [selectedItem, colaboradores]
  );

  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = {
        perfis_incluidos: confidenciaIds(values, 'perfis_incluidos'),
        perfis_excluidos: confidenciaIds(values, 'perfis_excluidos'),
        estados_incluidos: confidenciaIds(values, 'estados_incluidos'),
        estados_excluidos: confidenciaIds(values, 'estados_excluidos'),
      };

      dispatch(
        updateItem('confidencialidade', JSON.stringify(formData), {
          processoId,
          id: selectedItem?.id,
          msg: 'Confidencialidade atualizado',
          afterSuccess: () => {
            dispatch(closeModal());
            dispatch(getInfoProcesso('confidencialidades', { id: processoId }));
          },
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={() => dispatch(closeModal())} fullWidth maxWidth="md">
      <DialogTitle>Editar confidencialidade</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Confidencialidade
            perfisIncluidos="perfis_incluidos"
            perfisExcluidos="perfis_excluidos"
            estadosIncluidos="estados_incluidos"
            estadosExcluidos="estados_excluidos"
          />
          <DialogButons edit isSaving={isSaving} onCancel={() => dispatch(closeModal())} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function confidencialidadesIds(dados, item, label, colaboradores) {
  return (
    dados
      ?.filter((row) => row[item])
      .map((val) => ({
        id: val[item],
        label: label
          ? val[label]
          : colaboradores?.find((colab) => colab?.perfil_id === val[item])?.perfil?.displayName ||
            `PerfilID: ${val[item]}`,
      })) || []
  );
}
