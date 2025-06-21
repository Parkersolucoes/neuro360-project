
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, Save } from "lucide-react";
import { useSQLConnections, SQLConnection } from "@/hooks/useSQLConnections";

interface SQLConnectionFormProps {
  companyId: string;
  connections: SQLConnection[];
}

export function SQLConnectionForm({ companyId, connections }: SQLConnectionFormProps) {
  const { createConnection } = useSQLConnections();

  const [sqlForm, setSqlForm] = useState({
    name: "",
    host: "",
    database_name: "",
    username: "",
    password: "",
    port: 5432
  });

  const handleSQLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createConnection({
        ...sqlForm,
        company_id: companyId,
        connection_type: 'postgresql',
        is_active: true
      });
      setSqlForm({
        name: "",
        host: "",
        database_name: "",
        username: "",
        password: "",
        port: 5432
      });
    } catch (error) {
      console.error('Error creating SQL connection:', error);
    }
  };

  // Filtrar conexões da empresa atual
  const companyConnections = connections.filter(conn => conn.company_id === companyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Conexões SQL Server</span>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {companyConnections.length} conexões
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {companyConnections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Conexões Ativas</h3>
            {companyConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    connection.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{connection.name}</p>
                    <p className="text-sm text-gray-500">{connection.host}:{connection.port}</p>
                  </div>
                </div>
                <Badge className={
                  connection.is_active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }>
                  {connection.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSQLSubmit} className="space-y-4">
          <h3 className="text-lg font-medium">Nova Conexão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sql_name">Nome da Conexão</Label>
              <Input
                id="sql_name"
                value={sqlForm.name}
                onChange={(e) => setSqlForm({...sqlForm, name: e.target.value})}
                placeholder="Ex: Banco Principal"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sql_host">Servidor</Label>
              <Input
                id="sql_host"
                value={sqlForm.host}
                onChange={(e) => setSqlForm({...sqlForm, host: e.target.value})}
                placeholder="Ex: localhost"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sql_database">Database</Label>
              <Input
                id="sql_database"
                value={sqlForm.database_name}
                onChange={(e) => setSqlForm({...sqlForm, database_name: e.target.value})}
                placeholder="Nome do banco"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sql_port">Porta</Label>
              <Input
                id="sql_port"
                type="number"
                value={sqlForm.port}
                onChange={(e) => setSqlForm({...sqlForm, port: parseInt(e.target.value) || 5432})}
                placeholder="5432"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sql_username">Usuário</Label>
              <Input
                id="sql_username"
                value={sqlForm.username}
                onChange={(e) => setSqlForm({...sqlForm, username: e.target.value})}
                placeholder="Usuário do banco"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sql_password">Senha</Label>
              <Input
                id="sql_password"
                type="password"
                value={sqlForm.password}
                onChange={(e) => setSqlForm({...sqlForm, password: e.target.value})}
                placeholder="Senha do banco"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Conexão
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
