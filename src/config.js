// @mui
import { ptPT } from '@mui/material/locale';
// authentication
import { PublicClientApplication } from '@azure/msal-browser';

// ----------------------------------------------------------------------

export const ambiente =
  (window.location.hostname === 'localhost' && 'local') ||
  (window.location.hostname?.includes('ddocsteste') && 'teste') ||
  'producao';

export const msalConfig = {
  auth: {
    clientId: '1f73fdec-54e5-4bd5-9a39-ae5b8174e16e',
    authority: 'https://login.microsoftonline.com/353efa45-1c51-4b33-a7e4-b129dc92beb4',
    // redirectUri: 'http://localhost:3000',
    redirectUri: 'https://ddocsteste.caixa.cv/processos/lista',
    // redirectUri: 'https://digitaldocs.caixa.cv/processos/lista',
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
  system: { loggerOptions: {} },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  authority: 'https://login.microsoftonline.com/353efa45-1c51-4b33-a7e4-b129dc92beb4',
  scopes: ['User.Read', 'Presence.Read.All', 'openid', 'profile'],
};

export const graphConfig = { graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me' };

// ----------------------------------------------------------------------

export const HEADER = {
  MOBILE_HEIGHT: 64,
  MAIN_DESKTOP_HEIGHT: 88,
  DASHBOARD_DESKTOP_HEIGHT: 92,
  DASHBOARD_DESKTOP_OFFSET_HEIGHT: 92 - 32,
};

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 88,
  //
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
  DASHBOARD_ITEM_HORIZONTAL_HEIGHT: 32,
};

export const ICON = { NAVBAR_ITEM: 22, NAVBAR_ITEM_HORIZONTAL: 20 };

// ----------------------------------------------------------------------

export const defaultSettings = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'default',
  themeLayout: 'horizontal',
  themeColorPresets: 'default',
  themeStretch: false,
};

// ----------------------------------------------------------------------

export const allLangs = [{ label: 'Português', value: 'pt', systemValue: ptPT }];
export const defaultLang = allLangs[0];
export const presenceColorMap = {
  Available: 'success.main',
  Busy: 'error.main',
  DoNotDisturb: 'error.dark',
  Away: 'warning.main',
  BeRightBack: 'warning.main',
  Offline: 'focus.main',
  OutOfOffice: 'purple',
  PresenceUnknown: 'lightgray',
};
