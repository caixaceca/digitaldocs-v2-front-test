// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// assets
import { UploadIllustration } from '../../assets';

// ---------------------------------------------------------------------------------------------------------------------

export default function BlockContent({ multiple = false, small = false }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={{ xs: 0, sm: 2 }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ width: 1, textAlign: { xs: 'center', sm: 'left' } }}
    >
      <UploadIllustration sx={{ width: small ? 80 : 120 }} />

      <Box sx={{ p: small ? 1 : 2 }}>
        <Typography variant={small ? 'subtitle2' : 'subtitle1'}>
          Solte ou selecione o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''}...
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Solte o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''} nesta zona ou{' '}
          <Box component="span" sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 600 }}>
            clica aqui
          </Box>{' '}
          e procura na sua máquina...
        </Typography>
      </Box>
    </Stack>
  );
}
