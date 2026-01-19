import * as Yup from 'yup';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fillData } from '../../utils/formatTime';
import { emailCheck } from '../../utils/validarAcesso';
import { subtractArrays } from '../../utils/formatObject';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { createItem, updateItem, deleteItem } from '../../redux/slices/parametrizacao';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFDatePicker,
  RHFAutocompleteSmp,
  RHFAutocompleteObj,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import ListSelect from '../../components/ListSelect';
import { FormLoading } from '../../components/skeleton';
import { DialogButons } from '../../components/Actions';
import { SearchNotFoundSmall } from '../../components/table';
import { shapeDate } from '../../components/hook-form/yup-shape';
// _mock
import { codacessos, objetos, listaFreguesias } from '../../_mock';

// ---------------------------------------------------------------------------------------------------------------------

export function AcessoForm({ perfilIdA, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    objeto: Yup.mixed().required().label('Objeto'),
    acesso: Yup.mixed().required().label('Acesso'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilIDCC: perfilId,
      perfilID: Number(perfilIdA),
      datalimite: selectedItem?.datalimite ? new Date(selectedItem?.datalimite) : null,
      objeto: selectedItem?.objeto ? objetos?.find(({ id }) => id === selectedItem?.objeto) : null,
      acesso: selectedItem?.acesso ? codacessos?.find(({ id }) => id === selectedItem?.acesso) : null,
    }),
    [selectedItem, perfilIdA, perfilId]
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
      const formData = { ...values, objeto: values.objeto.id, acesso: values.acesso.id };
      const params = { id: selectedItem?.id, msg: `Acesso ${isEdit ? 'atualizado' : 'atribuido'}`, onClose };
      dispatch((isEdit ? updateItem : createItem)('acessos', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{selectedItem ? 'Editar acesso' : 'Adicionar acesso'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="objeto" label="Objeto" options={objetos} />
            <RHFAutocompleteObj name="acesso" label="Acesso" options={codacessos} />
            <RHFDatePicker dateTime name="datalimite" label="Data de término" />
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function MotivoPendenciaForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ motivo: Yup.string().required().label('Motivo') });
  const defaultValues = useMemo(
    () => ({ motivo: selectedItem?.motivo || '', obs: selectedItem?.obs || '' }),
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
    try {
      const params = { id: selectedItem?.id, msg: `Motivo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('motivosPendencia', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="motivo" label="Motivo" />
            <RHFTextField name="obs" label="Observação" />
          </Stack>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onClose={onClose}
            desc={isEdit ? 'eliminar este motivo' : ''}
            handleDelete={() =>
              dispatch(deleteItem('motivosPendencia', { id: selectedItem?.id, msg: 'Motivo eliminado' }))
            }
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function MotivoTransicaoForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [fluxosAtribuidos, setFluxosAtribuidos] = useState([]);
  const { isEdit, isSaving, selectedItem, fluxos } = useSelector((state) => state.parametrizacao);

  const fluxosList = useMemo(
    () => fluxos?.filter((item) => item?.is_ativo)?.map(({ id, assunto }) => ({ id, label: assunto })) || [],
    [fluxos]
  );
  const fluxosExistentes = useMemo(
    () => selectedItem?.fluxos?.map(({ id, fluxo }) => ({ id, label: fluxo })) || [],
    [selectedItem?.fluxos]
  );
  const fluxosDisponiveis = useMemo(
    () => (fluxosList?.length > 0 ? subtractArrays(fluxosList, fluxosExistentes) : []),
    [fluxosList, fluxosExistentes]
  );

  useEffect(() => {
    setFluxosAtribuidos(selectedItem?.fluxos?.map(({ id, fluxo }) => ({ id, label: fluxo })) || []);
  }, [selectedItem?.fluxos]);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({
      designacao: selectedItem?.designacao || '',
      observacao: selectedItem?.observacao || '',
      ativo: isEdit ? selectedItem?.ativo : true,
      imputavel: selectedItem?.imputavel || false,
      para_seguimento: !!selectedItem?.para_seguimento,
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
    try {
      const formData = { ...values, fluxos: fluxosAtribuidos.length > 0 ? fluxosAtribuidos.map(({ id }) => id) : null };
      const params = { id: selectedItem?.id, msg: `Motivo ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('motivosTransicao', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };
  const readOnly = isEdit && selectedItem?.designacao === 'AGUARDA INFORMAÇÕES COMPLEMENTARES';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar motivo' : 'Adicionar motivo'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={3}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ width: 1 }}>
                  <RHFTextField name="designacao" label="Motivo" InputProps={{ readOnly }} />
                  {readOnly && (
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'info.main' }}>
                      *A designação não pode ser alterada, está em uso para validações na aplicação
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: 1 }}>
                  <RHFTextField name="observacao" label="Observação" />
                </Box>
              </Stack>
              <Stack direction="row" spacing={3}>
                <RHFSwitch name="para_seguimento" label="Seguimento" />
                <RHFSwitch name="imputavel" label="Imputável" />
                {isEdit && <RHFSwitch name="ativo" label="Ativo" />}
              </Stack>
              <ListSelect
                atribuidos={fluxosExistentes}
                disponiveis={fluxosDisponiveis}
                changeItems={(items) => setFluxosAtribuidos(items)}
              />
            </Stack>
            <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function OrigemForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { perfilId } = useSelector((state) => state.intranet);
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    tipo: Yup.mixed().required().label('Tipo'),
    ilha: Yup.mixed().required().label('Ilha'),
    cidade: Yup.mixed().required().label('Concelho'),
    designacao: Yup.string().required().label('Designação'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: perfilId,
      email: selectedItem?.email || '',
      tipo: selectedItem?.tipo || null,
      ilha: selectedItem?.ilha || null,
      codigo: selectedItem?.codigo || '',
      cidade: selectedItem?.cidade || null,
      telefone: selectedItem?.telefone || '',
      seguimento: selectedItem?.seguimento || '',
      observacao: selectedItem?.observacao || '',
      designacao: selectedItem?.designacao || '',
    }),
    [selectedItem, perfilId]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const onSubmit = async () => {
    try {
      const params = { id: selectedItem?.id, msg: `Origem ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('origens', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar origem' : 'Adicionar origem'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={5}>
            <Grid container spacing={3} sx={{ pt: 3 }}>
              <GridItem children={<RHFTextField name="designacao" label="Designação" />} />
              <GridItem children={<RHFTextField name="seguimento" label="Segmento" />} />
              <GridItem sm={6} children={<RHFTextField name="codigo" label="Código" />} />
              <GridItem sm={6}>
                <RHFAutocompleteSmp name="tipo" label="Tipo" options={['Fiscal', 'Judicial']} />
              </GridItem>
              <GridItem sm={6}>
                <RHFAutocompleteSmp
                  name="ilha"
                  label="Ilha"
                  onChange={(event, value) => {
                    setValue('ilha', value);
                    setValue('cidade', null);
                  }}
                  options={[...new Set(listaFreguesias.map(({ ilha }) => ilha))]?.sort()}
                />
              </GridItem>
              <GridItem sm={6}>
                <RHFAutocompleteSmp
                  name="cidade"
                  label="Concelho"
                  options={[
                    ...new Set(listaFreguesias?.filter((f) => f?.ilha === values?.ilha).map((c) => c?.concelho)),
                  ]?.sort()}
                />
              </GridItem>
              <GridItem sm={6} children={<RHFTextField name="email" label="Email" />} />
              <GridItem sm={6} children={<RHFTextField name="telefone" label="Telefone" />} />
              <GridItem children={<RHFTextField name="observacao" multiline rows={2} label="Observação" />} />
            </Grid>
            <DialogButons
              edit={isEdit}
              isSaving={isSaving}
              onClose={onClose}
              desc={isEdit ? 'eliminar esta origem' : ''}
              handleDelete={() => dispatch(deleteItem('origens', { id: selectedItem?.id, msg: 'Origem eliminada' }))}
            />
          </ItemComponent>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function LinhaForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedItem, isEdit, isSaving } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    linha: Yup.string().required().label('Designação'),
    descricao: Yup.mixed().required().label('Segmento'),
  });
  const defaultValues = useMemo(
    () => ({
      linha: selectedItem?.linha || '',
      descricao: selectedItem?.descricao || null,
      funcionario: selectedItem?.funcionario || false,
    }),
    [selectedItem]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const params = { id: selectedItem?.id, msg: `Linha ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('linhas', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDelete = () => {
    dispatch(deleteItem('linhas', { linhaID: selectedItem?.id, msg: 'Linha eliminada' }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar linha de crédito' : 'Adicionar linha de crédito'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="linha" label="Designação" />
            <RHFAutocompleteSmp
              name="descricao"
              label="Segmento"
              options={['Empresa', 'Particular', 'Produtor Individual', 'Entidade Pública']}
            />
            <RHFSwitch name="funcionario" label="Funcionário" />
          </Stack>
          <DialogButons
            edit={isEdit}
            isSaving={isSaving}
            onClose={onClose}
            handleDelete={handleDelete}
            desc={isEdit ? 'eliminar esta linha de crédito' : ''}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function DespesaForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({ designacao: Yup.string().required().label('Designação') });
  const defaultValues = useMemo(
    () => ({
      descricao: selectedItem?.descricao || '',
      designacao: selectedItem?.designacao || '',
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
    try {
      const params = { id: selectedItem?.id, msg: `Despesa ${isEdit ? 'atualizada' : 'adicionada'}` };
      dispatch((isEdit ? updateItem : createItem)('despesas', JSON.stringify(values), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar despesa' : 'Adicionar despesa'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <ItemComponent item={selectedItem} rows={2}>
            <Stack spacing={3} sx={{ pt: 3 }}>
              <RHFTextField name="designacao" label="Designação" />
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

export function DocumentoForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, selectedItem } = useSelector((state) => state.parametrizacao);

  const formSchema = Yup.object().shape({
    tipo: Yup.mixed().required().label('Tipo'),
    codigo: Yup.string().required().label('Código'),
    designacao: Yup.string().required().label('Designação'),
    data_formulario: shapeDate('Data', 'Formulário', '', 'tipo'),
    titulo: Yup.mixed().when('formulario', { is: true, then: () => Yup.string().required().label('Título') }),
    sub_titulo: Yup.mixed().when('formulario', { is: true, then: () => Yup.string().required().label('Subtítulo') }),
  });

  const defaultValues = useMemo(
    () => ({
      codigo: selectedItem?.codigo || '',
      pagina: selectedItem?.pagina || '',
      titulo: selectedItem?.titulo || '',
      designacao: selectedItem?.designacao || '',
      sub_titulo: selectedItem?.sub_titulo || '',
      ativo: isEdit ? selectedItem?.ativo : true,
      identificador: selectedItem?.identificador || false,
      data_formulario: fillData(selectedItem?.data_formulario, null),
      obriga_prazo_validade: selectedItem?.obriga_prazo_validade || false,
      tipo: (selectedItem?.anexo && 'Anexo') || (selectedItem?.formulario && 'Formulário') || null,
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
    try {
      const formData = {
        ...values,
        anexo: values.tipo === 'Anexo',
        formulario: values.tipo === 'Formulário',
        titulo: values?.formulario ? values?.titulo : null,
        sub_titulo: values?.formulario ? values?.sub_titulo : null,
        data_formulario:
          values?.formulario && values?.data_formulario ? format(values.data_formulario, 'yyyy-MM-dd') : null,
      };
      const params = { id: selectedItem?.id, msg: `Documento ${isEdit ? 'atualizado' : 'adicionado'}` };
      dispatch((isEdit ? updateItem : createItem)('documentos', JSON.stringify(formData), params));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar documento' : 'Adicionar documento'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          {isEdit &&
          !emailCheck(mail) &&
          (selectedItem?.designacao === 'OUTROS' || selectedItem?.designacao === 'ATA - PARECER DE CRÉDITO') ? (
            <Stack sx={{ pt: 3, pb: 1 }}>
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'info.main' }}>
                Este documento não pode ser editado, está em uso para validações na aplicação.
              </Typography>
            </Stack>
          ) : (
            <ItemComponent item={selectedItem} rows={3}>
              <Grid container spacing={3} justifyContent="center" sx={{ pt: 3 }}>
                <GridItem children={<RHFTextField name="codigo" label="Código" />} />
                <GridItem children={<RHFTextField name="designacao" label="Designação" />} />
                <GridItem xs={values?.tipo === 'Anexo' ? 12 : 6} sm={values?.tipo === 'Anexo' ? 4 : 6}>
                  <RHFAutocompleteSmp name="tipo" label="Tipo" options={['Anexo', 'Formulário']} />
                </GridItem>
                {values?.tipo === 'Anexo' && (
                  <>
                    <GridItem xs={4} children={<RHFSwitch mt name="identificador" label="Identificador" />} />
                    <GridItem xs={4} children={<RHFSwitch mt name="obriga_prazo_validade" label="Validade" />} />
                  </>
                )}
                {values?.tipo === 'Formulário' && (
                  <>
                    <GridItem xs={6} children={<RHFDatePicker name="data_formulario" label="Data" />} />
                    <GridItem children={<RHFTextField name="titulo" label="Título" />} />
                    <GridItem children={<RHFTextField name="sub_titulo" label="Subtítulo" />} />
                  </>
                )}
                {isEdit && <GridItem children={<RHFSwitch name="ativo" label="Ativo" />} />}
              </Grid>
              <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
            </ItemComponent>
          )}
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ItemComponent({ item, rows, children }) {
  const { isLoading, isEdit } = useSelector((state) => state.parametrizacao);
  return isLoading ? (
    <GridItem children={<FormLoading rows={rows} />} />
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
