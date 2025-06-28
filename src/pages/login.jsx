import React from 'react';
import { format } from 'date-fns';
// @mui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
// context
import { useAuthContext } from '../providers/auth-provider';
// components
import Page from '../components/Page';
import Logo from '../components/Logo';

const RootStyle = styled(Page)(() => ({
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundImage: 'url(/assets/Shape.svg)',
}));

export default function PageLogin() {
  const { login, loginLoading } = useAuthContext();

  return (
    <RootStyle title="Login">
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container justifyContent="center" alignItems="center" style={{ width: '100%' }}>
          <Grid size={12}>
            <Grow in>
              <Card sx={{ mt: 1, p: { xs: 4, sm: 7 }, mb: 5 }}>
                <Stack direction="column" sx={{ mb: 5 }} spacing={2} alignItems="center">
                  <Logo sx={{ width: 50, height: 50, mb: 2 }} />
                  <Typography variant="h4" textAlign="center">
                    Olá, bem-vindo(a)
                  </Typography>
                  <Typography variant="h6" textAlign="center">
                    Intranet da Caixa Económica de Cabo Verde
                  </Typography>
                </Stack>

                <Alert severity="success" sx={{ mb: 3 }}>
                  Para aceder faça login com a sua conta <strong>Microsoft</strong>
                </Alert>

                <Button
                  fullWidth
                  size="large"
                  onClick={login}
                  variant="contained"
                  disabled={loginLoading}
                  sx={{ fontSize: '1rem' }}
                >
                  {loginLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                </Button>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Container>

      <Paper elevation={3} sx={{ p: 2, mt: 'auto', mx: { xs: 2, sm: 5 }, mb: 2 }}>
        <Stack alignItems="center" spacing={{ xs: 1, sm: 2 }} justifyContent="space-between" direction="row">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            © {format(new Date(), 'yyyy')} Caixa Económica de Cabo Verde
          </Typography>
          <Typography variant="caption" sx={{ textAlign: 'right', color: 'text.secondary' }}>
            <b>Versão 1.0</b>
          </Typography>
        </Stack>
      </Paper>
    </RootStyle>
  );
}
