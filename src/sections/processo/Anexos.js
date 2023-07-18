import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import { Grid, Button, Divider, Skeleton, Typography } from '@mui/material';
// utils
import { getFileFormat, getFileThumb, b64toBlob } from '../../utils/getFileFormat';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getAnexo, resetAnexo } from '../../redux/slices/digitaldocs';
//
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
  const { anexo, filePreview, previewType, isLoadingAnexo } = useSelector((state) => state.digitaldocs);
  const anexosAtivos = anexos?.filter((row) => row.is_ativo);
  const anexosInativos = anexos?.filter((row) => !row.is_ativo);
  const isPdf = anexosAtivos?.[0]?.conteudo === 'application/pdf';
  const isImg = getFileFormat(anexosAtivos?.[0]?.anexo) === 'image';
  const [selectedAnexoPreview, setSelectedAnexoPreview] = useState(
    (anexosAtivos?.[0]?.conteudo && isPdf) || (anexosAtivos?.[0]?.anexo && isImg) ? anexosAtivos?.[0] : null
  );

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
    const isPdf_ = anexo?.conteudo === 'application/pdf';
    const isImg_ = getFileFormat(anexo?.anexo) === 'image';

    if (isPdf_ || isImg_) {
      setSelectedAnexoPreview(anexo);
    } else {
      setSelectedAnexo(anexo);
    }
    dispatch(
      getAnexo(
        isPdf_ || isImg_ ? 'filepreview' : 'anotherone',
        anexo.anexo,
        (isPdf_ && 'pdf') || (isImg_ && 'image') || '',
        mail
      )
    );
  };

  useEffect(() => {
    if ((isPdf || isImg) && !filePreview?.ficheiro) {
      dispatch(getAnexo('filepreview', anexosAtivos?.[0]?.anexo, (isPdf && 'pdf') || (isImg && 'image'), mail));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, mail, anexosAtivos?.[0], filePreview?.ficheiro]);

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
          <Skeleton variant="text" sx={{ height: 600, transform: 'scale(1)', mb: 1 }} />
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
                        {row?.nome}
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
                          {row?.nome}
                        </Button>
                      )
                  )}
                </Grid>
              </RoleBasedGuard>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
