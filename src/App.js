import { Worker } from '@react-pdf-viewer/core';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import LoginPage from './pages/auth/Login';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import { StyledChart } from './components/chart';
import ThemeSettings from './components/settings';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import NotistackProvider from './components/NotistackProvider';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

// ----------------------------------------------------------------------

export default function App() {
  return (
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
  );
}
