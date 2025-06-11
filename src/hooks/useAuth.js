import { useAuthContext } from '../providers/auth-provider';

export function useAuth() {
  const { account, isAuthenticated, isLoading, error, login, logout } = useAuthContext();

  return { account, isAuthenticated, isLoading, error, login, logout };
}
