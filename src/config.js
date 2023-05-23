import { LogLevel } from '@azure/msal-browser';
// @mui
import { enUS, frFR, ptPT } from '@mui/material/locale';

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig = {
  auth: {
    clientId: '1f73fdec-54e5-4bd5-9a39-ae5b8174e16e',
    authority: 'https://login.microsoftonline.com/353efa45-1c51-4b33-a7e4-b129dc92beb4',
    // redirectUri: 'http://localhost:3000',
    // redirectUri: 'https://digitaldocs.caixa.cv/indicadores',
    redirectUri: 'https://ddocsteste.caixa.cv/indicadores',
  },
  cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            console.info(message);
        }
      },
    },
  },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  authority: 'https://login.microsoftonline.com/353efa45-1c51-4b33-a7e4-b129dc92beb4',
  scopes: ['User.Read', 'openid', 'profile'],
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphConfig = { graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me' };

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.REACT_APP_HOST_API_KEY || '';

export const MAPBOX_API =
  'pk.eyJ1IjoiaXZhbmRyb2V2b3JhIiwiYSI6ImNrejlxZnN2MzA0NWsyd2xybDc2dHdmMDMifQ.YQN8sr2IRJzOw5FfRWNlaA';

// LAYOUT
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

// SETTINGS
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const defaultSettings = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'default',
  themeLayout: 'horizontal',
  themeColorPresets: 'default',
  themeStretch: false,
};

// MULTI LANGUAGES
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const allLangs = [
  { label: 'Português', value: 'pt', systemValue: ptPT, icon: '/assets/icons/flags/ic_flag_pt.svg' },
  { label: 'English', value: 'en', systemValue: enUS, icon: '/assets/icons/flags/ic_flag_en.svg' },
  { label: 'French', value: 'fr', systemValue: frFR, icon: '/assets/icons/flags/ic_flag_fr.svg' },
];

export const defaultLang = allLangs[0]; // Português
