import * as Yup from 'yup';
import { useMemo } from 'react';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import { fillData } from '@/utils/formatTime';
import { concelhoToEnum } from '../configuracoes/utils';
import { useSelector, useDispatch } from '@/redux/store';
import { shapeMixed } from '@/components/hook-form/yup-shape';
import { createInSuporte, updateInSuporte, deleteInSuporte } from '@/redux/slices/suporte-cliente';
// components
import { DialogButons } from '@/components/Actions';
import { DialogConfirmar } from '@/components/CustomDialog';
import { FormProvider, RHFTextField, RHFAutocompleteObj, RHFDatePicker } from '@/components/hook-form';

export const DAYS_OF_WEEK = [
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
];

export const EXCEPTION_TYPES = [
  { id: 'CLOSED', label: 'Encerrado' },
  // { id: 'OPEN', label: 'Aberto' },
  { id: 'PARTIAL', label: 'Aberto parcial' },
];

// ---------------------------------------------------------------------------------------------------------------------

export function HorarioForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem, departamentos } = useSelector((state) => state.suporte);

  const agenciaList = useMemo(
    () => departamentos?.filter(({ type }) => type === 'AGENCY')?.map(({ code, name }) => ({ id: code, label: name })),
    [departamentos]
  );

  const formSchema = Yup.object().shape({
    closesAt: Yup.string().nullable().required().label('Fecho'),
    opensAt: Yup.string().nullable().required().label('Abertura'),
    dayOfWeek: Yup.mixed().nullable().required().label('Dia da semana'),
  });

  const defaultValues = useMemo(
    () => ({
      opensAt: selectedItem?.opensAt ?? null,
      closesAt: selectedItem?.closesAt ?? null,
      dayOfWeek: DAYS_OF_WEEK?.find(({ id }) => id === selectedItem?.dayOfWeek) ?? null,
      departmentCode: agenciaList?.find(({ id }) => id === selectedItem?.departmentCode) ?? null,
    }),
    [agenciaList, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    const formData = { ...values, departmentCode: values?.departmentCode?.id, dayOfWeek: values?.dayOfWeek?.id };
    const params = { id: selectedItem?.id, msg: `Horário ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('horario', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar horário' : 'Adicionar horário'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="departmentCode" label="Agência" options={agenciaList} />
            <RHFAutocompleteObj name="dayOfWeek" label="Dia da semana" options={DAYS_OF_WEEK} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <RHFDatePicker timePicker label="Abertura" name="opensAt" />
              <RHFDatePicker timePicker label="Fecho" name="closesAt" />
            </Stack>
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ExcecaoForm({ onClose }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, selectedItem, departamentos } = useSelector((state) => state.suporte);

  const agenciaList = useMemo(
    () => departamentos?.filter(({ type }) => type === 'AGENCY')?.map(({ code, name }) => ({ id: code, label: name })),
    [departamentos]
  );

  const formSchema = Yup.object().shape({
    closesAt: shapeMixed('type', ['PARTIAL'], 'Fecho'),
    opensAt: shapeMixed('type', ['PARTIAL'], 'Abertura'),
    date: Yup.date().typeError().required().label('Data'),
    type: Yup.mixed().nullable().required().label('Estado'),
    description: Yup.string().required().label('Descrição'),
  });

  const defaultValues = useMemo(
    () => ({
      opensAt: selectedItem?.opensAt ?? null,
      closesAt: selectedItem?.closesAt ?? null,
      date: fillData(selectedItem?.date, null),
      description: selectedItem?.description ?? '',
      type: EXCEPTION_TYPES?.find(({ id }) => id === selectedItem?.type) ?? null,
      council: concelhoToEnum?.find(({ id }) => id === selectedItem?.council) ?? null,
      departmentCode: agenciaList?.find(({ id }) => id === selectedItem?.departmentCode) ?? null,
    }),
    [agenciaList, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { setValue, control, handleSubmit } = methods;
  const estado = useWatch({ control, name: 'type' });

  const onSubmit = async (values) => {
    const formData = {
      ...values,
      type: values?.type?.id,
      council: values?.council?.id ?? null,
      departmentCode: values?.departmentCode?.id ?? '',
    };
    const params = { id: selectedItem?.id, msg: `Exceção ${isEdit ? 'atualizado' : 'adicionado'}`, onClose };
    dispatch((isEdit ? updateInSuporte : createInSuporte)('excecoes', JSON.stringify(formData), params));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? 'Editar exceção' : 'Adicionar exceção'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <RHFAutocompleteObj label="Estado" name="type" options={EXCEPTION_TYPES} />
              <RHFDatePicker label="Data" name="date" disablePast />
            </Stack>
            <RHFTextField name="description" label="Descrição" />
            <RHFAutocompleteObj
              label="Agência"
              name="departmentCode"
              options={agenciaList}
              onChange={(e, value) => {
                setValue('departmentCode', value);
                if (value) setValue('council', null);
              }}
            />
            <RHFAutocompleteObj
              name="council"
              label="Concelho"
              options={concelhoToEnum}
              onChange={(e, value) => {
                setValue('council', value);
                if (value) setValue('departmentCode', null);
              }}
            />
            {estado?.id === 'PARTIAL' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <RHFDatePicker timePicker label="Abertura" name="opensAt" />
                <RHFDatePicker timePicker label="Fecho" name="closesAt" />
              </Stack>
            )}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function Eliminar({ item, onClose }) {
  const dispatch = useDispatch();
  const { isSaving, selectedItem } = useSelector((state) => state.suporte);

  return (
    <DialogConfirmar
      onClose={onClose}
      isSaving={isSaving}
      desc="eliminar este item"
      handleOk={() => dispatch(deleteInSuporte(item, { id: selectedItem?.id, msg: 'Item eliminado', onClose }))}
    />
  );
}
