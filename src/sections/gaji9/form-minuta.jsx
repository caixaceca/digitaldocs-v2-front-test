import { useMemo } from 'react';
import PropTypes from 'prop-types';

// form
import { useForm } from 'react-hook-form';
// @mui
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// redux
import { getDocumento } from '../../redux/slices/gaji9';
import { useSelector, useDispatch } from '../../redux/store';
// components
import { DialogButons } from '../../components/Actions';
import { RHFSwitch, FormProvider, RHFNumberField } from '../../components/hook-form';

// ---------------------------------------------------------------------------------------------------------------------

PreviewForm.propTypes = { id: PropTypes.number, onClose: PropTypes.func };

export function PreviewForm({ id = 0, onClose }) {
  const dispatch = useDispatch();
  const { isSaving } = useSelector((state) => state.gaji9);
  const defaultValues = useMemo(() => ({ taxa: '', prazo: '', montante: '', isento: false, representante: false }), []);
  const methods = useForm({ defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    dispatch(getDocumento('minuta', { id, ...values }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ mb: 2 }}>Pré-visualizar minuta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack sx={{ pt: 1 }} spacing={3}>
            <RHFNumberField name="montante" label="Montante" tipo="CVE" />
            <Stack direction="row" spacing={3}>
              <RHFNumberField name="prazo" label="Prazo" />
              <RHFNumberField name="taxa" label="Taxa negociada" tipo="%" />
            </Stack>
            <Stack direction="row" spacing={1}>
              <RHFSwitch name="isento" label="Isento comissão" />
              <RHFSwitch name="representante" label="Com representante" />
            </Stack>
          </Stack>
          <DialogButons label="Pré-visualizar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
