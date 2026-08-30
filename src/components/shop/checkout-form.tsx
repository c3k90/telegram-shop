"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/shop/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shopFetch } from "@/lib/telegram/api";
import { formatMoney } from "@/lib/money";
import type { CatalogResponse, OrderDTO, ProductDTO } from "@/lib/types";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState({
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostal: "",
    shippingCountry: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/shop/catalog")
      .then((res) => res.json() as Promise<CatalogResponse>)
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, []);

  const rows = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { item, product } : null;
        })
        .filter((row): row is { item: (typeof items)[number]; product: ProductDTO } =>
          Boolean(row),
        ),
    [items, products],
  );

  const needsShipping = rows.some((row) => row.product.type === "PHYSICAL");
  const total = rows.reduce(
    (sum, row) => sum + row.product.price * row.item.quantity,
    0,
  );
  const currency = rows[0]?.product.currency ?? "EUR";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await shopFetch<{ order: OrderDTO }>("/api/shop/checkout", {
        method: "POST",
        body: JSON.stringify({
          items,
          note,
          ...shipping,
        }),
      });
      clear();
      router.push(`/orders?placed=${result.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Your cart is empty.</p>;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <ul className="space-y-2 text-sm">
        {rows.map(({ item, product }) => (
          <li key={product.id} className="flex justify-between gap-3">
            <span>
              {product.title} × {item.quantity}
            </span>
            <span>{formatMoney(product.price * item.quantity, product.currency)}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium">Total {formatMoney(total, currency)}</p>

      {needsShipping ? (
        <div className="space-y-3 rounded-xl border p-3">
          <p className="text-sm font-medium">Shipping</p>
          <Field
            label="Full name"
            value={shipping.shippingName}
            onChange={(value) => setShipping((s) => ({ ...s, shippingName: value }))}
            required
          />
          <Field
            label="Address"
            value={shipping.shippingAddress}
            onChange={(value) =>
              setShipping((s) => ({ ...s, shippingAddress: value }))
            }
            required
          />
          <Field
            label="City"
            value={shipping.shippingCity}
            onChange={(value) => setShipping((s) => ({ ...s, shippingCity: value }))}
            required
          />
          <Field
            label="Postal code"
            value={shipping.shippingPostal}
            onChange={(value) =>
              setShipping((s) => ({ ...s, shippingPostal: value }))
            }
            required
          />
          <Field
            label="Country"
            value={shipping.shippingCountry}
            onChange={(value) =>
              setShipping((s) => ({ ...s, shippingCountry: value }))
            }
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note for the seller"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Placing order…" : "Place order"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Payment is manual for now. The shop owner will confirm your order in admin.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
