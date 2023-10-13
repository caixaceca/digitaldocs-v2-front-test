import PropTypes from 'prop-types';
// @mui
import { Box, Typography, Stack } from '@mui/material';
// assets
import { UploadIllustration } from '../../assets';

// ----------------------------------------------------------------------

BlockContent.propTypes = { multiple: PropTypes.bool };

export default function BlockContent({ multiple = false }) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
    >
      <UploadIllustration sx={{ width: 150 }} />

      <Box sx={{ p: 3 }}>
        <Typography gutterBottom variant="h5">
          Solte ou seleciona o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''}...
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Solte o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''} aqui ou &nbsp;
          <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
            clica nesta zona
          </Typography>
          &nbsp; e procura na sua máquina
        </Typography>
      </Box>
    </Stack>
  );
}
