import { Product, Store, InventoryItem, Country, RewardItem, Topping, Order, OrderStatus, OrderType } from "./types";

export const COUNTRIES: Country[] = [
  { code: "VN", name: "Vietnam", currency: "VND", symbol: "₫", exchangeRate: 25400, flag: "🇻🇳" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$", exchangeRate: 1.35, flag: "🇸🇬" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", exchangeRate: 158.2, flag: "🇯🇵" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩", exchangeRate: 1390, flag: "🇰🇷" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥", exchangeRate: 7.28, flag: "🇨🇳" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM", exchangeRate: 4.72, flag: "🇲🇾" },
  { code: "TH", name: "Thailand", currency: "THB", symbol: "฿", exchangeRate: 36.8, flag: "🇹🇭" },
  { code: "US", name: "United States", currency: "USD", symbol: "$", exchangeRate: 1.0, flag: "🇺🇸" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", exchangeRate: 1.37, flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", exchangeRate: 0.79, flag: "🇬🇧" }
];

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "zh", name: "简体中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "th", name: "ไทย" }
];

export const TOPPINGS: Topping[] = [
  { id: "t1", name: "Golden Boba Pearls", priceUSD: 0.60 },
  { id: "t2", name: "Cheesy Cream Foam", priceUSD: 0.90 },
  { id: "t3", name: "Brown Sugar Jelly", priceUSD: 0.70 },
  { id: "t4", name: "Organic Coconut Jelly", priceUSD: 0.65 },
  { id: "t5", name: "Red Bean paste", priceUSD: 0.50 },
  { id: "t6", name: "Mellodi Crème Brûlée Pudding", priceUSD: 1.00 }
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Mellodi Signature Jasmine Green Milk Tea",
    chineseName: "茉莉翠绿奶茶",
    description: "A flawless infusion of organic high-mountain green tea scented with midnight-bloomed jasmine buds, layered with pristine cream.",
    category: "Milk Tea",
    priceUSD: 4.95,
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Size", options: ["Standard (450ml)", "Grande (650ml)"] },
      { name: "Sugar Level", options: ["100% Regular", "70% Less Sugar", "30% Low Sugar", "0% No Sugar"] },
      { name: "Ice Level", options: ["Regular Ice", "Less Ice", "No Ice", "Warm"] }
    ],
    nutrition: { calories: 290, sugarGrams: 28, fatGrams: 9 },
    allergens: ["Milk", "Gluten-Free"],
    stockLevel: 150,
    minAlert: 40,
    unit: "cups"
  },
  {
    id: "p2",
    name: "Golden Oolong Crème Latte",
    chineseName: "金凤乌龙岩盐",
    description: "Heavy-roast Taiwanese Dong Ding Oolong Tea, topped with a velvety layer of salty organic cream foam and golden caramel sprinkles.",
    category: "Milk Tea",
    priceUSD: 5.45,
    image: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Size", options: ["Standard (450ml)", "Grande (650ml)"] },
      { name: "Sugar Level", options: ["100% Regular", "70% Less Sugar", "30% Low Sugar"] },
      { name: "Ice Level", options: ["Regular Ice", "Less Ice", "Warm"] }
    ],
    nutrition: { calories: 340, sugarGrams: 32, fatGrams: 14 },
    allergens: ["Milk"],
    stockLevel: 120,
    minAlert: 35,
    unit: "cups"
  },
  {
    id: "p3",
    name: "Mellodi Camellia Mountain White Tea",
    chineseName: "山茶花白茶",
    description: "Ultra-premium delicate white tea cold-infused with distilled camellia essence. Pure, restorative, and floral.",
    category: "Pure Tea",
    priceUSD: 4.50,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Ice Level", options: ["Chilled (No Ice)", "Iced", "Warm"] }
    ],
    nutrition: { calories: 15, sugarGrams: 0, fatGrams: 0 },
    allergens: [],
    stockLevel: 18,
    minAlert: 20,
    unit: "cups"
  },
  {
    id: "p4",
    name: "Citrus Golden Pomelo Fruit Tea",
    chineseName: "西柚金萱冰茶",
    description: "Hand-squeezed Ruby Grapefruit and Honey Pomelo combined with high-mountain Jin Xuan Oolong tea over crystal crushed ice.",
    category: "Fruit Tea",
    priceUSD: 5.95,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Size", options: ["Grande (650ml)"] },
      { name: "Sugar Level", options: ["100% Regular", "70% Less Sugar", "50% Half Sugar"] },
      { name: "Ice Level", options: ["Regular Ice", "Less Ice"] }
    ],
    nutrition: { calories: 180, sugarGrams: 38, fatGrams: 0 },
    allergens: [],
    stockLevel: 80,
    minAlert: 25,
    unit: "cups"
  },
  {
    id: "p5",
    name: "White Peach Oolong Breeze",
    chineseName: "白桃乌龙果茶",
    description: "Succulent Yamanashi white peach pureed and shaken with light Oolong tea and organic aloe vera pulps.",
    category: "Fruit Tea",
    priceUSD: 5.80,
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Size", options: ["Standard (450ml)", "Grande (650ml)"] },
      { name: "Sugar Level", options: ["100% Regular", "70% Less Sugar"] },
      { name: "Ice Level", options: ["Regular Ice", "Less Ice"] }
    ],
    nutrition: { calories: 210, sugarGrams: 42, fatGrams: 0 },
    allergens: [],
    stockLevel: 95,
    minAlert: 30,
    unit: "cups"
  },
  {
    id: "p6",
    name: "Pistachio Hazelnut Mocha Latte",
    chineseName: "开心果榛果拿铁",
    description: "Sourced micro-lot Ethiopian Arabica espresso with steamed oat milk, house hazelnut praline paste, and raw pistachio foam crumbs.",
    category: "Coffee",
    priceUSD: 6.25,
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Size", options: ["Standard (350ml)", "Grande (480ml)"] },
      { name: "Milk", options: ["Barista Oat Milk", "Organic Full Cream", "Almond Milk"] },
      { name: "Temperature", options: ["Iced", "Steamed Hot"] }
    ],
    nutrition: { calories: 380, sugarGrams: 24, fatGrams: 18 },
    allergens: ["Nuts"],
    stockLevel: 12,
    minAlert: 15,
    unit: "cups"
  },
  {
    id: "p7",
    name: "Matcha Jasmine Crepê Cake",
    chineseName: "抹茶茉莉千层",
    description: "Handcrafted 30-layer French crepe cake infused with organic Uji Matcha powder and light whipped jasmine cream.",
    category: "Desserts",
    priceUSD: 6.50,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
    variants: [],
    nutrition: { calories: 420, sugarGrams: 19, fatGrams: 28 },
    allergens: ["Milk", "Gluten", "Egg"],
    stockLevel: 8,
    minAlert: 10,
    unit: "slices"
  },
  {
    id: "p8",
    name: "Mellodi Matte Brown Thermal Bottle",
    chineseName: "奢华磨砂咖啡杯",
    description: "Limited Edition dual-wall 316 medical-grade stainless steel flask with our brand signature matte-leather textured finish.",
    category: "Merchandise",
    priceUSD: 32.00,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
    variants: [
      { name: "Color", options: ["Premium Espresso", "Alabaster White"] }
    ],
    nutrition: { calories: 0, sugarGrams: 0, fatGrams: 0 },
    allergens: [],
    stockLevel: 45,
    minAlert: 15,
    unit: "pcs"
  }
];

