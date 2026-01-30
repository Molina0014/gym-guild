"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, Camera, Check, X, Image as ImageIcon } from "lucide-react";

interface AvatarUploaderProps {
  onImageSelected: (file: File) => void;
  onBack: () => void;
}

export function AvatarUploader({ onImageSelected, onBack }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem");
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }

      setSelectedFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onImageSelected(selectedFile);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Upload className="w-5 h-5 text-primary-500" />
          Enviar Foto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <>
            <div className="flex flex-col gap-3">
              {/* Upload de arquivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="flex items-center justify-center gap-2 p-4 border-pixel border-dashed border-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-gray-500" />
                <span className="font-pixel text-xs text-gray-600">
                  Escolher da Galeria
                </span>
              </label>

              {/* Câmera (mobile) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-camera"
              />
              <label
                htmlFor="avatar-camera"
                className="flex items-center justify-center gap-2 p-4 border-pixel border-dashed border-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Camera className="w-6 h-6 text-gray-500" />
                <span className="font-pixel text-xs text-gray-600">
                  Tirar Foto
                </span>
              </label>
            </div>

            <p className="font-pixel text-[8px] text-gray-500 text-center">
              Formatos aceitos: JPG, PNG, GIF
              <br />
              Tamanho máximo: 5MB
            </p>

            <Button variant="ghost" onClick={onBack} className="w-full">
              Voltar
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="relative w-48 h-48 border-pixel border-black shadow-pixel overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <p className="font-pixel text-[8px] text-gray-500 text-center">
              Esta será a imagem do seu personagem.
            </p>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClear} className="flex-1">
                <X className="w-4 h-4 mr-1" />
                Escolher Outra
              </Button>
              <Button
                variant="secondary"
                onClick={handleConfirm}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Usar Esta
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
