import { notFound, redirect } from "next/navigation";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const statuses = ["PENDING", "PAID", "FULFILLED", "CANCELLED"] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!order) notFound();

  const updateStatus = updateOrderStatusAction.bind(null, order.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Order</h1>
        <Badge variant="secondary">{order.status}</Badge>
      </div>
      <div className="space-y-1 text-sm">
        <p>
          Customer: {order.customer.firstName}{" "}
          {order.customer.username ? `@${order.customer.username}` : ""}
        </p>
        <p>Telegram ID: {order.customer.telegramId}</p>
        <p>Payment: {order.paymentProvider}</p>
        <p>Total: {formatMoney(order.total, order.currency)}</p>
      </div>
      <ul className="space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.id}>
            {item.title} × {item.quantity} —{" "}
            {formatMoney(item.unitPrice * item.quantity, order.currency)}
          </li>
        ))}
      </ul>
      {order.shippingAddress ? (
        <div className="rounded-lg border p-3 text-sm">
          <p className="font-medium">Shipping</p>
          <p>{order.shippingName}</p>
          <p>{order.shippingAddress}</p>
          <p>
            {order.shippingPostal} {order.shippingCity}
          </p>
          <p>{order.shippingCountry}</p>
        </div>
      ) : null}
      {order.note ? <p className="text-sm">Note: {order.note}</p> : null}
      <form action={updateStatus} className="flex items-center gap-2">
        <select
          name="status"
          defaultValue={order.status}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Update status
        </Button>
      </form>
    </div>
  );
}
