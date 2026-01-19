import { MsalProvider } from '@azure/msal-react';

import Router from './routes';
import { msalInstance } from './config';

import LoginPage from './pages/login';
import { StyledChart } from './components/chart';
import UIProvider from './providers/ui-provider';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider, useAuthContext } from './providers/auth-provider';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage />;

  return <Router />;
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
