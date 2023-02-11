import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useCallback } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Dialog, TextField, Autocomplete, DialogTitle, DialogContent, DialogActions } from '@mui/material';
// redux
import { useSelector, useDispatch } from '../../redux/store';
import { encaminharProcesso, resetItem } from '../../redux/slices/digitaldocs';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';
// components
import { FormProvider, RHFTextField, RHFUploadMultiFile } from '../../components/hook-form';

// ----------------------------------------------------------------------

IntervencaoForm.propTypes = {
  title: PropTypes.object,
  onCancel: PropTypes.func,
  destinos: PropTypes.array,
  processo: PropTypes.object,
  isOpenModal: PropTypes.object,
};

export default function IntervencaoForm({ isOpenModal, title, onCancel, destinos, processo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, error, isSaving } = useSelector((state) => state.digitaldocs);
  const { mail, currentColaborador } = useSelector((state) => state.colaborador);

  useEffect(() => {
    if (done === 'realizada') {
      enqueueSnackbar('Intervenção realizada com sucesso', { variant: 'success' });
      dispatch(resetItem('processo'));
      navigate(PATH_DIGITALDOCS.processos.root);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const IntervencaoSchema = Yup.object().shape({
    observacao: title === 'Devolver' && Yup.string().required('Observação não pode ficar vazio'),
    acao: Yup.mixed().nullable('Ação não pode ficar vazio').required('Ação não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({
      anexos: [],
      noperacao: '',
      observacao: '',
      acao: destinos?.length === 1 ? destinos?.[0] : null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processo]
  );

  const methods = useForm({ resolver: yupResolver(IntervencaoSchema), defaultValues });

  const { reset, watch, control, setValue, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    if (processo) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processo, isOpenModal]);

  const onSubmit = async () => {
    try {
      let haveAnexos = false;
      const formData = {
        modo: values?.acao?.modo,
        noperacao: values.noperacao,
        observacao: values.observacao,
        transicaoID: values?.acao?.id,
        perfilID: currentColaborador?.perfil_id,
        estado_finalID: values?.acao?.estado_final_id,
      };
      const formDataAnexos = new FormData();
      if (values?.anexos?.length > 0) {
        haveAnexos = true;
        formDataAnexos.append('perfilID', currentColaborador?.perfil_id);
        const listaanexo = values.anexos;
        for (let i = 0; i < listaanexo.length; i += 1) {
          formDataAnexos.append('anexos', listaanexo[i]);
        }
      }
      dispatch(encaminharProcesso(processo.id, JSON.stringify(formData), haveAnexos, formDataAnexos, mail));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const anexos = values.anexos || [];
      setValue('anexos', [
        ...anexos,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    },
    [setValue, values.anexos]
  );

  const handleRemoveAll = () => {
    setValue('anexos', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.anexos && values.anexos?.filter((_file) => _file !== file);
    setValue('anexos', filteredItems);
  };

  return (
    <Dialog open={isOpenModal} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ minWidth: { sm: 600 } }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Controller
                name="acao"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    {...field}
                    fullWidth
                    onChange={(event, newValue) => field.onChange(newValue)}
                    options={destinos?.map((option) => option)}
                    getOptionLabel={(option) => `${option?.modo} para ${option?.estado_final_label}`}
                    renderInput={(params) => (
                      <TextField {...params} label="Ação" error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            {values?.acao?.hasopnumero && (
              <Grid item xs={12}>
                <RHFTextField name="noperacao" required label="Nº de operação" InputProps={{ type: 'number' }} />
              </Grid>
            )}
            <Grid item xs={12}>
              <RHFTextField name="observacao" multiline minRows={5} maxRows={8} label="Observação" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadMultiFile
                name="anexos"
                onDrop={handleDrop}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isSaving}>
              Enviar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
