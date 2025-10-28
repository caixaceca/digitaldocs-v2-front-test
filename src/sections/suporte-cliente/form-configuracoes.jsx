import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createInSuporte, updateInSuporte } from '../../redux/slices/suporte-cliente';
// components
import { DialogButons } from '../../components/Actions';
import { FormLoading } from '../../components/skeleton/Carregando';
import { SearchNotFoundSmall } from '../../components/table/SearchNotFound';
import { RHFSwitch, FormProvider, RHFTextField, RHFNumberField, RHFAutocompleteObj } from '../../components/hook-form';
//
import { applyList, rolesList, phasesList } from './utils';

// ---------------------------------------------------------------------------------------------------------------------

export function AssuntoForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem, departamentos, slas } = useSelector((state) => state.suporte);

  const slasList = useMemo(() => slas?.map(({ id, name }) => ({ id, label: name })), [slas]);
  const departsList = useMemo(() => departamentos?.map(({ id, name }) => ({ id, label: name })), [departamentos]);

  const formSchema = Yup.object().shape({
    sla_id: Yup.mixed().required().label('SLA'),
    name: Yup.mixed().required().label('Nome'),
    departament_id: Yup.mixed().required().label('Departamento'),
    applicability: Yup.mixed().required().label('Aplicabilidade'),
  });

  const defaultValues = useMemo(
    () => ({
      name: selectedItem?.name ?? '',
      description: selectedItem?.description ?? null,
      sla_id: slasList?.find(({ id }) => id === selectedItem?.sla_id) ?? null,
      applicability: applyList?.find(({ id }) => id === selectedItem?.applicability) ?? null,
      departament_id: departsList?.find(({ id }) => id === selectedItem?.department_id) ?? null,
    }),
    [departsList, slasList, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, departsList, slasList]);

  const onSubmit = async (values) => {
    const formData = {
      name: values?.name,
      sla_id: values?.sla_id?.id,
      description: values?.description ?? null,
      applicability: values?.applicability?.id,
      department_id: values?.departament_id?.id,
    };
    const params = { id: selectedItem?.id, msg: `Assunto ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('assuntos', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar assunto' : 'Adicionar assunto'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="name" label="Nome" />
              <RHFTextField name="description" label="Descrição" multiline rows={2} />
              <RHFAutocompleteObj name="departament_id" label="Departamento" options={departsList} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <RHFAutocompleteObj name="applicability" label="Aplicabilidade" options={applyList} />
                <RHFAutocompleteObj name="sla_id" label="SLA" options={slasList} />
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

export function FaqForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem, categorias } = useSelector((state) => state.suporte);

  const categoriasList = useMemo(() => categorias?.map(({ id, name }) => ({ id, label: name })), [categorias]);

  const formSchema = Yup.object().shape({
    question: Yup.string().required().label('Questão'),
    response: Yup.string().required().label('Resposta'),
    categoryId: Yup.mixed().required().label('Categoria'),
  });

  const defaultValues = useMemo(
    () => ({
      sequence: selectedItem?.sequence ?? 1,
      question: selectedItem?.question ?? '',
      response: selectedItem?.response ?? '',
      highlighted: !!selectedItem?.highlighted,
      categoryId: categoriasList?.find(({ id }) => id === selectedItem?.category_id) ?? null,
    }),
    [selectedItem, categoriasList]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    const formData = { ...values, categoryId: values?.categoryId?.id };
    const params = { id: selectedItem?.id, msg: `Questão ${isEdit ? 'atualizada' : 'adicionada'}` };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('faq', JSON.stringify(formData), { ...params, onClose }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar questão' : 'Adicionar questão'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <RHFAutocompleteObj name="categoryId" label="Categoria" options={categoriasList} />
                <Stack direction="row" spacing={3}>
                  <RHFNumberField name="sequence" label="Ordem" sx={{ width: { sm: 200 } }} />
                  <RHFSwitch name="highlighted" label="Destacar" mt />
                </Stack>
              </Stack>
              <RHFTextField name="question" label="Questão" />
              <RHFTextField name="response" label="Resposta" multiline rows={4} />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function SlaForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.suporte);

  const formSchema = Yup.object().shape({
    name: Yup.string().required().label('Nome'),
    description: Yup.string().required().label('Descrição'),
    response_time_mn: Yup.number().positive().required().label('Tempo de resposta'),
    resolution_time_mn: Yup.number().positive().required().label('Tempo de resolução'),
  });

  const defaultValues = useMemo(
    () => ({
      name: selectedItem?.name ?? '',
      description: selectedItem?.description ?? '',
      response_time_mn: selectedItem?.response_time_mn ?? 0,
      resolution_time_mn: selectedItem?.resolution_time_mn ?? 0,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    const params = { id: selectedItem?.id, msg: `SLA ${isEdit ? 'atualizado' : 'adicionado'}` };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('slas', JSON.stringify(values), { ...params, onClose }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar SLA' : 'Adicionar SLA'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="name" label="Nome" />
              <RHFTextField name="description" label="Descrição" multiline rows={2} />
              <Stack direction="row" spacing={3}>
                <RHFNumberField name="response_time_mn" label="Tempo de resposta" tipo="min" />
                <RHFNumberField name="resolution_time_mn" label="Tempo de resolução" tipo="min" />
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

export function DepartamentoForm({ onClose }) {
  const dispatch = useDispatch();
  const { uos } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.suporte);

  const formSchema = Yup.object().shape({ uo: Yup.mixed().required().label('Unidade orgânica') });
  const defaultValues = useMemo(
    () => ({ uo: uos?.find(({ balcao }) => balcao === selectedItem?.counter) ?? null }),
    [selectedItem, uos]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    const { uo } = values;
    const formData = {
      active: true,
      name: uo?.nome ?? '',
      counter: uo?.balcao ?? null,
      council: 'PRAIA',
      // council: uo?.concelho ?? '',
      abreviation: uo?.label ?? '',
      latitude: uo?.latitude ?? null,
      longitude: uo?.longitude ?? null,
      island: uo?.ilha?.toUpperCase() ?? '',
      region: uo?.regiao === 'Sul' ? 'SOUTH' : 'NORTH',
      type:
        (uo?.tipo === 'Agências' && 'AGENCY') || (uo?.tipo === 'Serviços Centrais' && 'CENTRAL_SERVICES') || 'OTHER',
    };
    const params = { id: selectedItem?.id, msg: `Departamento ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('departamentos', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar departamneto' : 'Adicionar departamneto'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObj name="uo" label="Unidade orgânica" options={uos} />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function UtilizadorForm({ onClose }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem, departamentos } = useSelector((state) => state.suporte);

  const departsList = useMemo(() => departamentos?.map(({ id, name }) => ({ id, label: name })), [departamentos]);
  const colbsList = useMemo(
    () => colaboradores?.filter(({ ativo }) => ativo)?.map(({ id, nome, email }) => ({ id, label: nome, email })),
    [colaboradores]
  );

  const formSchema = Yup.object().shape({
    role: Yup.mixed().required().label('Função'),
    colaborador: Yup.mixed().required().label('Colaborador'),
    departamento: Yup.mixed().required().label('Departamento'),
  });

  const defaultValues = useMemo(
    () => ({
      role: rolesList?.find(({ label }) => label === selectedItem?.role) ?? null,
      colaborador: colbsList?.find(({ id }) => id === selectedItem?.employee_id) ?? null,
      departamento: departsList?.find(({ id }) => id === selectedItem?.department_id) ?? null,
    }),
    [colbsList, departsList, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    const formData = {
      role: values?.role?.id,
      username: values?.colaborador?.email,
      employee_id: values?.colaborador?.id,
      department_id: values?.departamento?.id,
    };
    const params = { id: selectedItem?.id, msg: `Utilizador ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('utilizadores', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar utilizador' : 'Adicionar utilizador'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFAutocompleteObj name="colaborador" label="Colaborador" options={colbsList} />
              <RHFAutocompleteObj name="departamento" label="Departamento" options={departsList} />
              <RHFAutocompleteObj name="role" label="Função" options={rolesList} />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function RespostaForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.suporte);

  const formSchema = Yup.object().shape({
    phase: Yup.mixed().required().label('Fase'),
    subject: Yup.string().required().label('Assunto'),
    content: Yup.string().required().label('Conteúdo'),
  });

  const defaultValues = useMemo(
    () => ({
      subject: selectedItem?.subject ?? '',
      content: selectedItem?.content ?? '',
      phase: phasesList?.find(({ id }) => id === selectedItem?.phase) ?? null,
    }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    const formData = { ...values, active: true, phase: values?.phase?.id };
    const params = { id: selectedItem?.id, msg: `Resposta ${isEdit ? 'atualizada' : 'adicionada'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('respostas', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar resposta' : 'Adicionar resposta'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="subject" label="Assunto" />
              <RHFTextField name="content" label="Conteúdo" multiline rows={8} />
              <RHFAutocompleteObj name="phase" label="Fase" options={phasesList} />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function CategoriasForm({ onClose, selectedItem }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.suporte);

  const isEdit = selectedItem?.action === 'edit';
  const formSchema = Yup.object().shape({ name: Yup.string().required().label('Categoria') });
  const defaultValues = useMemo(() => ({ name: selectedItem?.name ?? '' }), [selectedItem]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, handleSubmit } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async (values) => {
    const params = { id: selectedItem?.id, msg: `Categoria ${isEdit ? 'atualizada' : 'adicionada'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('categorias', JSON.stringify(values), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar categoria' : 'Adicionar categoria'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="name" label="Categoria" />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ItemComponent({ item, rows, children }) {
  const { isLoading, isEdit } = useSelector((state) => state.suporte);
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
