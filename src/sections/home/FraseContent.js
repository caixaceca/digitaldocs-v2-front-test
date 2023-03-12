import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Card, Stack, Typography, CardContent } from '@mui/material';
// components
import { MotionContainer } from '../../components/animate';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  boxShadow: 'none',
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  backgroundColor: 'transparent',
  paddingBottom: theme.spacing(1),
}));

// ----------------------------------------------------------------------

FraseContent.propTypes = { frase: PropTypes.object };

export default function FraseContent({ frase, ...other }) {
  return (
    <RootStyle sx={{ pr: 2 }} {...other}>
      <CardContent
        component={MotionContainer}
        sx={{
          p: 0,
          py: 1,
          color: (theme) => theme.palette.text.secondary,
        }}
      >
        <Typography gutterBottom variant="h4">
          Frase da semana
        </Typography>
        <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
          {frase?.frase ||
            '"Coisas incríveis no mundo dos negócios nunca são feitas por uma única pessoa, e sim por uma equipa" - Steve Jobs'}
        </Typography>
        {frase?.autor && (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Typography variant="body2">Autor(a):</Typography>
            <Typography variant="subtitle2">{frase?.autor}</Typography>
          </Stack>
        )}
        {frase?.colaborador && (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Typography variant="body2">Citado por:</Typography>
            <Typography variant="subtitle2">
              {frase?.colaborador?.perfil?.displayName} ({frase?.colaborador?.uo?.label})
            </Typography>
          </Stack>
        )}
      </CardContent>
    </RootStyle>
  );
}
