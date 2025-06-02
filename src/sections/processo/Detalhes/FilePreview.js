import { useState } from 'react';
import PropTypes from 'prop-types';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
// components
import Image from '../../../components/Image';
import LightboxModal from '../../../components/LightboxModal';

// --------------------------------------------------------------------------------------------------------------------------------------------

PdfPreview.propTypes = { url: PropTypes.string };

export function PdfPreview({ url }) {
  const theme = useTheme();
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {}, sidebarTabs: () => [] });
  const heightContent =
    document?.getElementById('detalhes')?.clientHeight - document?.getElementById('anexos')?.clientHeight - 52;

  return (
    <Box sx={{ height: `${heightContent}px`, minHeight: '660px' }}>
      <Viewer
        fileUrl={url}
        localization={pt}
        theme={{ theme: theme.palette.mode }}
        plugins={[defaultLayoutPluginInstance]}
        defaultScale={SpecialZoomLevel.PageWidth}
      />
    </Box>
  );
}

// --------------------------------------------------------------------------------------------------------------------------------------------

ImagemPreview.propTypes = { imagem: PropTypes.string };

export function ImagemPreview({ imagem }) {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleOpenLightbox = () => {
    setOpenLightbox(true);
    setSelectedImage(0);
  };

  return (
    <>
      <Image
        src={imagem}
        sx={{
          borderRadius: 2,
          cursor: 'zoom-in',
          border: '1px solid',
          borderColor: 'divider',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        onClick={() => handleOpenLightbox()}
      />

      <LightboxModal
        mainSrc={imagem}
        images={[imagem]}
        isOpen={openLightbox}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        onCloseRequest={() => setOpenLightbox(false)}
      />
    </>
  );
}
