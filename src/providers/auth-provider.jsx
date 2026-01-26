import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserAuthError, EventType } from '@azure/msal-browser';
import { msalInstance, loginRequest } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  const loadActiveAccount = async () => {
    await msalInstance.initialize();
    let currentAccount = msalInstance.getActiveAccount();
    if (currentAccount) {
      setAccount(currentAccount);
      return;
    }

    const allAccounts = msalInstance.getAllAccounts();
    if (allAccounts.length > 0) {
      currentAccount = allAccounts[0];
      msalInstance.setActiveAccount(currentAccount);
      setAccount(currentAccount);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();

        if (response?.account) {
          msalInstance.setActiveAccount(response.account);
          setAccount(response.account);
        } else loadActiveAccount();
      } catch (err) {
        console.error('Initialization Error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
        msalInstance.setActiveAccount(event.payload.account);
        loadActiveAccount();
      }

      if (event.eventType === EventType.LOGOUT_SUCCESS) setAccount(null);
    });

    return () => {
      if (callbackId) msalInstance.removeEventCallback(callbackId);
    };
  }, []);

  const login = async () => {
    if (loginLoading) return;

    setLoginLoading(true);
    try {
      const response = await msalInstance.loginRedirect(loginRequest);
      msalInstance.setActiveAccount(response.account);
      setAccount(response.account);
    } catch (err) {
      if (
        err instanceof BrowserAuthError &&
        (err.errorCode === 'popup_window_error' || err.errorCode === 'popup_blocked')
      ) {
        msalInstance.loginRedirect(loginRequest);
      } else {
        console.error('Login Error:', err);
        setError(err);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    const activeAccount = msalInstance.getActiveAccount();

    if (activeAccount) {
      msalInstance.logoutRedirect({
        account: activeAccount,
        logoutHint: activeAccount.username,
        postLogoutRedirectUri: window.location.origin,
      });
    } else {
      msalInstance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
    }
  };

  return (
    <AuthContext.Provider
      value={{ account, isAuthenticated: !!account, isLoading, loginLoading, error, login, logout }}
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
