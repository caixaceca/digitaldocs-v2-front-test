import PropTypes from 'prop-types';
import { m } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Card, Button, Tooltip, Typography, CardContent } from '@mui/material';
// components
import { MotionContainer } from '../../components/animate';
// routes
import { PATH_DIGITALDOCS } from '../../routes/paths';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  boxShadow: 'none',
  textAlign: 'center',
  backgroundColor: 'transparent',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

FraseContent.propTypes = {
  origem: PropTypes.string,
  frase: PropTypes.object,
};

export default function FraseContent({ origem, frase, ...other }) {
  const navigate = useNavigate();
  const handleView = () => {
    navigate(`${PATH_DIGITALDOCS.general.indicadores}`);
  };
  return (
    <RootStyle sx={{ pr: 2 }} {...other}>
      <CardContent
        component={MotionContainer}
        sx={{
          p: 0,
          py: 1,
          color: (theme) => (origem === 'disposicao' ? theme.palette.text.secondary : 'common.white'),
        }}
      >
        {origem === 'disposicao' && (
          <m.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{
              duration: 1,
            }}
          >
            <Typography gutterBottom variant="h4">
              Frase da semana
            </Typography>
          </m.div>
        )}
        <Typography variant={origem === 'home' ? 'h6' : 'subtitle1'} sx={{ fontStyle: 'italic' }}>
          {frase?.frase ||
            '"Coisas incríveis no mundo dos negócios nunca são feitas por uma única pessoa, e sim por uma equipa" - Steve Jobs'}
          {frase?.autor && ` ${frase?.autor}`}
        </Typography>
        {frase && (
          <>
            <Typography variant="body2" component="span">
              Citado por:
            </Typography>
            {origem === 'home' ? (
              <Tooltip title="Ver perfil" arrow placement="bottom">
                <Button
                  onClick={handleView}
                  sx={{ color: 'inherit', justifyContent: 'left', textAlign: 'left' }}
                  size="small"
                >
                  {frase?.colaborador?.perfil?.displayName} ({frase?.colaborador?.uo?.label})
                </Button>
              </Tooltip>
            ) : (
              <Typography variant="subtitle2" component="span">
                {' '}
                {frase?.colaborador?.perfil?.displayName} ({frase?.colaborador?.uo?.label})
              </Typography>
            )}
          </>
        )}
      </CardContent>
      {origem === 'disposicao' ? '' : ''}
    </RootStyle>
  );
}
