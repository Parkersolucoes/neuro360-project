
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageSquare, Eye, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  message: string;
  variables: string[];
  category: string;
  status: "active" | "inactive";
}

export default function Templates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Cobrança Amigável",
      description: "Template para cobrança de clientes em atraso",
      message: "Olá {nome}, temos uma pendência financeira em aberto no valor de R$ {valor}. Por favor, entre em contato para regularizar.",
      variables: ["nome", "valor"],
      category: "cobranca",
      status: "active"
    },
    {
      id: "2",
      name: "Relatório de Vendas",
      description: "Template para envio de relatório diário de vendas",
      message: "📊 Relatório de Vendas do dia {data}:\n\nTotal de vendas: R$ {total_vendas}\nQuantidade de pedidos: {quantidade_pedidos}\n\nObrigado!",
      variables: ["data", "total_vendas", "quantidade_pedidos"],
      category: "relatorio",
      status: "active"
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    message: "",
    category: ""
  });

  const extractVariables = (message: string): string[] => {
    const matches = message.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const saveTemplate = () => {
    const variables = extractVariables(newTemplate.message);
    const template: Template = {
      id: Date.now().toString(),
      ...newTemplate,
      variables,
      status: "active"
    };
    
    setTemplates([...templates, template]);
    setNewTemplate({ name: "", description: "", message: "", category: "" });
    setIsDialogOpen(false);
    
    toast({
      title: "Template salvo",
      description: "O novo template foi criado com sucesso!",
    });
  };

  const previewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates de Mensagem</h1>
          <p className="text-gray-600 mt-2">Gerencie templates para envio automático via WhatsApp</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Template de Mensagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome do template"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cobranca">Cobrança</SelectItem>
                      <SelectItem value="relatorio">Relatório</SelectItem>
                      <SelectItem value="promocao">Promoção</SelectItem>
                      <SelectItem value="notificacao">Notificação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do template"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui. Use {variavel} para inserir dados dinâmicos..."
                  className="min-h-32"
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate({...newTemplate, message: e.target.value})}
                />
                <p className="text-xs text-gray-500">
                  Use {"{variavel}"} para inserir dados dinâmicos. Ex: {"{nome}, {valor}, {data}"}
                </p>
              </div>
              {newTemplate.message && (
                <div className="space-y-2">
                  <Label>Variáveis Detectadas</Label>
                  <div className="flex flex-wrap gap-2">
                    {extractVariables(newTemplate.message).map((variable, index) => (
                      <Badge key={index} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveTemplate} disabled={!newTemplate.name || !newTemplate.message}>
                  Salvar Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Templates Salvos</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Lista de todos os templates de mensagem</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => previewTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} className="text-xs bg-blue-100 text-blue-800">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className={
                    template.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }>
                    {template.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewTemplate(template);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplates(templates.filter(t => t.id !== template.id));
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview do Template</CardTitle>
            <p className="text-sm text-gray-600">Visualize como ficará a mensagem</p>
          </CardHeader>
          <CardContent>
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Badge variant="secondary">{selectedTemplate.category}</Badge>
                </div>
                <div className="space-y-2">
                  <Label>Variáveis</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((variable, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{selectedTemplate.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                <p>Selecione um template para visualizar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
