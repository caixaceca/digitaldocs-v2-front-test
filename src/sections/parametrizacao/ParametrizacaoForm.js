import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { emailCheck } from '../../utils/validarAcesso';
// hooks
import { getComparator, applySort } from '../../hooks/useTable';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
import { AddItem, DialogButons } from '../../components/Actions';
import { FormLoading } from '../../components/skeleton';
import SvgIconStyle from '../../components/SvgIconStyle';
import { SearchNotFoundSmall } from '../../components/table';
import { Notificacao } from '../../components/NotistackProvider';
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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, isOpenModal, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    modelo: Yup.mixed().required('Modelo não pode ficar vazio'),
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
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
    [selectedItem, cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal, selectedItem]);

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

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('fluxo', { mail, id: selectedItem?.id, msg: 'Fluxo eliminado', perfilId: cc?.perfil_id }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
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
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onCancel={onCancel}
              handleDelete={handleDelete}
              desc={isEdit ? 'eliminar este fluxo' : ''}
            />
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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isSaving, selectedItem, isOpenView } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    modelo: Yup.string().required('Modelo não pode ficar vazio'),
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
      is_con: selectedItem?.is_con,
      modelo: selectedItem?.modelo || '',
      limpo: selectedItem?.limpo || false,
      assunto: selectedItem?.assunto || '',
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
            msg: 'Fluxo clonado',
            perfilId: cc?.perfil_id,
            transicoes: selectedItem?.transicoes?.filter((option) => option?.modo !== 'desarquivamento'),
          })
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenView} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Clonar fluxo</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Ao clonar este fluxo, será criado uma cópia deste, replicando o seu conteúdo e as transições
                  associadas para um novo fluxo. Pondendo, posteriormente, editar o conteúdo e as transições.
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
  const { mail, cc, uos } = useSelector((state) => state.intranet);
  const { isEdit, isOpenModal, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);
  const uosList = uos?.map((row) => ({ id: row?.id, balcao: row?.balcao, label: row?.label }));

  const formSchema = Yup.object().shape({
    nome: Yup.string().required('Nome não pode ficar vazio'),
    uo_id: Yup.mixed().required('Unidade orgânica não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
      nome: selectedItem?.nome || '',
      email: selectedItem?.email || '',
      balcao: selectedItem?.balcao || '',
      is_final: selectedItem?.is_final || false,
      observacao: selectedItem?.observacao || '',
      is_decisao: selectedItem?.is_decisao || false,
      is_inicial: selectedItem?.is_inicial || false,
      uo_id: uosList?.find((row) => row.id === selectedItem?.uo_id) || null,
    }),
    [selectedItem, cc, uosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, isOpenModal]);
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

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('estado', { mail, id: selectedItem?.id, perfilId: cc?.perfil_id, msg: 'Estado eliminado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
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

AcessoForm.propTypes = { onCancel: PropTypes.func, perfilId: PropTypes.number, isOpenModal: PropTypes.bool };

export function AcessoForm({ isOpenModal, perfilId, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    objeto: Yup.mixed().required('Objeto pode ficar vazio'),
    acesso: Yup.mixed().required('Acesso não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: Number(perfilId),
      perfilIDCC: cc?.perfil?.id,
      datalimite: selectedItem?.datalimite ? new Date(selectedItem?.datalimite) : null,
      objeto: selectedItem?.objeto ? objetos?.find((row) => row?.id === selectedItem?.objeto) : null,
      acesso: selectedItem?.acesso ? codacessos?.find((row) => row?.id === selectedItem?.acesso) : null,
    }),
    [selectedItem, cc?.perfil?.id, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, isOpenModal]);

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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isOpenModal, isSaving } = useSelector((state) => state.parametrizacao);
  const perfilId = cc?.perfil_id;

  const formSchema = Yup.object().shape({ motivo: Yup.string().required('Motivo não pode ficar vazio') });
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
  }, [isOpenModal, selectedItem]);

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

  const handleDelete = async () => {
    try {
      dispatch(deleteItem('motivo pendencia', { mail, perfilId, id: selectedItem?.id, msg: 'Motivo eliminado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
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
              desc={isEdit ? 'eliminar este motivo' : ''}
            />
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
  const [findConcelhos, setFindConcelhos] = useState([]);
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isOpenModal, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    tipo: Yup.mixed().required('Tipo não pode ficar vazio'),
    ilha: Yup.mixed().required('Ilha não pode ficar vazio'),
    cidade: Yup.mixed().required('Concelho não pode ficar vazio'),
    designacao: Yup.string().required('Designação não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: cc?.perfil_id,
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
    [selectedItem, cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenModal, selectedItem]);

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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isOpenModal, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    descricao: Yup.mixed().required('Escolhe o segmento'),
    linha: Yup.string().required('Linha não pode ficar vazio'),
  });
  const defaultValues = useMemo(
    () => ({ linha: selectedItem?.linha || '', descricao: selectedItem?.descricao || null }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, isOpenModal]);

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
      <DialogTitle>{isEdit ? 'Editar linha de crédito' : 'Adicionar linha de crédito'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFTextField name="linha" label="Linha" />
              </Grid>
              <Grid item xs={12}>
                <RHFAutocompleteSimple
                  name="descricao"
                  label="Segmento"
                  options={['Empresa', 'Particular', 'Produtor Individual', 'Entidade Pública']}
                />
              </Grid>
            </Grid>
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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { selectedItem, estados, done, error, isEdit, isSaving, isOpenModal } = useSelector(
    (state) => state.parametrizacao
  );
  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));

  const formSchema = Yup.object().shape({
    prazoemdias: Yup.string().required('Prazo não pode ficar vazio'),
    estado_inicial_id: Yup.mixed().required('Estado inicial não pode ficar vazio'),
    estado_final_id: Yup.mixed().required('Estado final não pode ficar vazio'),
    modo: Yup.mixed().required('Modo não pode ficar vazio'),
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
      requer_parecer: selectedItem?.requer_parecer || false,
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
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, isOpenModal]);

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
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{selectedItem ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <Notificacao done={done} error={error} onCancel={onCancel} />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
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
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="is_after_devolucao" label="Depois devolução" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="is_paralelo" label="Paralelo" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <RHFSwitch name="requer_parecer" label="Requer parecer" />
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

EstadosPerfilForm.propTypes = { onCancel: PropTypes.func, perfilId: PropTypes.number };

export function EstadosPerfilForm({ perfilId, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc } = useSelector((state) => state.intranet);
  const { estados, isEdit, isSaving, isOpenModal, selectedItem } = useSelector((state) => state.parametrizacao);

  const estadosList = estados.map((row) => ({ id: row?.id, label: row?.nome }));
  const estado = estadosList.find((row) => row.id === selectedItem?.estado_id) || null;

  const formSchema = Yup.object().shape({ estado_id: Yup.mixed().required('Estado orgânica não pode ficar vazio') });

  const defaultValues = useMemo(
    () => ({
      estado_id: estado,
      perfil_id: Number(perfilId),
      perfil_id_cc: cc?.perfil?.id,
      observador: selectedItem?.observador || false,
      data_limite: selectedItem?.data_limite ? new Date(selectedItem?.data_limite) : null,
      data_inicial: selectedItem?.data_inicial ? new Date(selectedItem?.data_inicial) : null,
    }),
    [selectedItem, cc?.perfil?.id, estado, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, isOpenModal]);

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
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <RHFAutocompleteObject
                  name="estado_id"
                  label="Estado"
                  options={applySort(estadosList, getComparator('asc', 'label'))}
                />
              </Grid>
              <Grid item xs={12}>
                <RHFDatePicker dateTime name="data_inicial" label="Data de início" />
              </Grid>
              <Grid item xs={12}>
                <RHFDatePicker dateTime name="data_limite" label="Data de término" />
              </Grid>
              <Grid item xs={12}>
                <RHFSwitch name="observador" label="Somente observador" />
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

PerfisEstadoForm.propTypes = { onCancel: PropTypes.func, estado: PropTypes.object, isOpenModal: PropTypes.bool };

export function PerfisEstadoForm({ isOpenModal, estado, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, done, error } = useSelector((state) => state.parametrizacao);

  const defaultValues = useMemo(() => ({ perfis: [{ perfil: null, data_limite: null, data_inicial: null }] }), []);
  const formSchema = Yup.object().shape({
    perfis: Yup.array(Yup.object({ perfil: Yup.mixed().required('Estado final não pode ficar vazio') })),
  });
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  // const methods = useForm({ defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'perfis' });
  const perfisFilter = applyFilter(
    colaboradores.filter((colab) => !estado?.perfis?.map((row) => row?.perfil_id)?.includes(colab?.perfil_id)) || [],
    values?.perfis?.map((row) => row?.perfil?.id)
  );

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
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="lg">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {`Adicionar colaborador ao estado » ${estado?.nome}`}
          <AddItem small label="Colaborador" handleClick={handleAdd} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Notificacao done={done} error={error} onCancel={onCancel} />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {fields.map((item, index) => (
              <Grid item xs={12} key={item.id}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <RHFAutocompleteObject
                      label="Colaborador"
                      options={perfisFilter}
                      name={`perfis[${index}].perfil`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={9} md={5}>
                    <Stack direction="row" spacing={1}>
                      <RHFDatePicker dateTime name={`perfis[${index}].data_inicial`} label="Data de início" />
                      <RHFDatePicker dateTime name={`perfis[${index}].data_limite`} label="Data de término" />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={3} md={2}>
                    <Stack direction="row" spacing={1}>
                      <RHFSwitch name={`perfis[${index}].observador`} label="Somente observador" />
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
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
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
  const { isEdit, isSaving, isOpenModal, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required('Designação não pode ficar vazio') });
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
  }, [isOpenModal, selectedItem]);

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

  const handleDelete = async () => {
    try {
      dispatch(deleteItem(item, { mail, id: selectedItem?.id, msg: `${item} eliminado` }));
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
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
  const { mail, cc } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, isOpenModal, selectedItem, fluxo, estados, anexos } = useSelector(
    (state) => state.parametrizacao
  );
  const transicoesList = useMemo(
    () => listaTransicoes(fluxo?.transicoes || [], estados || []),
    [estados, fluxo?.transicoes]
  );
  const anexosList = useMemo(
    () => anexos?.filter((item) => item?.ativo)?.map((row) => ({ id: row?.id, label: row?.designacao })) || [],
    [anexos]
  );

  const formSchema = Yup.object().shape({ designacao: Yup.mixed().required('Anexo não pode ficar vazio') });

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
  }, [isOpenModal, selectedItem]);

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

  const handleDelete = async () => {
    try {
      dispatch(
        deleteItem('regra anexo', { mail, id: selectedItem?.id, msg: 'Regra eliminado', perfilId: cc?.perfil_id })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao eliminar este item', { variant: 'error' });
    }
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
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
  const { isEdit, isSaving, isOpenModal, selectedItem, estado } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(() => listaPerfis(estado?.perfis, colaboradores), [colaboradores, estado?.perfis]);

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil: Yup.mixed().required('Seleciona o colaborador'),
        percentagem: Yup.number().typeError('Introduza o valor'),
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
  }, [isOpenModal, selectedItem]);

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
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
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
  const { isEdit, isSaving, isOpenModal, selectedItem, estado } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(() => listaPerfis(estado?.perfis, colaboradores), [colaboradores, estado?.perfis]);

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil: Yup.mixed().required('Seleciona o colaborador'),
        percentagem: Yup.number().typeError('Introduza o valor'),
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
  }, [isOpenModal, selectedItem]);

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
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar regras' : 'Adicionar regras'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: 'text.secondary' }}>Estado:</Typography>
                  <Typography variant="subtitle1">{estado?.nome}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ color: 'text.secondary' }}>Transição:</Typography>
                  <Typography variant="subtitle1">{transicao?.label}</Typography>
                </Stack>
              </Grid>
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

function applyFilter(colaboradores, perfisSelect) {
  return (
    colaboradores
      ?.filter((colab) => !perfisSelect?.includes(colab?.perfil_id))
      ?.map((row) => ({ id: row?.perfil_id, label: row?.nome })) || []
  );
}
