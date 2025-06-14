import * as Yup from 'yup';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// hooks
import useAnexos from '../../hooks/useAnexos';
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { createItem, getFromIntranet } from '../../redux/slices/intranet';
// components
import GridItem from '../../components/GridItem';
import { DialogButons } from '../../components/Actions';
import {
  RHFEditor,
  FormProvider,
  RHFTextField,
  RHFAutocompleteSmp,
  RHFUploadSingleFile,
} from '../../components/hook-form';

// ----------------------------------------------------------------------

FormSugestao.propTypes = { onClose: PropTypes.func };

export function FormSugestao({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { done, isSaving } = useSelector((state) => state.intranet);

  useNotificacao({ done, onClose });

  const formSchema = Yup.object().shape({
    titulo: Yup.string().required('Título não pode ficar vazio'),
    descricao: Yup.string().required('Descrção não pode ficar vazio'),
  });

  const defaultValues = useMemo(() => ({ titulo: '', descricao: '', imagem: '' }), []);
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('titulo', values.titulo);
      formData.append('descricao', values.descricao);
      if (values.imagem instanceof File) formData.append('imagem', values.imagem);
      dispatch(createItem('sugestao', formData, { msg: 'Sugestão enviada' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const { dropSingle } = useAnexos('imagem', '', setValue, []);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Deixe-nos a tua sugestão/feedback</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField name="titulo" label="Título" />
            <RHFTextField multiline minRows={6} maxRows={8} name="descricao" label="Descrição" />
            <RHFUploadSingleFile name="imagem" onDrop={dropSingle} />
          </Stack>
          <DialogButons label="Enviar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

DenunciaForm.propTypes = { onClose: PropTypes.func };

export function DenunciaForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, done, isSaving } = useSelector((state) => state.intranet);

  useNotificacao({ done, onClose });

  const formSchema = Yup.object().shape({
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
    denuncia: Yup.string().required('Descrição não pode ficar vazio'),
  });

  const defaultValues = useMemo(
    () => ({ assunto: '', denuncia: '', contato_or_email: mail, comprovativo: null }),
    [mail]
  );

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, setValue, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('assunto', values.assunto);
      formData.append('denuncia', values.denuncia);
      formData.append('contato_or_email', values.contato_or_email);
      if (values.comprovativo instanceof File) formData.append('comprovativo', values.comprovativo);
      dispatch(createItem('denuncia', formData, { msg: 'Denúncia enviada' }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };
  const { dropSingle } = useAnexos('comprovativo', '', setValue, []);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Denúncia</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <GridItem sm={7} children={<RHFTextField name="assunto" label="Assunto" />} />
            <GridItem sm={5} children={<RHFTextField name="contato_or_email" label="Contacto" />} />
            <GridItem children={<RHFEditor simple name="denuncia" />} />
            <GridItem children={<RHFUploadSingleFile name="comprovativo" onDrop={dropSingle} />} />
          </Grid>
          <DialogButons label="Enviar" isSaving={isSaving} onClose={onClose} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

export function ConsultarDocForm() {
  const dispatch = useDispatch();
  const { documentoPdex, isLoading } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({
    tipoSearch: Yup.mixed().required().label('Tipo'),
    numeroSearch: Yup.string().required().label('Nº de identificação'),
  });
  const defaultValues = useMemo(
    () => ({ tipoSearch: documentoPdex?.tipoSearch ?? null, numeroSearch: documentoPdex?.numeroSearch ?? '' }),
    [documentoPdex]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, handleSubmit } = methods;
  const values = watch();

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(() => dispatch(getFromIntranet('documentoPdex', values)))}>
      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
        <RHFAutocompleteSmp name="tipoSearch" label="Tipo" options={['NIF', 'CNI/BI', 'EMPRESA']} />
        <RHFTextField name="numeroSearch" label="Nº de identificação" />
        <Stack sx={{ pt: 0.5 }}>
          <Fab size="medium" type="submit" disabled={isLoading || !values.tipoSearch || !values?.numeroSearch}>
            <SearchIcon />
          </Fab>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
