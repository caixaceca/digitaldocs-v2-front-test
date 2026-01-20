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
// redux
import useAnexos from '../../../hooks/useAnexos';
import { applySort, getComparator } from '../../../hooks/useTable';
import { useSelector, useDispatch } from '../../../redux/store';
import { createInSuporte, updateInSuporte } from '../../../redux/slices/suporte-cliente';
// components
import {
  RHFSwitch,
  FormProvider,
  RHFTextField,
  RHFAutocompleteObj,
  RHFUploadMultiFile,
} from '../../../components/hook-form';
import { DialogButons } from '../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export function ActionForm({ dados, item = '', onClose: onClose1, closeTicket }) {
  const dispatch = useDispatch();
  const { colaboradores } = useSelector((state) => state.intranet);
  const { isEdit, isSaving, departamentos, utilizadores } = useSelector((state) => state.suporte);

  const title = (item === 'assign' && 'Atribuir') || (item === 'change-department' && 'Encaminhar') || 'Alterar';
  const label = (item === 'assign' && 'Utilizador') || (item === 'change-department' && 'Departamento') || 'Estado';

  const itemList = useMemo(
    () => buildItemList({ item, colaboradores, utilizadores, departamentos, dados }),
    [item, colaboradores, utilizadores, departamentos, dados]
  );

  const formSchema = Yup.object().shape({ item: Yup.mixed().required().label(label) });
  const defaultValues = useMemo(() => ({ item: null, resolved: false }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { control, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async (values) => {
    const params1 = { patch: true, getItem: 'selectedItem' };
    const onClose = item === 'change-department' ? closeTicket : onClose1;
    const msg = (item === 'assign' && 'atribuido') || (item === 'change-department' && 'encaminhado') || '';
    const params = { id: dados?.id, value: values?.item, status: dados?.status, resolved: values.resolved, ...params1 };
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

export function MessageForm({ dados, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.suporte);

  const formSchema = Yup.object().shape({ message: Yup.string().required().label('Mensagem') });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { message: '', to_client: false, attachments: [] },
  });
  const { control, setValue, handleSubmit } = methods;
  const values = useWatch({ control });

  const onSubmit = async (values) => {
    const formData = new FormData();
    const message = { content: values?.message, visibility: values?.to_client ? 'BOTH' : 'INTERNAL' };
    formData.append('message', new Blob([JSON.stringify(message)], { type: 'application/json' }));
    values?.attachments?.forEach((file) => formData.append('attachments', file));

    const params = { id: dados?.id, item: 'messages', item1: 'selectedItem', msg: 'Mensagem adicionada' };
    dispatch(createInSuporte('add-message', formData, { ...params, status: dados?.status, onClose }));
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

// ---------------------------------------------------------------------------------------------------------------------

function buildItemList({ item, colaboradores, utilizadores, departamentos, dados }) {
  const colaboradoresMap = new Map(colaboradores?.map((c) => [c.id, c.nome]));

  const status = dados?.status;
  const currentDept = dados?.current_department_id;

  const usersList = utilizadores
    ?.filter((ut) => ut?.department_id === currentDept)
    ?.map((ut) => ({ id: ut.id, label: colaboradoresMap.get(ut.employee_id) || ut.username }));

  const departsList = departamentos
    ?.filter((dep) => dep.id !== currentDept)
    ?.map((dep) => ({ id: dep.id, label: dep.name }));

  let itemList;

  switch (item) {
    case 'assign':
      itemList = usersList || [];
      break;

    case 'change-department':
      itemList = departsList || [];
      break;

    case 'change-status':
      itemList =
        status === 'IN_PROGRESS'
          ? [{ id: 'CLOSED', label: 'Fechado' }]
          : [
              { id: 'IN_PROGRESS', label: 'Em análise' },
              { id: 'CLOSED', label: 'Fechado' },
            ];
      break;

    default:
      itemList = [];
  }

  return applySort(itemList, getComparator('asc', 'label'));
}
