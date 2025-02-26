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
    clientId: process.env.REACT_APP_CLIENTE_ID_AAD,
    authority: process.env.REACT_APP_AUTHORITY_AAD,
    // redirectUri: 'http://localhost:3000',
    redirectUri: 'https://ddocsteste.caixa.cv/processos/lista',
    // redirectUri: 'https://digitaldocs.caixa.cv/processos/lista',
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
  system: { loggerOptions: {} },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  authority: process.env.REACT_APP_AUTHORITY_AAD,
  scopes: ['User.Read', 'Presence.Read.All', 'openid', 'profile'],
};

console.log(process.env.REACT_APP_CLIENTE_ID_AAD);

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
