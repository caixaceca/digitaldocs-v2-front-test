import { format } from 'date-fns';
import { useMsal } from '@azure/msal-react';
import React, { createRef, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Paper, Card, Stack, Alert, Container, Typography, Button } from '@mui/material';
// config
import { loginRequest } from '../../config';
// components
import Page from '../../components/Page';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(() => ({
  display: 'flex',
  backgroundImage: 'url(/assets/Shape.svg)',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(7),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
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
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.log(e);
    });
  };

  const referencia = createRef();

  useEffect(() => {
    referencia.current.click();
  }, [referencia]);

  return (
    <RootStyle title="Login">
      <Container maxWidth="sm">
        <ContentStyle>
          <SectionStyle>
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

            <Paper sx={{ position: 'fixed', bottom: 10, left: 10, right: 10, p: 1.5, borderRadius: 1 }} elevation={3}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems="center"
                spacing={{ xs: 1, sm: 2 }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  © {format(new Date(), 'Y')} Caixa Económica de Cabo Verde
                </Typography>
                <Typography variant="caption" sx={{ textAlign: 'right', color: 'text.secondary' }}>
                  <b>Versão 1.0</b>
                </Typography>
              </Stack>
            </Paper>
          </SectionStyle>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
