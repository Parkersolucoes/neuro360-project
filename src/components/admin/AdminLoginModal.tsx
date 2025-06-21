
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (password: string) => Promise<boolean>;
}

export function AdminLoginModal({ open, onOpenChange, onLogin }: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onLogin(password);
    if (success) {
      setPassword('');
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>Acesso Administrativo</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="masterPassword">Senha Master</Label>
            <Input
              id="masterPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha master"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              Para teste, use: admin123
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Verificando...' : 'Acessar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
