
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Save, X } from "lucide-react";
import { useSQLConnections } from "@/hooks/useSQLConnections";
import { SQLQuery } from "@/hooks/useSQLQueriesNew";

interface SQLQueryFormProps {
  query?: SQLQuery | null;
  onSubmit: (queryData: any) => Promise<void>;
  onCancel: () => void;
}

export function SQLQueryForm({ query, onSubmit, onCancel }: SQLQueryFormProps) {
  const { connections } = useSQLConnections();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    query_text: "",
    connection_id: "",
    status: "active" as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query) {
      setFormData({
        name: query.name || "",
        description: query.description || "",
        query_text: query.query_text || "",
        connection_id: query.connection_id || "",
        status: query.status || "active"
      });
    } else {
      setFormData({
        name: "",
        description: "",
        query_text: "",
        connection_id: "",
        status: "active"
      });
    }
    setErrors({});
  }, [query]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome da consulta é obrigatório";
    }

    if (!formData.query_text.trim()) {
      newErrors.query_text = "Texto da consulta SQL é obrigatório";
    }

    // Validar se é um SQL básico válido
    const sqlText = formData.query_text.trim().toLowerCase();
    if (sqlText && !sqlText.startsWith('select') && !sqlText.startsWith('with')) {
      newErrors.query_text = "Por segurança, apenas consultas SELECT são permitidas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        connection_id: formData.connection_id || null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>{query ? "Editar Consulta SQL" : "Nova Consulta SQL"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Consulta *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Ex: Relatório de Vendas"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection">Conexão SQL</Label>
              <Select
                value={formData.connection_id}
                onValueChange={(value) => handleFieldChange("connection_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conexão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma conexão</SelectItem>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name} ({connection.host})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Descrição opcional da consulta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="query_text">Consulta SQL *</Label>
            <Textarea
              id="query_text"
              value={formData.query_text}
              onChange={(e) => handleFieldChange("query_text", e.target.value)}
              placeholder="Digite sua consulta SQL aqui..."
              className={`min-h-32 font-mono ${errors.query_text ? "border-red-500" : ""}`}
            />
            {errors.query_text && <p className="text-sm text-red-600">{errors.query_text}</p>}
            <p className="text-xs text-gray-500">
              Por segurança, apenas consultas SELECT são permitidas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") => handleFieldChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="inactive">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : query ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
