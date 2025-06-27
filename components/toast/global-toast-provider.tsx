"use client";

import { useApiInterceptor } from "@/hooks/use-api-interceptor";

export function GlobalToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ativar o interceptor de APIs globalmente
  useApiInterceptor();

  return <>{children}</>;
}
