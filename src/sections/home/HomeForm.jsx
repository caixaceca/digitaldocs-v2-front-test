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
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
// utils
import { ptDateTime } from '../../utils/formatTime';
// hooks
import useAnexos from '../../hooks/useAnexos';
import { useNotificacao } from '../../hooks/useNotificacao';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getSuccess, createItem, getFromIntranet } from '../../redux/slices/intranet';
// components
import GridItem from '../../components/GridItem';
import { DialogButons } from '../../components/Actions';
import { Loading } from '../../components/LoadingScreen';
import { DialogTitleAlt } from '../../components/CustomDialog';
import { RHFSwitch, FormProvider, RHFTextField, RHFEditor, RHFUploadSingleFile } from '../../components/hook-form';

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

ValidarDocForm.propTypes = { onClose: PropTypes.func };

export function ValidarDocForm({ onClose }) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { docIdentificacao, isLoading } = useSelector((state) => state.intranet);

  const formSchema = Yup.object().shape({ documento: Yup.string().required('Introduza o nº do documento') });
  const defaultValues = useMemo(
    () => ({ documento: docIdentificacao?.NUM_DOCUMENTO ?? '', cache: false }),
    [docIdentificacao?.NUM_DOCUMENTO]
  );
  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { watch, reset, handleSubmit } = methods;
  const values = watch();

  const onSubmit = async () => {
    try {
      dispatch(getSuccess({ item: 'docIdentificacao', dados: null }));
      dispatch(getFromIntranet('docIdentificacao', { doc: values.documento, cache: !values.cache }));
    } catch (error) {
      enqueueSnackbar('Erro ao submeter os dados', { variant: 'error' });
    }
  };

  const limparDados = () => {
    reset(defaultValues);
    dispatch(getSuccess({ item: 'docIdentificacao', dados: null }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitleAlt title="Validação de documento" onClose={onClose} />
      <DialogContent sx={{ mt: 1 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack spacing={1}>
              <RHFTextField
                maxWidth
                name="documento"
                label="Nº de documento"
                InputProps={{
                  endAdornment: values?.documento && (
                    <InputAdornment position="end">
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Tooltip title="Limpar" arrow>
                          <IconButton onClick={limparDados} sx={{ width: 24, height: 24 }}>
                            <CloseOutlinedIcon sx={{ width: 18, opacity: 0.5 }} />
                          </IconButton>
                        </Tooltip>
                        <Fab size="small" type="submit" variant="soft" loading={isLoading}>
                          <SearchIcon />
                        </Fab>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
              />
              <RHFSwitch name="cache" label="Forçar atualização dos dados" />
            </Stack>
            {isLoading ? (
              <Stack direction="column" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
                <Loading />
              </Stack>
            ) : (
              <>
                {docIdentificacao && (
                  <Table size="small">
                    {docIdentificacao?.caregadoEm && (
                      <TableHead>
                        <TableRow>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            Data carregamento
                          </TableCell>
                          <TableCell>{ptDateTime(docIdentificacao.caregadoEm)}</TableCell>
                        </TableRow>
                      </TableHead>
                    )}
                    <TableBody>
                      <TableRowItem title="Tipo de documento" desc={docIdentificacao?.id_tp_doc} />
                      <TableRowItem title="Nº do documento" desc={docIdentificacao?.NUM_DOCUMENTO} />
                      <TableRowItem title="Nome completo" desc={docIdentificacao?.NOME_COMPLETO} />
                      <TableRowItem title="Nome normalizado" desc={docIdentificacao?.nome_normaliz} />
                      <TableRowItem title="Nome da Mãe" desc={docIdentificacao?.NOME_MAE_COMPLETO} />
                      <TableRowItem title="Nome do Pai" desc={docIdentificacao?.NOME_PAI_COMPLETO} />
                      <TableRowItem title="Data de nascimento" desc={docIdentificacao?.DATA_NASC} />
                      {docIdentificacao?.SEXO && (
                        <TableRowItem
                          title="Sexo"
                          desc={
                            (docIdentificacao?.SEXO === 'F' && 'FEMININO') ||
                            (docIdentificacao?.SEXO === 'M' && 'MASCULINO') ||
                            docIdentificacao?.SEXO
                          }
                        />
                      )}
                      <TableRowItem title="NIF" desc={docIdentificacao?.NIF} />
                      <TableRowItem title="ID Freguêsia" desc={docIdentificacao?.FREGUESIA_ID} />
                      <TableRowItem title="ID Estado civil" desc={docIdentificacao?.ID_CIVIL} />
                      <TableRowItem title="ID Localidade" desc={docIdentificacao?.LOCALIDADE_ID} />
                      <TableRowItem title="ID País" desc={docIdentificacao?.PAIS_ID} />
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

TableRowItem.propTypes = { title: PropTypes.string, desc: PropTypes.string };

function TableRowItem({ title, desc }) {
  return title && desc ? (
    <TableRow hover>
      <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {title}
      </TableCell>
      <TableCell>{desc}</TableCell>
    </TableRow>
  ) : (
    <></>
  );
}
