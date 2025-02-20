import * as Yup from 'yup';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
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
import { fillData } from '../../utils/formatTime';
import { emailCheck } from '../../utils/validarAcesso';
import { subtractArrays, transicoesList } from '../../utils/formatObject';
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
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import ListSelect from '../../components/ListSelect';
import { FormLoading } from '../../components/skeleton';
import { SearchNotFoundSmall } from '../../components/table';
import { Notificacao } from '../../components/NotistackProvider';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
// _mock
import { codacessos, objetos, _concelhos } from '../../_mock';
//
import PesosDecisao from './PesosDecisao';
import { listaPerfis } from './applySortFilter';

// --------------------------------------------------------------------------------------------------------------------------------------------

FluxoForm.propTypes = { onCancel: PropTypes.func };

export function FluxoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
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
      is_ativo: isEdit ? selectedItem?.is_ativo : true,
      credito_funcionario: selectedItem?.credito_funcionario || false,
    }),
    [selectedItem, isEdit, perfilId]
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
        dispatch(updateItem('fluxo', JSON.stringify(values), { id: selectedItem?.id, msg: 'Fluxo atualizado' }));
      } else {
        dispatch(createItem('fluxo', JSON.stringify(values), { msg: 'Fluxo adicionado' }));
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
              <GridItem children={<RHFTextField name="assunto" label="Assunto" />} />
              <GridItem
                sm={6}
                children={<RHFAutocompleteSmp name="modelo" label="Modelo" options={['Série', 'Paralelo']} />}
              />
              <GridItem xs={6} sm={isEdit ? 3 : 6} children={<RHFSwitch name="is_interno" label="Interno" />} />
              {isEdit && <GridItem xs={6} sm={3} children={<RHFSwitch name="is_ativo" label="Ativo" />} />}
              <GridItem xs={6} children={<RHFSwitch name="is_credito" label="Crédito" />} />
              <GridItem xs={6} children={<RHFSwitch name="credito_funcionario" label="Cré. colaborador" />} />
              <GridItem xs={6} children={<RHFSwitch name="limpo" label="Limpo" />} />
              <GridItem xs={6} children={<RHFSwitch name="is_con" label="CON" />} />
              <GridItem children={<RHFTextField name="observacao" multiline rows={3} label="Observação" />} />
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
  const { perfilId } = useSelector((state) => state.intranet);
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
          <Stack spacing={3} sx={{ pt: 3 }}>
            <Alert severity="info">
              Ao clonar este fluxo, será criada uma cópia que replicará o seu conteúdo e as transições associadas para
              um novo fluxo. Posteriormente pode ser editado.
            </Alert>
            <RHFTextField name="assunto" label="Assunto" />
          </Stack>
          <DialogButons label="Clonar" isSaving={isSaving} onCancel={onCancel} />
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
  const { perfilId, uos } = useSelector((state) => state.intranet);
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
        dispatch(updateItem('estado', JSON.stringify(values), { id: selectedItem.id, msg: 'Estado atualizado' }));
      } else {
        dispatch(createItem('estado', JSON.stringify(values), { msg: 'Estado adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('estado', { id: selectedItem?.id, perfilId, msg: 'Estado eliminado' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <GridItem children={<RHFTextField name="nome" label="Nome" />} />
            <GridItem children={<RHFTextField name="email" label="Email" />} />
            <GridItem children={<RHFAutocompleteObj name="uo_id" label="Unidade orgânica" options={uosList} />} />
            <GridItem xs={4} children={<RHFSwitch name="is_inicial" label="Inicial" />} />
            <GridItem xs={4} children={<RHFSwitch name="is_final" label="Final" />} />
            <GridItem xs={4} children={<RHFSwitch name="is_decisao" label="Decisão" />} />
            <GridItem children={<RHFTextField name="observacao" multiline rows={3} label="Observação" />} />
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
  const { perfilId } = useSelector((state) => state.intranet);
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
        dispatch(updateItem('acessos', JSON.stringify(values), { id: selectedItem.id, msg: 'Acesso atualizado' }));
      } else {
        dispatch(createItem('acessos', JSON.stringify(values), { msg: 'Acesso atribuido' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('acessos', { id: selectedItem.id, msg: 'Acesso eliminado', perfilId }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{selectedItem ? 'Editar acesso' : 'Adicionar acesso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="objeto" label="Objeto" options={objetos} />
            <RHFAutocompleteObj name="acesso" label="Acesso" options={codacessos} />
            <RHFDatePicker dateTime name="datalimite" label="Data" />
          </Stack>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit ? 'eliminar este acesso' : ''}
          />
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
          updateItem('motivosPendencia', JSON.stringify(values), { id: selectedItem?.id, msg: 'Motivo atualizado' })
        );
      } else {
        dispatch(createItem('motivosPendencia', JSON.stringify(values), { msg: 'Motivo adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('motivosPendencia', { id: selectedItem?.id, msg: 'Motivo eliminado' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
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
      ativo: isEdit ? selectedItem?.ativo : true,
      imputavel: selectedItem?.imputavel || false,
    }),
    [selectedItem, isEdit]
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
          updateItem('motivosTransicao', JSON.stringify(dados), { id: selectedItem?.id, msg: 'Motivo atualizado' })
        );
      } else {
        dispatch(createItem('motivosTransicao', JSON.stringify(dados), { msg: 'Motivo adicionado' }));
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
  const { perfilId } = useSelector((state) => state.intranet);
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
        dispatch(updateItem('origens', JSON.stringify(values), { id: selectedItem.id, msg: 'Origem atualizada' }));
      } else {
        dispatch(createItem('origens', JSON.stringify(values), { msg: 'Origem adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('origens', { id: selectedItem.id, msg: 'Origem eliminada', perfilId }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar origem' : 'Adicionar origem'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <GridItem children={<RHFTextField name="designacao" label="Designação" />} />
              <GridItem children={<RHFTextField name="seguimento" label="Segmento" />} />
              <GridItem sm={6} children={<RHFTextField name="codigo" label="Código" />} />
              <GridItem
                sm={6}
                children={<RHFAutocompleteSmp name="tipo" label="Tipo" options={['Fiscal', 'Judicial']} />}
              />
              <GridItem
                sm={6}
                children={
                  <RHFAutocompleteSmp
                    name="ilha"
                    label="Ilha"
                    onChange={(event, value) => {
                      setValue('ilha', value);
                      setValue('cidade', null);
                    }}
                    options={[...new Set(_concelhos.map((row) => row.ilha))]}
                  />
                }
              />
              <GridItem
                sm={6}
                children={
                  <RHFAutocompleteSmp
                    name="cidade"
                    label="Concelho"
                    options={_concelhos?.filter((row) => row?.ilha === values?.ilha)?.map((item) => item?.concelho)}
                  />
                }
              />
              <GridItem sm={6} children={<RHFTextField name="email" label="Email" />} />
              <GridItem sm={6} children={<RHFTextField name="telefone" label="Telefone" />} />
              <GridItem children={<RHFTextField name="observacao" multiline rows={2} label="Observação" />} />
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
  const { perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    linha: Yup.string().required().label('Designação'),
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
        dispatch(updateItem('linhas', JSON.stringify(values), { id: selectedItem.id, msg: 'Linha atualizada' }));
      } else {
        dispatch(createItem('linhas', JSON.stringify(values), { msg: 'Linha adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('linhas', { perfilID: perfilId, linhaID: selectedItem?.id, msg: 'Linha eliminada' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar linha de crédito' : 'Adicionar linha de crédito'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="linha" label="Designação" />
            <RHFAutocompleteSmp
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

GarantiaForm.propTypes = { onCancel: PropTypes.func };

export function GarantiaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    codigo: Yup.string().required().label('Código'),
    descritivo: Yup.string().required().label('Designação'),
  });
  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo || '',
      descritivo: selectedItem?.descritivo || '',
      ativo: isEdit ? selectedItem?.ativo : true,
    }),
    [selectedItem, isEdit]
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
        dispatch(updateItem('garantias', JSON.stringify(values), { id: selectedItem?.id, msg: 'Garantia atualizada' }));
      } else {
        dispatch(createItem('garantias', JSON.stringify(values), { msg: 'Garantia adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar garantia' : 'Adicionar garantia'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="codigo" label="Código" />
              <RHFTextField name="descritivo" label="Designação" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

DespesaForm.propTypes = { onCancel: PropTypes.func };

export function DespesaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({
      descricao: selectedItem?.descricao || '',
      designacao: selectedItem?.designacao || '',
      ativo: isEdit ? selectedItem?.ativo : true,
    }),
    [selectedItem, isEdit]
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
        dispatch(updateItem('despesas', JSON.stringify(values), { id: selectedItem?.id, msg: 'Despesa atualizada' }));
      } else {
        dispatch(createItem('despesas', JSON.stringify(values), { msg: 'Despesa adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar despesa' : 'Adicionar despesa'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descricao" label="Descrição" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
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
  const { perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, estados, done, error, isEdit, isSaving } = useSelector((state) => state.parametrizacao);
  const estadosList = useMemo(() => estados.map((row) => ({ id: row?.id, label: row?.nome })), [estados]);

  const formSchema = Yup.object().shape({
    modo: Yup.mixed().required().label('Modo'),
    prazoemdias: Yup.number().typeError().label('Prazo'),
    estado_final: Yup.mixed().required().label('Destino'),
    estado_inicial: Yup.mixed().required().label('Origem'),
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
      destino: estadosList?.find((row) => row.id === selectedItem?.estado_final_id) || null,
      origem: estadosList?.find((row) => row.id === selectedItem?.estado_inicial_id) || null,
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
      values.estado_final_id = values?.destino?.id;
      values.estado_inicial_id = values?.origem?.id;
      if (selectedItem) {
        dispatch(
          updateItem('transicoes', JSON.stringify(values), {
            item1: 'fluxo',
            id: selectedItem.id,
            msg: 'Transição atualizada',
          })
        );
      } else {
        dispatch(createItem('transicoes', JSON.stringify(values), { item1: 'fluxo', msg: 'Transição adicionada' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('transicoes', { item1: 'fluxo', id: selectedItem.id, msg: 'Transição eliminada' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{selectedItem ? 'Editar transição' : 'Adicionar transição'}</DialogTitle>
      <DialogContent>
        <Notificacao done={done} error={error} afterSuccess={onCancel} />
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <GridItem sm={6} children={<RHFAutocompleteObj name="origem" label="Origem" options={estadosList} />} />
              <GridItem sm={6} children={<RHFAutocompleteObj name="destino" label="Destino" options={estadosList} />} />
              <GridItem
                sm={6}
                children={<RHFAutocompleteSmp name="modo" label="Modo" options={['Seguimento', 'Devolução']} />}
              />
              <GridItem sm={6} children={<RHFNumberField label="Prazo" name="prazoemdias" tipo="dia" />} />
              <GridItem sm={4} children={<RHFSwitch name="is_paralelo" label="Paralelo" />} />
              <GridItem sm={4} children={<RHFSwitch name="requer_parecer" label="Requer parecer" />} />
              <GridItem sm={4} children={<RHFSwitch name="is_after_devolucao" label="Depois de devolução" />} />
              <GridItem sm={4} children={<RHFSwitch name="to_alert" label="Notificar" />} />
              <GridItem sm={4} children={<RHFSwitch name="hasopnumero" label="Indicar nº de operação" />} />
              <GridItem sm={4} children={<RHFSwitch name="arqhasopnumero" label="Nº de operação no arquivo" />} />
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

DocumentoForm.propTypes = { onCancel: PropTypes.func };

export function DocumentoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    codigo: Yup.string().required().label('Código'),
    designacao: Yup.string().required().label('Designação'),
    titulo: Yup.mixed().when('formulario', { is: true, then: () => Yup.string().required().label('Título') }),
    sub_titulo: Yup.mixed().when('formulario', { is: true, then: () => Yup.string().required().label('Subtítulo') }),
    data_formulario: Yup.mixed().when('formulario', {
      is: true,
      then: () => Yup.date().typeError().required().label('Data'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo || '',
      pagina: selectedItem?.pagina || '',
      titulo: selectedItem?.titulo || '',
      anexo: selectedItem?.anexo || false,
      designacao: selectedItem?.designacao || '',
      sub_titulo: selectedItem?.sub_titulo || '',
      ativo: isEdit ? selectedItem?.ativo : true,
      formulario: selectedItem?.formulario || false,
      identificador: selectedItem?.identificador || false,
      data_formulario: fillData(selectedItem?.data_formulario, null),
      obriga_prazo_validade: selectedItem?.obriga_prazo_validade || false,
    }),
    [selectedItem, isEdit]
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
        ...values,
        titulo: values?.formulario ? values?.titulo : null,
        sub_titulo: values?.formulario ? values?.sub_titulo : null,
        data_formulario:
          values?.formulario && values?.data_formulario ? format(values.data_formulario, 'yyyy-MM-dd') : null,
      };
      if (selectedItem) {
        dispatch(
          updateItem('documentos', JSON.stringify(formData), { id: selectedItem?.id, msg: 'Documento atualizado' })
        );
      } else {
        dispatch(createItem('documentos', JSON.stringify(formData), { msg: 'Documento adicionado' }));
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar documento' : 'Adicionar documento'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }} justifyContent="center">
              <GridItem children={<RHFTextField name="codigo" label="Código" />} />
              <GridItem children={<RHFTextField name="designacao" label="Designação" />} />
              <GridItem xs={6} children={<RHFSwitch name="formulario" label="Formulário" />} />
              {values?.formulario && (
                <>
                  <GridItem xs={6} children={<RHFDatePicker name="data_formulario" label="Data" />} />
                  <GridItem children={<RHFTextField name="titulo" label="Título" />} />
                  <GridItem children={<RHFTextField name="sub_titulo" label="Subtítulo" />} />
                </>
              )}
              <GridItem xs={6} children={<RHFSwitch name="identificador" label="Identificador" />} />
              <GridItem xs={6} children={<RHFSwitch name="obriga_prazo_validade" label="Validade" />} />
              <GridItem xs={6} children={<RHFSwitch name="anexo" label="Anexo" />} />
              {isEdit && <GridItem xs={6} children={<RHFSwitch name="ativo" label="Ativo" />} />}
            </Grid>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ChecklistForm.propTypes = { fluxo: PropTypes.object, onCancel: PropTypes.func };

export function ChecklistForm({ fluxo, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, estados, documentos } = useSelector((state) => state.parametrizacao);
  const listaTransicoes = useMemo(
    () =>
      transicoesList(fluxo?.transicoes, estados)?.map((row) => ({
        id: row?.id,
        label: `${row?.modo} ${row?.is_after_devolucao ? '(DD)' : ''}: ${row?.estado_inicial} » ${row?.estado_final}`,
      })),
    [fluxo?.transicoes, estados]
  );

  const formSchema = Yup.object().shape({
    transicao: isEdit && Yup.mixed().required().label('Transição'),
    tipo_documento: isEdit && Yup.mixed().required().label('Documento'),
    documentos:
      !isEdit &&
      Yup.array(
        Yup.object({
          transicao: Yup.mixed().required().label('Transição'),
          tipo_documento: Yup.mixed().required().label('Documento'),
        })
      ),
  });

  const defaultValues = useMemo(
    () => ({
      ativo: isEdit ? selectedItem?.ativo : false,
      obrigatorio: isEdit ? selectedItem?.obrigatorio : false,
      transicao: listaTransicoes?.find((row) => row?.id === selectedItem?.transicao_id) || null,
      documentos: isEdit ? [] : [{ tipo_documento: null, transicao: null, obrigatorio: false }],
      tipo_documento: documentos?.find((row) => row?.id === selectedItem?.tipo_documento_id) || null,
    }),
    [isEdit, selectedItem, listaTransicoes, documentos]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'documentos' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      if (selectedItem) {
        dispatch(
          updateItem(
            'checklist',
            JSON.stringify({
              ativo: values?.ativo,
              obrigatorio: values?.obrigatorio,
              transicao_id: values?.transicao?.id,
              tipo_documento_id: values?.tipo_documento?.id,
            }),
            { mail, id: selectedItem?.id, msg: 'Documento atualizado' }
          )
        );
      } else {
        dispatch(
          createItem(
            'checklist',
            JSON.stringify({
              fluxo_id: fluxo?.id,
              documentos: values?.documentos?.map((row) => ({
                ativo: true,
                obrigatorio: row?.obrigatorio,
                transicao_id: row?.transicao?.id,
                tipo_documento_id: row?.tipo_documento?.id,
              })),
            }),
            { mail, msg: 'Documentos adicionados' }
          )
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar documento' : 'Adicionar documentos'}
          {!isEdit && (
            <AddItem small handleClick={() => append({ tipo_documento: null, transicao: null, obrigatorio: false })} />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            {isEdit ? (
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <GridItem
                  children={<RHFAutocompleteObj label="Documento" options={documentos} name="tipo_documento" />}
                />
                <GridItem
                  children={<RHFAutocompleteObj label="Transição" options={listaTransicoes} name="transicao" />}
                />
                <GridItem sm={6} children={<RHFSwitch name="obrigatorio" label="Obrigatório" />} />
                <GridItem sm={6} children={<RHFSwitch name="ativo" label="Ativo" />} />
              </Grid>
            ) : (
              <Stack spacing={2} sx={{ pt: 3 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                {fields.map((item, index) => (
                  <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <RHFAutocompleteObj
                          label="Documento"
                          options={documentos}
                          name={`documentos[${index}].tipo_documento`}
                        />
                        <RHFSwitch name={`documentos[${index}].obrigatorio`} label="Obrigatório" sx={{ width: 180 }} />
                      </Stack>
                      <RHFAutocompleteObj
                        label="Transição"
                        options={listaTransicoes}
                        name={`documentos[${index}].transicao`}
                      />
                    </Stack>
                    {values.documentos.length > 1 && (
                      <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
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
      if (isEdit) dispatch(updateItem('estadosPerfil', values, { id: selectedItem.id, msg: 'Estado atualizado' }));
      else dispatch(createItem('estadosPerfil', values, { msg: 'Estado adicionado' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <GridItem
                children={<RHFAutocompleteObj name="estado" label="Estado" disabled={isEdit} options={estadosList} />}
              />
              <GridItem xs={6} children={<RHFDatePicker dateTime name="data_inicial" label="Data de início" />} />
              <GridItem xs={6} children={<RHFDatePicker dateTime name="data_limite" label="Data de término" />} />
              <GridItem xs={4} children={<RHFSwitch name="observador" label="Observador" />} />
              <GridItem xs={4} children={<RHFSwitch name="gestor" label="Gestor" />} />
              <GridItem xs={4} children={<RHFSwitch name="padrao" label="Padrão" />} />
              {isEdit && (
                <GridItem
                  children={
                    <Alert severity="info">
                      <Typography variant="body2">Os estados atríbuidos não podem ser eliminados.</Typography>
                      <Typography variant="body2">Para desativar o estado, preencha a data de término.</Typography>
                    </Alert>
                  }
                />
              )}
            </Grid>
            <DialogButons
              isSaving={isSaving}
              onCancel={onCancel}
              edit={isEdit && emailCheck(mail, 'vc.axiac@arove.ordnavi')}
              desc={isEdit && emailCheck(mail, 'vc.axiac@arove.ordnavi') ? 'eliminar esta transição' : ''}
              handleDelete={() =>
                dispatch(deleteItem('estadosPerfil', { id: selectedItem.id, msg: 'Estado eliminado' }))
              }
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
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, done, error } = useSelector((state) => state.parametrizacao);

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
      dispatch(createItem('perfisEstado', JSON.stringify(formData), { item1: 'estado', msg: 'Perfis adicionados' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {`Adicionar colaborador ao estado » ${estado?.nome}`}
          <AddItem
            small
            label="Colaborador"
            handleClick={() => append({ perfil: null, data_limite: null, data_inicial: null, observador: false })}
          />
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
                      <RHFAutocompleteObj label="Colaborador" options={perfisFilter} name={`perfis[${index}].perfil`} />
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
                  <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
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
        createItem(values?.destribuir ? 'regra estado destribuido' : 'regrasEstado', JSON.stringify(formData), {
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
              <GridItem
                children={
                  <>
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
                  </>
                }
              />
              {values?.destribuir && <GridItem children={<PesosDecisao perfisList={perfisList} />} />}
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
          'regrasTransicao',
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
              <GridItem children={<PesosDecisao perfisList={perfisList} />} />
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
          updateItem('notificacoes', JSON.stringify(values), {
            mail,
            id: selectedItem?.id,
            msg: 'Notificação atualizada',
          })
        );
      } else {
        dispatch(createItem('notificacoes', JSON.stringify(values), { mail, msg: 'Notificação adicionada' }));
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
            <GridItem sm={4} children={<RHFAutocompleteSmp name="via" label="Via" options={['Email', 'SMS']} />} />
            <GridItem sm={8} children={<RHFTextField name="assunto" label="Assunto" />} />
            <GridItem children={<RHFEditor simple name="corpo" />} />
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

DestinatarioForm.propTypes = { id: PropTypes.number, selectedItem: PropTypes.object, onCancel: PropTypes.func };

export function DestinatarioForm({ id, onCancel, selectedItem }) {
  const isEdit = selectedItem?.id;
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.parametrizacao);
  const { mail, colaboradores } = useSelector((state) => state.intranet);
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
      data_inicio: fillData(selectedItem?.data_inicio, null),
      data_termino: fillData(selectedItem?.data_termino, null),
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
      if (isEdit) {
        dispatch(
          updateItem(
            'destinatarios',
            JSON.stringify({
              telefone: values?.telefone,
              email: values?.perfil?.email,
              data_inicio: values?.data_inicio ? format(values.data_inicio, 'yyyy-MM-dd') : null,
              data_termino: values?.data_termino ? format(values.data_termino, 'yyyy-MM-dd') : null,
            }),
            { mail, id: selectedItem?.id || id, msg: 'Destinatário atualizado' }
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
            { mail, id, msg: 'Destinatários adicionado' }
          )
        );
      }
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth={isEdit ? 'sm' : 'lg'}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Editar destinatário' : 'Adicionar destinatários'}
          {!isEdit && (
            <AddItem
              small
              handleClick={() => append({ perfil: null, data_inicio: null, data_termino: null, telefone: '' })}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {isEdit ? (
              <>
                <GridItem children={<RHFAutocompleteObj label="Colaborador" options={perfisList} name="perfil" />} />
                <GridItem children={<RHFTextField label="Telefone" name="telefone" />} />
                <GridItem sm={6} children={<RHFDatePicker label="Data de início" name="data_inicio" />} />
                <GridItem sm={6} children={<RHFDatePicker label="Data de fim" name="data_termino" />} />
              </>
            ) : (
              fields.map((item, index) => (
                <Grid item xs={12} key={item.id}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <RHFAutocompleteObj
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
                          <DefaultAction color="error" label="ELIMINAR" handleClick={() => remove(index)} />
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
            desc={isEdit ? 'eliminar esta destinatário' : ''}
            handleDelete={() =>
              dispatch(deleteItem('destinatarios', { mail, id: selectedItem?.id, msg: 'Destinatário eliminado' }))
            }
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
    <GridItem children={<FormLoading rows={rows} />} />
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
        <Typography>{item}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ color: 'text.secondary' }}>Transição:</Typography>
        <Typography>{transicao}</Typography>
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
