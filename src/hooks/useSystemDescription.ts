
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
        // O config_value pode ser uma string direta ou um objeto JSON
        let description = 'Soluções em Dados';
        
        if (typeof data.config_value === 'string') {
          description = data.config_value;
        } else if (typeof data.config_value === 'object' && data.config_value !== null) {
          // Se for um objeto, procura pela propriedade 'description'
          description = (data.config_value as any)?.description || 'Soluções em Dados';
        }
        
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
