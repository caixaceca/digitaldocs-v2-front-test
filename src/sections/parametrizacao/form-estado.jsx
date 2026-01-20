import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
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
import { estadoFixo } from '../../utils/validarAcesso';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { shapeNumber } from '../../components/hook-form/yup-shape';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
//
import { listaPerfis } from './applySortFilter';
import { ItemComponent } from './ParametrizacaoForm';

const ps = { perfil_id: null, gestor: null, padrao: false, observador: false, data_limite: null, data_inicial: null };

// ---------------------------------------------------------------------------------------------------------------------

export function EstadoForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { uos } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);
  const uosList = useMemo(() => uos?.map(({ id, balcao, label }) => ({ id, balcao, label })), [uos]);
  const readOnly = isEdit && estadoFixo(selectedItem?.nome);

  const formSchema = Yup.object().shape({
    nome: Yup.string().required().label('Nome'),
    uo_id: Yup.mixed().required().label('Unidade orgânica'),
    nivel_decisao: shapeNumber('Nível de decisão', true, '', 'is_decisao'),
  });

  const defaultValues = useMemo(
    () => ({
      ativo: true,
      nome: selectedItem?.nome || '',
      email: selectedItem?.email || '',
      is_final: selectedItem?.is_final || false,
      observacao: selectedItem?.observacao || '',
      is_decisao: selectedItem?.is_decisao || false,
      is_inicial: selectedItem?.is_inicial || false,
      nivel_decisao: selectedItem?.nivel_decisao || null,
      uo_id: uosList?.find(({ id }) => Number(id) === Number(selectedItem?.uo_id)) || null,
    }),
    [selectedItem, uosList]
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
      const params = { id: selectedItem?.id, msg: `Estado ${isEdit ? 'atualizado' : 'adicionado'}` };
      const formData = JSON.stringify({ ...values, balcao: values?.uo_id?.balcao, uo_id: values?.uo_id?.id });
      dispatch((isEdit ? updateItem : createItem)('estado', formData, { ...params, getItem: 'selectedItem' }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar estado' : 'Adicionar estado'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} justifyContent="center" sx={{ pt: 3 }}>
            <GridItem>
              <RHFTextField name="nome" label="Nome" InputProps={{ readOnly }} />
              {readOnly && (
                <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'info.main' }}>
                  *O nome do estado não pode ser alterado, está em uso para validações na aplicação.
                </Typography>
              )}
            </GridItem>
            <GridItem sm={6} children={<RHFTextField name="email" label="Email" />} />
            <GridItem
              sm={6}
              children={<RHFAutocompleteObj name="uo_id" label="Unidade orgânica" options={uosList} />}
            />
            <GridItem xs={values?.is_decisao ? 6 : 4} children={<RHFSwitch name="is_inicial" label="Inicial" />} />
            <GridItem xs={values?.is_decisao ? 6 : 4} children={<RHFSwitch name="is_final" label="Final" />} />
            <GridItem xs={values?.is_decisao ? 6 : 4} children={<RHFSwitch name="is_decisao" label="Decisão" />} />
            {values?.is_decisao && (
              <GridItem sm={6} children={<RHFNumberField name="nivel_decisao" label="Nível de decisão" />} />
            )}
            <GridItem children={<RHFTextField name="observacao" multiline rows={3} label="Observação" />} />
          </Grid>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function EstadosPerfilForm({ perfilIdE = 0, estadoId = 0, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { estados, isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);
  const estadosList = useMemo(() => estados?.map(({ id, nome }) => ({ id, label: nome })), [estados]);
  const estadoAtualId = useMemo(() => Number(selectedItem?.estado_id || estadoId), [estadoId, selectedItem?.estado_id]);

  const formSchema = Yup.object().shape({ estado: Yup.mixed().required().label('Estado') });
  const defaultValues = useMemo(
    () => ({
      perfil_id_cc: perfilId,
      padrao: selectedItem?.padrao || false,
      perfil_id: perfilIdE || selectedItem?.perfil_id,
      estado: estadosList.find(({ id }) => id === estadoAtualId) || null,
      data_limite: selectedItem?.data_limite ? new Date(selectedItem?.data_limite) : null,
      gestor: (selectedItem?.gestor && 'Gestor') || (selectedItem?.observador && 'Observador') || null,
      data_inicial: selectedItem ? new Date(selectedItem?.data_inicial || selectedItem?.data_inicio) : null,
    }),
    [selectedItem, perfilId, estadosList, perfilIdE, estadoAtualId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    try {
      const formData = JSON.stringify({
        ...values,
        estado_id: values?.estado?.id,
        gestor: values?.gestor === 'Gestor',
        observador: values?.gestor === 'Observador',
      });
      const params = { id: selectedItem?.id, msg: `Estado ${isEdit ? 'atualizado' : 'adicionado'}` };
      const params1 = { item: estadoId ? 'perfis' : '', item1: estadoId ? 'estado' : '', onClose };
      dispatch((isEdit ? updateItem : createItem)('estadosPerfil', formData, { ...params, ...params1 }));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ mb: 2 }}>
        {selectedItem ? `Editar ${perfilIdE ? 'estado' : 'perfil'}` : `Adicionar ${perfilIdE ? 'estado' : 'perfil'}`}
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <RHFAutocompleteObj name="estado" label="Estado" disabled={isEdit} options={estadosList} />
              <Stack direction="row" spacing={3}>
                <RHFAutocompleteSmp label="Função" name="gestor" options={['Gestor', 'Observador']} />
                <RHFSwitch mt name="padrao" label="Padrão" />
              </Stack>
              <Stack direction="row" spacing={3}>
                <RHFDatePicker dateTime name="data_inicial" label="Início" />
                <RHFDatePicker dateTime name="data_limite" label="Término" />
              </Stack>
              {isEdit && (
                <Alert severity="info">
                  <Typography variant="body2">Os estados atríbuidos não podem ser eliminados.</Typography>
                  <Typography variant="body2">Para desativar o estado, preencha a data de término.</Typography>
                </Alert>
              )}
            </Stack>
            <DialogButons isSaving={isSaving} onClose={onClose} edit={isEdit} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function PerfisEstadoForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving, estado } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);

  const colaboradoresList = useMemo(
    () => colaboradores?.filter(({ ativo }) => ativo)?.map(({ perfil_id: pid, nome }) => ({ id: pid, label: nome })),
    [colaboradores]
  );

  const defaultValues = useMemo(() => ({ perfis: [ps] }), []);
  const formSchema = Yup.object().shape({
    perfis: Yup.array(Yup.object({ perfil_id: Yup.mixed().required().label('Colaborador') })),
  });

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });
  const { fields, append, remove } = useFieldArray({ control, name: 'perfis' });

  const onSubmit = async () => {
    try {
      const params = { id: estado?.id, msg: 'Colaboradores adicionados', onClose };
      const formData = { estado_id: estado?.id, perfil_id_cc: perfilId, perfis: [] };

      values?.perfis?.forEach((row) =>
        formData?.perfis?.push({
          ...row,
          perfil_id: row?.perfil_id?.id,
          gestor: row?.gestor === 'Gestor',
          observador: row?.gestor === 'Observador',
        })
      );
      dispatch(createItem('perfis', JSON.stringify(formData), params));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitleAlt
        title="Adicionar colaborador(es)"
        action={<AddItem dados={{ small: true, label: 'Colaborador' }} onClick={() => append(ps)} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />} spacing={2} sx={{ mt: 3 }}>
            {fields.map((item, index) => (
              <Stack direction="row" key={item.id} spacing={2} alignItems="center">
                <Stack sx={{ width: 1 }} spacing={1}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={3}>
                      <RHFAutocompleteObj
                        label="Colaborador"
                        options={colaboradoresList}
                        name={`perfis[${index}].perfil_id`}
                        getOptionDisabled={(option) => values.perfis.some(({ perfil }) => perfil?.id === option.id)}
                      />
                      <Stack>
                        <RHFSwitch mt name={`perfis[${index}].padrao`} label="Padrão" />
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <RHFDatePicker dateTime name={`perfis[${index}].data_inicial`} label="Início" />
                      <RHFDatePicker dateTime name={`perfis[${index}].data_limite`} label="Término" />
                      <RHFAutocompleteSmp
                        label="Função"
                        name={`perfis[${index}].gestor`}
                        options={['Gestor', 'Observador']}
                      />
                    </Stack>
                  </Stack>
                </Stack>
                {values.perfis.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
              </Stack>
            ))}
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RegrasForm({ item, onClose, estado = false, selectedItem }) {
  const dispatch = useDispatch();
  const isEdit = !!selectedItem;
  const { enqueueSnackbar } = useSnackbar();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.parametrizacao);

  const perfisList = useMemo(() => {
    const perfis = (item?.perfis ?? [])?.filter(({ observador }) => !observador);
    return listaPerfis(perfis, colaboradores);
  }, [colaboradores, item?.perfis]);

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil: Yup.mixed().required().label('Colaborador'),
        percentagem: Yup.number().positive().required().label('Percentagem'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      pesos: isEdit
        ? [{ ...selectedItem, perfil: perfisList?.find(({ id }) => id === selectedItem?.perfil_id) }]
        : [{ perfil: null, percentagem: null, decisor: false, para_aprovacao: false }],
    }),
    [isEdit, perfisList, selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, control, handleSubmit } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'pesos' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const paramsComum = {
    getItem: estado ? 'estado' : 'selectedItem',
    ...{ onClose, estadoId: item?.id, id: selectedItem?.id },
  };
  const action = estado ? 'regrasEstado' : 'regrasTransicao';

  const onSubmit = async (values) => {
    try {
      const formData = values?.pesos?.map((row) => ({ ...row, perfil_id: row?.perfil?.id }));
      const params = { ...paramsComum, msg: `Regra transição ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)(action, JSON.stringify(isEdit ? formData[0] : formData), params));
    } catch {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          {isEdit ? 'Editar regra' : 'Adicionar regras'}
          {!isEdit && perfisList?.length > 0 && (
            <AddItem
              dados={{ small: true, label: 'Colaborador' }}
              onClick={() => append({ perfil: null, percentagem: null, decisor: false, para_aprovacao: false })}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />} spacing={2} sx={{ pt: 3 }}>
            {fields.map((_, index) => (
              <Stack direction="row" spacing={2} key={_.id} alignItems="center">
                <Stack spacing={2} sx={{ width: 1 }}>
                  <RHFAutocompleteObj
                    label="Colaborador"
                    options={perfisList}
                    name={`pesos[${index}].perfil`}
                    // getOptionDisabled={(option) => values.pesos.some(({ perfil }) => perfil?.id === option.id)}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <RHFNumberField tipo="%" label="Percentagem" name={`pesos[${index}].percentagem`} />
                    <Stack direction="row" spacing={2}>
                      <RHFSwitch name={`pesos[${index}].para_aprovacao`} label="Aprovação" />
                      <RHFSwitch name={`pesos[${index}].decisor`} label="Decisor" />
                    </Stack>
                  </Stack>
                </Stack>
                {fields?.length > 1 && <DefaultAction label="ELIMINAR" small onClick={() => remove(index)} />}
              </Stack>
            ))}
          </Stack>
          <DialogButons
            edit={isEdit}
            onClose={onClose}
            isSaving={isSaving}
            desc={isEdit ? 'eliminar esta regra' : ''}
            handleDelete={() => dispatch(deleteItem(action, { ...paramsComum, msg: 'Regra transição eliminada' }))}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
