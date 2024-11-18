import { Worker } from '@react-pdf-viewer/core';
// authentication
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
// config
import { msalInstance } from './config';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import LoginPage from './pages/Login';
import { StyledChart } from './components/chart';
import ThemeSettings from './components/settings';
import ScrollToTop from './components/ScrollToTop';
import NotistackProvider from './components/NotistackProvider';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <MotionLazyContainer>
        <ThemeProvider>
          <ThemeSettings>
            <NotistackProvider>
              <AuthenticatedTemplate>
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
