import { Worker } from '@react-pdf-viewer/core';
// authentication
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
// config
import { msalConfig } from './config';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import LoginPage from './pages/auth/Login';
import { StyledChart } from './components/chart';
import ThemeSettings from './components/settings';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import NotistackProvider from './components/NotistackProvider';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

// ----------------------------------------------------------------------

export default function App() {
  const msalInstance = new PublicClientApplication(msalConfig);
  return (
    <MsalProvider instance={msalInstance}>
      <MotionLazyContainer>
        <ThemeProvider>
          <ThemeSettings>
            <NotistackProvider>
              <AuthenticatedTemplate>
                <ProgressBarStyle />
                <StyledChart />
                <ScrollToTop />
                <Worker workerUrl="/assets/pdf.worker.min.js">
                  <Router />
                </Worker>
              </AuthenticatedTemplate>
              <UnauthenticatedTemplate>
                <LoginPage />
              </UnauthenticatedTemplate>
            </NotistackProvider>
          </ThemeSettings>
        </ThemeProvider>
      </MotionLazyContainer>
    </MsalProvider>
  );
}
