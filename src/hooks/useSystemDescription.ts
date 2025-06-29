
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from '@/hooks/useCompanies';

export function useSystemDescription() {
  const [systemDescription, setSystemDescription] = useState<string>('Neuro360 - Soluções Inteligentes');
  const [loading, setLoading] = useState(true);
  const { currentCompany } = useCompanies();

  const fetchSystemDescription = async () => {
    if (!currentCompany?.id) {
      setSystemDescription('Neuro360 - Soluções Inteligentes');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_configs')
        .select('config_value')
        .eq('company_id', currentCompany.id)
        .eq('config_key', 'system_appearance')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('System appearance config not found, using default');
        setSystemDescription('Neuro360 - Soluções Inteligentes');
        return;
      }

      if (data?.config_value) {
        // O config_value é um objeto JSON com as configurações de aparência
        let description = 'Neuro360 - Soluções Inteligentes';
        
        if (typeof data.config_value === 'object' && data.config_value !== null) {
          // Buscar pela propriedade 'system_description' dentro do objeto de aparência
          const configValue = data.config_value as any;
          description = configValue?.system_description || 'Neuro360 - Soluções Inteligentes';
        }
        
        setSystemDescription(description);
      }
    } catch (error) {
      console.error('Error fetching system description:', error);
      setSystemDescription('Neuro360 - Soluções Inteligentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemDescription();
  }, [currentCompany?.id]);

  return {
    systemDescription,
    loading,
    refetch: fetchSystemDescription
  };
}
