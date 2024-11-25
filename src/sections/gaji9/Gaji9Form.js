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
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fillData } from '../../utils/formatTime';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem } from '../../redux/slices/gaji9';
// components
import { FormLoading } from '../../components/skeleton';
import { SearchNotFoundSmall } from '../../components/table';
import { DefaultAction, DialogButons } from '../../components/Actions';
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSimple,
  RHFAutocompleteObject,
} from '../../components/hook-form';
// _mock_
import { freguesiasConcelhos } from '../../_mock';

// ---------------------------------------------------------------------------------------------------------------------

ProdutoForm.propTypes = { onCancel: PropTypes.func };

export function ProdutoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    codigo: !isEdit && Yup.string().required().label('Código'),
    rotulo: isEdit && Yup.string().required().label('Rótulo'),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo || '',
      rotulo: selectedItem?.rotulo || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Rotular produto' : 'Importar produto'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'produto'))}
        >
          <ItemComponent item={selectedItem} rows={1}>
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
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

TitularForm.propTypes = { onCancel: PropTypes.func };

export function TitularForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    codigo: Yup.string().required().label('Código'),
    descritivo: Yup.string().required().label('Descritivo'),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo || '',
      descritivo: selectedItem?.descritivo || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar tipo de titular' : 'Adicionar tipo de titular'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'titular'))}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="codigo" label="Código" />
              <RHFTextField name="descritivo" label="Descritivo" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

GarantiaForm.propTypes = { onCancel: PropTypes.func };

export function GarantiaForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    codigo: Yup.string().required().label('Código'),
    designacao: Yup.string().required().label('Designação'),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo || '',
      designacao: selectedItem?.designacao || '',
      descritivo: selectedItem?.descritivo || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar tipo de dgarantia' : 'Adicionar tipo de dgarantia'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'garantia'))}
        >
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="codigo" label="Código" />
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descritivo" label="Descritivo" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

MarcadorForm.propTypes = { onCancel: PropTypes.func };

