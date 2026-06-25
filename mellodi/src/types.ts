export enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum OrderType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
  DINE_IN = "DINE_IN"
}

export enum MembershipTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  DIAMOND = "DIAMOND",
  VIP_BLACK = "VIP_BLACK"
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  chineseName?: string;
  description: string;
  category: "Milk Tea" | "Pure Tea" | "Fruit Tea" | "Coffee" | "Desserts" | "Merchandise";
  priceUSD: number;
  image: string;
  variants: ProductVariant[];
  nutrition: {
    calories: number;
    sugarGrams: number;
    fatGrams: number;
  };
  allergens: string[];
  stockLevel?: number;
  minAlert?: number;
  unit?: string;
}

export interface Topping {
  id: string;
  name: string;
  priceUSD: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariantOptions: Record<string, string>;
  selectedToppings: Topping[];
  notes?: string;
}

export interface OrderItem {
  productName: string;
  category: string;
  quantity: number;
  priceUSD: number;
  variants: string[];
  toppings: string[];
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalUSD: number;
  status: OrderStatus;
  type: OrderType;
  storeId: string;
  storeName: string;
  timestamp: string;
  country: string;
  currency: string;
  exchangeRate: number;
  pointsEarned: number;
  isPaid: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  hours: string;
  capacity: string;
  services: string[];
  latitude: number;
  longitude: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Ingredients" | "Packaging" | "Merchandise";
  stockLevel: number;
  minAlert: number;
  unit: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  exchangeRate: number; // 1 USD = X Currency
  flag: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: "ORDER" | "PROMO" | "ALERT";
  read: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  pointsCost: number;
  stock: number;
  image: string;
}

export interface SystemUser {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";
  lenPoints: number;
  tier: MembershipTier;
  referralCode: string;
}
