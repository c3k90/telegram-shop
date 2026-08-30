"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { shopFetch } from "@/lib/telegram/api";
import { formatMoney } from "@/lib/money";
import type { OrderDTO, OrderStatus } from "@/lib/types";

const statusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending payment",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export function OrdersList() {
  const searchParams = useSearchParams();
  const placed = searchParams.get("placed");
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shopFetch<OrderDTO[]>("/api/shop/orders")
      .then(setOrders)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load orders");
      });
  }, []);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!orders) return <p className="text-sm text-muted-foreground">Loading orders…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      {placed ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm">
          Order placed. Status is pending until the shop confirms payment.
        </p>
      ) : null}
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="space-y-2 rounded-xl border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {formatMoney(order.total, order.currency)}
                </p>
                <Badge variant="secondary">{statusLabel[order.status]}</Badge>
              </div>
              <ul className="text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.title} × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
