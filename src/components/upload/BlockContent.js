// @mui
import { Box, Typography, Stack } from '@mui/material';
// assets
import { UploadIllustration } from '../../assets';

// ----------------------------------------------------------------------

export default function BlockContent() {
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
          Solte ou selecione ficheiros...
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Arraste e solte os ficheiros ou &nbsp;
          <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
            clique aqui
          </Typography>
          &nbsp; e procura na sua máquina
        </Typography>
      </Box>
    </Stack>
  );
}
