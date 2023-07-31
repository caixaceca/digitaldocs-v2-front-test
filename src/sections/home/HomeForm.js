import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Fab,
  Box,
  Grid,
  Stack,
  Table,
  Dialog,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  InputAdornment,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// utils
import { ptDateTime } from '../../utils/formatTime';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { createItem, getFromIntranet } from '../../redux/slices/intranet';
// components
import { Loading } from '../../components/LoadingScreen';
import { RHFSwitch, FormProvider, RHFTextField, RHFEditor, RHFUploadSingleFile } from '../../components/hook-form';

// ----------------------------------------------------------------------

DenunciaForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func };

export function DenunciaForm({ open, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, done, error, isLoading } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (done === 'denuncia') {
      enqueueSnackbar('Denúncia enviada com sucesso', { variant: 'success' });
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
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
    denuncia: Yup.string().required('Descrição não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({ assunto: '', denuncia: '', contato_or_email: mail, comprovativo: null }),
    [mail]
  );

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
      formData.append('assunto', values.assunto);
      formData.append('denuncia', values.denuncia);
      formData.append('contato_or_email', values.contato_or_email);
      if (values.comprovativo instanceof File) {
        formData.append('comprovativo', values.comprovativo);
      }
      dispatch(createItem('denuncia', formData, { mail, msg: 'denuncia' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const handleDropSingle = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue('comprovativo', Object.assign(file, { preview: URL.createObjectURL(file) }));
      }
    },
    [setValue]
  );

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>Denúncia</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={7}>
              <RHFTextField name="assunto" label="Assunto" />
            </Grid>
            <Grid item xs={12} sm={5}>
              <RHFTextField name="contato_or_email" label="Contacto" />
            </Grid>
            <Grid item xs={12}>
              <RHFEditor simple name="denuncia" />
            </Grid>
            <Grid item xs={12}>
              <RHFUploadSingleFile name="comprovativo" onDrop={handleDropSingle} />
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
    </Dialog>
  );
}

// ----------------------------------------------------------------------

ValidarDocForm.propTypes = { open: PropTypes.bool, onCancel: PropTypes.func };

export function ValidarDocForm({ open, onCancel }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { documento, error, isLoading } = useSelector((state) => state.intranet);

  useEffect(() => {
    if (error && error !== 'field required') {
      enqueueSnackbar(error[0]?.msg || error, { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const formSchema = Yup.object().shape({ documento: Yup.string().required('Introduza o nº do documento') });
  const defaultValues = useMemo(() => ({ documento: '', cache: true }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(getFromIntranet('validar doc', { doc: values.documento, cache: values.cache }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          Validação de documento
          <Stack>
            <Tooltip title="Fechar" arrow>
              <IconButton onClick={onCancel}>
                <CloseOutlinedIcon sx={{ width: 20, opacity: 0.75 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Stack sx={{ px: 1.5 }}>
                  <RHFSwitch name="cache" labelPlacement="start" label="Cache" />
                </Stack>

                <RHFTextField
                  maxWidth
                  name="documento"
                  label="Documento"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Fab size="small" type="submit" variant="soft" loading={isLoading}>
                          <SearchIcon />
                        </Fab>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Grid>
            {isLoading ? (
              <Grid item xs={12}>
                <Stack direction="column" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
                  <Loading />
                </Stack>
              </Grid>
            ) : (
              <>
                {documento && (
                  <Grid item xs={12}>
                    <Table size="small">
                      {documento?.caregadoEm && (
                        <TableHead>
                          <TableRow>
                            <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              Data carregamento
                            </TableCell>
                            <TableCell>{ptDateTime(documento.caregadoEm)}</TableCell>
                          </TableRow>
                        </TableHead>
                      )}
                      <TableBody>
                        {documento?.id_tp_doc && <TableRowItem title="Tipo de documento" desc={documento?.id_tp_doc} />}
                        {documento?.NUM_DOCUMENTO && (
                          <TableRowItem title="Nº do documento" desc={documento?.NUM_DOCUMENTO} />
                        )}
                        {documento?.NOME_COMPLETO && (
                          <TableRowItem title="Nome completo" desc={documento?.NOME_COMPLETO} />
                        )}
                        {documento?.nome_normaliz && (
                          <TableRowItem title="Nome normalizado" desc={documento?.nome_normaliz} />
                        )}
                        {documento?.NOME_MAE_COMPLETO && (
                          <TableRowItem title="Nome da Mãe" desc={documento?.NOME_MAE_COMPLETO} />
                        )}
                        {documento?.NOME_PAI_COMPLETO && (
                          <TableRowItem title="Nome do Pai" desc={documento?.NOME_PAI_COMPLETO} />
                        )}
                        {documento?.DATA_NASC && (
                          <TableRowItem title="Data de nascimento" desc={documento?.DATA_NASC} />
                        )}
                        {documento?.SEXO && <TableRowItem title="Sexo" desc={documento?.SEXO} />}
                        {documento?.NIF && <TableRowItem title="NIF" desc={documento?.NIF} />}
                        {documento?.FREGUESIA_ID && (
                          <TableRowItem title="ID Freguêsia" desc={documento?.FREGUESIA_ID} />
                        )}
                        {documento?.ID_CIVIL && <TableRowItem title="ID Estado civil" desc={documento?.ID_CIVIL} />}
                        {documento?.LOCALIDADE_ID && (
                          <TableRowItem title="ID Localidade" desc={documento?.LOCALIDADE_ID} />
                        )}
                        {documento?.PAIS_ID && <TableRowItem title="ID País" desc={documento?.PAIS_ID} />}
                      </TableBody>
                    </Table>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

TableRowItem.propTypes = { title: PropTypes.string, desc: PropTypes.string };

function TableRowItem({ title, desc }) {
  return (
    <TableRow hover>
      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {title}
      </TableCell>
      <TableCell>{desc}</TableCell>
    </TableRow>
  );
}
