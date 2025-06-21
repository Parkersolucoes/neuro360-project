
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface QRSession {
  id: string;
  company_id: string | null;
  session_name: string;
  status: string;
  qr_code: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
  session_status?: string;
  qr_code_data?: string;
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
        setSession({
          ...data[0],
          session_status: data[0].status,
          qr_code_data: data[0].qr_code
        });
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
          session_name: instanceName,
          status: 'waiting'
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

      setSession({
        ...data,
        session_status: data.status,
        qr_code_data: data.qr_code
      });

      return data;
    } catch (error) {
      console.error('Error creating QR session:', error);
      throw error;
    }
  };

  const updateSession = async (updates: Partial<QRSession>) => {
    if (!session) return;

    try {
      const updateData: any = { ...updates, updated_at: new Date().toISOString() };
      
      // Map frontend properties to backend properties
      if (updates.session_status) {
        updateData.status = updates.session_status;
        delete updateData.session_status;
      }
      if (updates.qr_code_data) {
        updateData.qr_code = updates.qr_code_data;
        delete updateData.qr_code_data;
      }

      const { data, error } = await supabase
        .from('qr_sessions')
        .update(updateData)
        .eq('id', session.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating QR session:', error);
        return;
      }

      setSession(prev => prev ? {
        ...prev,
        ...updates,
        ...data,
        session_status: data.status,
        qr_code_data: data.qr_code
      } : null);
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