export function MarcadorForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    sufixo: Yup.string().required().label('Sufixo'),
    prefixo: Yup.string().required().label('Prefixo'),
  });

  const defaultValues = useMemo(
    () => ({
      sufixo: selectedItem?.sufixo || '',
      prefixo: selectedItem?.prefixo || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar marcador' : 'Adicionar marcador'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'marcador'))}
        >
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="prefixo" label="Prefixo" />
              <RHFTextField name="sufixo" label="Sufixo" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

VariavelForm.propTypes = { onCancel: PropTypes.func };

export function VariavelForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    variaveis: Yup.array(Yup.object({ nome: Yup.string().required().label('Nome') })),
  });

  const defaultValues = useMemo(
    () =>
      selectedItem
        ? {
            variaveis: [
              {
                id: selectedItem?.id,
                ativo: selectedItem?.ativo,
                nome: selectedItem?.nome || '',
                descritivo: selectedItem?.descritivo || '',
              },
            ],
          }
        : { variaveis: [{ nome: '', descritivo: '', ativo: true }] },
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'variaveis' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar variável' : 'Adicionar variáveis'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() =>
            submitDados(
              selectedItem?.id,
              values?.variaveis?.map((row) => row),
              isEdit,
              dispatch,
              'marcador'
            )
          )}
        >
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={2} sx={{ pt: 3 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {fields.map((item, index) => (
                <Stack key={`variavel_${index}`} spacing={1} direction="row" alignItems="center">
                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                      <RHFTextField label="Nome" name={`variaveis[${index}].nome`} />
                      {isEdit && <RHFSwitch name={`variaveis[${index}].ativo`} label="Ativo" />}
                    </Stack>
                    <RHFTextField label="Descritivo" name={`variaveis[${index}].descritivo`} />
                  </Stack>
                  {fields?.length > 1 && (
                    <DefaultAction small color="error" label="ELIMINAR" handleClick={() => remove(index)} />
                  )}
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <DefaultAction
                button
                label="Adicionar"
                handleClick={() => append({ nome: '', descritivo: '', ativo: true })}
              />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

GrupoForm.propTypes = { onCancel: PropTypes.func };

export function GrupoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({
      email: selectedItem?.email || '',
      descricao: selectedItem?.descricao || '',
      designacao: selectedItem?.designacao || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar grupo' : 'Adicionar grupo'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'grupos'))}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descricao" label="Descrição" />
              <RHFTextField name="email" label="Email" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

RecursoForm.propTypes = { onCancel: PropTypes.func };

export function RecursoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    nome: Yup.string().required().label('Nome'),
    tipo: Yup.mixed().required().label('Tipo'),
  });
  const defaultValues = useMemo(
    () => ({
      nome: selectedItem?.nome || '',
      tipo: selectedItem?.tipo || null,
      descricao: selectedItem?.descricao || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar recurso' : 'Adicionar recurso'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'recursos'))}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="nome" label="Nome" />
              <RHFAutocompleteSimple name="tipo" label="Tipo" options={[]} />
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

// ---------------------------------------------------------------------------------------------------------------------

FuncaoForm.propTypes = { onCancel: PropTypes.func };

export function FuncaoForm({ onCancel }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const colaboradoresList = useMemo(
    () => colaboradores?.map((row) => ({ id: row?.perfil?.id_aad, email: row?.perfil?.mail, label: row?.nome })),
    [colaboradores]
  );

  const formSchema = Yup.object().shape({
    role: Yup.mixed().required().label('Função'),
    utilizador: Yup.mixed().required().label('Colaborador'),
  });
  const defaultValues = useMemo(
    () => ({
      role: selectedItem?.role || null,
      ativo: selectedItem ? selectedItem?.ativo : true,
      data_inicio: selectedItem?.data_inicio ? new Date(selectedItem?.data_inicio) : null,
      data_termino: selectedItem?.data_termino ? new Date(selectedItem?.data_termino) : null,
      utilizador: colaboradoresList?.find((row) => row?.id === selectedItem?.utilizador_id) || null,
    }),
    [selectedItem, colaboradoresList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar recurso' : 'Adicionar recurso'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() =>
            submitDados(
              selectedItem?.id,
              { ...values, utilizador_id: values?.utilizador?.id, utilizador_email: values?.utilizador?.mail },
              isEdit,
              dispatch,
              'recursos'
            )
          )}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObject name="utilizador" label="Colaborador" options={colaboradoresList} />
              <RHFAutocompleteSimple name="role" label="Função" options={[]} />
              <Stack spacing={3} direction="row">
                <RHFDatePicker dateTime name="data_inicio" label="Data de início" />
                <RHFDatePicker dateTime name="data_termino" label="Data de término" />
              </Stack>
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

RepresentanteForm.propTypes = { onCancel: PropTypes.func };

export function RepresentanteForm({ onCancel }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const colaboradoresList = useMemo(
    () =>
      colaboradores?.map((row) => ({
        id: row?.id,
        balcao: row?.uo?.balcao,
        email: row?.perfil?.mail,
        label: row?.perfil?.displayName,
        estado_civil: row?.estado_civil,
        concelho: row?.morada?.concelho,
        funcao: row?.nomeacao || row?.funcao,
        residencia: `${row?.morada?.concelho}${row?.morada?.zona ? ` - ${row?.morada?.zona}` : ''}`,
      })),
    [colaboradores]
  );

  const formSchema = Yup.object().shape({
    nif: Yup.string().required().label('NIF'),
    funcao: Yup.string().required().label('Função'),
    concelho: Yup.mixed().required().label('Concelho'),
    freguesia: Yup.mixed().required().label('Fregusia'),
    atua_como: Yup.string().required().label('Atua como'),
    utilizador: Yup.mixed().required().label('Colaborador'),
    residencia: Yup.string().required().label('Residência'),
    bi_cni: Yup.string().required().label('Doc. identificação'),
    local_emissao: Yup.string().required().label('Local emissão'),
    data_emissao: Yup.date().typeError().required().label('Data de nacimento'),
  });

  const defaultValues = useMemo(
    () => ({
      nif: selectedItem?.nif || '',
      bi_cni: selectedItem?.bi_cni || '',
      funcao: selectedItem?.funcao || '',
      atua_como: selectedItem?.atua_como || '',
      concelho: selectedItem?.concelho || null,
      freguesia: selectedItem?.freguesia || null,
      residencia: selectedItem?.residencia || '',
      observacao: selectedItem?.observacao || '',
      ativo: selectedItem ? selectedItem?.ativo : true,
      local_emissao: selectedItem?.local_emissao || null,
      data_emissao: fillData(selectedItem?.data_emissao, null),
      data_inicio: selectedItem?.data_emissao ? new Date(selectedItem?.data_emissao) : null,
      utilizador: colaboradoresList?.find((row) => row?.id === selectedItem?.utilizador_id) || null,
    }),
    [colaboradoresList, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Atualizar representante' : 'Adicionar representante'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() =>
            submitDados(
              selectedItem?.id,
              {
                ...values,
                nome: values?.utilizador?.label,
                balcao: values?.utilizador?.balcao,
                utilizador_id: values?.utilizador?.id,
                utilizador_email: values?.utilizador?.mail,
                estado_civil: values?.utilizador?.estado_civil,
              },
              isEdit,
              dispatch,
              'representantes'
            )
          )}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObject
                name="utilizador"
                label="Colaborador"
                options={colaboradoresList}
                onChange={(event, newValue) => {
                  setValue('utilizador', newValue, { shouldValidate: true, shouldDirty: true });
                  setValue('funcao', newValue?.funcao || null, { shouldValidate: true, shouldDirty: true });
                  setValue('atua_como', newValue?.funcao || null, { shouldValidate: true, shouldDirty: true });
                  setValue('concelho', newValue?.concelho || null, { shouldValidate: true, shouldDirty: true });
                  setValue('residencia', newValue?.residencia || null, { shouldValidate: true, shouldDirty: true });
                }}
              />
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <Stack spacing={3} direction="row" sx={{ width: { sm: '50%' } }}>
                  <RHFTextField name="nif" label="NIF" />
                  <RHFTextField name="bi_cni" label="Doc. identificação" />
                </Stack>
                <Stack spacing={3} direction="row" sx={{ width: { sm: '50%' } }}>
                  <RHFTextField name="local_emissao" label="Local de emissão" />
                  <RHFDatePicker name="data_emissao" label="Data de emissão" />
                </Stack>
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFTextField name="funcao" label="Função" />
                <RHFTextField name="atua_como" label="Atua como" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFAutocompleteSimple
                  name="concelho"
                  label="Concelho"
                  options={[...new Set(freguesiasConcelhos?.map((row) => row?.concelho))]?.sort()}
                />
                <RHFAutocompleteSimple
                  name="freguesia"
                  label="Freguesia"
                  options={freguesiasConcelhos
                    ?.filter((item) => item?.concelho === values?.concelho)
                    ?.map((row) => row?.freguesia)}
                />
              </Stack>
              <RHFTextField name="residencia" label="Residência" />
              <RHFTextField name="observacao" label="Observação" />
              {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

ItemComponent.propTypes = { item: PropTypes.object, rows: PropTypes.number, children: PropTypes.node };

export function ItemComponent({ item, rows, children }) {
  const { isLoading, isEdit } = useSelector((state) => state.gaji9);
  return isLoading ? (
    <FormLoading rows={rows} />
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

// ---------------------------------------------------------------------------------------------------------------------

export function submitDados(id, values, isEdit, dispatch, item) {
  if (isEdit) {
    dispatch(updateItem(item, JSON.stringify(values), { id, msg: 'Item tualizado' }));
  } else {
    dispatch(createItem(item, JSON.stringify(values), { msg: 'Item idicionado' }));
  }
}
