// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// assets
import { UploadIllustration } from '../../assets';

// ---------------------------------------------------------------------------------------------------------------------

export default function BlockContent({ multiple = false, small = false, permitidos = '' }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={{ xs: 0, sm: 2 }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ width: 1, textAlign: { xs: 'center', sm: 'left' } }}
    >
      <UploadIllustration sx={{ width: small ? 80 : 120 }} />

      <Box sx={{ p: small ? 0 : 2 }}>
        <Typography variant={small ? 'subtitle2' : 'subtitle1'}>
          Arraste ou selecione o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''}.
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Arraste para esta área ou{' '}
          <Box component="span" sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 600 }}>
            clique aqui
          </Box>{' '}
          para escolher do seu dispositivo
        </Typography>

        {permitidos && (
          <Typography sx={{ color: 'text.disabled', typography: 'caption' }}>
            <Box component="span" sx={{ color: 'error.main', fontWeight: 600 }}>
              *{' '}
            </Box>
            Formatos permitidos: {permitidos}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
