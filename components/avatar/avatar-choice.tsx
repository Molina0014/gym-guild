"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, Wand2, Sparkles } from "lucide-react";

interface AvatarChoiceProps {
  onChooseUpload: () => void;
  onChooseGenerate: () => void;
  onBack: () => void;
}

export function AvatarChoice({ onChooseUpload, onChooseGenerate, onBack }: AvatarChoiceProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          Escolha seu Avatar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-pixel text-[10px] text-gray-600 text-center mb-4">
          Como você quer definir a aparência do seu herói?
        </p>

        <button
          onClick={onChooseUpload}
          className="w-full p-4 border-pixel border-black bg-parchment text-gray-900 shadow-pixel hover:bg-primary-100 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 border-2 border-black flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="font-pixel text-sm">Enviar Foto</div>
              <div className="font-pixel text-[8px] text-gray-600">
                Use uma imagem que você já tem
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={onChooseGenerate}
          className="w-full p-4 border-pixel border-black bg-parchment text-gray-900 shadow-pixel hover:bg-accent-100 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent-100 border-2 border-black flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <div className="font-pixel text-sm">Criar com IA</div>
              <div className="font-pixel text-[8px] text-gray-600">
                Gere um avatar único com inteligência artificial
              </div>
            </div>
          </div>
        </button>

        <Button variant="ghost" onClick={onBack} className="w-full mt-4">
          Voltar
        </Button>
      </CardContent>
    </Card>
  );
}
