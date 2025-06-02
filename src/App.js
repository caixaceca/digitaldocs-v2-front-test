import { Worker } from '@react-pdf-viewer/core';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
// config
import { msalInstance } from './config';
//
import Router from './routes';
import LoginPage from './pages/login';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/ScrollToTop';
import MotionLazyContainer from './components/animate/MotionLazyContainer';

import UIProvider from './providers/ui-provider';

export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <MotionLazyContainer>
        <UIProvider>
          <ScrollToTop />
          <AuthenticatedTemplate>
            <StyledChart />
            <Worker workerUrl="/assets/pdf.worker.min.js">
              <Router />
            </Worker>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <LoginPage />
          </UnauthenticatedTemplate>
        </UIProvider>
      </MotionLazyContainer>
    </MsalProvider>
  );
}
