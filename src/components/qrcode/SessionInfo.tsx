
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { QRSession } from "@/hooks/useQRSessions";

interface SessionInfoProps {
  sessionStatus: string;
  instanceName: string;
  currentCompanyName: string;
  session: QRSession | null;
}

export function SessionInfo({
  sessionStatus,
  instanceName,
  currentCompanyName,
  session
}: SessionInfoProps) {
  const getStatusBadge = () => {
    switch (sessionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "waiting":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Aguardando
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-100 text-red-800">
            Inativo
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Status</span>
          {getStatusBadge()}
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Instância</span>
          <span className="text-sm text-gray-900">{instanceName}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Empresa</span>
          <span className="text-sm text-gray-900">{currentCompanyName}</span>
        </div>
        
        {sessionStatus === "connected" && session && (
          <>
            {session.connected_at && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Conectado em</span>
                <span className="text-sm text-gray-900">
                  {new Date(session.connected_at).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
            
            {session.last_activity && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Última atividade</span>
                <span className="text-sm text-gray-900">
                  {new Date(session.last_activity).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {sessionStatus === "disconnected" && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma sessão ativa</p>
          <p className="text-sm text-gray-400 mt-1">
            Gere um QR Code para conectar
          </p>
        </div>
      )}
    </div>
  );
}
