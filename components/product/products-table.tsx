"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProductActions } from "@/components/product/product-actions";
import { ProductImage } from "@/components/product/product-image";
import {
  useProducts,
  ProductsFilters,
  Product,
} from "@/hooks/use-products-query";
import { usePagination } from "@/hooks/use-pagination";
import { LoadingSkeletonWrapper } from "@/components/ui/loading-skeleton-wrapper";

interface ProductsTableProps {
  filters?: ProductsFilters;
}

function ProductsTableContent({ filters }: ProductsTableProps) {
  const { data: products = [], isLoading } = useProducts(filters);
  const { currentPage, pageSize, goToPage, nextPage, previousPage } =
    usePagination({
      defaultPageSize: 10,
    });

  // Calcular dados da paginação
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-muted-foreground mb-4 px-4 text-sm sm:text-base">
          {filters?.categoryId || filters?.status
            ? "Nenhum produto encontrado com os filtros aplicados"
            : "Comece adicionando seu primeiro produto para revenda"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-center">Categoria</TableHead>
              <TableHead className="text-center">Preço Compra</TableHead>
              <TableHead className="text-center">Preço Venda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Data</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-lg overflow-hidden border">
                    <ProductImage
                      image={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {product.name.length > 20
                        ? product.name.slice(0, 20) + "..."
                        : product.name}
                    </div>
                    {product.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {product.category ? (
                    <Badge variant="outline" className="gap-1">
                      {product.category.icon && (
                        <span>{product.category.icon}</span>
                      )}
                      {product.category.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Sem categoria</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  R$ {product.buyPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {product.sellPrice ? (
                    <span className="font-medium">
                      R$ {product.sellPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "SOLD" ? "secondary" : "default"
                    }
                  >
                    {product.status === "SOLD" ? "Vendido" : "Disponível"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(product.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <ProductActions product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex justify-end items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1}
            >
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
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductsTable({ filters }: ProductsTableProps) {
  return (
    <LoadingSkeletonWrapper
      isLoading={false}
      skeletonType="list"
      skeletonCount={5}
    >
      <ProductsTableContent filters={filters} />
    </LoadingSkeletonWrapper>
  );
}
