
import { useAuth } from './useAuth';

export function useAdminAuth() {
  const { userLogin } = useAuth();

  const isAdmin = userLogin?.is_admin || userLogin?.is_master || false;
  const isMasterUser = userLogin?.is_master || false;

  return {
    isAdmin,
    isMasterUser,
    userLogin
  };
}
