import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import pt from '@react-pdf-viewer/locales/lib/pt_PT.json';
import { Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// @mui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
// components
import Image from '../../../components/Image';

// ---------------------------------------------------------------------------------------------------------------------

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

      <Lightbox index={0} open={index > -1} close={() => setIndex(-1)} slides={[{ src: imagem }]} />
    </>
  );
}
