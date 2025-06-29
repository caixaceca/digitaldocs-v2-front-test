// @mui
import Box from '@mui/material/Box';

// ---------------------------------------------------------------------------------------------------------------------

export default function SvgIconStyle({ src, sx }) {
  return (
    <Box
      component="span"
      sx={{
        width: 23,
        height: 23,
        display: 'inline-block',
        bgcolor: 'currentColor',
        mask: `url(${src}) no-repeat center / contain`,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        ...sx,
      }}
    />
  );
}
