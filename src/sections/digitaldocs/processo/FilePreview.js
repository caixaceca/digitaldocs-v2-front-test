import { useState } from 'react';
import PropTypes from 'prop-types';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import { useTheme } from '@mui/material/styles';
//
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
// components
import Image from '../../../components/Image';
import LightboxModal from '../../../components/LightboxModal';

// --------------------------------------------------------------------------------------------------------------------------------------------

PdfPreview.propTypes = { url: PropTypes.string };

export function PdfPreview({ url }) {
  const theme = useTheme();
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ toolbarPlugin: {} });

  return (
    <div style={{ height: '630px', borderRadius: '10px !important' }}>
      <Viewer
        fileUrl={url}
        localization={pt}
        theme={{ theme: theme.palette.mode }}
        plugins={[defaultLayoutPluginInstance]}
        defaultScale={SpecialZoomLevel.PageWidth}
      />
    </div>
  );
}

ImagemPreview.propTypes = { imagem: PropTypes.string };

// --------------------------------------------------------------------------------------------------------------------------------------------

export function ImagemPreview({ imagem }) {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleOpenLightbox = () => {
    setOpenLightbox(true);
    setSelectedImage(0);
  };

  return (
    <>
      <Image src={imagem} sx={{ cursor: 'zoom-in' }} onClick={() => handleOpenLightbox()} />

      <LightboxModal
        images={[imagem]}
        mainSrc={imagem}
        photoIndex={selectedImage}
        setPhotoIndex={setSelectedImage}
        isOpen={openLightbox}
        onCloseRequest={() => setOpenLightbox(false)}
      />
    </>
  );
}
