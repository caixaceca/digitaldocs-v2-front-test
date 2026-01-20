import * as Yup from 'yup';
import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// utils
import useAnexos from '../../hooks/useAnexos';
import { useDispatch, useSelector } from '../../redux/store';
import { getSuccess, getFromIntranet, createItem } from '../../redux/slices/intranet';
// components
import {
  RHFEditor,
  FormProvider,
  RHFTextField,
  RHFAutocompleteSmp,
  RHFUploadSingleFile,
} from '../../components/hook-form';
import GridItem from '../../components/GridItem';
import { DialogButons } from '../../components/Actions';

// ---------------------------------------------------------------------------------------------------------------------

export function FormSugestao({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isSaving } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({
    titulo: Yup.string().required('Título não pode ficar vazio'),
    descricao: Yup.string().required('Descrção não pode ficar vazio'),
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { titulo: '', descricao: '', imagem: '' },
  });
  const { setValue, handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('titulo', values.titulo);
      formData.append('descricao', values.descricao);
      if (values.imagem instanceof File) formData.append('imagem', values.imagem);
      dispatch(createItem('sugestao', formData, { msg: 'Sugestão enviada', onClose }));
    } catch {
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

// ---------------------------------------------------------------------------------------------------------------------

export function DenunciaForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { mail, isSaving } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({
    assunto: Yup.string().required('Assunto não pode ficar vazio'),
    denuncia: Yup.string().required('Descrição não pode ficar vazio'),
  });

  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { assunto: '', denuncia: '', contato_or_email: mail, comprovativo: null },
  });
  const { setValue, handleSubmit } = methods;

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('assunto', values.assunto);
      formData.append('denuncia', values.denuncia);
      formData.append('contato_or_email', values.contato_or_email);
      if (values.comprovativo instanceof File) formData.append('comprovativo', values.comprovativo);
      dispatch(createItem('denuncia', formData, { msg: 'Denúncia enviada', onClose }));
    } catch {
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

// ---------------------------------------------------------------------------------------------------------------------

export function ConsultarDocForm() {
  const dispatch = useDispatch();
  const { docPdex, isLoading } = useSelector((state) => state.intranet);

  const defaultValues = useMemo(
    () => ({
      numDoc: docPdex?.numDoc ?? '',
      nifSearch: docPdex?.nifSearch ?? '',
      nomeSearch: docPdex?.nomeSearch ?? '',
      tipoSearch: docPdex?.tipoSearch ?? null,
    }),
    [docPdex]
  );
  const methods = useForm({ defaultValues });
  const { control, setValue, handleSubmit } = methods;
  const values = useWatch({ control });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(() => dispatch(getFromIntranet('docPdex', values)))}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 2 }}>
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexGrow: 1 }}>
            <RHFAutocompleteSmp
              label="Tipo"
              disableClearable
              name="tipoSearch"
              options={[
                'Pesquisar NIF',
                'Pesquisar CNI/BI',
                'Pesquisar CNI pelo Nº de BI',
                'Pesquisar Registo Comercial',
                'Pesquisar por Doc. ID, NIF ou Nome',
              ]}
              onChange={(event, newValue) => {
                setValue('numDoc', '');
                setValue('nifSearch', '');
                setValue('nomeSearch', '');
                setValue('tipoSearch', newValue);
                dispatch(getSuccess({ item: 'docPdex', dados: null }));
              }}
            />
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <RHFTextField name="numDoc" label="Nº de identificação" />
              {values?.tipoSearch === 'Pesquisar por Doc. ID, NIF ou Nome' && (
                <RHFTextField name="nifSearch" label="NIF" />
              )}
            </Stack>
          </Stack>
          {values?.tipoSearch === 'Pesquisar por Doc. ID, NIF ou Nome' && (
            <RHFTextField name="nomeSearch" label="Nome" />
          )}
        </Stack>
        <Stack>
          <Fab
            size="medium"
            type="submit"
            disabled={isLoading || !values.tipoSearch || (!values?.numDoc && !values?.nifSearch && !values?.nomeSearch)}
          >
            <SearchIcon />
          </Fab>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
