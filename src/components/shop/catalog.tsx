"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import type { CatalogResponse } from "@/lib/types";

export function Catalog() {
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | "all">("all");

  useEffect(() => {
    fetch("/api/shop/catalog")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<CatalogResponse>;
      })
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load catalog");
      });
  }, []);

  const products = useMemo(() => {
    if (!data) return [];
    if (categoryId === "all") return data.products;
    return data.products.filter((product) => product.categoryId === categoryId);
  }, [data, categoryId]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading catalog…</p>;
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{data.settings.name}</h1>
        <p className="text-sm text-muted-foreground">{data.settings.welcomeMessage}</p>
      </header>

      {data.categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategoryId("all")}>
            <Badge variant={categoryId === "all" ? "default" : "secondary"}>All</Badge>
          </button>
          {data.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
            >
              <Badge variant={categoryId === category.id ? "default" : "secondary"}>
                {category.name}
              </Badge>
            </button>
          ))}
        </div>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
