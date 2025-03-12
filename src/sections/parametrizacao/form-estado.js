import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
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
  RHFAutocompleteObj,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { shapeNumber } from '../../components/hook-form/yup-shape';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
//
import PesosDecisao from './PesosDecisao';
import { listaPerfis } from './applySortFilter';
import { ItemComponent } from './ParametrizacaoForm';

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
    nivel_decisao: shapeNumber('Nível de decisão', true, '', 'is_decisao'),
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
      nivel_decisao: selectedItem?.nivel_decisao || null,
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
      const params = { id: selectedItem?.id, msg: `Estado ${isEdit ? 'atualizado' : 'adicionado'}` };
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
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 0 }}>
            <GridItem children={<RHFTextField name="nome" label="Nome" />} />
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
                dispatch(deleteItem('estadosPerfil', { id: selectedItem?.id, msg: 'Estado eliminado' }))
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
  const { isSaving } = useSelector((state) => state.parametrizacao);
  const { perfilId, colaboradores } = useSelector((state) => state.intranet);

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
      dispatch(
        createItem('perfisEstado', JSON.stringify(formData), {
          item1: 'estado',
          msg: 'Perfis adicionados',
          afterSuccess: () => onCancel(),
        })
      );
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitleAlt
        title="Adicionar colaborador"
        action={
          <AddItem
            dados={{ small: true, label: 'Colaborador' }}
            handleClick={() => append({ perfil: null, data_limite: null, data_inicial: null, observador: false })}
          />
        }
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column" divider={<Divider sx={{ borderStyle: 'dashed' }} />} spacing={2} sx={{ mt: 3 }}>
            {fields.map((item, index) => (
              <Stack direction="row" key={item.id} spacing={2} alignItems="center">
                <Stack sx={{ width: 1 }} spacing={1}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
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

RegraEstadoForm.propTypes = {
  item: PropTypes.object,
  estado: PropTypes.bool,
  onCancel: PropTypes.func,
  selectedItem: PropTypes.object,
};

export function RegraEstadoForm({ item, onCancel, estado = false, selectedItem }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.parametrizacao);
  const perfisList = useMemo(() => listaPerfis(item?.perfis, colaboradores), [colaboradores, item?.perfis]);
  const isEdit = !!selectedItem;

  const formSchema = Yup.object().shape({
    pesos: Yup.array(
      Yup.object({
        perfil_id: Yup.mixed().required().label('Colaborador'),
        percentagem: Yup.number().positive().required().label('Percentagem'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      pesos: isEdit
        ? [{ ...selectedItem, perfil_id: perfisList?.find(({ id }) => id === selectedItem?.perfil_id) }]
        : [{ perfil_id: null, percentagem: null, facultativo: false, para_aprovacao: false }],
    }),
    [isEdit, perfisList, selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const paramsComum = {
    estadoId: item?.id,
    id: selectedItem?.id,
    afterSuccess: () => onCancel(),
    getItem: estado ? 'estado' : 'selectedItem',
  };
  const action = estado ? 'regrasEstado' : 'regrasTransicao';

  const onSubmit = async () => {
    try {
      const params = { ...paramsComum, msg: `Regra transição ${isEdit ? 'atualizada' : 'adicionada'}` };
      const formData = values?.pesos?.map((row) => ({ ...row, perfil_id: row?.perfil_id?.id }));
      dispatch((isEdit ? updateItem : createItem)(action, JSON.stringify(isEdit ? formData[0] : formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem(action, { ...paramsComum, msg: 'Regra transição eliminada' }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar regra' : 'Adicionar regras'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <PesosDecisao perfisList={perfisList} isEdit={isEdit} />
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onCancel={onCancel}
            handleDelete={handleDelete}
            desc={isEdit ? 'eliminar esta regra' : ''}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
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
