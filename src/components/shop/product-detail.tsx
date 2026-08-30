"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { ProductDTO } from "@/lib/types";

export function ProductDetail({ productId }: { productId: string }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shop/products/${productId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<ProductDTO>;
      })
      .then(setProduct)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Product not found");
      });
  }, [productId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!product) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const outOfStock = product.stock !== null && product.stock <= 0;

  return (
    <div className="space-y-4">
      <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl bg-muted text-4xl font-semibold text-muted-foreground">
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
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{product.title}</h1>
          <Badge variant="secondary">{product.type.toLowerCase()}</Badge>
        </div>
        <p className="text-lg font-medium">
          {formatMoney(product.price, product.currency)}
        </p>
        {product.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
        ) : null}
        {product.stock !== null ? (
          <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
        ) : null}
      </div>
      <Button
        className="w-full"
        disabled={outOfStock}
        onClick={() => {
          addItem(product.id);
          router.push("/cart");
        }}
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );
}
