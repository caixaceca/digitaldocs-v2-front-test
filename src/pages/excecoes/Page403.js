import { m } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import Page from '../../components/Page';
import { MotionContainer, varBounce } from '../../components/animate';
// assets
import { ForbiddenIllustration } from '../../assets';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Page403() {
  return (
    <Page title="Acesso restrito">
      <Container component={MotionContainer}>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <m.div variants={varBounce().in}>
            <Typography variant="h3" paragraph>
              Sem permissão
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <Typography sx={{ color: 'text.secondary' }}>
              A página que você está tentando acessar tem acesso restrito.
              <br />
              Consulte o Departamento de Informática, Segurança e Comunicação (DICS)
            </Typography>
          </m.div>

          <m.div variants={varBounce().in}>
            <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
          </m.div>

          <Button to="/" size="large" variant="contained" component={RouterLink}>
            Ínicio
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