export const STORES: Store[] = [
  {
    id: "s1",
    name: "Mellodi Flagship - Hoan Kiem",
    address: "12 Le Thai To, Hang Trong, Hoan Kiem",
    city: "Hanoi",
    country: "Vietnam",
    hours: "07:00 - 23:00",
    capacity: "120 Seats",
    services: ["Dine-In", "Pickup", "Delivery", "Meeting Rooms", "Free Wi-Fi"],
    latitude: 21.0285,
    longitude: 105.8542
  },
  {
    id: "s2",
    name: "Mellodi Premium - Shibuya Crossing",
    address: "2 Chome-2-1 Dogenzaka, Shibuya",
    city: "Tokyo",
    country: "Japan",
    hours: "08:00 - 22:30",
    capacity: "85 Seats",
    services: ["Pickup", "Dine-In", "Drip Bar"],
    latitude: 35.6580,
    longitude: 139.7016
  },
  {
    id: "s3",
    name: "Mellodi Highstreet - Orchard Road",
    address: "270 Orchard Rd, Level 1",
    city: "Singapore",
    country: "Singapore",
    hours: "09:00 - 22:00",
    capacity: "60 Seats",
    services: ["Pickup", "Delivery", "Dine-In"],
    latitude: 1.3018,
    longitude: 103.8378
  },
  {
    id: "s4",
    name: "Mellodi Reserve - Gangnam Center",
    address: "14 Teheran-ro 2-gil, Gangnam-gu",
    city: "Seoul",
    country: "South Korea",
    hours: "07:30 - 23:00",
    capacity: "150 Seats",
    services: ["Dine-In", "Pickup", "Delivery", "VIP Lounges"],
    latitude: 37.4980,
    longitude: 127.0276
  },
  {
    id: "s5",
    name: "Mellodi Mansion - Fifth Avenue",
    address: "590 Fifth Avenue, Midtown",
    city: "New York",
    country: "United States",
    hours: "06:30 - 21:00",
    capacity: "110 Seats",
    services: ["Dine-In", "Pickup", "Delivery", "Drip Bar", "Catering"],
    latitude: 40.7580,
    longitude: -73.9790
  }
];

