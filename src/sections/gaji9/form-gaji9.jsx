import * as Yup from 'yup';
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
import { perfisAad, utilizadoresGaji9, removerPropriedades } from '../../utils/formatObject';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { getFromGaji9, createItem, updateItem } from '../../redux/slices/gaji9';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import { FormLoading } from '../../components/skeleton';
import { SearchNotFoundSmall } from '../../components/table';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { DefaultAction, DialogButons } from '../../components/Actions';
// _mock_

// ---------------------------------------------------------------------------------------------------------------------

export function MarcadorForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    sufixo: Yup.string().required().label('Sufixo'),
    prefixo: Yup.string().required().label('Prefixo'),
  });

  const defaultValues = useMemo(
    () => ({
      sufixo: selectedItem?.sufixo ?? '',
      prefixo: selectedItem?.prefixo ?? '',
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
    const params = { id: selectedItem?.id, msg: `Marcador ${isEdit ? 'atualizado' : 'adicionad'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('marcadores', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar marcador' : 'Adicionar marcador'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="prefixo" label="Prefixo" />
              <RHFTextField name="sufixo" label="Sufixo" />
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

export function VariavelForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    variaveis: Yup.array(Yup.object({ nome: Yup.string().required().label('Nome') })),
  });

  const defaultValues = useMemo(
    () => (isEdit ? { variaveis: [selectedItem] } : { variaveis: [{ nome: '', descritivo: '', ativo: true }] }),
    [isEdit, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'variaveis' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    const params = { onClose, msg: `Variável ´${isEdit ? 'atualizado' : 'adicionado'}` };
    if (isEdit) dispatch(updateItem('variaveis', JSON.stringify([values?.variaveis?.[0]]), params));
    else dispatch(createItem('variaveis', JSON.stringify(values?.variaveis?.map((row) => row)), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt
        title={isEdit ? 'Editar variável' : 'Adicionar variáveis'}
        action={
          !isEdit && (
            <DefaultAction
              small
              button
              icon="adicionar"
              label="Variável"
              onClick={() => append({ nome: '', descritivo: '', ativo: true })}
            />
          )
        }
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={2} sx={{ pt: 3 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {fields.map((item, index) => (
                <Stack key={`variavel_${index}`} spacing={1} direction="row" alignItems="center">
                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <RHFTextField label="Nome" name={`variaveis[${index}].nome`} />
                    <RHFTextField label="Descritivo" name={`variaveis[${index}].descritivo`} />
                    {isEdit && <RHFSwitch name={`variaveis[${index}].ativo`} label="Ativo" />}
                  </Stack>
                  {fields?.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
                </Stack>
              ))}
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function GrupoForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    email: Yup.string().required().label('Email'),
    designacao: Yup.string().required().label('Designação'),
  });
  const defaultValues = useMemo(
    () => ({
      email: selectedItem?.email ?? '',
      descricao: selectedItem?.descricao ?? '',
      designacao: selectedItem?.designacao ?? '',
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
    const params = { id: selectedItem?.id, msg: `Grupo ${isEdit ? 'atualizado' : 'adicionad'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('grupos', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar grupo' : 'Adicionar grupo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
              <RHFTextField name="descricao" label="Descrição" />
              <RHFTextField name="email" label="Email" />
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

export function RecursoGrupoForm({ onClose, selectedItem, grupoId }) {
  const dispatch = useDispatch();
  const { isSaving, recursos } = useSelector((state) => state.gaji9);
  const recursosList = useMemo(() => recursos?.map(({ id, nome }) => ({ id, label: nome })), [recursos]);

  useEffect(() => {
    dispatch(getFromGaji9('recursos'));
  }, [dispatch]);

  const formSchema = Yup.object().shape({
    recursos: Yup.array(
      Yup.object({
        recurso: Yup.mixed().required().label('Recurso'),
        permissao: Yup.array().min(1, 'Permissão não pode ficar vazio').label('Permissão'),
      })
    ),
  });

  const defaultValues = useMemo(
    () =>
      selectedItem?.action === 'edit'
        ? {
            recursos: [
              {
                ativo: selectedItem?.ativo,
                permissao: selectedItem?.permissoes,
                recurso: recursosList?.find(({ id }) => id === selectedItem?.recurso_id),
                data_inicio: selectedItem?.data_inicio ? new Date(selectedItem?.data_inicio) : null,
                data_termino: selectedItem?.data_termino ? new Date(selectedItem?.data_termino) : null,
              },
            ],
          }
        : { recursos: [{ recurso: null, permissao: [], data_inicio: null, data_termino: null }] },
    [selectedItem, recursosList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();
  const { fields, append, remove } = useFieldArray({ control, name: 'recursos' });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const params = useMemo(
    () => ({
      onClose,
      getItem: 'selectedItem',
      id: selectedItem?.action === 'add' ? grupoId : selectedItem?.id,
      msg: selectedItem?.action === 'add' ? 'Recurso atualizado' : 'Recursos adicionados',
    }),
    [grupoId, onClose, selectedItem?.action, selectedItem?.id]
  );

  const onSubmit = async () => {
    if (selectedItem?.action === 'add') {
      const formData = values?.recursos?.map(({ recurso, permissao, data_inicio: di, data_termino: dt }) => {
        const updatedPermissions = new Set(permissao);
        updatedPermissions.add('READ');
        return {
          ativo: true,
          data_termino: dt,
          recurso_id: recurso?.id,
          data_inicio: di || new Date(),
          permissao: Array.from(updatedPermissions),
        };
      });
      dispatch(createItem('recursosGrupo', JSON.stringify(formData), params));
    } else {
      const recurso = values?.recursos?.[0];
      const formData = {
        grupo_id: grupoId,
        ativo: recurso?.ativo,
        permissao: recurso?.permissao,
        recurso_id: recurso?.recurso?.id,
        data_termino: recurso?.data_termino,
        data_inicio: recurso?.data_inicio || new Date(),
      };
      dispatch(updateItem('recursosGrupo', JSON.stringify(formData), params));
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt
        title={selectedItem?.action === 'add' ? 'Adicionar recursos' : 'Atualizar recurso'}
        action={
          selectedItem?.action === 'add' && (
            <DefaultAction
              small
              button
              label="Recurso"
              icon="adicionar"
              onClick={() => append({ recurso: null, permissao: [], data_inicio: null, data_termino: null })}
            />
          )
        }
      />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ pt: 3 }} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {fields.map((item, index) => (
              <Stack key={`recurso_${index}`} spacing={1} direction="row" alignItems="center">
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <RHFAutocompleteObj name={`recursos[${index}].recurso`} label="Recurso" options={recursosList} />
                  <RHFAutocompleteSmp
                    multiple
                    label="Permissão"
                    name={`recursos[${index}].permissao`}
                    options={['READ', 'CREATE', 'UPDATE', 'DELETE']}
                  />
                  <Stack spacing={2} direction="row" alignItems="center" justifyContent="center">
                    <RHFDatePicker dateTime label="Data de início" name={`recursos[${index}].data_inicio`} />
                    <RHFDatePicker dateTime label="Data de término" name={`recursos[${index}].data_termino`} />
                  </Stack>
                  {selectedItem?.action === 'edit' && <RHFSwitch name={`recursos[${index}].ativo`} label="Ativo" />}
                </Stack>
                {fields?.length > 1 && <DefaultAction small label="ELIMINAR" onClick={() => remove(index)} />}
              </Stack>
            ))}
          </Stack>
          <DialogButons edit={selectedItem?.action === 'edit'} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RecursoForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);

  const formSchema = Yup.object().shape({
    nome: Yup.string().required().label('Nome'),
    tipo: Yup.mixed().required().label('Tipo'),
  });
  const defaultValues = useMemo(
    () => ({
      nome: selectedItem?.nome ?? '',
      tipo: selectedItem?.tipo || null,
      descricao: selectedItem?.descricao ?? '',
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
    const params = { id: selectedItem?.id, msg: `Recurso ${isEdit ? 'atualizado' : 'adicionad'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('recursos', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar recurso' : 'Adicionar recurso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="nome" label="Nome" />
              <RHFAutocompleteSmp name="tipo" label="Tipo" options={['API']} />
              <RHFTextField name="descricao" label="Descrição" />
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

export function UtilizadorGrupoForm({ grupoId, onClose, selectedItem }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isSaving, funcoes } = useSelector((state) => state.gaji9);
  const colaboradoresList = useMemo(
    () => utilizadoresGaji9(colaboradores, funcoes, 'funcoes'),
    [funcoes, colaboradores]
  );

  const formSchema = Yup.object().shape({ colaborador: Yup.mixed().required().label('Colaborador') });
  const defaultValues = useMemo(
    () => ({
      nota: '',
      ativo: true,
      grupo_id: grupoId,
      data_inicio: selectedItem?.data_inicio ? new Date(selectedItem?.data_inicio) : null,
      data_termino: selectedItem?.data_termino ? new Date(selectedItem?.data_termino) : null,
      colaborador: colaboradoresList?.find(({ id }) => id === selectedItem?.utilizador_id) || null,
    }),
    [colaboradoresList, grupoId, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    const params = {
      onClose,
      id: selectedItem?.id,
      item: 'utilizadores',
      item1: 'selectedItem',
      msg: `Utilizador ${selectedItem?.action === 'edit' ? 'atualizado' : 'adicionado'}`,
    };
    const formData = removerPropriedades(
      { ...values, utilizador_id: values?.colaborador?.id, data_inicio: values?.data_inicio || new Date() },
      ['colaborador']
    );

    if (selectedItem?.action === 'edit') dispatch(updateItem('colaboradorGrupo', JSON.stringify(formData), params));
    else dispatch(createItem('colaboradorGrupo', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{selectedItem?.action === 'edit' ? 'Atualizar colaborador' : 'Adicionar colaborador'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObj name="colaborador" label="Colaborador" options={colaboradoresList} />
              <Stack spacing={3} direction="row">
                <RHFDatePicker dateTime name="data_inicio" label="Data de início" />
                <RHFDatePicker dateTime name="data_termino" label="Data de término" />
              </Stack>
              {selectedItem?.action === 'edit' && <RHFSwitch name="ativo" label="Ativo" />}
            </Stack>
            <DialogButons edit={selectedItem?.action === 'edit'} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function FuncaoForm({ onClose }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.gaji9);
  const colaboradoresList = useMemo(() => perfisAad(colaboradores, 'funcoes'), [colaboradores]);

  const formSchema = Yup.object().shape({
    role: Yup.mixed().required().label('Função'),
    utilizador: Yup.mixed().required().label('Colaborador'),
  });
  const defaultValues = useMemo(
    () => ({
      role: selectedItem?._role || null,
      ativo: isEdit ? selectedItem?.ativo : true,
      data_inicio: selectedItem?.data_inicio ? new Date(selectedItem?.data_inicio) : null,
      data_termino: selectedItem?.data_termino ? new Date(selectedItem?.data_termino) : null,
      utilizador: colaboradoresList?.find(({ id }) => id === selectedItem?.utilizador_id) || null,
    }),
    [selectedItem, isEdit, colaboradoresList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    const formData = removerPropriedades(
      {
        ...values,
        utilizador_id: values?.utilizador?.id,
        utilizador_email: values?.utilizador?.email,
        data_inicio: values?.data_inicio || new Date(),
      },
      ['utilizador']
    );
    const params = { id: selectedItem?.id, msg: `Utilizador ${isEdit ? 'atualizada' : 'adicionada'}`, onClose };
    dispatch((isEdit ? updateItem : createItem)('funcoes', JSON.stringify(formData), { ...params }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Atualizar utilizador' : 'Adicionar utilizador'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObj name="utilizador" label="Colaborador" options={colaboradoresList} />
              <RHFAutocompleteSmp name="role" label="Função" options={['ADMIN', 'AUDITOR', 'GERENTE', 'USER']} />
              <Stack spacing={3} direction="row">
                <RHFDatePicker dateTime name="data_inicio" label="Data de início" />
                <RHFDatePicker dateTime name="data_termino" label="Data de término" />
              </Stack>
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

export function BalcaoForm({ id, item, onClose }) {
  const dispatch = useDispatch();
  const isEdit = item?.action === 'editar';
  const { uos } = useSelector((state) => state.intranet);
  const { isSaving } = useSelector((state) => state.gaji9);
  const balcoesList = useMemo(() => uos?.map(({ balcao, label }) => ({ id: balcao, label })), [uos]);

  const formSchema = Yup.object().shape({ balcao: Yup.mixed().required().label('Balcão') });
  const defaultValues = useMemo(
    () => ({
      balcao: balcoesList?.find(({ id }) => id === item?.balcao) || null,
      data_inicio: item?.data_inicio ? new Date(item?.data_inicio) : null,
      data_termino: item?.data_termino ? new Date(item?.data_termino) : null,
    }),
    [balcoesList, item]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balcoesList, item]);

  const onSubmit = async () => {
    const formData = { ...values, balcao: values?.balcao?.id };
    const params = {
      ...{ id: item?.id, repId: id, getItem: 'selectedItem' },
      ...{ msg: `Balcão ${isEdit ? 'atualizado' : 'adicionado'}`, onClose },
    };
    dispatch((isEdit ? updateItem : createItem)('balcoes', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Atualizar balcão' : 'Adicionar balcão'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="balcao" label="Balcão" options={balcoesList} />
            <Stack spacing={3} direction="row">
              <RHFDatePicker dateTime name="data_inicio" label="Data de início" />
              <RHFDatePicker dateTime disablePast name="data_termino" label="Data de término" />
            </Stack>
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ItemComponent({ item, rows, children }) {
  const { isLoading, isEdit } = useSelector((state) => state.gaji9);
  return isEdit && isLoading ? (
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
