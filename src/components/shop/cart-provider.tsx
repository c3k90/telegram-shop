"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "telegram-shop-cart";
const emptyCart: CartItem[] = [];
let cartItems: CartItem[] = emptyCart;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : emptyCart;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return emptyCart;
  }
}

function writeCart(next: CartItem[]) {
  cartItems = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

if (typeof window !== "undefined") {
  cartItems = readStorage();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cartItems;
}

function getServerSnapshot() {
  return emptyCart;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const current = readStorage();
    const next =
      quantity <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.some((item) => item.productId === productId)
          ? current.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            )
          : [...current, { productId, quantity }];
    writeCart(next);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem: (productId, quantity = 1) => {
        const existing = readStorage().find((item) => item.productId === productId);
        setQuantity(productId, (existing?.quantity ?? 0) + quantity);
      },
      setQuantity,
      removeItem: (productId) => setQuantity(productId, 0),
      clear: () => writeCart(emptyCart),
    }),
    [items, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
