import { Suspense } from "react";
import { OrdersList } from "@/components/shop/orders-list";

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading orders…</p>}>
      <OrdersList />
    </Suspense>
  );
}
