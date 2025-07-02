"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  paramName?: string;
  pageSizeParamName?: string;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 10,
    paramName = "page",
    pageSizeParamName = "pageSize",
  } = options;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    const page = searchParams.get(paramName);
    return page ? parseInt(page, 10) : defaultPage;
  }, [searchParams, paramName, defaultPage]);

  const pageSize = useMemo(() => {
    const size = searchParams.get(pageSizeParamName);
    return size ? parseInt(size, 10) : defaultPageSize;
  }, [searchParams, pageSizeParamName, defaultPageSize]);

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete(paramName);
      } else {
        params.set(paramName, page.toString());
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname, paramName]
  );

  const setPageSize = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (size === defaultPageSize) {
        params.delete(pageSizeParamName);
      } else {
        params.set(pageSizeParamName, size.toString());
      }
      // Reset to first page when changing page size
      params.delete(paramName);
      router.push(`${pathname}?${params.toString()}`);
    },
    [
      searchParams,
      router,
      pathname,
      pageSizeParamName,
      paramName,
      defaultPageSize,
    ]
  );

  const goToPage = useCallback(
    (page: number) => {
      setPage(page);
    },
    [setPage]
  );

  const nextPage = useCallback(() => {
    setPage(currentPage + 1);
  }, [setPage, currentPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [setPage, currentPage]);

  const resetPagination = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    params.delete(pageSizeParamName);
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname, paramName, pageSizeParamName]);

  return {
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    goToPage,
    nextPage,
    previousPage,
    resetPagination,
  };
}
