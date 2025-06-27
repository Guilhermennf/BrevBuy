"use client";

import { toast } from "@/hooks/use-toast";

export function useAuthToast() {
  const showLoginError = () => {
    toast({
      title: "Erro no login",
      description: "Email ou senha incorretos.",
      variant: "destructive",
    });
  };

  const showLoginSuccess = () => {
    toast({
      title: "Login realizado com sucesso!",
      description: "Redirecionando para o dashboard...",
    });
  };

  const showPasswordMismatch = () => {
    toast({
      title: "Erro",
      description: "As senhas não coincidem.",
      variant: "destructive",
    });
  };

  return {
    showLoginError,
    showLoginSuccess,
    showPasswordMismatch,
  };
}
