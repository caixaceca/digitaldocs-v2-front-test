import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import useAnexos from '@/hooks/useAnexos';
import { applySort, getComparator } from '@/hooks/useTable';
import { useSelector, useDispatch } from '@/redux/store';
import { createInSuporte, updateInSuporte } from '@/redux/slices/suporte-cliente';
// components
import { DialogButons } from '@/components/Actions';
import { RHFSwitch, FormProvider, RHFTextField, RHFAutocompleteObj, RHFUploadMultiFile } from '@/components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

const ACTION_CONFIGS = {
  assign: { title: 'Atribuir ticket a um colaborador', label: 'Colaborador', message: 'Assunto alterado' },
  'change-subject': { title: 'Alterar assunto do ticket', label: 'Assunto', message: 'Ticket atribuido' },
  'change-department': { title: 'Encaminhar', label: 'Departamento', message: 'Ticket encaminhado' },
  default: { title: 'Alterar estado do ticket', label: 'Estado', message: 'Estado alterado' },
};

const messageFormSchema = Yup.object().shape({ message: Yup.string().required().label('Mensagem') });
export const actionFormSchema = (label) => Yup.object().shape({ item: Yup.mixed().required().label(label) });

// ---------------------------------------------------------------------------------------------------------------------

export function ActionForm({ dados, item = '', onClose, closeTicket, refetch }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, departamentos, utilizadores, assuntos } = useSelector((state) => state.suporte);

  const config = ACTION_CONFIGS[item] || ACTION_CONFIGS.default;

  const itemList = useMemo(
    () => buildItemList({ item, colaboradores, utilizadores, departamentos, assuntos, dados }),
    [item, colaboradores, utilizadores, departamentos, assuntos, dados]
  );

  const methods = useForm({
    resolver: yupResolver(actionFormSchema(config.label)),
    defaultValues: { item: null, resolved: false, message: '', to_client: false, attachments: [] },
  });

  const { control, setValue, handleSubmit } = methods;

  const messageFieldValue = useWatch({ control, name: 'message' });
  const attachmentsValue = useWatch({ control, name: 'attachments' });
  const hasMsg = useMemo(() => !!messageFieldValue?.trim(), [messageFieldValue]);
  const { dropMultiple, removeOne } = useAnexos('', 'attachments', setValue, attachmentsValue);

  useEffect(() => {
    if (!hasMsg) {
      setValue('attachments', []);
      setValue('to_client', false);
    }
  }, [hasMsg, setValue]);

  const onSubmit = async (values) => {
    const formData = new FormData();
    const resolved = values?.item?.id === 'RESOLVED';
    const value = resolved ? { id: 'CLOSED', label: 'Fechado' } : values?.item;

    if (hasMsg) {
      const messagePayload = { content: values.message, visibility: values?.to_client ? 'BOTH' : 'INTERNAL' };
      formData.append('message', new Blob([JSON.stringify(messagePayload)], { type: 'application/json' }));
      values?.attachments?.forEach((file) => formData.append('attachments', file));
    }

    const isAssunto = item === 'change-subject';
    const params = { id: dados?.id, status: dados?.status, mfd: item !== 'assign', ms: config?.message };
    const params1 = { value, resolved, getItem: isAssunto ? 'selectedItem' : '', refetch, patch: true, ...params };

    dispatch(updateInSuporte(item, formData, { ...params1, onClose: isAssunto ? onClose : closeTicket }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={item === 'assign' ? 'xs' : 'sm'}>
      <DialogTitle>{config.title}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="item" label={config.label} options={itemList} />
            {item !== 'assign' && (
              <>
                <RHFTextField name="message" label="Mensagem" multiline rows={4} />
                {hasMsg && (
                  <>
                    <RHFUploadMultiFile small name="attachments" onDrop={dropMultiple} onRemove={removeOne} />
                    <RHFSwitch name="to_client" label="Mostrar mensagem ao cliente" />
                  </>
                )}
              </>
            )}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function MessageForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.suporte);

  const methods = useForm({
    resolver: yupResolver(messageFormSchema),
    defaultValues: { message: '', to_client: false, attachments: [] },
  });

  const { control, setValue, handleSubmit } = methods;
  const attachmentsValue = useWatch({ control, name: 'attachments' });
  const { dropMultiple, removeOne } = useAnexos('', 'attachments', setValue, attachmentsValue);

  const onSubmit = async (values) => {
    const formData = new FormData();
    const message = { content: values?.message, visibility: values?.to_client ? 'BOTH' : 'INTERNAL' };
    formData.append('message', new Blob([JSON.stringify(message)], { type: 'application/json' }));
    values?.attachments?.forEach((file) => formData.append('attachments', file));

    const params = { id: dados?.id, item: 'messages', item1: 'selectedItem', msg: 'Mensagem adicionada' };
    dispatch(createInSuporte('add-message', formData, { ...params, status: dados?.status, onClose }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar mensagem</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFTextField name="message" label="Mensagem" multiline rows={4} />
            <RHFUploadMultiFile small name="attachments" onDrop={dropMultiple} onRemove={removeOne} />
            <RHFSwitch name="to_client" label="Mostrar mensagem ao cliente" />
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function buildItemList({ item, colaboradores, utilizadores, departamentos, assuntos, dados }) {
  const { status = '', current_department_id: currentDept = '' } = dados || {};

  const sort = (list) => applySort(list || [], getComparator('asc', 'label'));

  switch (item) {
    case 'assign': {
      const colaboradoresMap = new Map(colaboradores?.map((c) => [c.id, c.nome]));
      const filteredUsers = (utilizadores || [])
        .filter((ut) => ut?.department_id === currentDept || ut?.departments?.some((d) => d?.id === currentDept))
        .map((ut) => ({ id: ut.id, label: colaboradoresMap.get(ut.employee_id) || ut.username }));
      return sort(filteredUsers);
    }

    case 'change-department': {
      const filteredDepts = (departamentos || [])
        .filter((dep) => dep.id !== currentDept)
        .map((dep) => ({ id: dep.id, label: dep.name }));
      return sort(filteredDepts);
    }

    case 'change-subject': {
      const filteredSubjects = (assuntos || [])
        .filter(({ name }) => name !== dados?.subject_name)
        .map((row) => ({ ...row, label: row?.name }));
      return sort(filteredSubjects);
    }

    case 'change-status':
      return status === 'IN_PROGRESS'
        ? [
            { id: 'RESOLVED', label: 'Resolvido' },
            { id: 'CLOSED', label: 'Encerrado (Não Resolvido)' },
          ]
        : [
            { id: 'IN_PROGRESS', label: 'Em análise' },
            { id: 'RESOLVED', label: 'Resolvido' },
            { id: 'CLOSED', label: 'Encerrado (Não Resolvido)' },
          ];

    default:
      return [];
  }
}
