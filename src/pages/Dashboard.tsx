
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare, Calendar, CheckCircle, AlertTriangle, Activity, Database, Building2 } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";

export default function Dashboard() {
  const { currentCompany, companies } = useCompanies();
  const { connections } = useSQLConnections();
  const { integration } = useWebhookIntegration(currentCompany?.id);

  const stats = [
    {
      title: "Consultas Executadas",
      value: "142",
      subtitle: "Últimas 24h",
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      title: "Mensagens Enviadas",
      value: "89",
      subtitle: "Hoje",
      icon: MessageSquare,
      color: "bg-green-500",
    },
    {
      title: "Agendamentos Ativos",
      value: "12",
      subtitle: "Em execução",
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      title: "Taxa de Sucesso",
      value: "98.5%",
      subtitle: "Última semana",
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
  ];

  const recentActivities = [
    {
      type: "success",
      title: "Consulta 'Vendas Diárias' executada com sucesso",
      description: "23 registros encontrados, 15 mensagens enviadas",
      time: "2 min atrás",
      icon: CheckCircle,
      company: currentCompany?.name || "Sistema"
    },
    {
      type: "info",
      title: "Nova sessão WhatsApp conectada",
      description: "Sessão 'vendas-bot' ativa",
      time: "15 min atrás",
      icon: Activity,
      company: currentCompany?.name || "Sistema"
    },
    {
      type: "warning",
      title: "Falha na conexão com banco de dados",
      description: "Timeout na consulta - tentativa automática em 5 min",
      time: "1 hora atrás",
      icon: AlertTriangle,
      company: currentCompany?.name || "Sistema"
    },
  ];

  // Filter connections by current company
  const companyConnections = connections.filter(conn => 
    currentCompany ? conn.company_id === currentCompany.id : false
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {currentCompany 
            ? `Visão geral do sistema - ${currentCompany.name}` 
            : "Visão geral do sistema e atividades recentes"
          }
        </p>
      </div>

      {/* Company Selector Info */}
      {companies.length > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-800">
                Você tem acesso a {companies.length} empresas. 
                {currentCompany && ` Visualizando: ${currentCompany.name}`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Atividades Recentes</span>
              {currentCompany && (
                <Badge variant="secondary" className="ml-2">
                  {currentCompany.name}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">Últimas ações executadas no sistema</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'success' ? 'text-green-600' :
                    activity.type === 'warning' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.company}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Database Connections Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-500" />
              <span>Conexões SQL</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Estado das conexões com banco</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyConnections.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma conexão configurada</p>
            ) : (
              companyConnections.map((connection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      connection.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{connection.name}</span>
                      <p className="text-xs text-gray-500">{connection.host}</p>
                    </div>
                  </div>
                  <Badge className={
                    connection.status === 'active' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {connection.status === 'active' ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
              ))
            )}
            
            {/* Webhook Integration Status */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Webhook Integration</h4>
              {integration ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      integration.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-gray-900 text-sm">{integration.webhook_name}</span>
                  </div>
                  <Badge className={
                    integration.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }>
                    {integration.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma integração webhook configurada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
