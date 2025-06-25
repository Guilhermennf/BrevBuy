"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductActions } from "@/components/product-actions";
import { ProductImage } from "@/components/product-image";
import {
  useProducts,
  ProductsFilters,
  Product,
} from "@/hooks/use-products-query";

interface ProductListClientProps {
  filters?: ProductsFilters;
}

export function ProductListClient({ filters }: ProductListClientProps) {
  const { data: products = [], isLoading: loading } = useProducts(filters);

  // Os produtos já vêm no tipo correto do React Query

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-muted-foreground mb-4">
          {filters?.categoryId || filters?.status
            ? "Nenhum produto encontrado com os filtros aplicados"
            : "Comece adicionando seu primeiro produto para revenda"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
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
                  {product.category && (
                    <Badge variant="outline" className="gap-1">
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
