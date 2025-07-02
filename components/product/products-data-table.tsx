"use client";

import { useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataTable } from "@/components/ui/data-table";
import { ProductActions } from "./product-actions";
import { ProductImage } from "./product-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/hooks/use-products-query";

interface ProductsDataTableProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductsDataTable({
  products,
  isLoading,
}: ProductsDataTableProps) {
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "image",
        header: "Imagem",
        accessor: (product: Product) => (
          <ProductImage
            image={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-md object-cover"
          />
        ),
        className: "w-16",
      },
      {
        key: "name",
        header: "Nome",
        accessor: (product: Product) => (
          <div className="font-medium">{product.name}</div>
        ),
      },
      {
        key: "category",
        header: "Categoria",
        accessor: (product: Product) => (
          <Badge variant="secondary">
            {product.category?.icon && (
              <span className="text-xs mr-1">{product.category.icon}</span>
            )}
            {product.category?.name || "Sem categoria"}
          </Badge>
        ),
      },
      {
        key: "price",
        header: "Preço",
        accessor: (product: Product) => (
          <div className="font-medium">
            {formatCurrency(product.sellPrice || product.buyPrice)}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        accessor: (product: Product) => (
          <Badge
            variant={product.status === "SOLD" ? "destructive" : "default"}
          >
            {product.status === "SOLD" ? "Vendido" : "Disponível"}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        header: "Data de Criação",
        accessor: (product: Product) => (
          <div className="text-sm text-muted-foreground">
            {new Date(product.createdAt).toLocaleDateString("pt-BR")}
          </div>
        ),
      },
    ],
    [formatCurrency]
  );

  const cardRenderer = useCallback(
    (product: Product) => (
      <Card className="p-3 sm:p-4">
        <CardContent className="p-0">
          {/* Layout Mobile - Vertical */}
          <div className="flex flex-col sm:hidden space-y-3">
            {/* Header com imagem e título */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border">
                <ProductImage
                  image={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight mb-2">
                  {product.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={
                      product.status === "SOLD" ? "secondary" : "default"
                    }
                    className="text-xs"
                  >
                    {product.status === "SOLD" ? "Vendido" : "Disponível"}
                  </Badge>
                  {product.category && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      {product.category.icon && (
                        <span className="text-xs">{product.category.icon}</span>
                      )}
                      <span>{product.category.name}</span>
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <ProductActions product={product} />
                </div>
              </div>
            </div>

            {/* Descrição */}
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Informações financeiras - Grid 2x2 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/30 rounded p-2">
                <span className="text-muted-foreground block">Compra</span>
                <span className="font-medium">
                  R$ {product.buyPrice.toFixed(2)}
                </span>
              </div>

              {product.sellPrice && (
                <div className="bg-muted/30 rounded p-2">
                  <span className="text-muted-foreground block">Venda</span>
                  <span className="font-medium">
                    R$ {product.sellPrice.toFixed(2)}
                  </span>
                </div>
              )}

              {product.sellPrice && (
                <div className="bg-green-50 dark:bg-green-950/30 rounded p-2">
                  <span className="text-muted-foreground block">Lucro</span>
                  <span className="font-medium text-green-600">
                    R$ {(product.sellPrice - product.buyPrice).toFixed(2)}
                  </span>
                </div>
              )}

              {product.supplier && (
                <div className="bg-muted/30 rounded p-2">
                  <span className="text-muted-foreground block text-xs">
                    Fornecedor
                  </span>
                  <span className="font-medium text-xs truncate block">
                    {product.supplier}
                  </span>
                </div>
              )}
            </div>

            {/* Data */}
            <div className="text-xs text-muted-foreground">
              Adicionado em{" "}
              {format(new Date(product.createdAt), "dd/MM/yyyy", {
                locale: ptBR,
              })}
              {product.soldAt && (
                <>
                  {" • Vendido em "}
                  {format(new Date(product.soldAt), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </>
              )}
            </div>
          </div>

          {/* Layout Desktop - Horizontal */}
          <div className="hidden sm:flex items-start gap-4">
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border">
              <ProductImage
                image={product.image}
                alt={product.name}
                width={80}
                height={80}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold truncate text-base lg:text-lg">
                      {product.name}
                    </h3>
                    <Badge
                      variant={
                        product.status === "SOLD" ? "secondary" : "default"
                      }
                      className="flex-shrink-0"
                    >
                      {product.status === "SOLD" ? "Vendido" : "Disponível"}
                    </Badge>
                    {product.category && (
                      <Badge variant="outline" className="gap-1 flex-shrink-0">
                        {product.category.icon && (
                          <span>{product.category.icon}</span>
                        )}
                        <span>{product.category.name}</span>
                      </Badge>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div>
                      <span className="text-muted-foreground">Compra: </span>
                      <span className="font-medium">
                        R$ {product.buyPrice.toFixed(2)}
                      </span>
                    </div>

                    {product.sellPrice && (
                      <div>
                        <span className="text-muted-foreground">Venda: </span>
                        <span className="font-medium">
                          R$ {product.sellPrice.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {product.sellPrice && (
                      <div>
                        <span className="text-muted-foreground">Lucro: </span>
                        <span className="font-medium text-green-600">
                          R$ {(product.sellPrice - product.buyPrice).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {product.supplier && (
                      <div>
                        <span className="text-muted-foreground">
                          Fornecedor:{" "}
                        </span>
                        <span className="font-medium">{product.supplier}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    Adicionado em{" "}
                    {format(
                      new Date(product.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      }
                    )}
                    {product.soldAt && (
                      <>
                        {" • Vendido em "}
                        {format(
                          new Date(product.soldAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          {
                            locale: ptBR,
                          }
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                  <div className="relative">
                    <ProductActions product={product} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    []
  );

  const actionsRenderer = useCallback(
    (product: Product) => <ProductActions product={product} />,
    []
  );

  return (
    <DataTable
      data={products}
      columns={columns}
      cardRenderer={cardRenderer}
      actionsRenderer={actionsRenderer}
      emptyMessage="Nenhum produto encontrado"
      showViewToggle={true}
      showPagination={true}
      pageSize={10}
      isLoading={isLoading}
    />
  );
}
