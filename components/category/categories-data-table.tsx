"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Package } from "lucide-react";
import { Category } from "@/hooks/use-categories-query";

interface CategoriesDataTableProps {
  categories: Category[];
  isLoading?: boolean;
  actionsRenderer?: (category: Category) => React.ReactNode;
}

export function CategoriesDataTable({
  categories,
  isLoading,
  actionsRenderer,
}: CategoriesDataTableProps) {
  const columns = [
    {
      key: "name",
      header: "Nome",
      accessor: (category: Category) => (
        <div className="font-medium">{category.name}</div>
      ),
    },
    {
      key: "description",
      header: "Descrição",
      accessor: (category: Category) => (
        <div className="text-sm text-muted-foreground">
          {category.description || "Sem descrição"}
        </div>
      ),
    },
    {
      key: "color",
      header: "Cor",
      accessor: (category: Category) => (
        <div className="flex items-center gap-2">
          {category.color && (
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: category.color }}
            />
          )}
          <span className="text-sm">{category.color || "Sem cor"}</span>
        </div>
      ),
    },
    {
      key: "icon",
      header: "Ícone",
      accessor: (category: Category) => (
        <div className="text-sm">{category.icon || "Sem ícone"}</div>
      ),
    },
    {
      key: "createdAt",
      header: "Data de Criação",
      accessor: (category: Category) => (
        <div className="text-sm text-muted-foreground">
          {new Date(category.createdAt).toLocaleDateString("pt-BR")}
        </div>
      ),
    },
  ];

  const cardRenderer = (category: Category) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {category.icon && <span className="text-xl">{category.icon}</span>}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: category.color || "#6b7280",
                }}
              />
              <span className="line-clamp-1">{category.name}</span>
            </div>
          </CardTitle>
          {actionsRenderer && (
            <div className="flex items-center gap-2">
              {actionsRenderer(category)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {category.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {category.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1">
            <Package className="w-3 h-3" />
            {category._count?.products || 0} produto
            {category._count?.products === 1 ? "" : "s"}
          </Badge>

          <span className="text-xs text-muted-foreground">
            Criada em {new Date(category.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DataTable
      data={categories}
      columns={columns}
      cardRenderer={cardRenderer}
      actionsRenderer={actionsRenderer}
      emptyMessage="Nenhuma categoria encontrada"
      showViewToggle={true}
      showPagination={true}
      pageSize={10}
      isLoading={isLoading}
    />
  );
}
