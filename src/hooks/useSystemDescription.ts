
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
        .eq('config_key', 'system_appearance')
        .single();

      if (error) {
        console.log('System appearance config not found, using default');
        setSystemDescription('Soluções em Dados');
        return;
      }

      if (data?.config_value) {
        // O config_value é um objeto JSON com as configurações de aparência
        let description = 'Soluções em Dados';
        
        if (typeof data.config_value === 'object' && data.config_value !== null) {
          // Buscar pela propriedade 'system_description' dentro do objeto de aparência
          const configValue = data.config_value as any;
          description = configValue?.system_description || 'Soluções em Dados';
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
