"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export interface User {
  id: string;
  name: string | null;
  email: string;
}

export interface UpdateProfileData {
  name: string;
}

// Funções de API
const fetchProfile = async (): Promise<{ user: User }> => {
  const response = await fetch("/api/auth/profile");
  if (!response.ok) {
    throw new Error("Erro ao carregar perfil");
  }
  return response.json();
};

const updateProfile = async (
  data: UpdateProfileData
): Promise<{ user: User; message: string }> => {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao atualizar perfil");
  }

  return response.json();
};

// Query Keys
export const profileKeys = {
  all: ["profile"] as const,
  profile: () => [...profileKeys.all, "user"] as const,
};

// Hooks
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { update: updateSession } = useSession();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      // Atualizar cache do React Query
      queryClient.setQueryData(profileKeys.profile(), data);

      // Atualizar a sessão do NextAuth sem refresh
      await updateSession({
        name: data.user.name,
        email: data.user.email,
      });

      // O toast será exibido automaticamente pelo sistema centralizado
      // pois data.message existe na resposta da API
    },
    // onError removido - será tratado pelo sistema centralizado
  });
}
