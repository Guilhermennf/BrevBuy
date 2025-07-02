"use client";

import { Suspense } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductActions } from "@/components/product/product-actions";
import { ProductImage } from "@/components/product/product-image";
import { useProducts, ProductsFilters } from "@/hooks/use-products-query";
import { LoadingSkeletonWrapper } from "../ui/loading-skeleton-wrapper";

interface ProductListProps {
  filters?: ProductsFilters;
}

function ProductListComponent({ filters }: ProductListProps) {
  const { data: products = [] } = useProducts(filters);

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
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1 overflow-y-auto">
      {products.map((product) => (
        <Card key={product.id} className="p-3 sm:p-4">
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
                          <span className="text-xs">
                            {product.category.icon}
                          </span>
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
                        <Badge
                          variant="outline"
                          className="gap-1 flex-shrink-0"
                        >
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
                            R${" "}
                            {(product.sellPrice - product.buyPrice).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {product.supplier && (
                        <div>
                          <span className="text-muted-foreground">
                            Fornecedor:{" "}
                          </span>
                          <span className="font-medium">
                            {product.supplier}
                          </span>
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
      ))}
    </div>
  );
}

export function ProductList({ filters }: ProductListProps) {
  const { error, isLoading } = useProducts(filters);

  if (error) return <div>Erro ao carregar produtos</div>;

  return (
    <LoadingSkeletonWrapper
      isLoading={isLoading}
      skeletonType="list"
      skeletonCount={3}
    >
      <ProductListComponent filters={filters} />
    </LoadingSkeletonWrapper>
  );
}
