import { CartProvider } from "@/components/shop/cart-provider";
import { ShopNav } from "@/components/shop/shop-nav";
import { TelegramProvider } from "@/components/telegram-provider";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelegramProvider>
      <CartProvider>
        <div className="shop-shell mx-auto flex min-h-dvh w-full max-w-lg flex-col pb-20">
          <main className="flex-1 px-4 py-5">{children}</main>
          <ShopNav />
        </div>
      </CartProvider>
    </TelegramProvider>
  );
}
