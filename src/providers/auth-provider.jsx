import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EventType } from '@azure/msal-browser';
import { msalInstance, loginRequest, redirectUri } from '../config';

// ---------------------------------------------------------------------------------------------------------------------

const AuthContext = createContext();

const resolveAccount = () => {
  const active = msalInstance.getActiveAccount();
  if (active) return active;
  const all = msalInstance.getAllAccounts();
  if (all.length > 0) {
    msalInstance.setActiveAccount(all[0]);
    return all[0];
  }
  return null;
};

// ---------------------------------------------------------------------------------------------------------------------

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    let callbackId = null;

    callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        const eventAccount = event.payload?.account;
        if (eventAccount) {
          msalInstance.setActiveAccount(eventAccount);
          setAccount(eventAccount);
        }
      }
      if (event.eventType === EventType.LOGOUT_SUCCESS) {
        setAccount(null);
      }
      if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
        console.warn('[AuthProvider] Falha ao adquirir token:', event.error);
        const erroDeInteracao =
          event.error?.errorCode === 'timed_out' || event.error?.errorCode === 'monitor_window_timeout';
        if (!erroDeInteracao && !resolveAccount()) setAccount(null);
      }
    });

    const handleTokenRefreshed = (event) => {
      const refreshedAccount = event.detail?.account ?? resolveAccount();
      if (refreshedAccount) {
        console.info('[AuthProvider] Token renovado via popup');
        msalInstance.setActiveAccount(refreshedAccount);
        setAccount(refreshedAccount);
      }
    };

    window.addEventListener('msal:tokenRefreshed', handleTokenRefreshed);

    const init = async () => {
      try {
        await msalInstance.initialize();
        const redirectResponse = await msalInstance.handleRedirectPromise();
        if (redirectResponse?.account) {
          msalInstance.setActiveAccount(redirectResponse.account);
          setAccount(redirectResponse.account);
        } else {
          setAccount(resolveAccount());
        }
      } catch (err) {
        console.error('[AuthProvider] Erro na inicialização:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (callbackId) msalInstance.removeEventCallback(callbackId);
      window.removeEventListener('msal:tokenRefreshed', handleTokenRefreshed);
    };
  }, []);

  const login = useCallback(async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setError(null);
    try {
      await msalInstance.loginRedirect({ ...loginRequest, redirectUri });
    } catch (err) {
      console.error('[AuthProvider] Erro no login:', err);
      setError(err);
      setLoginLoading(false);
    }
  }, [loginLoading]);

  const logout = useCallback(() => {
    const activeAccount = msalInstance.getActiveAccount();
    msalInstance.logoutRedirect({
      account: activeAccount ?? undefined,
      logoutHint: activeAccount?.username,
      postLogoutRedirectUri: redirectUri,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ account, error, isLoading, loginLoading, login, logout, isAuthenticated: !!account }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
