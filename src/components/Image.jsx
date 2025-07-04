import { LazyLoadImage } from 'react-lazy-load-image-component';
// @mui
import Box from '@mui/material/Box';

// ---------------------------------------------------------------------------------------------------------------------

export default function Image({ ratio, disabledEffect = false, effect = 'blur', sx, otherSx = null, ...other }) {
  if (ratio) {
    return (
      <Box
        component="span"
        sx={{
          width: 1,
          lineHeight: 0,
          display: 'block',
          overflow: 'hidden',
          position: 'relative',
          pt: getRatio(ratio),
          '& .wrapper': {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            lineHeight: 0,
            position: 'absolute',
            backgroundSize: 'cover !important',
          },
          ...sx,
        }}
      >
        <Box
          component={LazyLoadImage}
          wrapperClassName="wrapper"
          placeholderSrc="/assets/placeholder.svg"
          effect={disabledEffect ? undefined : effect}
          sx={{ width: 1, height: 1, objectFit: 'cover', ...otherSx }}
          {...other}
        />
      </Box>
    );
  }

  return (
    <Box
      component="span"
      sx={{
        lineHeight: 1,
        display: 'block',
        overflow: 'hidden',
        '& .wrapper': { width: 1, height: 1, backgroundSize: 'cover !important' },
        ...sx,
      }}
    >
      <Box
        component={LazyLoadImage}
        wrapperClassName="wrapper"
        placeholderSrc="/assets/placeholder.svg"
        effect={disabledEffect ? undefined : effect}
        sx={{ width: 1, height: 1, objectFit: 'cover', borderRadius: 1, ...otherSx }}
        {...other}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function getRatio(ratio = '1/1') {
  return {
    '4/3': 'calc(100% / 4 * 3)',
    '3/4': 'calc(100% / 3 * 4)',
    '6/4': 'calc(100% / 6 * 4)',
    '4/6': 'calc(100% / 4 * 6)',
    '16/9': 'calc(100% / 16 * 9)',
    '9/16': 'calc(100% / 9 * 16)',
    '21/9': 'calc(100% / 21 * 9)',
    '9/21': 'calc(100% / 9 * 21)',
    '3/1': 'calc(100% / 3 * 1)',
    '1/3': 'calc(100% / 1 * 3)',
    '1/1': '100%',
  }[ratio];
}

// ---------------------------------------------------------------------------------------------------------------------

export const getIcon = (name, thumbp, sx) =>
  thumbp ? (
    <Box component="img" src={`/assets/icons/file_format/${name}.svg`} sx={{ flexShrink: 0, ...sx }} />
  ) : (
    <Image src={`/assets/icons/file_format/${name}.svg`} alt={name} sx={{ width: 24, height: 24 }} {...sx} />
  );
