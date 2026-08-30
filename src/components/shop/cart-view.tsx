"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/shop/cart-provider";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { CatalogResponse, ProductDTO } from "@/lib/types";

export function CartView() {
  const { items, setQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<ProductDTO[]>([]);

  useEffect(() => {
    fetch("/api/shop/catalog")
      .then((res) => res.json() as Promise<CatalogResponse>)
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, []);

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return product ? { item, product } : null;
      })
      .filter((row): row is { item: (typeof items)[number]; product: ProductDTO } =>
        Boolean(row),
      );
  }, [items, products]);

  const total = rows.reduce(
    (sum, row) => sum + row.product.price * row.item.quantity,
    0,
  );
  const currency = rows[0]?.product.currency ?? "EUR";

  if (items.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button asChild>
          <Link href="/">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <ul className="space-y-3">
        {rows.map(({ item, product }) => (
          <li key={product.id} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(product.price, product.currency)}
                </p>
              </div>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => removeItem(product.id)}
              >
                Remove
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => setQuantity(product.id, item.quantity - 1)}
              >
                -
              </Button>
              <span className="min-w-6 text-center text-sm">{item.quantity}</span>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => setQuantity(product.id, item.quantity + 1)}
              >
                +
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Total</span>
        <span>{formatMoney(total, currency)}</span>
      </div>
      <Button asChild className="w-full">
        <Link href="/checkout">Checkout</Link>
      </Button>
    </div>
  );
}
