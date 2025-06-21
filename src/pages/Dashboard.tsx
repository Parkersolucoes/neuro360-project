
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare, Calendar, CheckCircle, AlertTriangle, Activity } from "lucide-react";

export default function Dashboard() {
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
    },
    {
      type: "info",
      title: "Nova sessão WhatsApp conectada",
      description: "Sessão 'vendas-bot' ativa",
      time: "15 min atrás",
      icon: Activity,
    },
    {
      type: "warning",
      title: "Falha na conexão com banco de dados",
      description: "Timeout na consulta - tentativa automática em 5 min",
      time: "1 hora atrás",
      icon: AlertTriangle,
    },
  ];

  const systemStatus = [
    {
      service: "Banco SQL Server",
      status: "Conectado",
      statusType: "success",
    },
    {
      service: "Evolution API",
      status: "Online",
      statusType: "success",
    },
    {
      service: "WhatsApp Session",
      status: "Ativa",
      statusType: "success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema e atividades recentes</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Atividades Recentes</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Últimas ações executadas no sistema</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'success' ? 'bg-green-100' :
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.type === 'success' ? 'text-green-600' :
                    activity.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Status do Sistema</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Estado atual das conexões e serviços</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStatus.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{service.service}</span>
                </div>
                <Badge className="status-indicator status-connected">
                  {service.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
