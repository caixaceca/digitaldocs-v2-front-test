import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, DialogTitle, DialogActions, DialogContent } from '@mui/material';
// redux
import { createItem } from '../../redux/slices/intranet';
import { useDispatch, useSelector } from '../../redux/store';
// components
import { FormProvider, RHFTextField, RHFUploadSingleFile } from '../../components/hook-form';

// ----------------------------------------------------------------------

FormSugestao.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func };

export function FormSugestao({ open, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail } = useSelector((state) => state.intranet);
  const { done, error, isLoading } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (done === 'sugestao') {
      enqueueSnackbar('Sugestão enviada com sucesso. Obrigado(a)!', { variant: 'success' });
      onCancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({
    titulo: Yup.string().required('Título não pode ficar vazio'),
    descricao: Yup.string().required('Descrção não pode ficar vazio'),
  });

  const defaultValues = useMemo(() => ({ titulo: '', descricao: '', imagem: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('titulo', values.titulo);
      formData.append('descricao', values.descricao);
      if (values.imagem instanceof File) {
        formData.append('imagem', values.imagem);
      }
      dispatch(createItem('sugestao', formData, { mail, mensagem: 'sugestao' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDropSingle = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue('imagem', Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [setValue]
  );

  return (
    <>
      <DialogTitle>Deixe-nos a tua sugestão/feedback</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <RHFTextField name="titulo" label="Título" />
            </Grid>
            <Grid item xs={12}>
              <RHFTextField multiline minRows={6} maxRows={8} name="descricao" label="Descrição" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadSingleFile name="imagem" onDrop={handleDropSingle} />
            </Grid>
          </Grid>
          <DialogActions sx={{ pb: '0px !important', px: '0px !important', mt: 3 }}>
            <Box sx={{ flexGrow: 1 }} />
            <LoadingButton variant="outlined" color="inherit" onClick={onCancel}>
              Cancelar
            </LoadingButton>
            <LoadingButton type="submit" variant="contained" loading={isLoading}>
              Enviar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </DialogContent>
    </>
  );
}
