import { useState } from 'react';
import PropTypes from 'prop-types';
// components
import Image from '../../components/Image';
import LightboxModal from '../../components/LightboxModal';

// ----------------------------------------------------------------------

ImagemPreview.propTypes = { imagem: PropTypes.string };

export default function ImagemPreview({ imagem }) {
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
