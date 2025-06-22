
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface QRSession {
  id: string;
  company_id: string;
  evolution_config_id: string | null;
  session_name: string;
  instance_name: string | null;
  session_status: 'connected' | 'waiting' | 'disconnected';
  qr_code: string | null;
  qr_code_data: string | null;
  phone_number: string | null;
  connected_at: string | null;
  last_activity: string | null;
  instance_data: any;
  webhook_data: any;
  created_at: string;
  updated_at: string;
}

export function useQRSessions() {
  const [session, setSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSession = async (companyId: string) => {
    try {
      setLoading(true);
      
      if (!companyId) {
        setSession(null);
        return;
      }

      const { data, error } = await supabase
        .from('qr_sessions')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSession({
          ...data,
          session_status: data.session_status as 'connected' | 'waiting' | 'disconnected'
        });
      } else {
        setSession(null);
      }
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

  const createSession = async (evolutionConfigId: string, instanceName: string, companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('qr_sessions')
        .insert({
          company_id: companyId,
          evolution_config_id: evolutionConfigId,
          session_name: `session_${instanceName}`,
          instance_name: instanceName,
          session_status: 'disconnected'
        })
        .select()
        .single();

      if (error) throw error;
      
      const newSession = {
        ...data,
        session_status: data.session_status as 'connected' | 'waiting' | 'disconnected'
      };
      setSession(newSession);
      
      toast({
        title: "Sucesso",
        description: "Sessão QR criada com sucesso"
      });
      
      return newSession;
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
      if (!session) return;

      const { data, error } = await supabase
        .from('qr_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedSession = {
        ...data,
        session_status: data.session_status as 'connected' | 'waiting' | 'disconnected'
      };
      setSession(updatedSession);
      
      return updatedSession;
    } catch (error) {
      console.error('Error updating QR session:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar sessão QR",
        variant: "destructive"
      });
      throw error;
    }
  };

  const disconnectSession = async () => {
    try {
      if (!session) return;

      await updateSession({
        session_status: 'disconnected',
        qr_code_data: null,
        connected_at: null,
        last_activity: null
      });
    } catch (error) {
      console.error('Error disconnecting session:', error);
      throw error;
    }
  };

  return {
    session,
    loading,
    createSession,
    updateSession,
    disconnectSession,
    refetch: fetchSession
  };
}
