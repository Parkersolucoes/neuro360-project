
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      let query = supabase
        .from('qr_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('Error fetching QR session:', error);
        return;
      }

      if (data && data.length > 0) {
        setSession(data[0]);
      }
    } catch (error) {
      console.error('Error fetching QR session:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (evolutionConfigId: string, instanceName: string, companyId?: string) => {
    try {
      const { data, error } = await supabase
        .from('qr_sessions')
        .insert([{
          company_id: companyId || null,
          evolution_config_id: evolutionConfigId,
          session_name: instanceName,
          instance_name: instanceName,
          session_status: 'waiting'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating QR session:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar sessão QR",
          variant: "destructive"
        });
        throw error;
      }

      setSession(data);
      return data;
    } catch (error) {
      console.error('Error creating QR session:', error);
      throw error;
    }
  };

  const updateSession = async (updates: Partial<QRSession>) => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('qr_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', session.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating QR session:', error);
        return;
      }

      setSession(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating QR session:', error);
    }
  };

  const disconnectSession = () => {
    if (session) {
      updateSession({ 
        session_status: 'disconnected',
        qr_code_data: null,
        phone_number: null
      });
      
      toast({
        title: "Sessão desconectada",
        description: "WhatsApp desconectado com sucesso!"
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
