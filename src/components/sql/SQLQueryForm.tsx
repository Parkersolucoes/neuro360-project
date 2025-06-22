
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

interface SQLQueryFormProps {
  query?: any;
  onSubmit: (queryData: any) => void;
  onCancel: () => void;
}

export function SQLQueryForm({ query, onSubmit, onCancel }: SQLQueryFormProps) {
  const { currentCompany } = useCompanies();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    query_text: "",
    status: "active"
  });

  useEffect(() => {
    if (query) {
      setFormData({
        name: query.name || "",
        description: query.description || "",
        query_text: query.query_text || "",
        status: query.status || "active"
      });
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      company_id: currentCompany?.id
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{query ? 'Editar Consulta SQL' : 'Nova Consulta SQL'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Consulta *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Relatório de Vendas"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição da consulta"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="query_text">Consulta SQL *</Label>
            <Textarea
              id="query_text"
              value={formData.query_text}
              onChange={(e) => setFormData({...formData, query_text: e.target.value})}
              placeholder="SELECT * FROM tabela WHERE..."
              className="min-h-[200px] font-mono"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {query ? 'Atualizar' : 'Salvar'} Consulta
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
