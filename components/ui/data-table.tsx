"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table as TableIcon,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { useViewMode } from "@/hooks/use-view-mode";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "cards";

interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  defaultViewMode?: ViewMode;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  cardRenderer?: (item: T) => React.ReactNode;
  actionsRenderer?: (item: T) => React.ReactNode;
  className?: string;
  showViewToggle?: boolean;
  showPagination?: boolean;
  paramName?: string;
  pageSizeParamName?: string;
  viewModeParamName?: string;
  isLoading?: boolean;
}

// Componente de loading para tabela
function TableLoadingSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Componente de loading para cards
function CardsLoadingSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-muted rounded animate-pulse"></div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
                <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de loading para categorias
function CategoryCardsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
          <div className="flex justify-between">
            <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente principal do conteúdo
function DataTableContent<T>({
  data,
  columns,
  defaultViewMode = "table",
  pageSize = 10,
  emptyMessage = "Nenhum item encontrado",
  emptyIcon: EmptyIcon,
  cardRenderer,
  actionsRenderer,
  className,
  showViewToggle = true,
  showPagination = true,
  paramName = "page",
  pageSizeParamName = "pageSize",
  viewModeParamName = "view",
  isLoading = false,
}: DataTableProps<T>) {
  const {
    currentPage,
    pageSize: currentPageSize,
    goToPage,
    nextPage,
    previousPage,
  } = usePagination({
    defaultPageSize: pageSize,
    paramName,
    pageSizeParamName,
  });

  const { viewMode, setViewMode } = useViewMode({
    defaultMode: defaultViewMode,
    paramName: viewModeParamName,
  });

  // Calcular dados da paginação
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = startIndex + currentPageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Se está carregando, mostrar skeleton baseado no modo
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {showViewToggle && (
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          </div>
        )}

        {viewMode === "table" ? (
          <TableLoadingSkeleton />
        ) : // Detectar se é categoria ou produto baseado na presença de cardRenderer
        cardRenderer ? (
          <CategoryCardsLoadingSkeleton />
        ) : (
          <CardsLoadingSkeleton />
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {EmptyIcon && (
          <EmptyIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com toggle de visualização */}
      {showViewToggle && (
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {viewMode === "table" ? (
                    <>
                      <TableIcon className="h-4 w-4" />
                      Tabela
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="h-4 w-4" />
                      Cards
                    </>
                  )}
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewModeChange("table")}>
                  <TableIcon className="mr-2 h-4 w-4" />
                  Visualizar como Tabela
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewModeChange("cards")}>
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  Visualizar como Cards
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                {actionsRenderer && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.accessor(item)}
                    </TableCell>
                  ))}
                  {actionsRenderer && (
                    <TableCell>{actionsRenderer(item)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1">
          {paginatedData.map((item, index) => (
            <div key={index}>
              {cardRenderer ? (
                cardRenderer(item)
              ) : (
                <Card className="p-3 sm:p-4">
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      {columns.map((column) => (
                        <div
                          key={column.key}
                          className="flex justify-between items-start"
                        >
                          <span className="text-sm font-medium text-muted-foreground">
                            {column.header}:
                          </span>
                          <div className="text-right flex-1 ml-2">
                            {column.accessor(item)}
                          </div>
                        </div>
                      ))}
                      {actionsRenderer && (
                        <div className="flex justify-end pt-2">
                          {actionsRenderer(item)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principal com Suspense
export function DataTable<T>(props: DataTableProps<T>) {
  return (
    <Suspense fallback={<DataTableContent {...props} isLoading={true} />}>
      <DataTableContent {...props} />
    </Suspense>
  );
}
