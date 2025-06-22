
import { useToast } from '@/hooks/use-toast';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useAuth } from '@/hooks/useAuth';
import { EvolutionConfigService } from '@/services/evolutionConfigService';
import type { EvolutionConfig, CreateEvolutionConfigData, UpdateEvolutionConfigData } from '@/types/evolutionConfig';

export function useEvolutionConfigActions() {
  const { toast } = useToast();
  const { logError, logInfo } = useSystemLogs();
  const { userLogin } = useAuth();

  const createConfig = async (configData: CreateEvolutionConfigData): Promise<EvolutionConfig> => {
    try {
      console.log('useEvolutionConfigActions: Creating config:', configData);
      logInfo('Criando nova configuração Evolution API', 'useEvolutionConfigActions', { companyId: configData.company_id });
      
      if (!userLogin?.id) {
        throw new Error('Usuário não autenticado');
      }

      const newConfig = await EvolutionConfigService.create(configData);
      
      console.log('useEvolutionConfigActions: Config created successfully:', newConfig);
      logInfo('Configuração da Evolution API criada com sucesso', 'useEvolutionConfigActions', { configId: newConfig.id });
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API criada com sucesso!"
      });
      
      return newConfig;
    } catch (error) {
      console.error('useEvolutionConfigActions: Error creating Evolution config:', error);
      logError(`Erro ao criar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar configuração da Evolution API",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateConfig = async (id: string, updates: UpdateEvolutionConfigData): Promise<EvolutionConfig> => {
    try {
      console.log('useEvolutionConfigActions: Updating config:', id, updates);
      logInfo('Atualizando configuração Evolution API', 'useEvolutionConfigActions', { configId: id });
      
      const updatedConfig = await EvolutionConfigService.update(id, updates);
      
      console.log('useEvolutionConfigActions: Config updated successfully:', updatedConfig);
      logInfo('Configuração da Evolution API atualizada com sucesso', 'useEvolutionConfigActions', { configId: id });
      
      toast({
        title: "Sucesso",
        description: "Configuração da Evolution API atualizada com sucesso!"
      });
      
      return updatedConfig;
    } catch (error) {
      console.error('useEvolutionConfigActions: Error updating Evolution config:', error);
      logError(`Erro ao atualizar configuração da Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'useEvolutionConfigActions', error);
      
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração da Evolution API",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return {
    createConfig,
    updateConfig
  };
}
