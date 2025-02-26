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
import { subtractArrays } from '../../utils/formatObject';
// hooks
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import ListSelect from '../../components/ListSelect';
import { FormLoading } from '../../components/skeleton';
import { SearchNotFoundSmall } from '../../components/table';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
// _mock
import { codacessos, objetos, _concelhos } from '../../_mock';
//
import PesosDecisao from './PesosDecisao';
import { listaPerfis } from './applySortFilter';

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
      const formData = { ...values, balcao: values?.uo_id?.balcao, uo_id: values?.uo_id?.id };
      const params = { id: selectedItem.id, msg: `Estado ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('estado', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
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
            desc={isEdit ? 'eliminar este estado' : ''}
            handleDelete={() => dispatch(deleteItem('estado', { id: selectedItem?.id, msg: 'Estado eliminado' }))}
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
      const formData = { ...values, objeto: values.objeto.id, acesso: values.acesso.id };
      const params = { id: selectedItem.id, msg: `Acesso ${isEdit ? 'atualizado' : 'atribuido'}` };
      dispatch((isEdit ? updateItem : createItem)('acessos', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
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
            desc={isEdit ? 'eliminar este acesso' : ''}
            handleDelete={() => dispatch(deleteItem('acessos', { id: selectedItem.id, msg: 'Acesso eliminado' }))}
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
      const params = { id: selectedItem?.id, msg: `Motivo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('motivosPendencia', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
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
            desc={isEdit ? 'eliminar este motivo' : ''}
            handleDelete={() =>
              dispatch(deleteItem('motivosPendencia', { id: selectedItem?.id, msg: 'Motivo eliminado' }))
            }
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
    () => fluxos?.filter((item) => item?.is_ativo)?.map((row) => ({ id: row?.id, label: row?.assunto })) || [],
    [fluxos]
  );
  const [fluxosAtribuidos, setFluxosAtribuidos] = useState([]);
  const fluxosExistentes = useMemo(
    () => selectedItem?.fluxos?.map((row) => ({ id: row?.id, label: row?.fluxo })) || [],
    [selectedItem?.fluxos]
  );
  const fluxosDisponiveis = useMemo(
    () => (fluxosList?.length > 0 ? subtractArrays(fluxosList, fluxosExistentes) : []),
    [fluxosList, fluxosExistentes]
  );

  useEffect(() => {
    setFluxosAtribuidos(selectedItem?.fluxos?.map((row) => ({ id: row?.id, label: row?.fluxo })) || []);
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
      const formData = { ...values, fluxos: fluxosAtribuidos?.map((row) => row?.id) || null };
      const params = { id: selectedItem?.id, msg: `Motivo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('motivosTransicao', JSON.stringify(formData), params));
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
      const params = { id: selectedItem?.id, msg: `Origem ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('origens', JSON.stringify(values), params));
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
      const params = { id: selectedItem?.id, msg: `Linha ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('linhas', JSON.stringify(values), params));
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
      const params = { id: selectedItem?.id, msg: `Despesa ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('despesas', JSON.stringify(values), params));
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
      const params = { id: selectedItem?.id, msg: `Documento ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('documentos', JSON.stringify(formData), params));
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
      const formData = { ...values, estado_id: values?.estado?.id };
      const params = { id: selectedItem?.id, msg: `Estado ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('estadosPerfil', JSON.stringify(formData), params));
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
  const { isSaving, done } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);

  useNotificacao({ done, afterSuccess: () => onCancel() });

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
  const { colaboradores } = useSelector((state) => state.intranet);
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
      const params = { estadoId: estado?.id, msg: 'Regra adicionada' };
      dispatch(
        createItem(values?.destribuir ? 'regra estado destribuido' : 'regrasEstado', JSON.stringify(formData), params)
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

function applyFilter(colaboradores, perfisSelect) {
  return (
    colaboradores
      ?.filter((colab) => !perfisSelect?.includes(colab?.perfil_id))
      ?.map((row) => ({ id: row?.perfil_id, label: row?.nome })) || []
  );
}
