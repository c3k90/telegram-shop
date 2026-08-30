import type { PaymentAdapter } from "@/lib/payments/types";

export const manualPaymentAdapter: PaymentAdapter = {
  provider: "MANUAL",
  async createCheckout() {
    return { provider: "MANUAL", redirectUrl: "/orders" };
  },
  async markPaid() {
    // Manual payments are marked paid from the admin dashboard.
  },
};
