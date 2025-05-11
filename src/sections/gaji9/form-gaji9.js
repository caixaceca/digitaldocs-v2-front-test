import * as Yup from 'yup';
import { format } from 'date-fns';
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
  RHFNumberField,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import { FormLoading } from '../../components/skeleton';
import { SearchNotFoundSmall } from '../../components/table';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { DefaultAction, DialogButons } from '../../components/Actions';
// _mock_
import { freguesiasConcelhos } from '../../_mock';

const vsv = { shouldValidate: true, shouldDirty: true, shouldTouch: true };

// ---------------------------------------------------------------------------------------------------------------------

ProdutoForm.propTypes = { onCancel: PropTypes.func };

export function ProdutoForm({ onCancel }) {
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
    const params = { values, msg: `Produto ${isEdit ? 'rotulado' : 'importado'}`, onClose: () => onCancel() };
    if (isEdit) {
      const formData = JSON.stringify([{ id: values?.id, rotulo: values?.rotulo, ativo: values?.ativo }]);
      dispatch(updateItem('componentes', formData, params));
    } else {
      dispatch(createItem('componentes', JSON.stringify({ codigo: values?.codigo }), params));
    }
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
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
          <DialogButons edit={isEdit} isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

TipoTitularForm.propTypes = { onCancel: PropTypes.func };

export function TipoTitularForm({ onCancel }) {
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

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar tipo de titular' : 'Adicionar tipo de titular'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() =>
            submitDados(selectedItem?.id, values, isEdit, dispatch, 'tiposTitulares', onCancel)
          )}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="codigo" label="Código" />
              <RHFTextField name="descritivo" label="Descritivo" />
              <Stack direction="row" spacing={3}>
                <RHFSwitch name="consumidor" label="Consumidor" />
                {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
              </Stack>
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
      codigo: selectedItem?.codigo ?? '',
      designacao: selectedItem?.designacao ?? '',
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

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar tipo de garantia' : 'Adicionar tipo de garantia'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() =>
            submitDados(selectedItem?.id, values, isEdit, dispatch, 'tiposGarantias', onCancel)
          )}
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

FreguesiaForm.propTypes = { onCancel: PropTypes.func };

export function FreguesiaForm({ onCancel }) {
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

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar freguesia' : 'Adicionar freguesia'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'freguesias', onCancel))}
        >
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

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar marcador' : 'Adicionar marcador'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'marcadores', onCancel))}
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
    const params = { onClose: onCancel, msg: `Variável ´${isEdit ? 'atualizado' : 'adicionado'}` };
    if (isEdit) dispatch(updateItem('variaveis', JSON.stringify([values?.variaveis?.[0]]), params));
    else dispatch(createItem('variaveis', JSON.stringify(values?.variaveis?.map((row) => row)), params));
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
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

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar grupo' : 'Adicionar grupo'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'grupos', onCancel))}
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

RecursoGrupoForm.propTypes = { onCancel: PropTypes.func, selectedItem: PropTypes.object, grupoId: PropTypes.string };

export function RecursoGrupoForm({ onCancel, selectedItem, grupoId }) {
  const dispatch = useDispatch();
  const { isSaving, recursos } = useSelector((state) => state.gaji9);
  const recursosList = useMemo(() => recursos?.map((row) => ({ id: row?.id, label: row?.nome })), [recursos]);

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
                recurso: recursosList?.find((row) => row?.id === selectedItem?.recurso_id),
                data_inicio: selectedItem?.data_inicio ? new Date(selectedItem?.data_inicio) : null,
                data_termino: selectedItem?.data_termino ? new Date(selectedItem?.data_termino) : null,
              },
            ],
          }
        : {
            recursos: [{ recurso: null, permissao: [], data_inicio: null, data_termino: null }],
          },
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
      onClose: onCancel,
      getItem: 'selectedItem',
      id: selectedItem?.action === 'add' ? grupoId : selectedItem?.id,
      msg: selectedItem?.action === 'add' ? 'Recurso atualizado' : 'Recursos adicionados',
    }),
    [grupoId, onCancel, selectedItem?.action, selectedItem?.id]
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
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
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
          <DialogButons edit={selectedItem?.action === 'edit'} isSaving={isSaving} onCancel={onCancel} />
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

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Atualizar recurso' : 'Adicionar recurso'}</DialogTitle>
      <DialogContent>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(() => submitDados(selectedItem?.id, values, isEdit, dispatch, 'recursos', onCancel))}
        >
          <ItemComponent item={selectedItem} rows={1}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="nome" label="Nome" />
              <RHFAutocompleteSmp name="tipo" label="Tipo" options={['API']} />
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

UtilizadorGrupoForm.propTypes = { grupoId: PropTypes.string, onCancel: PropTypes.func, selectedItem: PropTypes.object };

