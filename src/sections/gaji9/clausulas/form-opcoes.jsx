import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { listaProdutos, listaTitrulares } from '../applySortFilter';
// redux
import { createItem } from '../../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../../redux/store';
// components
import GridItem from '../../../components/GridItem';
import { DialogTitleAlt } from '../../../components/CustomDialog';
import { AddItem, DefaultAction, DialogButons } from '../../../components/Actions';
import { RHFSwitch, FormProvider, RHFNumberField, RHFAutocompleteObj } from '../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

TiposTitularesForm.propTypes = { id: PropTypes.number, ids: PropTypes.array, onClose: PropTypes.func };

export function TiposTitularesForm({ id, ids, onClose }) {
  const dispatch = useDispatch();
  const { isSaving, tiposTitulares } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    items: Yup.array(Yup.object({ item: Yup.mixed().required().label('Tipo de titular') })),
  });
  const defaultValues = useMemo(() => ({ items: [{ item: null }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async () => {
    const params = { patch: true, getItem: 'selectedItem', id, msg: 'Tipos de titulares adicionados', onClose };
    dispatch(createItem('tiposTitularesCl', JSON.stringify(values?.items?.map(({ item }) => item?.id)), params));
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar tipos de titulares"
        action={<AddItem dados={{ small: true }} onClick={() => append({ item: null })} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObj
                  label="Tipo de titular"
                  name={`items[${index}].item`}
                  options={listaTitrulares(tiposTitulares)?.filter(({ id }) => !ids?.includes(id))}
                  getOptionDisabled={(option) => values.items.some(({ item }) => item?.id === option.id)}
                />
                {values.items.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
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

SegmentosForm.propTypes = { id: PropTypes.number, ids: PropTypes.array, onClose: PropTypes.func };

export function SegmentosForm({ id, ids, onClose }) {
  const dispatch = useDispatch();
  const { isSaving, segmentos } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    items: Yup.array(Yup.object({ item: Yup.mixed().required().label('Segmento') })),
  });
  const defaultValues = useMemo(() => ({ items: [{ item: null }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async () => {
    const params = { patch: true, getItem: 'selectedItem', id, msg: 'Segmentos adicionados', onClose };
    dispatch(createItem('segmentosCl', JSON.stringify(values?.items?.map(({ item }) => item?.id)), params));
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar segmentos"
        action={<AddItem dados={{ small: true }} onClick={() => append({ item: null })} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObj
                  label="Segmento"
                  name={`items[${index}].item`}
                  options={segmentos
                    ?.filter(({ id }) => !ids?.includes(id))
                    ?.map(({ id, designacao }) => ({ id, label: designacao }))}
                  getOptionDisabled={(option) => values.items.some(({ item }) => item?.id === option.id)}
                />
                {values.items.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
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

ComponetesForm.propTypes = { id: PropTypes.number, ids: PropTypes.array, onClose: PropTypes.func };

export function ComponetesForm({ id, ids, onClose }) {
  const dispatch = useDispatch();
  const { isSaving, componentes } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    items: Yup.array(Yup.object({ item: Yup.mixed().required().label('Componente') })),
  });
  const defaultValues = useMemo(() => ({ items: [{ item: null }] }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async () => {
    const params = { patch: true, getItem: 'selectedItem', id, msg: 'Componentes adicionados', onClose };
    dispatch(createItem('componentesSeg', JSON.stringify(values?.items?.map(({ item }) => item?.id)), params));
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onClose}>
      <DialogTitleAlt
        sx={{ mb: 2 }}
        title="Adicionar componentes"
        action={<AddItem dados={{ small: true }} onClick={() => append({ item: null })} />}
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {fields.map((item, index) => (
              <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                <RHFAutocompleteObj
                  label="Componente"
                  name={`items[${index}].item`}
                  options={listaProdutos(componentes)?.filter(({ id }) => !ids?.includes(id))}
                  getOptionDisabled={(option) => values.items.some(({ item }) => item?.id === option.id)}
                />
                {values.items.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
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

RegraForm.propTypes = { dados: PropTypes.object, onClose: PropTypes.func };

export function RegraForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving, clausulas } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ clausula_id: Yup.mixed().required().label('Cláusula') });
  const defaultValues = useMemo(
    () => ({
      clausula_id: null,
      prazo_maior_que: null,
      prazo_menor_que: null,
      montante_maior_que: null,
      montante_menor_que: null,
      representante: false,
      isencao_comissao: false,
      segunda_habitacao: false,
      taxa_juros_negociado: false,
    }),
    []
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    const params = { msg: 'Regra adicionada', onClose, clausulaId: dados?.id };
    dispatch(
      createItem('regrasClausula', JSON.stringify([{ ...values, clausula_id: values?.clausula_id?.id }]), params)
    );
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Adicionar regras" />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <GridItem
              children={
                <RHFAutocompleteObj
                  label="Cláusula"
                  name="clausula_id"
                  options={clausulas
                    ?.filter(({ titulo }) => titulo === dados?.titulo)
                    ?.map(({ id, titulo }) => ({ id, label: `${titulo} (ID: ${id})` }))}
                />
              }
            />
            <GridItem xs={6} children={<RHFNumberField label="Montante maior que" name="montante_maior_que" />} />
            <GridItem xs={6} children={<RHFNumberField label="Montante menor que" name="montante_menor_que" />} />
            <GridItem xs={6} children={<RHFNumberField label="Prazo maior que" name="prazo_maior_que" />} />
            <GridItem xs={6} children={<RHFNumberField label="Prazo menor que" name="prazo_menor_que" />} />
            <GridItem xs={6} children={<RHFSwitch name="isencao_comissao" label="Isenção de comissão" />} />
            <GridItem xs={6} children={<RHFSwitch name="segunda_habitacao" label="Segunda habitação" />} />
            <GridItem xs={6} children={<RHFSwitch name="taxa_juros_negociado" label="Taxa juros negociada" />} />
            <GridItem xs={6} children={<RHFSwitch name="representante" label="Representante" />} />
          </Grid>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
