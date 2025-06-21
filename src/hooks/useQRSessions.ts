
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QRSession {
  id: string;
  evolution_config_id: string;
  instance_name: string;
  qr_code_data?: string;
  session_status: 'connected' | 'waiting' | 'disconnected';
  connected_at?: string;
  last_activity?: string;
  created_at?: string;
  updated_at?: string;
}

export function useQRSessions() {
  const [session, setSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSession(data ? { ...data, session_status: data.session_status as 'connected' | 'waiting' | 'disconnected' } : null);
    } catch (error) {
      console.error('Error fetching QR session:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (evolutionConfigId: string, instanceName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('qr_sessions')
        .insert([{
          user_id: user.id,
          evolution_config_id: evolutionConfigId,
          instance_name: instanceName,
          session_status: 'waiting'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSession({ ...data, session_status: data.session_status as 'connected' | 'waiting' | 'disconnected' });
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
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('qr_sessions')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      
      setSession({ ...data, session_status: data.session_status as 'connected' | 'waiting' | 'disconnected' });
      return data;
    } catch (error) {
      console.error('Error updating QR session:', error);
      throw error;
    }
  };

  const disconnectSession = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('qr_sessions')
        .update({ 
          session_status: 'disconnected',
          qr_code_data: null 
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      
      setSession({ ...data, session_status: data.session_status as 'connected' | 'waiting' | 'disconnected' });
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
