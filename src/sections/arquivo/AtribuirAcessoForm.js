import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// redux
import { updateItem } from '../../redux/slices/digitaldocs';
import { useSelector, useDispatch } from '../../redux/store';
// components
import { DialogButons } from '../../components/Actions';
import { FormProvider, RHFAutocompleteObject } from '../../components/hook-form';

// ----------------------------------------------------------------------

AtribuirAcessoForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func, processoId: PropTypes.number };

export default function AtribuirAcessoForm({ open, onCancel, processoId }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, cc, colaboradores } = useSelector((state) => state.intranet);

  const colaboradoresList = colaboradores?.map((row) => ({ id: row?.perfil_id, label: row?.perfil?.displayName }));

  useEffect(() => {
    if (done === 'Acesso atribuido') {
      enqueueSnackbar('Acesso ao processo atribuído com sucesso', { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    perfilID: Yup.mixed().nullable('Colaborador não pode ficar vazio').required('Colaborador não pode ficar vazio'),
    datalimite: Yup.date().typeError('Introduza a data de término').required('Data de término não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      perfilID: null,
      datalimite: null,
      perfilIDCC: cc?.perfil_id,
    }),
    [cc?.perfil_id]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, control, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      values.perfilID = values?.perfilID?.id;
      dispatch(updateItem('dar aceso', JSON.stringify(values), { id: processoId, mail, mensagem: 'Acesso atribuido' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <>
      <DialogTitle>Atribuir acesso</DialogTitle>
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <RHFAutocompleteObject name="perfilID" label="Colaborador" options={colaboradoresList} />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="datalimite"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    label="Data de término"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error, helperText: error?.message, fullWidth: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <DialogButons label="Atribuir" isSaving={isSaving} onCancel={onCancel} />
        </FormProvider>
      </DialogContent>
    </>
  );
}
