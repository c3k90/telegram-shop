export type ProductType = "DIGITAL" | "PHYSICAL" | "SERVICE";
export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";
export type PaymentProvider = "MANUAL" | "STARS";

export interface ShopSettingsDTO {
  id: string;
  name: string;
  welcomeMessage: string;
  currency: string;
  checkoutEnabled: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  sortOrder: number;
}

export interface ProductDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: ProductType;
  stock: number | null;
  active: boolean;
  imageUrl: string | null;
  categoryId: string | null;
  category: CategoryDTO | null;
}

export interface CatalogResponse {
  settings: ShopSettingsDTO;
  categories: CategoryDTO[];
  products: ProductDTO[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDTO {
  id: string;
  status: OrderStatus;
  paymentProvider: PaymentProvider;
  currency: string;
  total: number;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingPostal: string | null;
  shippingCountry: string | null;
  note: string | null;
  items: OrderItemDTO[];
  createdAt: string;
}
