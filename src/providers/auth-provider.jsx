import PropTypes from 'prop-types';
import { useEffect, useState, createContext, useContext } from 'react';
import { msalInstance } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await msalInstance.initialize();

        const response = await msalInstance.handleRedirectPromise();
        let activeAccount = response?.account;

        if (activeAccount) {
          msalInstance.setActiveAccount(activeAccount);
        } else {
          const allAccounts = msalInstance.getAllAccounts();
          if (allAccounts.length > 0) {
            activeAccount = allAccounts[0];
            msalInstance.setActiveAccount(activeAccount);
          }
        }

        setAccount(msalInstance.getActiveAccount());
      } catch (err) {
        console.error('Erro MSAL:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = () => {
    msalInstance.loginRedirect({ scopes: ['User.Read', 'Presence.Read.All', 'openid', 'profile'] });
  };

  const logout = () => {
    setAccount(null);
    localStorage.clear();
    const account = msalInstance.getActiveAccount();
    if (account) {
      msalInstance.logoutRedirect({
        account,
        logoutHint: account.username,
        postLogoutRedirectUri: window.location.origin,
      });
    } else {
      msalInstance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
    }
  };

  return (
    <AuthContext.Provider value={{ account, isAuthenticated: !!account, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};
