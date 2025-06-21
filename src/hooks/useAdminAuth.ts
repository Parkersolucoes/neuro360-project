
import { useAuth } from './useAuth';

export function useAdminAuth() {
  const { profile } = useAuth();

  const isAdmin = profile?.is_admin || profile?.is_master_user || false;
  const isMasterUser = profile?.is_master_user || false;

  return {
    isAdmin,
    isMasterUser,
    profile
  };
}
