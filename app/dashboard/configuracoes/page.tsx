"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUpdateProfile } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Palette, Save, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";

export default function ConfiguracoesPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();
  const updateProfileMutation = useUpdateProfile();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(
      {
        name: formData.name.trim(),
      },
      {
        onSuccess: async (data) => {
          // Atualizar a sessão localmente
          await updateSession({
            ...session,
            user: {
              ...session?.user,
              name: data.user.name,
            },
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize sua experiência</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>Informações básicas da conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateProfileMutation.isPending
                ? "Salvando..."
                : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a interface do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tema</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha entre tema claro ou escuro
              </p>
              <div className="grid grid-cols-2 gap-4">
                {/* Tema Claro */}
                <div
                  className={`cursor-pointer relative ${
                    theme === "light" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <div className="border border-gray-200 rounded-md p-4 bg-white">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded-md w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded-md w-1/2"></div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <div className="h-3 bg-gray-300 rounded-md w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                        <div className="h-3 bg-gray-300 rounded-md w-2/3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-2">Claro</div>
                  {theme === "light" && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Tema Escuro */}
                <div
                  className={`cursor-pointer relative ${
                    theme === "dark" ? "ring-2 ring-white" : ""
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="border border-gray-700 rounded-md p-4 bg-[#1e2b3f]">
                    <div className="space-y-2">
                      <div className="h-3 bg-[#3a4a63] rounded-md w-3/4"></div>
                      <div className="h-3 bg-[#3a4a63] rounded-md w-1/2"></div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#5a6a83]"></div>
                        <div className="h-3 bg-[#3a4a63] rounded-md w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#5a6a83]"></div>
                        <div className="h-3 bg-[#3a4a63] rounded-md w-2/3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-2">Escuro</div>
                  {theme === "dark" && (
                    <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                      <Check className="h-4 w-4 text-black" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
