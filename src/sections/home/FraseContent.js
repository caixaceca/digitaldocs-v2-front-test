import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

FraseContent.propTypes = { frase: PropTypes.object };

export default function FraseContent({ frase }) {
  return (
    <Stack sx={{ flexGrow: 1, color: 'text.secondary' }}>
      <Typography gutterBottom variant="h5" sx={{ textAlign: 'center' }}>
        Frase da semana
      </Typography>
      <Typography variant="subtitle1" sx={{ fontStyle: 'italic', textAlign: 'center', mb: 1 }}>
        {frase?.frase ||
          '"Coisas incríveis no mundo dos negócios nunca são feitas por uma única pessoa, e sim por uma equipa" - Steve Jobs'}
      </Typography>
      {frase?.autor && (
        <Stack direction="row" alignItems="center" justifyContent="right" spacing={0.5}>
          <Typography variant="caption">Autor(a):</Typography>
          <Typography variant="subtitle2">{frase?.autor}</Typography>
        </Stack>
      )}
      {frase?.colaborador && (
        <Stack direction="row" alignItems="center" justifyContent="right" spacing={0.5}>
          <Typography variant="caption">Citado por:</Typography>
          <Typography variant="subtitle2">
            {frase?.colaborador?.perfil?.displayName} ({frase?.colaborador?.uo?.label})
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
