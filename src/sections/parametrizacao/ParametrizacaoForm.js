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
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { emailCheck } from '../../utils/validarAcesso';
import { subtractArrays } from '../../utils/formatText';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
// components
import {
  RHFEditor,
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import ListSelect from '../../components/ListSelect';
import { FormLoading } from '../../components/skeleton';
import { SearchNotFoundSmall } from '../../components/table';
import { Notificacao } from '../../components/NotistackProvider';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
// _mock
import { codacessos, objetos, _concelhos } from '../../_mock';
//
import PesosDecisao from './PesosDecisao';
import { listaTransicoes, listaPerfis } from './applySortFilter';

// --------------------------------------------------------------------------------------------------------------------------------------------

FluxoForm.propTypes = { onCancel: PropTypes.func };

export function FluxoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    modelo: Yup.mixed().required().label('Modelo'),
    assunto: Yup.string().required().label('Assunto'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: perfilId,
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      modelo: selectedItem?.modelo || null,
      is_con: selectedItem?.is_con || false,
      observacao: selectedItem?.observacao || '',
      is_interno: selectedItem?.is_interno || false,
      is_credito: selectedItem?.is_credito || false,
      is_ativo: selectedItem ? selectedItem?.is_ativo : true,
      credito_funcionario: selectedItem?.credito_funcionario || false,
    }),
    [selectedItem, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem) {
        dispatch(updateItem('fluxo', JSON.stringify(values), { mail, id: selectedItem?.id, msg: 'Fluxo atualizado' }));
      } else {
        dispatch(createItem('fluxo', JSON.stringify(values), { mail, msg: 'Fluxo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar fluxo' : 'Adicionar fluxo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFTextField name="assunto" label="Assunto" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteSimple name="modelo" label="Modelo" options={['Série', 'Paralelo']} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <RHFSwitch name="is_interno" label="Interno" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <RHFSwitch name="is_ativo" label="Ativo" />
              </Grid>
              <Grid item xs={6}>
                <RHFSwitch name="is_credito" label="Crédito" />
              </Grid>
              <Grid item xs={6}>
                <RHFSwitch name="credito_funcionario" label="Crédito colaborador" />
              </Grid>
              <Grid item xs={6}>
                <RHFSwitch name="limpo" label="Limpo" />
              </Grid>
              <Grid item xs={6}>
                <RHFSwitch name="is_con" label="Com. Operação Numerário" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="observacao" multiline minRows={3} maxRows={5} label="Observação" />
              </Grid>
            </Grid>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ClonarFluxoForm.propTypes = { onCancel: PropTypes.func };

export function ClonarFluxoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ assunto: Yup.string().required().label('Assunto') });

  const defaultValues = useMemo(
    () => ({
      is_ativo: true,
      observacao: '',
      perfilID: perfilId,
      is_con: selectedItem?.is_con,
      modelo: selectedItem?.modelo || '',
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
      is_interno: selectedItem?.is_interno || false,
      is_credito: selectedItem?.is_credito || false,
      credito_funcionario: selectedItem?.credito_funcionario || false,
    }),
    [selectedItem, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (selectedItem) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem) {
        dispatch(
          createItem('clonar fluxo', JSON.stringify(values), {
            mail,
            perfilId,
            msg: 'Fluxo clonado',
            transicoes: selectedItem?.transicoes?.filter((option) => option?.modo !== 'desarquivamento'),
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Clonar fluxo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Ao clonar este fluxo, será criada uma cópia que replicará o seu conteúdo e as transições associadas
                  para um novo fluxo. Posteriormente pode ser editado.
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="assunto" label="Assunto" />
              </Grid>
            </Grid>
            <DialogButons label="Clonar" isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

EstadoForm.propTypes = { onCancel: PropTypes.func };

export function EstadoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId, uos } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);
  const uosList = useMemo(() => uos?.map((row) => ({ id: row?.id, balcao: row?.balcao, label: row?.label })), [uos]);

  const formSchema = Yup.object().shape({
    nome: Yup.string().required().label('Nome'),
    uo_id: Yup.mixed().required().label('Unidade orgânica'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: perfilId,
      nome: selectedItem?.nome || '',
      email: selectedItem?.email || '',
      balcao: selectedItem?.balcao || '',
      is_final: selectedItem?.is_final || false,
      observacao: selectedItem?.observacao || '',
      is_decisao: selectedItem?.is_decisao || false,
      is_inicial: selectedItem?.is_inicial || false,
      uo_id: uosList?.find((row) => row.id === selectedItem?.uo_id) || null,
    }),
    [selectedItem, perfilId, uosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      values.balcao = values?.uo_id?.balcao;
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

  const handleDelete = () => {
    dispatch(deleteItem('estado', { mail, id: selectedItem?.id, perfilId, msg: 'Estado eliminado' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
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
              <RHFAutocompleteObject name="uo_id" label="Unidade orgânica" options={uosList} />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch name="is_inicial" label="Inicial" />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch name="is_final" label="Final" />
            </Grid>
            <Grid item xs={4}>
              <RHFSwitch name="is_decisao" label="Decisão" />
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
            desc={isEdit ? 'eliminar este estado' : ''}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AcessoForm.propTypes = { onCancel: PropTypes.func, perfilIdA: PropTypes.string };

export function AcessoForm({ perfilIdA, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    objeto: Yup.mixed().required().label('Objeto'),
    acesso: Yup.mixed().required().label('Acesso'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilIDCC: perfilId,
      perfilID: Number(perfilIdA),
      datalimite: selectedItem?.datalimite ? new Date(selectedItem?.datalimite) : null,
      objeto: selectedItem?.objeto ? objetos?.find((row) => row?.id === selectedItem?.objeto) : null,
      acesso: selectedItem?.acesso ? codacessos?.find((row) => row?.id === selectedItem?.acesso) : null,
    }),
    [selectedItem, perfilIdA, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

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

  const handleDelete = () => {
    dispatch(deleteItem('acesso', { mail, id: selectedItem.id, msg: 'Acesso eliminado', perfilId }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedItem ? 'Editar acesso' : 'Adicionar acesso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject name="objeto" label="Objeto" options={objetos} />
              </Grid>
              <Grid item xs={12}>
                <RHFAutocompleteObject name="acesso" label="Acesso" options={codacessos} />
              </Grid>
              <Grid item xs={12}>
                <RHFDatePicker dateTime name="datalimite" label="Data" />
              </Grid>
            </Grid>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar este acesso' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

MotivoPendenciaForm.propTypes = { onCancel: PropTypes.func };

export function MotivoPendenciaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ motivo: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({ motivo: selectedItem?.motivo || '', obs: selectedItem?.obs || '' }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (isEdit) {
        dispatch(
          updateItem('motivo pendencia', JSON.stringify(values), {
            mail,
            perfilId,
            id: selectedItem?.id,
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

  const handleDelete = () => {
    dispatch(deleteItem('motivo pendencia', { mail, perfilId, id: selectedItem?.id, msg: 'Motivo eliminado' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="motivo" label="Designação" />
              <RHFTextField name="obs" label="Observação" />
            </Stack>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar este motivo' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

MotivoTransicaoForm.propTypes = { onCancel: PropTypes.func };

export function MotivoTransicaoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, fluxos } = useSelector((state) => state.parametrizacao);

  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })),
    [fluxos]
  );
  const [fluxosAtribuidos, setFluxosAtribuidos] = useState([]);
  const fluxosExistentes = useMemo(
    () =>
      selectedItem?.fluxos?.length > 0 ? selectedItem?.fluxos?.map((row) => ({ id: row?.id, label: row?.fluxo })) : [],
    [selectedItem?.fluxos]
  );
  const fluxosDisponiveis = useMemo(
    () => (fluxosList?.length > 0 ? subtractArrays(fluxosList, fluxosExistentes) : []),
    [fluxosList, fluxosExistentes]
  );

  useEffect(() => {
    setFluxosAtribuidos(
      selectedItem?.fluxos?.length > 0 ? selectedItem?.fluxos?.map((row) => ({ id: row?.id, label: row?.fluxo })) : []
    );
  }, [selectedItem?.fluxos]);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({
      designacao: selectedItem?.designacao || '',
      observacao: selectedItem?.observacao || '',
      imputavel: selectedItem?.imputavel || false,
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const changeFluxos = (novosFluxosAtribuidos) => {
    setFluxosAtribuidos(novosFluxosAtribuidos);
  };

  const onSubmit = async () => {
    try {
      const dados = {
        ...values,
        fluxos: fluxosAtribuidos?.length > 0 ? fluxosAtribuidos?.map((row) => row?.id) : null,
      };
      if (isEdit) {
        dispatch(
          updateItem('motivo transicao', JSON.stringify(dados), {
            mail,
            perfilId,
            id: selectedItem?.id,
            msg: 'Motivo atualizado',
          })
        );
      } else {
        dispatch(createItem('motivo transicao', JSON.stringify(dados), { mail, perfilId, msg: 'Motivo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <RHFTextField name="designacao" label="Designação" />
                <RHFTextField name="observacao" label="Observação" />
              </Stack>
              <Stack direction="row" spacing={3}>
                <RHFSwitch name="imputavel" label="Imputável" />
                {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
              </Stack>
              <ListSelect atribuidos={fluxosExistentes} disponiveis={fluxosDisponiveis} changeFluxos={changeFluxos} />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

OrigemForm.propTypes = { onCancel: PropTypes.func };

export function OrigemForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [Concelhos, setConcelhos] = useState([]);
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    tipo: Yup.mixed().required().label('Tipo'),
    ilha: Yup.mixed().required().label('Ilha'),
    cidade: Yup.mixed().required().label('Concelho'),
    designacao: Yup.string().required().label('Designação'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: perfilId,
      email: selectedItem?.email || '',
      tipo: selectedItem?.tipo || null,
      ilha: selectedItem?.ilha || null,
      codigo: selectedItem?.codigo || '',
      cidade: selectedItem?.cidade || null,
      telefone: selectedItem?.telefone || '',
      seguimento: selectedItem?.seguimento || '',
      observacao: selectedItem?.observacao || '',
      designacao: selectedItem?.designacao || '',
    }),
    [selectedItem, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

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

  const handleDelete = () => {
    dispatch(deleteItem('origem', { mail, id: selectedItem.id, msg: 'Origem eliminada', perfilId }));
  };

  useEffect(() => {
    setValue('cidade', null);
    setConcelhos(_concelhos.filter((row) => row?.ilha === values?.ilha));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.ilha]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar origem' : 'Adicionar origem'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
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
                  disabled={!values.ilha}
                  options={[...new Set(Concelhos?.map((obj) => obj.concelho))]}
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
              desc={isEdit ? 'eliminar esta origem' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

LinhaForm.propTypes = { onCancel: PropTypes.func };

export function LinhaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    linha: Yup.string().required().label('Linha'),
    descricao: Yup.mixed().required().label('Segmento'),
  });
  const defaultValues = useMemo(
    () => ({
      linha: selectedItem?.linha || '',
      descricao: selectedItem?.descricao || null,
      funcionario: selectedItem?.funcionario || false,
    }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

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

  const handleDelete = () => {
    dispatch(
      deleteItem('linha', { mail, perfilID: perfilId, linhaID: selectedItem?.id, msg: 'Linha de crédito eliminada' })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar linha de crédito' : 'Adicionar linha de crédito'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="linha" label="Linha" />
              <RHFAutocompleteSimple
                name="descricao"
                label="Segmento"
                options={['Empresa', 'Particular', 'Produtor Individual', 'Entidade Pública']}
              />
              <RHFSwitch name="funcionario" label="Funcionário" />
            </Stack>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar esta linha de crédito' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

TransicaoForm.propTypes = { onCancel: PropTypes.func, fluxoId: PropTypes.number };

export function TransicaoForm({ onCancel, fluxoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, estados, done, error, isEdit, isSaving } = useSelector((state) => state.parametrizacao);
  const estadosList = useMemo(() => estados.map((row) => ({ id: row?.id, label: row?.nome })), [estados]);

  const formSchema = Yup.object().shape({
    modo: Yup.mixed().required().label('Modo'),
    prazoemdias: Yup.number().typeError().label('Prazo'),
    estado_final: Yup.mixed().required().label('Estado final'),
    estado_inicial: Yup.mixed().required().label('Estado inicial'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilIDCC: perfilId,
      modo: selectedItem?.modo || null,
      to_alert: selectedItem?.to_alert || false,
      fluxo_id: selectedItem?.fluxo_id || fluxoId,
      prazoemdias: selectedItem?.prazoemdias || 0,
      hasopnumero: selectedItem?.hasopnumero || false,
      is_paralelo: selectedItem?.is_paralelo || false,
      requer_parecer: selectedItem?.requer_parecer || false,
      arqhasopnumero: selectedItem?.arqhasopnumero || false,
      is_after_devolucao: selectedItem?.is_after_devolucao || false,
      estado_final: estadosList?.find((row) => row.id === selectedItem?.estado_final_id) || null,
      estado_inicial: estadosList?.find((row) => row.id === selectedItem?.estado_inicial_id) || null,
    }),
    [fluxoId, selectedItem, perfilId, estadosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      values.estado_final_id = values?.estado_final?.id;
      values.estado_inicial_id = values?.estado_inicial?.id;
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

  const handleDelete = () => {
    dispatch(deleteItem('transicao', { mail, id: selectedItem.id, msg: 'Transição eliminada', perfilId }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{selectedItem ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <Notificacao done={done} error={error} afterSuccess={onCancel} />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteObject
                  name="estado_inicial"
                  label="Estado de origem"
                  options={applySort(estadosList, getComparator('asc', 'label'))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteObject
                  name="estado_final"
                  label="Estado de destino"
                  options={applySort(estadosList, getComparator('asc', 'label'))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFAutocompleteSimple name="modo" label="Modo" options={['Seguimento', 'Devolução']} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFNumberField label="Prazo" name="prazoemdias" tipo="dia" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="is_paralelo" label="Paralelo" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="requer_parecer" label="Requer parecer" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="is_after_devolucao" label="Depois de devolução" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="to_alert" label="Notificar" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="hasopnumero" label="Indicar nº de operação" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="arqhasopnumero" label="Nº de operação no arquivo" />
              </Grid>
            </Grid>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar esta transição' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

EstadosPerfilForm.propTypes = { onCancel: PropTypes.func, perfilIdE: PropTypes.string };

export function EstadosPerfilForm({ perfilIdE, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { estados, isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);
  const estadosList = useMemo(() => estados?.map((row) => ({ id: row?.id, label: row?.nome })), [estados]);

  const formSchema = Yup.object().shape({ estado: Yup.mixed().required().label('Estado') });
  const defaultValues = useMemo(
    () => ({
      perfil_id_cc: perfilId,
      perfil_id: Number(perfilIdE),
      gestor: selectedItem?.gestor || false,
      padrao: selectedItem?.padrao || false,
      observador: selectedItem?.observador || false,
      estado: estadosList.find((row) => row.id === selectedItem?.estado_id) || null,
      data_limite: selectedItem?.data_limite ? new Date(selectedItem?.data_limite) : null,
      data_inicial: selectedItem?.data_inicial ? new Date(selectedItem?.data_inicial) : null,
    }),
    [selectedItem, perfilId, estadosList, perfilIdE]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      values.estado_id = values?.estado?.id;
      if (isEdit) {
        dispatch(updateItem('estadoPerfil', values, { mail, id: selectedItem.id, msg: 'Estado atualizado' }));
      } else {
        dispatch(createItem('estadoPerfil', values, { mail, msg: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('estadoPerfil', { mail, id: selectedItem.id, msg: 'Estado eliminado', perfilId }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject
                  name="estado"
                  label="Estado"
                  disabled={isEdit}
                  options={applySort(estadosList, getComparator('asc', 'label'))}
                />
              </Grid>
              <Grid item xs={6}>
                <RHFDatePicker dateTime name="data_inicial" label="Data de início" />
              </Grid>
              <Grid item xs={6}>
                <RHFDatePicker dateTime name="data_limite" label="Data de término" />
              </Grid>
              <Grid item xs={4}>
                <RHFSwitch name="observador" label="Observador" />
              </Grid>
              <Grid item xs={4}>
                <RHFSwitch name="gestor" label="Gestor" />
              </Grid>
              <Grid item xs={4}>
                <RHFSwitch name="padrao" label="Padrão" />
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
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              edit={isEdit && emailCheck(mail, 'vc.axiac@arove.ordnavi')}
              desc={isEdit && emailCheck(mail, 'vc.axiac@arove.ordnavi') ? 'eliminar esta transição' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

PerfisEstadoForm.propTypes = { onCancel: PropTypes.func, estado: PropTypes.object };

export function PerfisEstadoForm({ estado, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, done, error } = useSelector((state) => state.parametrizacao);
  const { mail, perfilId, colaboradores } = useSelector((state) => state.intranet);

  const defaultValues = useMemo(
    () => ({
      perfis: [
        { perfil: null, gestor: false, padrao: false, observador: false, data_limite: null, data_inicial: null },
      ],
    }),
    []
  );
  const formSchema = Yup.object().shape({
    perfis: Yup.array(Yup.object({ perfil: Yup.mixed().required().label('Colaborador') })),
  });
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'perfis' });
  const perfisFilter = applyFilter(
    colaboradores.filter((colab) => !estado?.perfis?.map((row) => row?.perfil_id)?.includes(colab?.perfil_id)) || [],
    values?.perfis?.map((row) => row?.perfil?.id)
  );

  const onSubmit = async () => {
    try {
      const formData = { estado_id: estado?.id, perfil_id_cc: perfilId, perfis: [] };
      values?.perfis?.forEach((row) => {
        formData?.perfis?.push({
          perfil_id: row?.perfil?.id,
          gestor: row?.gestor || false,
          padrao: row?.padrao || false,
          data_limite: row?.data_limite,
          data_inicial: row?.data_inicial,
          observador: row?.observador || false,
        });
      });
      dispatch(createItem('perfisEstado', JSON.stringify(formData), { mail, msg: 'Perfis adicionados' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleAdd = () => {
    append({ perfil: null, data_limite: null, data_inicial: null, observador: false });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {`Adicionar colaborador ao estado » ${estado?.nome}`}
          <AddItem small label="Colaborador" handleClick={handleAdd} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Notificacao done={done} error={error} afterSuccess={onCancel} />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />} spacing={2} sx={{ mt: 3 }}>
            {fields.map((item, index) => (
              <Stack direction="row" key={item.id} spacing={2} alignItems="center">
                <Stack sx={{ width: 1 }} spacing={1}>
                  <Stack direction={{ xs: 'column', md: 'row' }} key={item.id} spacing={1} alignItems="center">
                    <Stack direction="row" sx={{ width: { xs: 1, md: '50%' } }}>
                      <RHFAutocompleteObject
                        label="Colaborador"
                        options={perfisFilter}
                        name={`perfis[${index}].perfil`}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <RHFDatePicker dateTime name={`perfis[${index}].data_inicial`} label="Início" />
                      <RHFDatePicker dateTime name={`perfis[${index}].data_limite`} label="Término" />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <RHFSwitch name={`perfis[${index}].observador`} label="Observador" />
                    <RHFSwitch name={`perfis[${index}].gestor`} label="Gestor" />
                    <RHFSwitch name={`perfis[${index}].padrao`} label="Padrão" />
                  </Stack>
                </Stack>
                {values.perfis.length > 1 && (
                  <DefaultAction small color="error" label="ELIMINAR" handleClick={() => handleRemove(index)} />
                )}
              </Stack>
            ))}
          </Stack>
          <DialogButons isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

AnexoDespesaForm.propTypes = { item: PropTypes.string, onCancel: PropTypes.func };

export function AnexoDespesaForm({ item, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({
      designacao: selectedItem?.designacao || '',
      reutilizavel: selectedItem?.reutilizavel || false,
      obriga_prazo_validade: selectedItem?.obriga_prazo_validade || false,
    }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem) {
        dispatch(updateItem(item, JSON.stringify(values), { mail, id: selectedItem?.id, msg: `${item} atualizado` }));
      } else {
        dispatch(createItem(item, JSON.stringify(values), { mail, msg: `${item} adicionado` }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem(item, { mail, id: selectedItem?.id, msg: `${item} eliminado` }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit
          ? `Editar ${item === 'Despesa' ? 'despesa' : 'anexo'}`
          : `Adicionar ${item === 'Despesa' ? 'despesa' : 'anexo'}`}
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={item === 'Anexo' ? 3 : 1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFTextField name="designacao" label="Designação" />
              </Grid>
              {item === 'Anexo' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <RHFSwitch name="obriga_prazo_validade" label="Tem prazo de validade" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFSwitch name="reutilizavel" label="Reutilizável" />
                  </Grid>
                </>
              )}
            </Grid>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? `eliminar ${item === 'Despesa' ? 'esta despesa' : 'este anexo'}` : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

RegraAnexoForm.propTypes = { onCancel: PropTypes.func };

export function RegraAnexoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, perfilId } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, fluxo, estados, anexos } = useSelector((state) => state.parametrizacao);
  const transicoesList = useMemo(
    () => listaTransicoes(fluxo?.transicoes || [], estados || []),
    [estados, fluxo?.transicoes]
  );
  const anexosList = useMemo(
    () => anexos?.filter((item) => item?.ativo)?.map((row) => ({ id: row?.id, label: row?.designacao })) || [],
    [anexos]
  );

  const formSchema = Yup.object().shape({ designacao: Yup.mixed().required().label('Anexo') });

  const defaultValues = useMemo(
    () => ({
      obrigatorio: selectedItem ? selectedItem?.obrigatorio : false,
      transicao: transicoesList?.find((row) => row?.id === selectedItem?.transicao_id),
      designacao: anexosList?.find((row) => row?.id === selectedItem?.designacao_id) || null,
    }),
    [selectedItem, anexosList, transicoesList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const formData = {
        fluxo_id: fluxo?.id,
        obrigatorio: values?.obrigatorio,
        transicao_id: values?.transicao?.id,
        designacao_id: values?.designacao?.id,
      };
      if (selectedItem) {
        dispatch(
          updateItem('regra anexo', JSON.stringify(formData), { mail, id: selectedItem?.id, msg: 'Regra atualizado' })
        );
      } else {
        dispatch(createItem('regra anexo', JSON.stringify(formData), { mail, msg: 'Regra atualizado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('regra anexo', { mail, id: selectedItem?.id, msg: 'Regra eliminado', perfilId }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar regra' : 'Adicionar regra'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject name="designacao" label="Anexo" options={anexosList} />
              </Grid>
              <Grid item xs={12}>
                <RHFAutocompleteObject name="transicao" label="Transição" options={transicoesList} />
              </Grid>
              <Grid item xs={12}>
                <RHFSwitch name="obrigatorio" label="Obrigatório" />
              </Grid>
            </Grid>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar esta regra' : ''}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

RegraEstadoForm.propTypes = { onCancel: PropTypes.func };

export function RegraEstadoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, estado } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(() => listaPerfis(estado?.perfis, colaboradores), [colaboradores, estado?.perfis]);

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil: Yup.mixed().required().label('Colaborador'),
        percentagem: Yup.number().positive().typeError().label('Percentagem'),
      })
    ),
  });

  const defaultValues = useMemo(() => ({ destribuir: false, pesos: [] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const formData = values?.destribuir
        ? values?.pesos?.map((row) => ({ perfil_id: row?.perfil?.id, percentagem: row?.percentagem }))
        : { estado_id: estado?.id };
      dispatch(
        createItem(values?.destribuir ? 'regra estado destribuido' : 'regra estado', JSON.stringify(formData), {
          mail,
          estadoId: estado?.id,
          msg: 'Regra adicionada',
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar regra' : 'Adicionar regra'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: 'text.secondary' }}>Estado:</Typography>
                  <Typography variant="subtitle1">{estado?.nome}</Typography>
                </Stack>
                <RHFSwitch
                  name="destribuir"
                  label="Destribuir peso da decisão"
                  onChange={(event, value) => {
                    setValue('pesos', []);
                    setValue('destribuir', value);
                  }}
                />
              </Grid>
              {values?.destribuir && (
                <Grid item xs={12}>
                  <PesosDecisao perfisList={perfisList} />
                </Grid>
              )}
            </Grid>
            <DialogButons isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

RegraTransicaoForm.propTypes = { transicao: PropTypes.number, onCancel: PropTypes.func };

export function RegraTransicaoForm({ transicao, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, estado } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(() => listaPerfis(estado?.perfis, colaboradores), [colaboradores, estado?.perfis]);

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil: Yup.mixed().required().label('Colaborador'),
        percentagem: Yup.number().positive().typeError().label('Percentagem'),
      })
    ),
  });

  const defaultValues = useMemo(() => ({ destribuir: false, pesos: [] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      dispatch(
        createItem(
          'regras transicao',
          JSON.stringify(values?.pesos?.map((row) => ({ perfil_id: row?.perfil?.id, percentagem: row?.percentagem }))),
          { mail, transicaoId: transicao?.id, msg: 'Regra adicionada', estadoId: estado?.id }
        )
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar regras' : 'Adicionar regras'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Transicao item={estado?.nome} transicao={transicao?.label} />
              <Grid item xs={12}>
                <PesosDecisao perfisList={perfisList} />
              </Grid>
            </Grid>
            <DialogButons isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

NotificacaoForm.propTypes = { fluxo: PropTypes.object, transicao: PropTypes.object, onCancel: PropTypes.func };

export function NotificacaoForm({ fluxo, transicao, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
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
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem) {
        dispatch(
          updateItem('notificacao', JSON.stringify(values), {
            mail,
            id: selectedItem?.id,
            msg: 'Notificação atualizada',
          })
        );
      } else {
        dispatch(createItem('notificacao', JSON.stringify(values), { mail, msg: 'Notificação adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('notificacao', { mail, id: selectedItem?.id, msg: 'Notificação eliminada' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar notificação' : 'Adicionar notificação'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Transicao item={fluxo?.assunto} transicao={transicao?.label} fluxo />
            <Grid item xs={12} sm={4}>
              <RHFAutocompleteSimple name="via" label="Via" options={['Email', 'SMS']} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <RHFTextField name="assunto" label="Assunto" />
            </Grid>
            <Grid item xs={12}>
              <RHFEditor simple name="corpo" />
            </Grid>
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit ? 'eliminar esta notificação' : ''}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DestinatarioForm.propTypes = { onCancel: PropTypes.func };

export function DestinatarioForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, notificacaoId } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(
    () => colaboradores?.map((row) => ({ id: row?.id, label: row?.perfil?.displayName, email: row?.perfil?.mail })),
    [colaboradores]
  );

  const formSchema = Yup.object().shape({
    perfil: isEdit && Yup.mixed().required().label('Colaborador'),
    destinatarios: !isEdit && Yup.array(Yup.object({ perfil: Yup.mixed().required().label('Colaborador') })),
  });

  const defaultValues = useMemo(
    () => ({
      telefone: selectedItem?.telefone || '',
      data_inicio: selectedItem?.data_inicio ? add(new Date(selectedItem?.data_inicio), { hours: 2 }) : null,
      data_termino: selectedItem?.data_termino ? add(new Date(selectedItem?.data_termino), { hours: 2 }) : null,
      perfil: isEdit
        ? perfisList?.find((row) => row?.email?.toLowerCase() === selectedItem?.email?.toLowerCase())
        : null,
      destinatarios: isEdit ? [] : [{ perfil: null, data_inicio: null, data_termino: null, telefone: '' }],
    }),
    [selectedItem, isEdit, perfisList]
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
      if (selectedItem) {
        dispatch(
          updateItem(
            'destinatario',
            JSON.stringify({
              telefone: values?.telefone,
              email: values?.perfil?.email,
              data_inicio: values?.data_inicio ? format(values.data_inicio, 'yyyy-MM-dd') : null,
              data_termino: values?.data_termino ? format(values.data_termino, 'yyyy-MM-dd') : null,
            }),
            { mail, id: selectedItem?.id, msg: 'Destinatário atualizado' }
          )
        );
      } else {
        dispatch(
          createItem(
            'destinatario',
            JSON.stringify(
              values?.destinatarios?.map((row) => ({
                telefone: row?.telefone,
                email: row?.perfil?.email,
                data_inicio: row?.data_inicio ? format(row.data_inicio, 'yyyy-MM-dd') : null,
                data_termino: row?.data_termino ? format(row.data_termino, 'yyyy-MM-dd') : null,
              }))
            ),
            { mail, id: notificacaoId, msg: 'Destinatários adicionado' }
          )
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('destinatario', { mail, id: selectedItem?.id, msg: 'Destinatário eliminado' }));
  };

  const handleAdd = () => {
    append({ perfil: null, data_inicio: null, data_termino: null, telefone: '' });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth={isEdit ? 'sm' : 'lg'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar destinatário' : 'Adicionar destinatários'}
          <AddItem small handleClick={handleAdd} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {isEdit ? (
              <>
                <Grid item xs={12}>
                  <RHFAutocompleteObject label="Colaborador" options={perfisList} name="perfil" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField label="Telefone" name="telefone" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker label="Data de início" name="data_inicio" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <RHFDatePicker label="Data de fim" name="data_termino" />
                </Grid>
              </>
            ) : (
              fields.map((item, index) => (
                <Grid item xs={12} key={item.id}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <RHFAutocompleteObject
                        label="Colaborador"
                        options={perfisList}
                        name={`destinatarios[${index}].perfil`}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <RHFTextField label="Telefone" name={`destinatarios[${index}].telefone`} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
                        <RHFDatePicker label="Data de início" name={`destinatarios[${index}].data_inicio`} />
                        <RHFDatePicker label="Data de fim" name={`destinatarios[${index}].data_termino`} />
                        {values.destinatarios.length > 1 && (
                          <DefaultAction color="error" label="ELIMINAR" handleClick={() => handleRemove(index)} />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              ))
            )}
          </Grid>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit ? 'eliminar esta destinatário' : ''}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ItemComponent.propTypes = { item: PropTypes.object, rows: PropTypes.number, children: PropTypes.node };

export function ItemComponent({ item, rows, children }) {
  const { isLoading, isEdit } = useSelector((state) => state.parametrizacao);
  return isLoading ? (
    <Grid item xs={12}>
      <FormLoading rows={rows} />
    </Grid>
  ) : (
    <>
      {isEdit && !item ? (
        <Stack sx={{ py: 5 }}>
          <SearchNotFoundSmall message="Item não disponível..." />
        </Stack>
      ) : (
        children
      )}
    </>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

Transicao.propTypes = { item: PropTypes.string, transicao: PropTypes.string, fluxo: PropTypes.bool };

export function Transicao({ item, transicao, fluxo = false }) {
  return (
    <Grid item xs={12}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>{fluxo ? 'Fluxo:' : 'Estado:'}</Typography>
        <Typography variant="subtitle1">{item}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>Transição:</Typography>
        <Typography variant="subtitle1">{transicao}</Typography>
      </Stack>
    </Grid>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

function applyFilter(colaboradores, perfisSelect) {
  return (
    colaboradores
      ?.filter((colab) => !perfisSelect?.includes(colab?.perfil_id))
      ?.map((row) => ({ id: row?.perfil_id, label: row?.nome })) || []
  );
}
