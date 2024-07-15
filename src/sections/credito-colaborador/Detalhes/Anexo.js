import { useEffect, useState } from 'react';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
// utils
import { b64toBlob } from '../../../utils/getFileFormat';
// redux
import { closeModal } from '../../../redux/slices/cc';
import { useDispatch, useSelector } from '../../../redux/store';
// components
import Image from '../../../components/Image';
import { DTFechar } from '../../../components/Actions';
import { SearchNotFound } from '../../../components/table';
import { Loading } from '../../../components/LoadingScreen';

// ----------------------------------------------------------------------

export default function Anexo() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [url, setUrl] = useState('');
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {} });
  const { isOpenModal, isLoadingAnexo, selectedAnexo, anexo } = useSelector((state) => state.cc);

  useEffect(() => {
    if (anexo?.preview !== 'pdf' && anexo?.preview !== 'image' && anexo?.anexo?.ficheiro) {
      const blob = b64toBlob(anexo?.anexo?.ficheiro, selectedAnexo.conteudo);
      const link = document.createElement('a');
      link.download = anexo?.anexo?.nome;
      link.href = window.URL.createObjectURL(blob);
      link.click();
      dispatch(closeModal());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anexo]);

  useEffect(() => {
    if ((anexo?.preview === 'pdf' || anexo?.preview === 'image') && anexo?.anexo?.ficheiro) {
      setUrl(URL?.createObjectURL(b64toBlob(anexo?.anexo?.ficheiro)));
    }
  }, [anexo]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <Dialog fullScreen open={isOpenModal}>
      <DTFechar title={selectedAnexo?.designacao} handleClick={() => handleCloseModal()} />
      <DialogContent sx={{ mt: 2, px: anexo?.preview === 'pdf' ? 0 : 3, pb: anexo?.preview === 'pdf' ? 0 : 3 }}>
        <Box sx={{ flexGrow: 1, height: '100%' }}>
          {isLoadingAnexo ? (
            <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 1 }}>
              <Loading />
              <Typography sx={{ color: 'text.secondary', mt: 3 }}>Carregando o ficheiro...</Typography>
            </Stack>
          ) : (
            <>
              {!anexo ? (
                <Stack direction="column" alignItems="center" justifyContent="center" sx={{ height: 1 }}>
                  <SearchNotFound message="Ficheiro não encontrado..." />
                </Stack>
              ) : (
                <>
                  {anexo?.preview === 'image' && url && <Image src={url} sx={{ borderRadius: 2 }} />}
                  {anexo?.preview === 'pdf' && url && (
                    <Viewer
                      fileUrl={url}
                      localization={pt}
                      theme={{ theme: theme.palette.mode }}
                      defaultScale={SpecialZoomLevel.PageFit}
                      plugins={[defaultLayoutPluginInstance]}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
