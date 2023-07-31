import { LicenseInfo } from '@mui/x-license-pro';
// i18n
import './locales/i18n';

// styles
import './style.css';

// highlight
import './utils/highlight';

// scroll bar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'react-image-lightbox/style.css';

// editor
import 'react-quill/dist/quill.snow.css';

// pdf-viewer
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
// authentication
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import pt from 'date-fns/locale/pt';
// redux
import { store } from './redux/store';
// contexts
import { SettingsProvider } from './contexts/SettingsContext';
import { CollapseDrawerProvider } from './contexts/CollapseDrawerContext';
// config
import { msalConfig } from './config';

//
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

// ----------------------------------------------------------------------

const msalInstance = new PublicClientApplication(msalConfig);
const root = ReactDOM.createRoot(document.getElementById('root'));

LicenseInfo.setLicenseKey(
  '61628ce74db2c1b62783a6d438593bc5Tz1NVUktRG9jLEU9MTY4MzQ0NzgyMTI4NCxTPXByZW1pdW0sTE09c3Vic2NyaXB0aW9uLEtWPTI='
);

root.render(
  <MsalProvider instance={msalInstance}>
    <HelmetProvider>
      <ReduxProvider store={store}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pt}>
          <SettingsProvider>
            <CollapseDrawerProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </CollapseDrawerProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </HelmetProvider>
  </MsalProvider>
);

serviceWorkerRegistration.register();

reportWebVitals();
