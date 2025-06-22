
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';

export interface SystemLogDB {
  id: string;
  company_id?: string;
  user_id?: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  component?: string;
  details?: any;
  created_at: string;
  companies?: {
    name: string;
  };
  users?: {
    name: string;
  };
}

export function useSystemLogsDB() {
  const [logs, setLogs] = useState<SystemLogDB[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentCompany } = useCompanies();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_logs')
        .select(`
          *,
          companies(name),
          users(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logs do sistema",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (
    level: SystemLogDB['level'], 
    message: string, 
    component?: string, 
    details?: any
  ) => {
    try {
      const logData = {
        company_id: currentCompany?.id || null,
        user_id: user?.id || null,
        level,
        message,
        component,
        details
      };

      const { data, error } = await supabase
        .from('system_logs')
        .insert(logData)
        .select(`
          *,
          companies(name),
          users(name)
        `)
        .single();

      if (error) throw error;

      setLogs(prevLogs => [data, ...prevLogs.slice(0, 99)]);

      // Mostrar toast apenas para erros
      if (level === 'error') {
        toast({
          title: "Erro do Sistema",
          description: message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding system log:', error);
    }
  };

  const clearLogs = async () => {
    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all logs

      if (error) throw error;

      setLogs([]);
      toast({
        title: "Sucesso",
        description: "Logs limpos com sucesso"
      });
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar logs",
        variant: "destructive"
      });
    }
  };

  const logError = (message: string, component?: string, details?: any) => {
    console.error('System Error:', message, details);
    addLog('error', message, component, details);
  };

  const logWarning = (message: string, component?: string, details?: any) => {
    console.warn('System Warning:', message, details);
    addLog('warning', message, component, details);
  };

  const logInfo = (message: string, component?: string, details?: any) => {
    console.info('System Info:', message, details);
    addLog('info', message, component, details);
  };

  // Interceptar erros globais
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError(`Erro global: ${event.message}`, 'Global', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString()
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError(`Promise rejeitada: ${event.reason}`, 'Promise', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    addLog,
    clearLogs,
    logError,
    logWarning,
    logInfo,
    refetch: fetchLogs
  };
}
