import { Link as RouterLink } from 'react-router-dom';
// @mui
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import Page from '../components/Page';
// assets
import { PageNotFoundIllustration } from '../assets';

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function PageNotFound() {
  return (
    <Page title="Página não encontrada">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <Typography variant="h3" paragraph>
            Desculpa, página não encontrada!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Desculpe, não encontramos a página que você está procurando. Talvez você tenha digitado errado a URL?
            Certifique-se de verificar sua ortografia.
          </Typography>

          <PageNotFoundIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />

          <Button to="/" size="large" variant="contained" component={RouterLink}>
            Ínicio
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
