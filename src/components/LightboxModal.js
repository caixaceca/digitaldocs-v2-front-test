import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Lightbox from 'react-18-image-lightbox';
// @mui
import Typography from '@mui/material/Typography';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTheme, alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

function LightboxModalStyles() {
  const theme = useTheme();

  const ICON_SIZE = 28;
  const ICON_COLOR = theme.palette.grey[600].replace('#', '');

  const getIcon = (icon) =>
    `url(https://api.iconify.design/carbon/${icon}.svg?color=%23${ICON_COLOR}&width=${ICON_SIZE}&height=${ICON_SIZE})`;

  const Icon = (icon) => ({
    opacity: 1,
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'center',
    backgroundImage: `unset`,
    backgroundColor: 'transparent',
    transition: theme.transitions.create('opacity'),
    '&:before': { display: 'block', width: ICON_SIZE, height: ICON_SIZE, content: getIcon(icon) },
    '&:hover': { opacity: 0.72 },
  });

  return (
    <GlobalStyles
      styles={{
        '& .ReactModalPortal': {
          '& .ril__outer': { backgroundColor: alpha(theme.palette.grey[900], 0.96) },

          // Toolbar
          '& .ril__toolbar': { height: 'auto !important', padding: theme.spacing(2), backgroundColor: 'transparent' },
          '& .ril__toolbarLeftSide': { display: 'none' },
          '& .ril__toolbarRightSide': {
            height: 'auto !important',
            padding: 0,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            '& li': { display: 'flex', alignItems: 'center' },
            '& li:first-of-type': { flexGrow: 1 },
            '& li:not(:first-of-type)': {
              width: 40,
              height: 40,
              justifyContent: 'center',
              marginLeft: theme.spacing(2),
            },
          },

          // Button
          '& button:focus': { outline: 'none' },
          '& .ril__toolbarRightSide button': {
            width: '100%',
            height: '100%',
            '&.ril__closeButton': Icon('close'),
            '&.ril__zoomInButton': Icon('zoom-in'),
            '&.ril__zoomOutButton': Icon('zoom-out'),
          },
          '& .ril__navButtons': {
            padding: theme.spacing(2),
            '&.ril__navButtonPrev': { right: 'auto', left: theme.spacing(2), ...Icon('arrow-left') },
            '&.ril__navButtonNext': { left: 'auto', right: theme.spacing(2), ...Icon('arrow-right') },
          },
        },
      }}
    />
  );
}

LightboxModal.propTypes = {
  isOpen: PropTypes.bool,
  photoIndex: PropTypes.number,
  setPhotoIndex: PropTypes.func,
  images: PropTypes.array.isRequired,
};

export default function LightboxModal({ images, photoIndex, setPhotoIndex, isOpen, ...other }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isOpen]);

  const showIndex = images.length > 1 && (
    <Typography variant="subtitle2">{`${photoIndex + 1} / ${images.length}`}</Typography>
  );

  const toolbarButtons = [showIndex];

  const customStyles = { overlay: { zIndex: 9999 } };

  return (
    <>
      <LightboxModalStyles />

      {isOpen && (
        <Lightbox
          animationDuration={160}
          reactModalStyle={customStyles}
          toolbarButtons={toolbarButtons}
          nextSrc={images.length > 1 ? images[(photoIndex + 1) % images.length] : ''}
          prevSrc={images.length > 1 ? images[(photoIndex + images.length - 1) % images.length] : ''}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
          {...other}
        />
      )}
    </>
  );
}
