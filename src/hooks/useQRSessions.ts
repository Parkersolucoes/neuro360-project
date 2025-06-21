
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface QRSession {
  id: string;
  company_id: string | null;
  session_name: string;
  evolution_config_id: string | null;
  instance_name: string | null;
  session_status: string;
  qr_code_data: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
  connected_at?: string;
  last_activity?: string;
}

export function useQRSessions() {
  const [session, setSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSession = async (companyId?: string) => {
    try {
      console.log('QRSessions: Table qr_sessions does not exist in current database schema');
      
      // Como a tabela qr_sessions não existe mais, retornar null
      setSession(null);
    } catch (error) {
      console.error('Error fetching QR session:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (evolutionConfigId: string, instanceName: string, companyId?: string) => {
    try {
      console.log('QRSessions: Cannot create session - table qr_sessions does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade QR Code está temporariamente indisponível",
        variant: "destructive"
      });
      
      throw new Error('qr_sessions table does not exist');
    } catch (error) {
      console.error('Error creating QR session:', error);
      throw error;
    }
  };

  const updateSession = async (updates: Partial<QRSession>) => {
    try {
      console.log('QRSessions: Cannot update session - table qr_sessions does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade QR Code está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error updating QR session:', error);
    }
  };

  const disconnectSession = () => {
    console.log('QRSessions: Cannot disconnect session - table qr_sessions does not exist');
    
    toast({
      title: "Erro",
      description: "Funcionalidade QR Code está temporariamente indisponível",
      variant: "destructive"
    });
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    session,
    loading,
    createSession,
    updateSession,
    disconnectSession,
    refetch: fetchSession
  };
}
