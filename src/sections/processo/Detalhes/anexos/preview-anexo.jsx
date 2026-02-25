import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
// components
import Image from '@/components/Image';
import ImageLightbox from '@/components/image-lightbox';

// ---------------------------------------------------------------------------------------------------------------------

export function PdfPreview({ url, title }) {
  const theme = useTheme();
  const heightContent =
    document?.getElementById('detalhes')?.clientHeight - document?.getElementById('anexos')?.clientHeight - 52;

  return (
    <Box sx={{ height: `${heightContent}px`, minHeight: '660px', boxShadow: 3 }}>
      <iframe
        src={url}
        width="100%"
        height="100%"
        title={title}
        key="pdf-viewer"
        type="application/pdf"
        style={{ border: 'none', colorScheme: theme.palette.mode, minHeight: '660px' }}
      >
        <p>
          Seu navegador não suporta a visualização de PDFs.
          <a href={url}>Clique aqui para baixar o arquivo.</a>
        </p>
      </iframe>
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function ImagemPreview({ imagem }) {
  const [index, setIndex] = useState(-1);

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
        onClick={() => setIndex(0)}
      />

      {index > -1 && <ImageLightbox onClose={() => setIndex(-1)} slides={[{ src: imagem }]} />}
    </>
  );
}
