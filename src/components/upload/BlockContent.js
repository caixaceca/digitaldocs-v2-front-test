import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
// assets
import { UploadIllustration } from '../../assets';
// redux
import { useSelector } from '../../redux/store';

// ----------------------------------------------------------------------

BlockContent.propTypes = { multiple: PropTypes.bool, small: PropTypes.bool };

export default function BlockContent({ multiple = false, small = false }) {
  const { isLoading } = useSelector((state) => state.indicadores);
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      direction={{ xs: 'column', md: 'row' }}
      sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
    >
      <UploadIllustration sx={{ width: small ? 80 : 120 }} />

      {isLoading ? (
        <Box sx={{ p: small ? 1 : 2 }}>
          <Typography gutterBottom variant={'subtitle1'}>
            Carregando e compactando o{multiple ? 's' : ''} documento{multiple ? 's' : ''}...
          </Typography>
          <LinearProgress />
        </Box>
      ) : (
        <Box sx={{ p: small ? 1 : 2 }}>
          <Typography gutterBottom variant={small ? 'subtitle1' : 'h6'}>
            Solte ou seleciona o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''}...
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Solte o{multiple ? 's' : ''} ficheiro{multiple ? 's' : ''} nesta zona ou &nbsp;
            <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
              clica aqui
            </Typography>
            &nbsp; e procura na sua máquina...
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
