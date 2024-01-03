import { useState } from 'react';
import PropTypes from 'prop-types';
import { Viewer } from '@react-pdf-viewer/core';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import { useTheme } from '@mui/material/styles';
// components
import Image from '../../components/Image';
import LightboxModal from '../../components/LightboxModal';

// --------------------------------------------------------------------------------------------------------------------------------------------

PdfPreview.propTypes = { url: PropTypes.string };

export function PdfPreview({ url }) {
  const theme = useTheme();
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {} });
  const heightContent =
    document.getElementById('card_detail').clientHeight - document.getElementById('list_anexos').clientHeight - 100;

  return (
    <div style={{ height: `${heightContent}px`, minHeight: '630px' }}>
      <Viewer
        fileUrl={url}
        localization={pt}
        theme={{ theme: theme.palette.mode }}
        plugins={[defaultLayoutPluginInstance]}
      />
    </div>
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
      <Image src={imagem} sx={{ cursor: 'zoom-in', borderRadius: 2 }} onClick={() => handleOpenLightbox()} />

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
