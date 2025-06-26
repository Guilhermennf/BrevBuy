"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductActions } from "@/components/product-actions";
import { ProductImage } from "@/components/product-image";
import { useProducts } from "@/hooks/use-products-query";
import { useMemo } from "react";

interface ProductListProps {
  filter?: "AVAILABLE" | "SOLD";
  categoryId?: string;
}

export function ProductList({ filter, categoryId }: ProductListProps = {}) {
  const { data: allProducts = [], isLoading: loading } = useProducts();

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      if (filter && product.status !== filter) return false;
      if (
        categoryId &&
        categoryId !== "ALL" &&
        product.categoryId !== categoryId
      )
        return false;
      return true;
    });
  }, [allProducts, filter, categoryId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-muted-foreground mb-4">
          {filter || categoryId
            ? "Nenhum produto encontrado com os filtros aplicados"
            : "Comece adicionando seu primeiro produto para revenda"}
        </p>
      </div>
    );
  }

  // Converter produtos para o tipo que ProductActions espera
  const convertedProducts = filteredProducts.map((product) => ({
    ...product,
    categoryId: product.categoryId || null,
    category: null,
  }));

  return (
    <div className="grid gap-4 grid-cols-1">
      {convertedProducts.map((product) => (
        <Card key={product.id} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  width={80}
                  height={80}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <Badge
                    variant={
                      product.status === "SOLD" ? "secondary" : "default"
                    }
                  >
                    {product.status === "SOLD" ? "Vendido" : "Disponível"}
                  </Badge>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
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

              <div className="flex-shrink-0">
                <ProductActions product={product} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
