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
import { createItem } from '../../../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../../../redux/store';
import { getFromParametrizacao } from '../../../../redux/slices/parametrizacao';
// components
import { DialogButons } from '../../../../components/Actions';
import { FormProvider, RHFTextField, RHFSwitch, RHFUploadSingleFile } from '../../../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

export default function FormParecer({ pId, fluxoId, estadoId, onClose }) {
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
    dispatch(getFromParametrizacao('checklist', { fluxoId, reset: { val: [] } }));
  }, [dispatch, fluxoId]);

  const formSchema = Yup.object().shape({ descritivo: Yup.string().required().label('Descrição') });
  const defaultValues = useMemo(
    () => ({ descritivo: selectedItem?.parecer ?? '', favoravel: selectedItem?.favoravel ?? false, anexo: null }),
    [selectedItem]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      let anexo = null;
      if (values?.anexo instanceof File) {
        const formData = new FormData();
        formData.append('anexo', values.anexo);
        formData.append('tipo_documento_id', ata.tipo_id);
        anexo = formData;
      }
      const formData = { favoravel: values.favoravel, descritivo: values?.descritivo };
      const params = { id: pId, msg: `Parecer ${isEdit ? 'atualizado' : 'enviado'}`, put: true, anexo, estadoId };
      dispatch(createItem('parecer-credito', JSON.stringify(formData), { ...params, onClose }));
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
            <RHFSwitch name="favoravel" label="Parecer favorável" />
            <RHFTextField name="descritivo" label="Descrição" multiline minRows={6} maxRows={10} />
            {ata?.tipo_id && (
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
