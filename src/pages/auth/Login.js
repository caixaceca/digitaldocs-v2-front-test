import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { useMsal } from '@azure/msal-react';
import React, { createRef, useEffect } from 'react';
import { InteractionStatus } from '@azure/msal-browser';
// @mui
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// config
import { loginRequest, msalInstance } from '../../config';
// components
import Page from '../../components/Page';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(() => ({
  display: 'flex',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundImage: 'url(/assets/Shape.svg)',
}));

const ContentStyle = styled('div')(() => ({
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const referencia = createRef();
  const { enqueueSnackbar } = useSnackbar();
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    referencia.current.click();
  }, [referencia]);

  const handleLogin = async () => {
    try {
      await msalInstance.initialize();
      if (inProgress === InteractionStatus.None) {
        await instance.loginRedirect({ ...loginRequest });
        enqueueSnackbar('Login efetuado com sucesso', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  };

  return (
    <RootStyle title="Login">
      <Container maxWidth="sm">
        <ContentStyle>
          <Card sx={{ p: 7, mb: 5 }}>
            <Stack direction="column" sx={{ mb: 5 }} spacing={2}>
              <Typography variant="h3">Olá, bem-vindo(a)</Typography>
              <Typography variant="h5">Intranet da Caixa Económica de Cabo Verde</Typography>
            </Stack>
            <Alert severity="success" sx={{ mb: 3 }}>
              Para aceder faça login com a sua conta <strong>Microsoft</strong>
            </Alert>
            <Button fullWidth size="large" ref={referencia} variant="contained" onClick={() => handleLogin()}>
              Login
            </Button>
          </Card>
        </ContentStyle>
      </Container>
      <Paper sx={{ position: 'absolute', bottom: 10, left: 10, right: 10, p: 1.5 }} elevation={3}>
        <Stack alignItems="center" spacing={{ xs: 1, sm: 2 }} justifyContent="space-between" direction="row">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            © {format(new Date(), 'y')} Caixa Económica de Cabo Verde
          </Typography>
          <Typography variant="caption" sx={{ textAlign: 'right', color: 'text.secondary' }}>
            <b>Versão 1.0</b>
          </Typography>
        </Stack>
      </Paper>
    </RootStyle>
  );
}
