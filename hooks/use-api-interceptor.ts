"use client";

import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface ApiResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
}

// Mapeamento de endpoints para mensagens personalizadas
const endpointMessages = {
  // Autenticação
  "/api/auth/register": {
    success: "Conta criada com sucesso! Agora você pode fazer login.",
    error: "Erro ao criar conta",
  },
  "/api/auth/profile": {
    success: "Perfil atualizado com sucesso!",
    error: "Erro ao atualizar perfil",
  },

  // Produtos
  "/api/products": {
    success: "Produto salvo com sucesso!",
    error: "Erro ao salvar produto",
  },

  // Upload
  "/api/upload": {
    success: "Upload realizado com sucesso!",
    error: "Erro no upload",
  },

  // Categorias
  "/api/categories": {
    success: "Categoria salva com sucesso!",
    error: "Erro ao salvar categoria",
  },

  // Venda de produtos
  "/sell": {
    success: "Produto vendido com sucesso!",
    error: "Erro ao vender produto",
  },

  // Automação
  "/api/automation/analyze-screenshot": {
    success: "Análise concluída com sucesso!",
    error: "Erro na análise da imagem",
  },
};

// Função para obter mensagem baseada no endpoint e método
const getMessageForEndpoint = (
  url: string,
  method: string,
  isSuccess: boolean
) => {
  // Procurar por correspondências exatas primeiro
  const exactMatch = endpointMessages[url as keyof typeof endpointMessages];
  if (exactMatch) {
    return isSuccess ? exactMatch.success : exactMatch.error;
  }

  // Procurar por correspondências parciais
  for (const [endpoint, messages] of Object.entries(endpointMessages)) {
    if (url.includes(endpoint)) {
      return isSuccess ? messages.success : messages.error;
    }
  }

  // Mensagens padrão baseadas no método HTTP
  if (isSuccess) {
    switch (method) {
      case "POST":
        return "Criado com sucesso!";
      case "PUT":
      case "PATCH":
        return "Atualizado com sucesso!";
      case "DELETE":
        return "Excluído com sucesso!";
      default:
        return "Operação realizada com sucesso!";
    }
  } else {
    switch (method) {
      case "POST":
        return "Erro ao criar";
      case "PUT":
      case "PATCH":
        return "Erro ao atualizar";
      case "DELETE":
        return "Erro ao excluir";
      default:
        return "Erro na operação";
    }
  }
};

export function useApiInterceptor() {
  useEffect(() => {
    // Interceptar o fetch global
    const originalFetch = window.fetch;

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method || "GET";

      try {
        const response = await originalFetch(input, init);

        // Só interceptar chamadas para APIs internas (que começam com /api)
        // IGNORAR métodos GET (queries não precisam de toast de sucesso)
        if (
          (url.startsWith("/api") || url.includes("/api")) &&
          method !== "GET"
        ) {
          const isSuccess = response.ok;

          // Clonar a response para ler o body sem afetar o consumo original
          const clonedResponse = response.clone();

          try {
            const data = await clonedResponse.json();

            if (isSuccess) {
              // Exibir toast de sucesso apenas para mutations (POST, PUT, PATCH, DELETE)
              const message =
                data.message || getMessageForEndpoint(url, method, true);
              toast({
                title: "Sucesso!",
                description: message,
              });
            } else {
              // Exibir toast de erro
              const errorMessage =
                data.error ||
                data.message ||
                getMessageForEndpoint(url, method, false);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
            }
          } catch (jsonError) {
            // Se não conseguir fazer parse do JSON, usar mensagens padrão
            if (isSuccess) {
              toast({
                title: "Sucesso!",
                description: getMessageForEndpoint(url, method, true),
              });
            } else {
              toast({
                title: "Erro",
                description: `${getMessageForEndpoint(url, method, false)} (${
                  response.status
                })`,
                variant: "destructive",
              });
            }
          }
        } else if (
          (url.startsWith("/api") || url.includes("/api")) &&
          method === "GET" &&
          !response.ok
        ) {
          // Para GETs, só mostrar toast em caso de ERRO
          const clonedResponse = response.clone();
          try {
            const data = await clonedResponse.json();
            const errorMessage =
              data.error || data.message || `Erro ao carregar dados`;
            toast({
              title: "Erro ao carregar",
              description: errorMessage,
              variant: "destructive",
            });
          } catch (jsonError) {
            toast({
              title: "Erro ao carregar",
              description: `Erro ao carregar dados (${response.status})`,
              variant: "destructive",
            });
          }
        }

        return response;
      } catch (networkError) {
        // Erro de rede
        if (url.startsWith("/api") || url.includes("/api")) {
          toast({
            title: "Erro de conexão",
            description: "Verifique sua conexão com a internet",
            variant: "destructive",
          });
        }
        throw networkError;
      }
    };

    // Cleanup: restaurar o fetch original quando o componente for desmontado
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}
