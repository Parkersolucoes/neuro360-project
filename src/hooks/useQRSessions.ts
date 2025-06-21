
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface QRSession {
  id: string;
  company_id: string | null;
  session_name: string;
  evolution_config_id?: string | null;
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
      setLoading(true);
      console.log('QRSessions: Fetching session for company:', companyId);
      
      if (!companyId) {
        setSession(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('qr_sessions')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        console.error('QRSessions: Error fetching session:', error);
        throw error;
      }

      console.log('QRSessions: Fetched session:', data);
      setSession(data);
    } catch (error) {
      console.error('Error fetching QR session:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar sessão QR",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (evolutionConfigId: string, instanceName: string, companyId?: string) => {
    try {
      console.log('QRSessions: Creating session for company:', companyId);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const sessionData = {
        company_id: companyId,
        session_name: `session_${instanceName}_${Date.now()}`,
        instance_data: { evolution_config_id: evolutionConfigId },
        status: 'waiting',
        qr_code: null,
        phone_number: null
      };

      const { data, error } = await supabase
        .from('qr_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      console.log('QRSessions: Session created successfully:', data);
      setSession(data);
      
      toast({
        title: "Sucesso",
        description: "Sessão QR criada com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating QR session:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar sessão QR",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSession = async (updates: Partial<QRSession>) => {
    try {
      if (!session?.id) {
        throw new Error('No active session to update');
      }

      console.log('QRSessions: Updating session:', session.id, updates);
      
      const { data, error } = await supabase
        .from('qr_sessions')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      console.log('QRSessions: Session updated successfully:', data);
      setSession(data);
      
      toast({
        title: "Sucesso",
        description: "Sessão QR atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Error updating QR session:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar sessão QR",
        variant: "destructive"
      });
    }
  };

  const disconnectSession = async () => {
    try {
      if (!session?.id) {
        throw new Error('No active session to disconnect');
      }

      console.log('QRSessions: Disconnecting session:', session.id);
      
      const { error } = await supabase
        .from('qr_sessions')
        .update({ 
          status: 'disconnected',
          qr_code: null,
          phone_number: null
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, session_status: 'disconnected', qr_code_data: null } : null);
      
      toast({
        title: "Sucesso",
        description: "Sessão desconectada com sucesso!"
      });
    } catch (error) {
      console.error('Error disconnecting QR session:', error);
      toast({
        title: "Erro",
        description: "Erro ao desconectar sessão",
        variant: "destructive"
      });
    }
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
