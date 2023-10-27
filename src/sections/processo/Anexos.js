import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// utils
import { getFileFormat, getFileThumb, b64toBlob } from '../../utils/getFileFormat';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAnexo, resetAnexo } from '../../redux/slices/digitaldocs';
// components
import { Loading } from '../../components/LoadingScreen';
//
import ModelosRespostas from './ModelosRespostas';
import { PdfPreview, ImagemPreview } from './FilePreview';
// guards
import RoleBasedGuard from '../../guards/RoleBasedGuard';

// ----------------------------------------------------------------------

Anexos.propTypes = { anexos: PropTypes.array };

export default function Anexos({ anexos }) {
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const { mail } = useSelector((state) => state.intranet);
  const [selectedAnexo, setSelectedAnexo] = useState(null);
  const { anexo, filePreview, previewType, isLoadingAnexo, processo } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = anexos?.filter((row) => row.is_ativo);
  const anexosInativos = anexos?.filter((row) => !row.is_ativo);
  const canPreview =
    anexosAtivos?.find((row) => row?.conteudo === 'application/pdf' || getFileFormat(row?.anexo) === 'image') || null;
  const [selectedAnexoPreview, setSelectedAnexoPreview] = useState(canPreview || null);
  const isPdf = canPreview?.conteudo === 'application/pdf';
  const isImg = getFileFormat(canPreview?.anexo) === 'image';

  useEffect(() => {
    if (anexo?.ficheiro) {
      const blob = b64toBlob(anexo?.ficheiro, selectedAnexo.conteudo);
      const link = document.createElement('a');
      link.download = selectedAnexo.nome;
      link.href = window.URL.createObjectURL(blob);
      dispatch(resetAnexo());
      setSelectedAnexo(null);
      link.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anexo?.ficheiro]);

  const handleAnexo = (anexo) => {
    const pdfFile = anexo?.conteudo === 'application/pdf';
    const imgFile = getFileFormat(anexo?.anexo) === 'image';

    if (pdfFile || imgFile) {
      setSelectedAnexoPreview(anexo);
    } else {
      setSelectedAnexo(anexo);
    }
    dispatch(
      getAnexo(
        pdfFile || imgFile ? 'filepreview' : 'anotherone',
        anexo.anexo,
        (pdfFile && 'pdf') || (imgFile && 'image') || '',
        mail
      )
    );
  };

  useEffect(() => {
    if ((isPdf || isImg) && !filePreview?.ficheiro) {
      dispatch(getAnexo('filepreview', canPreview?.anexo, (isPdf && 'pdf') || (isImg && 'image'), mail));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, mail, canPreview, filePreview?.ficheiro]);

  useEffect(() => {
    if (filePreview?.ficheiro) {
      setUrl(URL?.createObjectURL(b64toBlob(filePreview?.ficheiro)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filePreview?.ficheiro]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sx={{ mb: -2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Anexos
        </Typography>
        <Divider />
      </Grid>
      {isLoadingAnexo ? (
        <Grid item xs={12}>
          <Stack direction="column" justifyContent="center" alignItems="center" sx={{ height: { xs: 400, lg: 600 } }}>
            <Loading />
            <Typography sx={{ color: 'text.secondary', mt: 3 }}>Carregando o ficheiro...</Typography>
          </Stack>
        </Grid>
      ) : (
        <>
          {url && previewType === 'pdf' && (
            <Grid item xs={12}>
              <PdfPreview url={url} />
            </Grid>
          )}
          {url && previewType === 'image' && (
            <Grid item xs={12}>
              <ImagemPreview imagem={url} />
            </Grid>
          )}
        </>
      )}
      {(anexosInativos?.length > 0 || anexosAtivos.length > 0) && (
        <Grid item xs={12} id="list_anexos">
          <Grid container spacing={3}>
            {anexosAtivos.length > 0 && (
              <Grid item xs={12}>
                {anexosAtivos.map(
                  (row) =>
                    row?.nome && (
                      <Button
                        fullWidth
                        color="inherit"
                        key={row?.anexo}
                        variant="outlined"
                        onClick={() => handleAnexo(row)}
                        startIcon={getFileThumb(row.nome)}
                        disabled={row?.anexo === selectedAnexoPreview?.anexo}
                        sx={{ justifyContent: 'left', textAlign: 'left', mt: 1, py: 1 }}
                      >
                        {row?.nome} {row?.anexo === selectedAnexoPreview?.anexo && '(Em pré-vizualização)'}
                      </Button>
                    )
                )}
              </Grid>
            )}
            {anexosInativos?.length > 0 && (
              <RoleBasedGuard roles={['Todo-111']}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Eliminados
                  </Typography>
                  {anexosInativos?.map(
                    (row) =>
                      row?.nome && (
                        <Button
                          fullWidth
                          color="inherit"
                          key={row?.anexo}
                          variant="outlined"
                          onClick={() => handleAnexo(row)}
                          startIcon={getFileThumb(row?.nome)}
                          disabled={row?.anexo === selectedAnexoPreview?.anexo}
                          sx={{ justifyContent: 'left', textAlign: 'left', mt: 0.5, opacity: 0.5 }}
                        >
                          {row?.nome} {row?.anexo === selectedAnexoPreview?.anexo && '(Em pré-vizualização)'}
                        </Button>
                      )
                  )}
                </Grid>
              </RoleBasedGuard>
            )}
            {!processo?.is_interno && processo?.nome?.includes('Notas Externas') && processo?.nome !== 'Arquivo' && (
              <ModelosRespostas />
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