export function UtilizadorGrupoForm({ grupoId, onCancel, selectedItem }) {
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
      colaborador: colaboradoresList?.find((row) => row?.id === selectedItem?.utilizador_id) || null,
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
      id: selectedItem?.id,
      item: 'utilizadores',
      item1: 'selectedItem',
      onClose: onCancel,
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
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
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
            <DialogButons edit={selectedItem?.action === 'edit'} isSaving={isSaving} onCancel={onCancel} />
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
      utilizador: colaboradoresList?.find((row) => row?.id === selectedItem?.utilizador_id) || null,
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
    const params = { msg: `Utilizador ${isEdit ? 'atualizada' : 'adicionada'}`, onClose: () => onCancel() };
    dispatch(
      (isEdit ? updateItem : createItem)('funcoes', JSON.stringify(formData), { id: selectedItem?.id, ...params })
    );
  };

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
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
  const { isEdit, isSaving, funcoes, selectedItem } = useSelector((state) => state.gaji9);
  const colaboradoresList = useMemo(
    () => utilizadoresGaji9(colaboradores, funcoes, 'representantes'),
    [funcoes, colaboradores]
  );

  const formSchema = Yup.object().shape({
    nif: Yup.string().required().label('NIF'),
    funcao: Yup.string().required().label('Função'),
    concelho: Yup.mixed().required().label('Concelho'),
    freguesia: Yup.mixed().required().label('Fregusia'),
    nome: Yup.string().required().label('Nome completo'),
    atua_como: Yup.string().required().label('Atua como'),
    utilizador: Yup.mixed().required().label('Colaborador'),
    residencia: Yup.string().required().label('Residência'),
    cni: Yup.string().required().label('Doc. identificação'),
    balcao: Yup.number().positive().required().label('Bacão'),
    local_emissao: Yup.string().required().label('Local emissão'),
    data_emissao: Yup.date().typeError().required().label('Data de nacimento'),
  });

  const defaultValues = useMemo(
    () => ({
      bi: selectedItem?.bi ?? '',
      nif: selectedItem?.nif ?? '',
      cni: selectedItem?.cni ?? '',
      nome: selectedItem?.nome ?? '',
      funcao: selectedItem?.funcao ?? '',
      balcao: selectedItem?.balcao ?? '',
      atua_como: selectedItem?.atua_como ?? '',
      concelho: selectedItem?.concelho || null,
      freguesia: selectedItem?.freguesia || null,
      residencia: selectedItem?.residencia ?? '',
      observacao: selectedItem?.observacao ?? '',
      ativo: isEdit ? selectedItem?.ativo : true,
      local_emissao: selectedItem?.local_emissao || null,
      data_emissao: fillData(selectedItem?.data_emissao, null),
      utilizador: colaboradoresList?.find((row) => row?.id === selectedItem?.utilizador_id) || null,
    }),
    [colaboradoresList, isEdit, selectedItem]
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
              removerPropriedades(
                {
                  ...values,
                  sexo: values?.utilizador?.sexo,
                  email: values?.utilizador?.email,
                  utilizador_id: values?.utilizador?.id,
                  estado_civil: values?.utilizador?.estado_civil,
                  data_emissao: values?.data_emissao ? format(values.data_emissao, 'yyyy-MM-dd') : null,
                },
                ['utilizador']
              ),
              isEdit,
              dispatch,
              'representantes',
              onCancel
            )
          )}
        >
          <ItemComponent item={selectedItem} rows={5}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <Stack spacing={3} direction="row" sx={{ width: '100%' }}>
                  <RHFAutocompleteObj
                    name="utilizador"
                    label="Colaborador"
                    options={colaboradoresList}
                    onChange={(event, newValue) => {
                      setValue('utilizador', newValue, vsv);
                      setValue('nome', newValue?.label ?? '', vsv);
                      setValue('balcao', newValue?.balcao ?? '', vsv);
                      setValue('funcao', newValue?.funcao ?? '', vsv);
                      setValue('atua_como', newValue?.funcao ?? '', vsv);
                      setValue('concelho', newValue?.concelho || null, vsv);
                      setValue('residencia', newValue?.residencia ?? '', vsv);
                    }}
                  />
                  <RHFNumberField label="Balcão" name="balcao" sx={{ maxWidth: 120 }} />
                </Stack>
                <RHFTextField name="nome" label="Nome completo" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <Stack spacing={3} direction="row" sx={{ width: { sm: '50%' } }}>
                  <RHFTextField name="nif" label="NIF" />
                  <RHFTextField name="cni" label="Doc. identificação" />
                </Stack>
                <Stack spacing={3} direction="row" sx={{ width: { sm: '50%' } }}>
                  <RHFTextField name="local_emissao" label="Local de emissão" />
                  <RHFDatePicker disableFuture name="data_emissao" label="Data de emissão" />
                </Stack>
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFTextField name="funcao" label="Função" />
                <RHFTextField name="atua_como" label="Atua como" />
              </Stack>
              <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                <RHFAutocompleteSmp
                  name="concelho"
                  label="Concelho"
                  options={[...new Set(freguesiasConcelhos?.map((row) => row?.concelho))]?.sort()}
                />
                <RHFAutocompleteSmp
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

// ---------------------------------------------------------------------------------------------------------------------

export function submitDados(id, values, isEdit, dispatch, item, onCancel) {
  const params = { id, msg: `Item ${isEdit ? 'atualizado' : 'adicionado'}`, onClose: onCancel || null };
  if (isEdit) dispatch(updateItem(item, JSON.stringify(values), params));
  else dispatch(createItem(item, JSON.stringify(values), params));
}
