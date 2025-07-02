"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ViewMode } from "@/components/ui/data-table";

interface UseViewModeOptions {
  defaultMode?: ViewMode;
  paramName?: string;
}

export function useViewMode(options: UseViewModeOptions = {}) {
  const { defaultMode = "table", paramName = "view" } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentMode = useMemo(() => {
    const mode = searchParams.get(paramName);
    return mode === "table" || mode === "cards" ? mode : defaultMode;
  }, [searchParams, paramName, defaultMode]);

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());

      // Só atualiza se o modo realmente mudou
      if (mode === defaultMode) {
        params.delete(paramName);
      } else {
        params.set(paramName, mode);
      }

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname, paramName, defaultMode]
  );

  return {
    viewMode: currentMode,
    setViewMode,
  };
}
