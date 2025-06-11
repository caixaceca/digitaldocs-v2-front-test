import { Worker } from '@react-pdf-viewer/core';
import { MsalProvider } from '@azure/msal-react';

import Router from './routes';
import { msalInstance } from './config';
import { useAuth } from './hooks/useAuth';

import LoginPage from './pages/login';
import { StyledChart } from './components/chart';
import UIProvider from './providers/ui-provider';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider } from './providers/auth-provider';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <Worker workerUrl="/assets/pdf.worker.min.js">
      <Router />
    </Worker>
  );
}

export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <MotionLazyContainer>
          <UIProvider>
            <StyledChart />
            <ScrollToTop />
            <AuthenticatedApp />
          </UIProvider>
        </MotionLazyContainer>
      </AuthProvider>
    </MsalProvider>
  );
}
