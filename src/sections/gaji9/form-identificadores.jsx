import * as Yup from 'yup';
import { format } from 'date-fns';
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
// utils
import { listaProdutos } from './applySortFilter';
import { fillData } from '../../utils/formatTime';
import { utilizadoresGaji9, removerPropriedades, vdt } from '../../utils/formatObject';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromGaji9, createItem, updateItem, deleteItem } from '../../redux/slices/gaji9';
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
import { AddItem, DefaultAction, DialogButons } from '../../components/Actions';
//
import { ItemComponent } from './form-gaji9';
import { freguesiasConcelhos } from '../../_mock';

// ---------------------------------------------------------------------------------------------------------------------

export function ProdutoForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ codigo: !isEdit && Yup.string().required().label('Código') });
  const defaultValues = useMemo(
    () => ({
      id: selectedItem?.id ?? '',
      codigo: selectedItem?.codigo ?? '',
      rotulo: selectedItem?.rotulo ?? '',
      descritivo: selectedItem?.descritivo ?? '',
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
    const params = { values, msg: `Produto ${isEdit ? 'rotulado' : 'importado'}`, onClose };
    if (isEdit) {
      const formData = JSON.stringify([{ id: values?.id, rotulo: values?.rotulo, ativo: values?.ativo }]);
      dispatch(updateItem('componentes', formData, params));
    } else dispatch(createItem('componentes', JSON.stringify({ codigo: values?.codigo }), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Rotular componente' : 'Importar componente'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            {isEdit ? (
              <>
                <RHFTextField name="rotulo" label="Rótulo" />
                <RHFSwitch name="ativo" label="Ativo" />
              </>
            ) : (
              <RHFTextField name="codigo" label="Código" />
            )}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SegmentoForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem, componentes } = useSelector((state) => state.gaji9);
  const componentesList = useMemo(() => listaProdutos(componentes), [componentes]);

  const formSchema = Yup.object().shape({
    designacao: Yup.string().required().label('Designação'),
    componentes: Yup.array(Yup.object({ componente: Yup.mixed().required().label('Componente') })),
  });
  const defaultValues = useMemo(
    () => ({ componentes: [], designacao: selectedItem?.designacao ?? '', descritivo: selectedItem?.descritivo ?? '' }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'componentes' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    const formaData = { ...values, componentes: values?.componentes?.map(({ componente }) => componente?.id) || null };
    const params = { id: selectedItem?.id, msg: `Segmento ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('segmentos', JSON.stringify(formaData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar segmento' : 'Adicionar segmento'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descritivo" label="Descritivo" />
              {!isEdit && (
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="end" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle2">Componentes</Typography>
                    <AddItem dados={{ small: true }} onClick={() => append({ garantia: null })} />
                  </Stack>
                  <Divider sx={{ mt: 0.5 }} />
                  {fields.map((item, index) => (
                    <Stack direction="row" alignItems="center" spacing={2} key={item.id}>
                      <RHFAutocompleteObj
                        label="Componente"
                        options={componentesList}
                        name={`componentes[${index}].componente`}
                        getOptionDisabled={(option) =>
                          values.componentes.some(({ componente }) => componente?.id === option.id)
                        }
                      />
                      {values.componentes.length > 1 && (
                        <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
            <DialogButons
              edit={isEdit}
              onClose={onClose}
              isSaving={isSaving}
              desc={isEdit ? 'eliminar este segmento' : ''}
              handleDelete={() =>
                dispatch(deleteItem('segmentos', { id: selectedItem?.id, msg: 'Segmento eliminado', onClose }))
              }
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TipoTitularForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    codigo: Yup.string().required().label('Código'),
    descritivo: Yup.string().required().label('Descritivo'),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo ?? '',
      consumidor: !!selectedItem?.consumidor,
      descritivo: selectedItem?.descritivo ?? '',
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
    const params = { id: selectedItem?.id, msg: `Tipo de titular ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('tiposTitulares', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar tipo de titular' : 'Adicionar tipo de titular'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="codigo" label="Código" />
              <RHFTextField name="descritivo" label="Descritivo" />
              <Stack direction="row" spacing={3}>
                <RHFSwitch name="consumidor" label="Consumidor" />
                {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
              </Stack>
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function TipoForm({ item, label, onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({ designacao: selectedItem?.designacao ?? '', descritivo: selectedItem?.descritivo ?? '' }),
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
    const params = { id: selectedItem?.id, msg: `Item ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)(item, JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{`${isEdit ? 'Editar' : 'Adicionar'} ${label}`}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descritivo" label="Descritivo" />
            </Stack>
            <DialogButons
              edit={isEdit}
              onClose={onClose}
              isSaving={isSaving}
              desc={isEdit ? 'eliminar este item' : ''}
              handleDelete={() => dispatch(deleteItem(item, { id: selectedItem?.id, msg: 'Item eliminado', onClose }))}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function GarantiaForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    reais: Yup.mixed().required().label('Tipo'),
    codigo: Yup.string().required().label('Código'),
    designacao: Yup.string().required().label('Designação'),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo ?? '',
      designacao: selectedItem?.designacao ?? '',
      descritivo: selectedItem?.descritivo ?? '',
      ativo: isEdit ? selectedItem?.ativo : true,
      reais: (selectedItem && selectedItem?.reais && 'Real') || (selectedItem && 'Pessoal') || null,
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
    const formData = { ...values, reais: values?.reais === 'Real' };
    const params = { id: selectedItem?.id, msg: `Tipo de garantia ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('tiposGarantias', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar tipo de garantia' : 'Adicionar tipo de garantia'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <Stack direction="row" spacing={3}>
                <RHFTextField name="codigo" label="Código" />
                <RHFAutocompleteSmp name="reais" label="Tipo" options={['Real', 'Pessoal']} />
              </Stack>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descritivo" label="Descritivo" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SeguroForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({ designacao: selectedItem?.designacao ?? '', descritivo: selectedItem?.descritivo ?? '' }),
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
    const params = { id: selectedItem?.id, msg: `Tipo de seguro ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('tiposSeguros', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar tipo de seguro' : 'Adicionar tipo de seguro'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descritivo" label="Descritivo" />
            </Stack>
            <DialogButons
              edit={isEdit}
              onClose={onClose}
              isSaving={isSaving}
              desc={isEdit ? 'eliminar este tipo de seguro' : ''}
              handleDelete={() =>
                dispatch(deleteItem('tiposSeguros', { id: selectedItem?.id, msg: 'Tipo de seguro eliminado', onClose }))
              }
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SubtiposForm({ id, item, onClose }) {
  const dispatch = useDispatch();
  const isEdit = item?.action === 'editar';
  const { isSaving } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({ designacao: item?.designacao ?? '', descritivo: item?.descritivo ?? '' }),
    [item]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const onSubmit = async () => {
    const formData = isEdit ? values : [values];
    const params = {
      ...{ id: item?.id, garantiaId: id, getItem: 'selectedItem' },
      ...{ msg: `Subtipo da garantia ${isEdit ? 'atualizado' : 'adicionado'}`, onClose },
    };
    dispatch((isEdit ? updateItem : createItem)('subtipos', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Atualizar subtipo' : 'Adicionar subtipo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="designacao" label="Designação" />
            <RHFTextField name="descritivo" label="Descritivo" />
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RepresentanteForm({ onClose }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, funcoes, selectedItem } = useSelector((state) => state.gaji9);
  const colaboradoresList = useMemo(
    () => utilizadoresGaji9(colaboradores, funcoes, 'representantes'),
    [funcoes, colaboradores]
  );

  useEffect(() => {
    dispatch(getFromGaji9('funcoes'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({
    nif: Yup.string().required().label('NIF'),
    sexo: Yup.string().required().label('Sexo'),
    funcao: Yup.string().required().label('Função'),
    concelho: Yup.mixed().required().label('Concelho'),
    freguesia: Yup.mixed().required().label('Fregusia'),
    nome: Yup.string().required().label('Nome completo'),
    atua_como: Yup.string().required().label('Atua como'),
    utilizador: Yup.mixed().required().label('Colaborador'),
    residencia: Yup.string().required().label('Residência'),
    cni: Yup.string().required().label('Doc. identificação'),
    balcao: Yup.number().positive().required().label('Balcão'),
    estado_civil: Yup.string().required().label('Estado civil'),
    local_emissao: Yup.string().required().label('Local emissão'),
    data_emissao: Yup.date().typeError().required().label('Data de emissão'),
  });

  const defaultValues = useMemo(
    () => ({
      bi: selectedItem?.bi ?? '',
      nif: selectedItem?.nif ?? '',
      cni: selectedItem?.cni ?? '',
      nome: selectedItem?.nome ?? '',
      sexo: selectedItem?.sexo ?? '',
      funcao: selectedItem?.funcao ?? '',
      balcao: selectedItem?.balcao ?? '',
      atua_como: selectedItem?.atua_como ?? '',
      concelho: selectedItem?.concelho || null,
      freguesia: selectedItem?.freguesia || null,
      residencia: selectedItem?.residencia ?? '',
      observacao: selectedItem?.observacao ?? '',
      ativo: isEdit ? selectedItem?.ativo : true,
      estado_civil: selectedItem?.estado_civil ?? '',
      local_emissao: selectedItem?.local_emissao || '',
      data_emissao: fillData(selectedItem?.data_emissao, null),
      utilizador: colaboradoresList?.find(({ id }) => id === selectedItem?.utilizador_id) || null,
    }),
    [colaboradoresList, isEdit, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, colaboradoresList]);

  const onSubmit = async () => {
    const formData = removerPropriedades(
      {
        ...values,
        email: values?.utilizador?.email,
        utilizador_id: values?.utilizador?.id,
        data_emissao: values?.data_emissao ? format(values.data_emissao, 'yyyy-MM-dd') : null,
      },
      ['utilizador']
    );
    const params = { id: selectedItem?.id, msg: `Representante ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('representantes', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>{isEdit ? 'Atualizar representante' : 'Adicionar representante'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <Stack spacing={3} direction="row" sx={{ width: '100%' }}>
                  <RHFAutocompleteObj
                    name="utilizador"
                    label="Colaborador"
                    options={colaboradoresList}
                    onChange={(event, newValue) => {
                      setValue('utilizador', newValue, vdt);
                      setValue('sexo', newValue?.sexo ?? '', vdt);
                      setValue('nome', newValue?.label ?? '', vdt);
                      setValue('balcao', newValue?.balcao ?? '', vdt);
                      setValue('funcao', newValue?.funcao ?? '', vdt);
                      setValue('atua_como', newValue?.funcao ?? '', vdt);
                      setValue('concelho', newValue?.concelho || null, vdt);
                      setValue('estado_civil', newValue?.estado_civil ?? '', vdt);
                    }}
                  />
                  <RHFNumberField label="Balcão" name="balcao" sx={{ maxWidth: 120 }} />
                </Stack>
                <RHFTextField name="nome" label="Nome completo" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFTextField name="funcao" label="Função" />
                <RHFTextField name="atua_como" label="Atua como" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFTextField name="sexo" label="Sexo" />
                <RHFTextField name="estado_civil" label="Estado civil" />
                <RHFTextField name="nif" label="NIF" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFTextField name="cni" label="Doc. identificação" />
                <RHFTextField name="local_emissao" label="Local de emissão" />
                <RHFDatePicker disableFuture name="data_emissao" label="Data de emissão" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFAutocompleteSmp
                  name="concelho"
                  label="Concelho"
                  options={[...new Set(freguesiasConcelhos?.map(({ concelho }) => concelho))]?.sort()}
                />
                <RHFAutocompleteSmp
                  name="freguesia"
                  label="Freguesia"
                  options={freguesiasConcelhos
                    ?.filter(({ concelho }) => concelho === values?.concelho)
                    ?.map(({ freguesia }) => freguesia)}
                />
              </Stack>
              <RHFTextField name="residencia" label="Residência" />
              <RHFTextField name="observacao" label="Observação" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FreguesiaForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    ilha: Yup.string().required().label('Ilha'),
    sigla: Yup.string().required().label('Sigla'),
    regiao: Yup.string().required().label('Região'),
    concelho: Yup.string().required().label('Concelho'),
    freguesia: Yup.string().required().label('Freguesia'),
    freguesia_banca: Yup.string().required().label('Freguesia na banca'),
    naturalidade_banca: Yup.string().required().label('Naturalidade na banca'),
  });

  const defaultValues = useMemo(
    () => ({
      ilha: selectedItem?.ilha ?? '',
      sigla: selectedItem?.sigla ?? '',
      regiao: selectedItem?.regiao ?? '',
      concelho: selectedItem?.concelho ?? '',
      freguesia: selectedItem?.freguesia ?? '',
      ativo: isEdit ? selectedItem?.ativo : true,
      freguesia_banca: selectedItem?.freguesia_banca ?? '',
      naturalidade_banca: selectedItem?.naturalidade_banca ?? '',
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
    const params = { id: selectedItem?.id, msg: `Freguesia ${isEdit ? 'atualizada' : 'adicionada'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('freguesias', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar freguesia' : 'Adicionar freguesia'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <Stack direction="row" spacing={3}>
                <RHFTextField name="sigla" label="Sigla" />
                <RHFTextField name="ilha" label="Ilha" />
                <RHFTextField name="regiao" label="Região" />
              </Stack>
              <RHFTextField name="freguesia" label="Freguesia" />
              <RHFTextField name="freguesia_banca" label="Freguesia na banca" />
              <RHFTextField name="concelho" label="Concelho" />
              <RHFTextField name="naturalidade_banca" label="Naturalidade na banca" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
