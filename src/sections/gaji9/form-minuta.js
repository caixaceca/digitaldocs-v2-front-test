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
import { getFromGaji9, getDocumento, createItem, updateItem } from '../../redux/slices/gaji9';
// components
import { DialogTitleAlt } from '../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
import { RHFSwitch, FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteObj } from '../../components/hook-form';
//
import { listaTitrulares, listaProdutos, listaGarantias, listaClausulas } from './applySortFilter';

const vsv = { shouldValidate: true, shouldDirty: true, shouldTouch: true };

// ---------------------------------------------------------------------------------------------------------------------

MinutaForm.propTypes = { onCancel: PropTypes.func, action: PropTypes.string, minuta: PropTypes.object };

export default function MinutaForm({ onCancel, action, minuta = null }) {
  const dispatch = useDispatch();
  const { isSaving, tiposTitulares, componentes, tiposGarantias } = useSelector((state) => state.gaji9);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);

  const formSchema = Yup.object().shape({
    titulo: Yup.string().required().label('Título'),
    subtitulo: Yup.string().required().label('Subtítulo'),
    componente: Yup.mixed().required().label('Componente'),
    titular: Yup.mixed().required().label('Tipo de titular'),
    garantias: Yup.array(Yup.object({ garantia: Yup.mixed().required().label('Tipo de garantia') })),
  });

  const defaultValues = useMemo(
    () => ({
      nota: minuta?.nota || '',
      titulo: minuta?.titulo || '',
      subtitulo: minuta?.subtitulo || '',
      ativo: action === 'Adicionar' ? true : minuta?.ativo,
      titular: titularesList?.find((row) => Number(row?.id) === Number(minuta?.tipo_titular_id)) || null,
      componente: componentesList?.find((row) => Number(row?.id) === Number(minuta?.componente_id)) || null,
      garantias:
        action === 'Adicionar'
          ? [{ garantia: null }]
          : garantiasList
              ?.filter((tipo) =>
                minuta?.tipos_garantias
                  ?.filter((row) => row?.ativo)
                  ?.map((item) => item?.id)
                  ?.includes(tipo?.id)
              )
              ?.map((dados) => ({ garantia: dados })),
    }),
    [action, componentesList, garantiasList, minuta, titularesList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'garantias' });

  const onSubmit = async () => {
    const formData = {
      nota: values?.nota,
      titulo: values?.titulo,
      subtitulo: values?.subtitulo,
      tipo_titular_id: values?.titular?.id,
      componente_id: values?.componente?.id,
      ...(action === 'Atualizar'
        ? { ativo: values?.ativo }
        : { tipos_garantias: values?.garantias?.map((row) => row?.garantia?.id) }),
    };
    if (action === 'Adicionar') {
      dispatch(createItem('minutas', JSON.stringify(formData), { msg: 'Minuta adicionada' }));
    } else if (action === 'Clonar') {
      dispatch(createItem('clonarMinuta', JSON.stringify(formData), { id: minuta?.id, msg: 'Minuta clonada' }));
    } else {
      dispatch(
        updateItem(action === 'Atualizar' ? 'minutas' : action, JSON.stringify(formData), {
          id: minuta?.id,
          getItem: action === 'Atualizar' ? 'minuta' : '',
          msg: (action === 'Versionar' && 'Minuta versionada') || 'Minuta atualizada',
        })
      );
    }
  };

  return (
    <Dialog open fullWidth maxWidth="sm">
      <DialogTitleAlt title={`${action} minuta`} onClose={() => onCancel()} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="titulo" label="Título" />
            <RHFTextField name="subtitulo" label="Subtítulo" />
            <RHFAutocompleteObj name="titular" label="Tipo de titular" options={titularesList} />
            <RHFAutocompleteObj name="componente" label="Componente" options={componentesList} />
            {action !== 'Atualizar' && (
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="end" justifyContent="space-between" spacing={2}>
                  <Typography variant="subtitle2">Tipos de garantia</Typography>
                  <AddItem dados={{ small: true }} handleClick={() => append({ garantia: null })} />
                </Stack>
                <Divider sx={{ mt: 0.5 }} />
                {fields.map((item, index) => (
                  <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                    <RHFAutocompleteObj
                      label="Tipo de garantia"
                      options={garantiasList}
                      name={`garantias[${index}].garantia`}
                      getOptionDisabled={(option) => fields.some(({ garantia }) => garantia?.id === option.id)}
                    />
                    {values.garantias.length > 1 && (
                      <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
            <RHFTextField name="nota" label="Observação" multiline minRows={2} maxRows={5} />
            {action === 'editar' && <RHFSwitch name="ativo" label="Ativo" />}
          </Stack>
          <DialogButons edit={action !== 'Adicionar'} isSaving={isSaving} onCancel={onCancel} />
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
  const garantiasExistentes = useMemo(
    () => (minuta?.tipos_garantias || [])?.filter(({ ativo }) => ativo),
    [minuta?.tipos_garantias]
  );

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
      updateItem(
        'garantiasMinuta',
        JSON.stringify({ tipos_garantias: values?.garantias?.map((row) => row?.garantia?.id) }),
        { patch: true, getItem: 'minuta', id: minuta?.id, msg: 'Tipos de garantia adicionadas' }
      )
    );
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={() => onCancel()}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar tipos de garantias"
        action={<AddItem dados={{ small: true }} handleClick={() => append({ garantia: null })} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObj
                  label="Tipo de garantia"
                  name={`garantias[${index}].garantia`}
                  options={listaGarantias(tiposGarantias)}
                  getOptionDisabled={(option) =>
                    garantiasExistentes.some(({ id }) => id === option.id) ||
                    fields.some(({ garantia }) => garantia?.id === option.id)
                  }
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

ComponentesForm.propTypes = { onCancel: PropTypes.func };

export function ComponentesForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isSaving, minuta, componentes } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    componentes: Yup.array(Yup.object({ componente: Yup.mixed().required().label('Componente') })),
  });
  const defaultValues = useMemo(() => ({ componentes: [{ componente: null }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'componentes' });

  const onSubmit = async () => {
    const ids = values?.componentes?.map((row) => ({ componente_id: row?.componente?.id }));
    const params = { patch: true, getItem: 'minuta', id: minuta?.id, msg: 'Componentes adicionados' };
    dispatch(createItem('componentesMinuta', JSON.stringify(ids), params));
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={() => onCancel()}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar componentes"
        action={<AddItem dados={{ small: true }} handleClick={() => append({ garantia: null })} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObj
                  label="Componente"
                  options={listaProdutos(componentes)}
                  name={`componentes[${index}].componente`}
                  getOptionDisabled={(option) => fields.some(({ componente }) => componente?.id === option.id)}
                />
                {values.componentes.length > 1 && (
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

ComposicaoForm.propTypes = { onCancel: PropTypes.func, action: PropTypes.string };

export function ComposicaoForm({ onCancel, action }) {
  const dispatch = useDispatch();
  const { isSaving, clausulas, minuta } = useSelector((state) => state.gaji9);
  const clausulasList = useMemo(() => listaClausulas(clausulas), [clausulas]);

  const formSchema = Yup.object().shape({
    clausulas: Yup.array(
      Yup.object({
        clausula: Yup.mixed().required().label('Claúsula'),
        numero: Yup.number().min(0).integer().required().label('Nº de cláusula'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      clausulas:
        action === 'compor'
          ? [{ clausula: null, numero: '' }]
          : minuta?.clausulas
              ?.filter((item) => item?.ativo && item?.numero_ordem > 0)
              ?.map((row) => ({
                numero: row?.numero_ordem,
                clausula: { id: row?.clausula_id, label: row?.titulo || 'Cláusula solta' },
              })),
    }),
    [action, minuta]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, setValue, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'clausulas' });

  const onSubmit = async () => {
    const formData =
      action === 'compor'
        ? {
            clausulas: values?.clausulas?.map((row) => ({ numero_ordem: row?.numero, clausula_id: row?.clausula?.id })),
          }
        : values?.clausulas?.map((row) => ({
            ativo: true,
            numero_ordem: row?.numero,
            clausula_id: row?.clausula?.id,
          }));
    const params = {
      id: minuta?.id,
      getItem: 'minuta',
      msg: action === 'compor' ? 'Cláusulas adicionadas' : 'Composição atualizada',
    };
    dispatch((action === 'compor' ? createItem : updateItem)('coposicaoMinuta', JSON.stringify(formData), params));
  };

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitleAlt
        onClose={() => onCancel()}
        title={action === 'compor' ? 'Adicionar cláusulas' : 'Atualizar composição'}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            {action === 'compor' && <PesquisarClausulas />}
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack sx={{ flexGrow: 1 }}>
                    <RHFAutocompleteObj
                      label="Cláusula"
                      disableClearable
                      options={clausulasList}
                      readOnly={action !== 'compor'}
                      name={`clausulas[${index}].clausula`}
                      // groupBy={(option) => option.itemOrder}
                      getOptionDisabled={(option) =>
                        minuta?.clausulas.some(({ clausula_id: cid }) => cid === option.id) ||
                        fields.some(({ clausula }) => clausula?.id === option.id)
                      }
                      onChange={(event, newValue) => {
                        setValue(`clausulas[${index}].clausula`, newValue, vsv);
                        setValue(`clausulas[${index}].numero`, newValue?.numero_ordem, vsv);
                      }}
                    />
                  </Stack>
                  <RHFNumberField label="Nº de cláusula" name={`clausulas[${index}].numero`} sx={{ width: 130 }} />
                </Stack>
                {action === 'compor' && values.clausulas.length > 1 && (
                  <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                )}
              </Stack>
            ))}
            {action === 'compor' && clausulasList?.length > 0 && (
              <Stack alignItems="center">
                <AddItem
                  dados={{ small: true, label: 'Cláusula' }}
                  handleClick={() => append({ clausula: null, numero: '' })}
                />
              </Stack>
            )}
          </Stack>
          <DialogButons edit={action !== 'compor'} isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function PesquisarClausulas() {
  const dispatch = useDispatch();
  const { tiposTitulares, componentes, tiposGarantias } = useSelector((state) => state.gaji9);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const titularesList = useMemo(() => listaTitrulares(tiposTitulares), [tiposTitulares]);
  const seccoesList = [
    { id: 'solta', label: 'Solta' },
    { id: 'identificacao', label: 'Secção de identificação' },
    { id: 'caixa', label: 'Secção de identificação Caixa' },
  ];

  const defaultValues = useMemo(() => ({ seccao: null, garantia: null, titular: null, componente: null }), []);
  const methods = useForm({ defaultValues });
  const { watch } = methods;
  const values = watch();

  useEffect(() => {
    dispatch(
      getFromGaji9('clausulas', {
        titularId: values?.titular?.id || '',
        garantiaId: values?.garantia?.id || '',
        solta: values?.seccao?.label === 'Solta',
        componenteId: values?.componente?.id || '',
        caixa: values?.seccao?.label === 'Secção de identificação',
        identificacao: values?.seccao?.label === 'Secção de identificação Caixa',
      })
    );
  }, [dispatch, values?.titular?.id, values?.garantia?.id, values?.componente?.id, values?.seccao?.label]);

  return (
    <FormProvider methods={methods}>
      <Stack spacing={1} sx={{ p: 1, mb: 1, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', pl: 0.5 }}>
          Pesquisar cláusulas
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
          <RHFAutocompleteObj small label="Secção" options={seccoesList} name="seccao" />
          <RHFAutocompleteObj small label="Tipo titular" options={titularesList} name="titular" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={1}>
          <RHFAutocompleteObj small label="Componente" options={componentesList} name="componente" />
          <RHFAutocompleteObj small label="Tipo garantia" options={garantiasList} name="garantia" />
        </Stack>
      </Stack>
    </FormProvider>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PublicarRevogarForm.propTypes = { onCancel: PropTypes.func, action: PropTypes.string };

export function PublicarRevogarForm({ onCancel, action }) {
  const dispatch = useDispatch();
  const { isSaving, minuta } = useSelector((state) => state.gaji9);
  const formSchema = Yup.object().shape({ nota: Yup.string().required().label('Observação') });
  const defaultValues = useMemo(() => ({ nota: minuta?.nota || '' }), [minuta]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    const msg = `Minuta ${action === 'Publicar' ? 'publicada' : 'revogada'}`;
    dispatch(updateItem(action, JSON.stringify(values), { patch: true, id: minuta?.id, getItem: 'minuta', msg }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ mb: 2 }}>{action} minuta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }}>
            <RHFTextField name="nota" label="Observação" multiline minRows={3} maxRows={10} />
          </Stack>
          <DialogButons
            label={action}
            isSaving={isSaving}
            onCancel={onCancel}
            color={action === 'Revogar' ? 'error' : 'primary'}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PreviewForm.propTypes = { id: PropTypes.number, onCancel: PropTypes.func };

export function PreviewForm({ id, onCancel }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);
  const defaultValues = useMemo(() => ({ taxa: '', prazo: '', montante: '', isento: false, representante: false }), []);
  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(getDocumento('minuta', { id, ...values }));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ mb: 2 }}>Pré-visualizar minuta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }} spacing={3}>
            <RHFNumberField name="montante" label="Montante" />
            <RHFNumberField name="prazo" label="Prazo" />
            <RHFNumberField name="taxa" label="Taxa de juros negociado" />
            <Stack direction="row" spacing={1}>
              <RHFSwitch name="isento" label="Isento comissão" />
              <RHFSwitch name="representante" label="Com representante" />
            </Stack>
          </Stack>
          <DialogButons label="Pré-visualizar" isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