export const INVENTORY: InventoryItem[] = [
  { id: "i1", name: "Premium Midnight Jasmine Tea Leaves", category: "Ingredients", stockLevel: 420, minAlert: 100, unit: "kg" },
  { id: "i2", name: "Dong Ding Oolong Premium Leaf", category: "Ingredients", stockLevel: 310, minAlert: 100, unit: "kg" },
  { id: "i3", name: "House Premium Sweet Cream Base", category: "Ingredients", stockLevel: 85, minAlert: 120, unit: "L" },
  { id: "i4", name: "Golden Tapioca Boba Pearls", category: "Ingredients", stockLevel: 140, minAlert: 150, unit: "kg" },
  { id: "i5", name: "High-Density PLA Insulated Paper Cups (Grande)", category: "Packaging", stockLevel: 8500, minAlert: 2000, unit: "pcs" },
  { id: "i6", name: "Craft Coffee Beans - Ethiopian Yirgacheffe", category: "Ingredients", stockLevel: 180, minAlert: 50, unit: "kg" },
  { id: "i7", name: "Dual-wall 316 Stainless Thermal Tumblers", category: "Merchandise", stockLevel: 45, minAlert: 15, unit: "pcs" },
  { id: "i8", name: "Mellodi Branded Keychain (Golden Brass)", category: "Merchandise", stockLevel: 120, minAlert: 30, unit: "pcs" }
];

export const REWARD_ITEMS: RewardItem[] = [
  { id: "r1", name: "Mellodi Solid Brass Keychain", pointsCost: 150, stock: 120, image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&auto=format&fit=crop&q=80" },
  { id: "r2", name: "Mellodi Premium Heavyweight T-Shirt", pointsCost: 400, stock: 65, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80" },
  { id: "r3", name: "Mellodi Double-Wall Thermal Bottle", pointsCost: 800, stock: 34, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop&q=80" },
  { id: "r4", name: "Luxury Tea Tumbler & Filter Set", pointsCost: 1200, stock: 18, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80" },
  { id: "r5", name: "Signature Oolong Tea Ceremony Box Set", pointsCost: 2000, stock: 10, image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&auto=format&fit=crop&q=80" }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "MEL-9281",
    customerName: "Alex Mercer",
    customerPhone: "+1 (555) 381-9922",
    items: [
      { productName: "Mellodi Signature Jasmine Green Milk Tea", category: "Milk Tea", quantity: 2, priceUSD: 4.95, variants: ["Grande (650ml)", "70% Less Sugar", "Less Ice"], toppings: ["Golden Boba Pearls", "Cheesy Cream Foam"] },
      { productName: "Matcha Jasmine Crepê Cake", category: "Desserts", quantity: 1, priceUSD: 6.50, variants: [], toppings: [] }
    ],
    totalUSD: 19.40,
    status: OrderStatus.COMPLETED,
    type: OrderType.PICKUP,
    storeId: "s5",
    storeName: "Mellodi Mansion - Fifth Avenue",
    timestamp: "2026-06-24T08:15:00-07:00",
    country: "United States",
    currency: "USD",
    exchangeRate: 1.0,
    pointsEarned: 19,
    isPaid: true
  },
  {
    id: "MEL-8472",
    customerName: "Min-ji Kim",
    customerPhone: "+82 10-4822-9112",
    items: [
      { productName: "Pistachio Hazelnut Mocha Latte", category: "Coffee", quantity: 1, priceUSD: 6.25, variants: ["Standard (350ml)", "Barista Oat Milk", "Iced"], toppings: [] }
    ],
    totalUSD: 6.25,
    status: OrderStatus.PREPARING,
    type: OrderType.DELIVERY,
    storeId: "s4",
    storeName: "Mellodi Reserve - Gangnam Center",
    timestamp: "2026-06-24T10:42:00-07:00",
    country: "South Korea",
    currency: "KRW",
    exchangeRate: 1390,
    pointsEarned: 6,
    isPaid: true
  },
  {
    id: "MEL-7391",
    customerName: "Yuto Takahashi",
    customerPhone: "+81 90-8271-4829",
    items: [
      { productName: "Golden Oolong Crème Latte", category: "Milk Tea", quantity: 1, priceUSD: 5.45, variants: ["Standard (450ml)", "100% Regular", "Regular Ice"], toppings: ["Mellodi Crème Brûlée Pudding"] }
    ],
    totalUSD: 6.45,
    status: OrderStatus.PENDING,
    type: OrderType.PICKUP,
    storeId: "s2",
    storeName: "Mellodi Premium - Shibuya Crossing",
    timestamp: "2026-06-24T11:02:00-07:00",
    country: "Japan",
    currency: "JPY",
    exchangeRate: 158.2,
    pointsEarned: 6,
    isPaid: false
  },
  {
    id: "MEL-6819",
    customerName: "Nguyen Tran",
    customerPhone: "+84 901 234 567",
    items: [
      { productName: "Citrus Golden Pomelo Fruit Tea", category: "Fruit Tea", quantity: 2, priceUSD: 5.95, variants: ["Grande (650ml)", "70% Less Sugar", "Regular Ice"], toppings: ["Organic Coconut Jelly"] }
    ],
    totalUSD: 13.20,
    status: OrderStatus.READY,
    type: OrderType.DINE_IN,
    storeId: "s1",
    storeName: "Mellodi Flagship - Hoan Kiem",
    timestamp: "2026-06-24T10:15:00-07:00",
    country: "Vietnam",
    currency: "VND",
    exchangeRate: 25400,
    pointsEarned: 13,
    isPaid: true
  }
];
