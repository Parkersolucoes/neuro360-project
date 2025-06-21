
import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadSectionProps {
  currentImage: string;
  previewImage: string | null;
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadSection({
  currentImage,
  previewImage,
  isUploading,
  onImageUpload
}: ImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label>Imagem de Fundo do Login</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {previewImage || currentImage ? (
          <div className="space-y-3">
            <img
              src={previewImage || currentImage}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Alterar Imagem'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">
              Clique para adicionar uma imagem de fundo
            </p>
            <p className="text-sm text-gray-500">
              Recomendado: 1920x1080px, máximo 5MB
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Escolher Imagem'}
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
