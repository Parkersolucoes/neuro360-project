
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSystemDescription() {
  const [systemDescription, setSystemDescription] = useState<string>('Soluções em Dados');
  const [loading, setLoading] = useState(true);

  const fetchSystemDescription = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_configs')
        .select('config_value')
        .eq('config_key', 'system_description')
        .single();

      if (error) {
        console.log('System description config not found, using default');
        setSystemDescription('Soluções em Dados');
        return;
      }

      if (data?.config_value) {
        const description = typeof data.config_value === 'string' 
          ? data.config_value 
          : (data.config_value as any)?.description || 'Soluções em Dados';
        setSystemDescription(description);
      }
    } catch (error) {
      console.error('Error fetching system description:', error);
      setSystemDescription('Soluções em Dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemDescription();
  }, []);

  return {
    systemDescription,
    loading,
    refetch: fetchSystemDescription
  };
}
