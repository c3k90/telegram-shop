"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { ProductDTO } from "@/lib/types";

export function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:bg-muted/40">
        <div className="flex aspect-[16/10] items-center justify-center bg-muted text-3xl font-semibold text-muted-foreground">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            product.title.slice(0, 1)
          )}
        </div>
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{product.title}</CardTitle>
            <Badge variant="secondary">{product.type.toLowerCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm font-medium">
          {formatMoney(product.price, product.currency)}
        </CardContent>
      </Card>
    </Link>
  );
}
