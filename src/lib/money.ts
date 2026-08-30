export function formatMoney(amount: number, currency: string): string {
  if (currency === "XTR") {
    return `${amount} Stars`;
  }

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  }
}

export function currencyLabel(currency: string): string {
  return currency === "XTR" ? "Telegram Stars" : currency;
}
