import type { Order, PaymentProvider } from "@/generated/prisma/client";

export interface CheckoutResult {
  provider: PaymentProvider;
  redirectUrl?: string;
}

export interface PaymentAdapter {
  provider: PaymentProvider;
  createCheckout(order: Order): Promise<CheckoutResult>;
  markPaid(orderId: string): Promise<void>;
}
