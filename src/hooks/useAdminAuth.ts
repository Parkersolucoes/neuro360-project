
import { useAuth } from './useAuth';

export function useAdminAuth() {
  const { userLogin } = useAuth();

  // is_admin = '0' significa master, is_admin = '1' significa usuário comum
  const isAdmin = userLogin?.is_admin === '0' || false;
  const isMasterUser = userLogin?.is_master || false;

  return {
    isAdmin,
    isMasterUser,
    userLogin
  };
}
