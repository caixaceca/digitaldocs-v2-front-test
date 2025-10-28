import * as Yup from 'yup';
import { useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import useAnexos from '../../hooks/useAnexos';
import { useSelector, useDispatch } from '../../redux/store';
import { createInSuporte, updateInSuporte } from '../../redux/slices/suporte-cliente';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFAutocompleteObj,
  RHFUploadMultiFile,
} from '../../components/hook-form';
import { DialogButons } from '../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export function ActionForm({ id, item = '', onClose: onClose1, closeTicket }) {
  const dispatch = useDispatch();
  const { isEdit, isSaving, departamentos, utilizadores } = useSelector((state) => state.suporte);

  const label = (item === 'assign' && 'Utilizador') || (item === 'change-department' && 'Departamento') || 'Estado';
  const title = (item === 'assign' && 'Atribuir') || (item === 'change-department' && 'Encaminhar') || 'Alterar';

  const usersList = useMemo(() => utilizadores?.map(({ id, username }) => ({ id, label: username })), [utilizadores]);
  const departsList = useMemo(() => departamentos?.map(({ id, name }) => ({ id, label: name })), [departamentos]);

  const itemList = useMemo(() => {
    if (item === 'assign' && Array.isArray(usersList)) return usersList;
    if (item === 'change-department' && Array.isArray(departsList)) return departsList;
    return [
      { id: 'IN_PROGRESS', label: 'Em análise' },
      { id: 'CLOSED', label: 'Fechado' },
    ];
  }, [item, usersList, departsList]);

  const formSchema = Yup.object().shape({ item: Yup.mixed().required().label(label) });
  const defaultValues = useMemo(() => ({ item: null, resolved: false }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async (values) => {
    const onClose = item === 'change-department' ? closeTicket : onClose1;
    const msg = (item === 'assign' && 'atribuido') || (item === 'change-department' && 'encaminhado') || '';
    const params = { id, value: values?.item, resolved: values.resolved, patch: true, getItem: 'selectedItem' };
    dispatch(updateInSuporte(item, null, { ...params, msg: msg ? `Ticket ${msg}` : 'Estado alterado', onClose }));
  };

  return (
    <Dialog open onClose={onClose1} fullWidth maxWidth="xs">
      <DialogTitle>{`${title} ${item === 'change-status' ? ' estado' : 'ticket'}`}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFAutocompleteObj name="item" label={label} options={itemList} />
            {values?.item?.id === 'CLOSED' && <RHFSwitch name="resolved" label="Resolvido" />}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose1} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function MessageForm({ id, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.suporte);

  const formSchema = Yup.object().shape({ message: Yup.string().required().label('Mensagem') });
  const defaultValues = useMemo(() => ({ message: '', to_client: false, attachments: [] }), []);

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async (values) => {
    const formData = new FormData();
    const message = { content: values?.message, visibility: values?.to_client ? 'BOTH' : 'INTERNAL' };
    formData.append('message', new Blob([JSON.stringify(message)], { type: 'application/json' }));
    values?.attachments?.forEach((file) => formData.append('attachments', file));

    const params = { item: 'messages', item1: 'selectedItem', id, msg: 'Mensagem adicionada' };
    dispatch(createInSuporte('add-message', formData, { id, ...params, onClose }));
  };

  const { dropMultiple, removeOne } = useAnexos('', 'attachments', setValue, values?.attachments);

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
