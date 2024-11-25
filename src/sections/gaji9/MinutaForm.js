import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem } from '../../redux/slices/gaji9';
// components
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFNumberField,
  RHFAutocompleteObject,
} from '../../components/hook-form';
//
import { ItemComponent } from './Gaji9Form';

// ---------------------------------------------------------------------------------------------------------------------

MinutaForm.propTypes = { onCancel: PropTypes.func };

export default function MinutaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem, tiposTitulares, componentes, tiposGarantias } = useSelector(
    (state) => state.gaji9
  );

  const formSchema = Yup.object().shape({
    nota: Yup.string().required().label('Nota'),
    titulo: Yup.string().required().label('Título'),
    subtitulo: Yup.string().required().label('Subtítulo'),
    titular: Yup.mixed().required().label('Tipo de titular'),
    componente: Yup.mixed().required().label('Produto/Componente'),
    garantias: Yup.array(Yup.object({ garantia: Yup.mixed().required().label('Tipo de garantia') })),
  });

  const defaultValues = useMemo(
    () => ({
      nota: selectedItem?.nota || '',
      titulo: selectedItem?.titulo || '',
      subtitulo: selectedItem?.subtitulo || '',
      garantias: isEdit ? [] : [{ garantia: null }],
      ativo: selectedItem ? selectedItem?.ativo : true,
      componente: componentes?.find((row) => row?.id === selectedItem?.componente_id) || null,
      titular: tiposTitulares?.find((row) => row?.id === selectedItem?.tipo_titular_id) || null,
    }),
    [isEdit, componentes, selectedItem, tiposTitulares]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    const formData = {
      nota: values?.nota,
      titulo: values?.titular,
      subtitulo: values?.subtitulo,
      tipo_titular_id: values?.titular?.id,
      componente_id: values?.componente?.id,
      ...(isEdit ? { ativo: values?.ativo } : { tipos_garantias: values?.garantias?.map((row) => row?.id) }),
    };
    if (isEdit) {
      dispatch(updateItem('minutas', JSON.stringify(formData), { id: selectedItem?.id, msg: 'Item atualizado' }));
    } else {
      dispatch(createItem('minutas', JSON.stringify(formData), { msg: 'Item adicionado' }));
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Rotular produto' : 'Importar produto'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="titulo" label="Título" />
              <RHFTextField name="subtitulo" label="Subtítulo" />
              <RHFTextField name="nota" label="Nota" />
              <RHFAutocompleteObject name="titular" label="Tipo de titular" />
              <RHFAutocompleteObject name="componente" label="Produto/Componente" />
              {isEdit ? (
                <RHFSwitch name="ativo" label="Ativo" />
              ) : (
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="end" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle2">Tipos de garantias</Typography>
                    <AddItem small handleClick={() => append({ garantia: null })} />
                  </Stack>
                  <Divider sx={{ mt: 0.5 }} />
                  {fields.map((item, index) => (
                    <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                      <RHFAutocompleteObject
                        label="Tipo de garantia"
                        options={tiposGarantias}
                        name={`garantias[${index}].garantia`}
                      />
                      {values.garantias.length > 1 && (
                        <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

ComporMinutaForm.propTypes = { onCancel: PropTypes.func };

export function ComporMinutaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, minuta, clausulas } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    clausulas: Yup.array(
      Yup.object({
        clausula: Yup.mixed().required().label('Cláusula'),
        numero: Yup.number().positive().integer().required().label('Número ordem'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      clausulas: isEdit
        ? minuta?.clausulas?.map((row) => ({
            ativo: row?.ativo,
            numero: row?.numero_ordem,
            clausula: { id: row?.clausula_id, label: row?.titulo },
          }))
        : [{ clausula: null, numero: 1, ativo: true }],
    }),
    [isEdit, minuta]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async () => {
    const formData = isEdit
      ? values?.clausulas?.map((row) => ({
          ativo: row?.ativo,
          numero_ordem: row?.numero,
          clausula_id: row?.clausula?.id,
        }))
      : { clausulas: values?.clausulas?.map((row) => ({ numero_ordem: row?.numero, clausula_id: row?.clausula?.id })) };
    if (isEdit) {
      dispatch(updateItem('minutas', JSON.stringify(formData), { id: minuta?.id, msg: 'Composição atualizada' }));
    } else {
      dispatch(createItem('minutas', JSON.stringify(formData), { msg: 'Composição adicionada' }));
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          {isEdit ? 'Atualizar composição' : 'Compor minuta'}
          <AddItem small handleClick={() => append({ clausula: null, numero: fields?.length + 1, ativo: true })} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {fields.map((item, index) => (
              <Stack key={item.id} spacing={1} direction="row" alignItems="center">
                <Stack spacing={2} direction="row" alignItems="center" justifyContent="center" sx={{ flexGrow: 1 }}>
                  <RHFNumberField name={`clausulas[${index}].numero`} label="Nº" sx={{ width: 50 }} />
                  <RHFAutocompleteObject label="Cláusula" options={clausulas} name={`clausulas[${index}].clausula`} />
                  {isEdit && <RHFSwitch name={`clausulas[${index}].ativo`} label="Ativo" />}
                </Stack>
                {values.clausulas.length > 1 && (
                  <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                )}
              </Stack>
            ))}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

GarantiasForm.propTypes = { onCancel: PropTypes.func };

export function GarantiasForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isSaving, minuta, tiposGarantias } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    garantias: Yup.array(Yup.object({ garantia: Yup.mixed().required().label('Tipo de garantia') })),
  });
  const defaultValues = useMemo(() => ({ garantias: [{ garantia: null }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async () => {
    dispatch(
      updateItem('minutas', JSON.stringify(values?.garantias?.map((row) => row?.id)), {
        id: minuta?.id,
        msg: 'Tipos de garantias adicionadas',
      })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          Adicionar tipos de garantias
          <AddItem small handleClick={() => append({ garantia: null })} />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObject
                  label="Tipo de garantia"
                  options={tiposGarantias}
                  name={`garantias[${index}].garantia`}
                />
                {values.garantias.length > 1 && (
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

// ---------------------------------------------------------------------------------------------------------------------

PublicarRevogar.propTypes = { onCancel: PropTypes.func, acao: PropTypes.string };

export function PublicarRevogar({ onCancel, acao }) {
  const dispatch = useDispatch();
  const { isSaving, minuta } = useSelector((state) => state.gaji9);
  const formSchema = Yup.object().shape({ nota: Yup.string().required().label('Nota') });
  const defaultValues = useMemo(() => ({ nota: minuta?.nota || '' }), [minuta]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(
      updateItem(acao, JSON.stringify(values), {
        id: minuta?.id,
        msg: `Minuta ${acao === 'publicar' ? 'publicada' : 'revogada'}`,
      })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{acao === 'publicar' ? 'Publicar minuta' : 'Revogar minuta'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <RHFTextField name="nota" label="Nota" />
          <DialogButons edit isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
