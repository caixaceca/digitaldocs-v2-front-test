import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useMemo, useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import useAnexos from '../../../../hooks/useAnexos';
import { useSelector, useDispatch } from '../../../../redux/store';
import { createItem, updateItem } from '../../../../redux/slices/digitaldocs';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
// components
import {
  FormProvider,
  RHFTextField,
  RHFRadioGroup,
  RHFNumberField,
  RHFUploadSingleFile,
} from '../../../../components/hook-form';
import { DialogButons } from '../../../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormParecer({ pId, fluxoId, estadoId, gestor, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { checklist } = useSelector((state) => state.parametrizacao);
  const { isSaving, selectedItem } = useSelector((state) => state.digitaldocs);
  const isEdit = !!selectedItem;
  const ata = useMemo(
    () => checklist?.find(({ designacao }) => designacao === 'ATA - PARECER DE CRÉDITO'),
    [checklist]
  );

  useEffect(() => {
    if (gestor) dispatch(getFromParametrizacao('checklist', { fluxoId, reset: { val: [] } }));
  }, [dispatch, fluxoId, gestor]);

  const formSchema = Yup.object().shape({
    parecer: Yup.string().required().label('Parecer'),
    descritivo: Yup.string().required().label('Descrição'),
  });
  const defaultValues = useMemo(
    () => ({
      anexo: null,
      descritivo: selectedItem?.parecer ?? '',
      parecer: (isEdit && selectedItem?.favoravel && 'Favorável') || (isEdit && 'Não favorável') || '',
    }),
    [isEdit, selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { setValue, handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      let anexo = null;
      if (values?.anexo instanceof File) {
        const formData = new FormData();
        formData.append('anexo', values.anexo);
        formData.append('tipo_documento_id', ata.tipo_id);
        anexo = formData;
      }
      const formData = { favoravel: values.parecer === 'Favorável', descritivo: values?.descritivo };
      const params = { id: pId, msg: `Parecer ${isEdit ? 'atualizado' : 'enviado'}`, put: true, estadoId };
      dispatch(createItem('parecer-credito', JSON.stringify(formData), { ...params, anexo, onClose }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropSingle } = useAnexos('anexo', '', setValue, []);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Editar parecer' : 'Adicionar parecer'}</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <RHFRadioGroup row name="parecer" label="Parecer" options={['Favorável', 'Não favorável']} />
            <RHFTextField name="descritivo" label="Descrição" multiline minRows={6} maxRows={10} />
            {gestor && ata?.tipo_id && (
              <Card sx={{ p: 1, boxShadow: (theme) => theme.customShadows.cardAlt }}>
                <Typography sx={{ pb: 0.5, pl: 0.5, typography: 'overline' }}>ATA DO PARECER</Typography>
                <RHFUploadSingleFile small name="anexo" onDrop={dropSingle} />
              </Card>
            )}
          </Stack>
          <DialogButons edit={isEdit} isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function CondicoesForm({ ids, dados, onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const formSchema = Yup.object().shape({
    prazo: Yup.number().positive().required().label('Prazo'),
    montante: Yup.number().positive().required().label('Montante'),
    taxa_juro: Yup.number().positive().required().label('Taxa de juros'),
  });

  const defaultValues = useMemo(() => dados, [dados]);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      const params = { ...ids, msg: 'Condições alteradas', put: true };
      dispatch(updateItem('condicoes-aprovacao', JSON.stringify(values), { ...params, onClose }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Alterar condições</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 3 }}>
            <RHFNumberField tipo="CVE" name="montante" label="Montante" />
            <Stack spacing={3} direction="row">
              <RHFNumberField name="taxa_juro" tipo="%" label="Taxa de juro" />
              <RHFNumberField name="prazo" tipo="meses" label="Prazo" />
            </Stack>
          </Stack>
          <DialogButons isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
