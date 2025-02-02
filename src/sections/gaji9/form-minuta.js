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
import { getFromGaji9, createItem, updateItem } from '../../redux/slices/gaji9';
// components
import { DialogTitleAlt } from '../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
import { RHFSwitch, FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteObj } from '../../components/hook-form';
//
import { listaTitrulares, listaProdutos, listaGarantias, listaClausulas } from './applySortFilter';

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
          msg: (action === 'Versionar' && 'Minuta versionada') || 'Minuta atualizada',
        })
      );
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{action} minuta</DialogTitle>
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
                  <Typography variant="subtitle2">Tipos de garantias</Typography>
                  <AddItem small handleClick={() => append({ garantia: null })} />
                </Stack>
                <Divider sx={{ mt: 0.5 }} />
                {fields.map((item, index) => (
                  <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                    <RHFAutocompleteObj
                      label="Tipo de garantia"
                      options={garantiasList}
                      name={`garantias[${index}].garantia`}
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
        { patch: true, item: 'minuta', id: minuta?.id, msg: 'Tipos de garantias adicionadas' }
      )
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar tipos de garantias"
        action={<AddItem small handleClick={() => append({ garantia: null })} />}
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

ComposicaoForm.propTypes = { onCancel: PropTypes.func, action: PropTypes.string };

export function ComposicaoForm({ onCancel, action }) {
  const dispatch = useDispatch();
  const { isSaving, clausulas, minuta } = useSelector((state) => state.gaji9);
  const clausulasList = useMemo(
    () =>
      action === 'compor'
        ? listaClausulas(
            clausulas,
            minuta?.clausulas?.map((row) => row?.clausula_id)
          )
        : [],
    [action, clausulas, minuta?.clausulas]
  );

  const formSchema = Yup.object().shape({
    clausulas: Yup.array(
      Yup.object({
        clausula: Yup.mixed().required().label('Claúsula'),
        numero: Yup.number().min(0).integer().required().label('Nº ordem'),
      })
    ),
  });

  const defaultValues = useMemo(
    () => ({
      clausulasGarant: false,
      clausulas:
        action === 'compor'
          ? [{ clausula: null, numero: (minuta?.clausulas?.length || 0) + 1 }]
          : minuta?.clausulas?.map((row) => ({
              ativo: row?.ativo,
              numero: row?.numero_ordem,
              clausula: { id: row?.clausula_id, label: row?.titulo || 'Cláusula solta' },
            })),
    }),
    [action, minuta]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'clausulas' });

  const onSubmit = async () => {
    if (action === 'compor') {
      const formData = {
        clausulas: values?.clausulas?.map((row) => ({ numero_ordem: row?.numero, clausula_id: row?.clausula?.id })),
      };
      dispatch(
        createItem('comporMinuta', JSON.stringify(formData), {
          item: 'minuta',
          id: minuta?.id,
          getSuccess: true,
          msg: 'Cláusulas adicionadas',
          clausulasGarant: values?.clausulasGarant,
        })
      );
    } else {
      const formData = values?.clausulas?.map((row) => ({
        ativo: row?.ativo,
        clausula_id: row?.clausula?.id,
        numero_ordem: Number(row?.numero),
      }));
      dispatch(
        updateItem('coposicaoMinuta', JSON.stringify(formData), { id: minuta?.id, msg: 'Composição atualizada' })
      );
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title={action === 'compor' ? 'Adicionar cláusulas' : 'Atualizar composição'}
        action={
          action === 'compor' &&
          clausulasList?.length > 0 && (
            <AddItem
              small
              label="Cláusula"
              handleClick={() =>
                append({ clausula: null, numero: (minuta?.clausulas?.length || 0) + fields?.length + 1 })
              }
            />
          )
        }
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <PesquisarClausulas titularId={minuta?.tipo_titular_id} componenteId={minuta?.componente_id} />
            {fields.map((item, index) => {
              const clausulaSel = clausulasList?.find((row) => row?.id === values?.clausulas?.[index]?.clausula?.id);
              return (
                <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                  <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                    <RHFNumberField label="Nº ordem" name={`clausulas[${index}].numero`} sx={{ width: 80 }} />
                    <Stack sx={{ flexGrow: 1 }}>
                      <RHFAutocompleteObj
                        label="Cláusula"
                        disableClearable
                        options={clausulasList}
                        readOnly={action !== 'compor'}
                        name={`clausulas[${index}].clausula`}
                      />
                      <ItemInfoClausula label="Conteúdo" value={clausulaSel?.conteudo} />
                      {/* <ItemInfoClausula label="Componente" value={clausulaSel?.componente} />
                      <ItemInfoClausula label="Tipo de titular" value={clausulaSel?.titular} />
                      <ItemInfoClausula label="Tipo de garantia" value={clausulaSel?.garantia} /> */}
                    </Stack>
                    {action !== 'compor' && (
                      <RHFSwitch name={`clausulas[${index}].ativo`} label="Ativo" sx={{ width: 100 }} />
                    )}
                  </Stack>
                  {action === 'compor' && values.clausulas.length > 1 && (
                    <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                  )}
                </Stack>
              );
            })}
            {action === 'compor' && <RHFSwitch name="clausulasGarant" label="Carregar cláusulas de garantias" />}
          </Stack>
          <DialogButons edit={action !== 'compor'} isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

PesquisarClausulas.propTypes = { titularId: PropTypes.number, componenteId: PropTypes.number };

export function PesquisarClausulas({ componenteId = 0, titularId = 0 }) {
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

  const defaultValues = useMemo(
    () => ({
      seccao: null,
      garantia: null,
      titular: titularesList?.find((row) => Number(row?.id) === Number(titularId)),
      componente: componentesList?.find((row) => Number(row?.id) === Number(componenteId)),
    }),
    [componenteId, componentesList, titularId, titularesList]
  );

  const methods = useForm({ defaultValues });
  const { watch } = methods;
  const values = watch();

  console.log(values);

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

ItemInfoClausula.propTypes = { label: PropTypes.string, value: PropTypes.string };

export function ItemInfoClausula({ label, value = '' }) {
  return value ? (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {label}:
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {value}
      </Typography>
    </Stack>
  ) : (
    ''
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
    dispatch(
      updateItem(action, JSON.stringify(values), {
        patch: true,
        item: 'minuta',
        id: minuta?.id,
        msg: `Minuta ${action === 'Publicar' ? 'publicada' : 'revogada'}`,
      })
    );
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
