
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  component?: string;
  details?: any;
}

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const { toast } = useToast();

  const addLog = (level: SystemLog['level'], message: string, component?: string, details?: any) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      component,
      details
    };

    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]); // Manter apenas os últimos 100 logs

    // Mostrar toast apenas para erros
    if (level === 'error') {
      toast({
        title: "Erro do Sistema",
        description: message,
        variant: "destructive"
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
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
        error: event.error
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

  return {
    logs,
    addLog,
    clearLogs,
    logError,
    logWarning,
    logInfo
  };
}
