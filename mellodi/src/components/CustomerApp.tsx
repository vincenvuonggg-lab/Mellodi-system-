import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, User, ShoppingBag, MapPin, Award, ArrowRight, X, Plus, 
  Minus, Check, Sparkles, CreditCard, ChevronRight, Compass, Bell, ShieldCheck,
  LogOut, Mail, Lock, ArrowLeft, Coffee, Gift, Ticket
} from "lucide-react";
import { Product, Country, Order, OrderStatus, OrderType, MembershipTier, Topping, CartItem, SystemUser } from "../types";
import { PRODUCTS, TOPPINGS, STORES, COUNTRIES, REWARD_ITEMS } from "../data";
import { translate, translateProduct, translateTopping, translateCategory } from "../locales";

interface CustomerAppProps {
  onAddOrder: (order: Order) => void;
  countries: Country[];
  selectedCountry: Country;
  setSelectedCountry: (c: Country) => void;
  language: string;
  setLanguage: (lang: string) => void;
  lenPoints: number;
  setLenPoints: React.Dispatch<React.SetStateAction<number>>;
  userTier: MembershipTier;
  setUserTier: (tier: MembershipTier) => void;
  currentCustomer: SystemUser | null;
  setCurrentCustomer: (user: SystemUser | null) => void;
  promoBanners?: any[];
  addSystemNotification?: (title: string, body: string, type?: "ORDER" | "PROMO" | "ALERT") => void;
}

export default function CustomerApp({
  onAddOrder,
  countries,
  selectedCountry,
  setSelectedCountry,
  language,
  setLanguage,
  lenPoints,
  setLenPoints,
  userTier,
  setUserTier,
  currentCustomer,
  setCurrentCustomer,
  promoBanners = [],
  addSystemNotification
}: CustomerAppProps) {
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "stores" | "profile">("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("Milk Tea");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Authentication Local States
  const [authMode, setAuthMode] = useState<"welcome" | "signin" | "signup">("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referral, setReferral] = useState("");
  const [authError, setAuthError] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email || !password) {
      setAuthError(language === "vi" ? "Vui lòng nhập đầy đủ thông tin" : "Please fill in all fields");
      return;
    }

    const seeded = [
      { email: "vincent@mellodi.com", password: "admin", name: "Vincent Vuong", lenPoints: 385, tier: MembershipTier.DIAMOND, referralCode: "MELLODI-847291" },
      { email: "jane@mellodi.com", password: "password", name: "Jane Doe", lenPoints: 120, tier: MembershipTier.GOLD, referralCode: "MELLODI-123456" }
    ];
    let customers = seeded;
    const stored = localStorage.getItem("mellodi_customers");
    if (stored) {
      customers = JSON.parse(stored);
    } else {
      localStorage.setItem("mellodi_customers", JSON.stringify(seeded));
    }

    const user = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      setAuthError(language === "vi" ? "Email hoặc mật khẩu không chính xác" : "Invalid email or password");
      return;
    }

    const systemUser: SystemUser = {
      email: user.email,
      name: user.name,
      role: "CUSTOMER",
      lenPoints: user.lenPoints,
      tier: user.tier as MembershipTier,
      referralCode: user.referralCode
    };

    setCurrentCustomer(systemUser);
    localStorage.setItem("current_customer", JSON.stringify(systemUser));
    setEmail("");
    setPassword("");
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!name || !email || !password) {
      setAuthError(language === "vi" ? "Vui lòng điền tất cả các trường bắt buộc" : "Please fill in all required fields");
      return;
    }

    const seeded = [
      { email: "vincent@mellodi.com", password: "admin", name: "Vincent Vuong", lenPoints: 385, tier: MembershipTier.DIAMOND, referralCode: "MELLODI-847291" },
      { email: "jane@mellodi.com", password: "password", name: "Jane Doe", lenPoints: 120, tier: MembershipTier.GOLD, referralCode: "MELLODI-123456" }
    ];
    let customers = seeded;
    const stored = localStorage.getItem("mellodi_customers");
    if (stored) {
      customers = JSON.parse(stored);
    }

    if (customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      setAuthError(language === "vi" ? "Email này đã được đăng ký" : "This email is already registered");
      return;
    }

    const newReferralCode = `MELLODI-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCustomer = {
      email,
      password,
      name,
      lenPoints: 0,
      tier: MembershipTier.BRONZE,
      referralCode: newReferralCode
    };

    customers.push(newCustomer);
    localStorage.setItem("mellodi_customers", JSON.stringify(customers));

    const systemUser: SystemUser = {
      email,
      name,
      role: "CUSTOMER",
      lenPoints: 0,
      tier: MembershipTier.BRONZE,
      referralCode: newReferralCode
    };

    setCurrentCustomer(systemUser);
    localStorage.setItem("current_customer", JSON.stringify(systemUser));
    setName("");
    setEmail("");
    setPassword("");
    setReferral("");
  };
  
  // Customization state
  const [variantOptions, setVariantOptions] = useState<Record<string, string>>({});
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Checkout and QR state
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.PICKUP);
  const [selectedStore, setSelectedStore] = useState(STORES[0]);
  const [showQR, setShowQR] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Loyalty Boutique states
  const [selectedReward, setSelectedReward] = useState<any | null>(null);
  const [showRewardSuccess, setShowRewardSuccess] = useState<any | null>(null);
  const [activeVouchers, setActiveVouchers] = useState<Array<{ id: string; reward: any; code: string; date: string }>>([]);
  const [showVouchersList, setShowVouchersList] = useState(false);

  // Helper for currency conversion
  const formatPrice = (usd: number) => {
    const localAmount = usd * selectedCountry.exchangeRate;
    if (selectedCountry.code === "VN") {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.round(localAmount / 1000) * 1000);
    }
    if (selectedCountry.code === "JP") {
      return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(localAmount));
    }
    if (selectedCountry.code === "KR") {
      return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(Math.round(localAmount));
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: selectedCountry.currency,
    }).format(localAmount);
  };

  const getLocalizedRewardName = (id: string) => {
    const rewardsMap: Record<string, Record<string, string>> = {
      r1: {
        en: "Mellodi Solid Brass Keychain",
        vi: "Móc khóa Đồng Thau Mellodi",
        ja: "Mellodi 真鍮キーホルダー",
        zh: "Mellodi 黄铜钥匙扣",
        ko: "멜로디 솔리드 브라스 키링",
        th: "พวงกุญแจทองเหลือง Mellodi"
      },
      r2: {
        en: "Mellodi Premium Heavyweight T-Shirt",
        vi: "Áo Thun Heavyweight Mellodi",
        ja: "Mellodi プレミアムTシャツ",
        zh: "Mellodi 优质重磅T恤",
        ko: "멜로디 프리미엄 헤비웨이트 티셔츠",
        th: "เสื้อยืดพรีเมียม Mellodi"
      },
      r3: {
        en: "Mellodi Double-Wall Thermal Bottle",
        vi: "Bình Giữ Nhiệt Lõi Đôi Mellodi",
        ja: "Mellodi ダブルウォール魔法瓶",
        zh: "Mellodi 双层保温杯",
        ko: "멜로디 더블월 보온병",
        th: "กระบอกน้ำเก็บอุณหภูมิ Mellodi"
      },
      r4: {
        en: "Luxury Tea Tumbler & Filter Set",
        vi: "Bộ Ly Lọc Trà Thủy Tinh Cao Cấp",
        ja: "高級ティー タンブラー＆フィルター セット",
        zh: "奢华茶杯及过滤组合",
        ko: "럭셔리 티 텀블러 & 필터 세트",
        th: "แก้วชา Tumbler หรูหรา & ชุดกรอง"
      },
      r5: {
        en: "Signature Oolong Tea Ceremony Box Set",
        vi: "Bộ Hộp Trà Đạo Oolong Thượng Hạng",
        ja: "最高級烏龍茶茶道セレモニーボックス",
        zh: "特级乌龙茶道礼盒",
        ko: "시그니처 우롱 다도 세트 박스",
        th: "กล่องเซ็ตพิธีชาอูหลงพรีเมียม"
      }
    };
    return rewardsMap[id]?.[language] || rewardsMap[id]?.["en"] || "";
  };

  const categories = ["Milk Tea", "Pure Tea", "Fruit Tea", "Coffee", "Desserts", "Merchandise"];

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    // Initialize default variant choices
    const defaults: Record<string, string> = {};
    product.variants.forEach(v => {
      if (v.options.length > 0) defaults[v.name] = v.options[0];
    });
    setVariantOptions(defaults);
    setSelectedToppings([]);
    setNotes("");
    setQuantity(1);
  };

  const handleToggleTopping = (topping: Topping) => {
    if (selectedToppings.some(t => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const newItem: CartItem = {
      product: selectedProduct,
      quantity,
      selectedVariantOptions: { ...variantOptions },
      selectedToppings: [...selectedToppings],
      notes
    };
    setCart([...cart, newItem]);
    setSelectedProduct(null);
  };

  const calculateCartTotalUSD = () => {
    return cart.reduce((total, item) => {
      const toppingCost = item.selectedToppings.reduce((sum, t) => sum + t.priceUSD, 0);
      return total + (item.product.priceUSD + toppingCost) * item.quantity;
    }, 0);
  };

  const handleCheckout = (paymentMethod: "Stripe" | "GooglePay" | "Cash") => {
    const totalUSD = calculateCartTotalUSD();
    const orderItems = cart.map(item => ({
      productName: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      priceUSD: item.product.priceUSD + item.selectedToppings.reduce((sum, t) => sum + t.priceUSD, 0),
      variants: Object.entries(item.selectedVariantOptions).map(([k, v]) => `${k}: ${v}`),
      toppings: item.selectedToppings.map(t => t.name)
    }));

    const orderId = `MEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const pointsToEarn = Math.floor(totalUSD);

    const newOrder: Order = {
      id: orderId,
      customerName: currentCustomer ? currentCustomer.name : "Vincent Vuong",
      customerPhone: currentCustomer ? (currentCustomer.email === "vincent@mellodi.com" ? "+84 908 123 456" : "+1 555-0199") : "+84 908 123 456",
      items: orderItems,
      totalUSD,
      status: OrderStatus.PENDING,
      type: orderType,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      timestamp: new Date().toISOString(),
      country: selectedCountry.name,
      currency: selectedCountry.currency,
      exchangeRate: selectedCountry.exchangeRate,
      pointsEarned: pointsToEarn,
      isPaid: paymentMethod !== "Cash"
    };

    onAddOrder(newOrder);
    setLenPoints(prev => prev + pointsToEarn);
    setCart([]);
    setShowCart(false);
    setOrderSuccess(orderId);
    setTimeout(() => setOrderSuccess(null), 5000);
  };

  return (
    <div id="customer-app-root" className="w-full flex justify-center items-center py-4 bg-cream/40 border-r border-premium-brown/10">
      {/* Smartphone Outer Container */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-rich-espresso rounded-[48px] shadow-xl border-4 border-premium-brown p-2 overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-rich-espresso rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-3 h-3 bg-premium-brown rounded-full mr-2"></div>
          <div className="w-12 h-1 bg-premium-brown/80 rounded-full"></div>
        </div>

        {/* Screen Container */}
        <div className="flex-1 w-full h-full bg-cream rounded-[38px] overflow-hidden flex flex-col relative text-rich-espresso font-sans text-sm">
          
          {/* Custom Status Bar / Header */}
          <div className="pt-7 px-5 pb-3 bg-white border-b border-premium-brown/10 flex justify-between items-center z-10">
            <div>
              <span className="text-[10px] text-text-light font-bold uppercase tracking-[0.15em]">{translate("ecosystem_portal", language)}</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gold-accent" />
                <span className="font-semibold text-premium-brown text-xs truncate max-w-[125px]">{selectedStore.name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Country Picker */}
              <select 
                value={selectedCountry.code} 
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="bg-cream text-[10px] font-bold border border-premium-brown/15 py-1 px-1.5 rounded-none cursor-pointer focus:outline-none text-premium-brown uppercase tracking-wider"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.currency}</option>
                ))}
              </select>

              {/* Language Picker */}
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-cream text-[10px] font-bold border border-premium-brown/15 py-1 px-1 rounded-none cursor-pointer focus:outline-none text-premium-brown uppercase tracking-wider"
              >
                <option value="vi">🇻🇳 VI</option>
                <option value="en">🇺🇸 EN</option>
                <option value="ja">🇯🇵 JA</option>
                <option value="zh">🇨🇳 ZH</option>
                <option value="ko">🇰🇷 KO</option>
                <option value="th">🇹🇭 TH</option>
              </select>
            </div>
          </div>

          {/* Main App Content */}
          {!currentCustomer ? (
            <div className="flex-1 overflow-y-auto bg-cream flex flex-col p-6 pb-12">
              <AnimatePresence mode="wait">
                {authMode === "welcome" && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 pt-10">
                      <div className="w-16 h-16 rounded-full border border-gold-accent/45 bg-premium-brown flex items-center justify-center shadow-lg animate-pulse">
                        <Coffee className="w-8 h-8 text-gold-accent" />
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-serif font-black tracking-widest text-premium-brown">MELLODI</h2>
                        <p className="text-xs text-text-light uppercase tracking-[0.2em] font-bold">
                          {language === "vi" ? "Hương Vị Trà Thượng Hạng" : "Crafted Premium Tea Room"}
                        </p>
                      </div>
                      <p className="text-center text-xs text-text-light max-w-[250px] leading-relaxed">
                        {language === "vi" 
                          ? "Đăng nhập hoặc đăng ký để tích luỹ điểm thưởng, thăng hạng thành viên và đặt trà thượng hạng."
                          : "Sign in or register to accumulate loyalty points, level up membership tiers, and order high-mountain teas."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setAuthMode("signin");
                          setAuthError("");
                        }}
                        className="w-full bg-premium-brown text-cream hover:bg-rich-espresso py-3.5 rounded-none font-bold uppercase tracking-[0.15em] text-xs transition border border-gold-accent/20 shadow-md"
                      >
                        {language === "vi" ? "Đăng Nhập" : "Sign In"}
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode("signup");
                          setAuthError("");
                        }}
                        className="w-full bg-white text-premium-brown border border-premium-brown/20 hover:bg-gold-accent/5 py-3.5 rounded-none font-bold uppercase tracking-[0.15em] text-xs transition shadow-sm"
                      >
                        {language === "vi" ? "Đăng Ký Tài Khoản" : "Create Account"}
                      </button>

                      {/* Presets / Demo Accounts */}
                      <div className="pt-4 border-t border-premium-brown/10 text-center">
                        <p className="text-[10px] uppercase font-bold text-text-light/80 tracking-wider mb-2">
                          {language === "vi" ? "Tài khoản chạy thử nhanh" : "Quick Demo Login Presets"}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEmail("vincent@mellodi.com");
                              setPassword("admin");
                              setAuthMode("signin");
                            }}
                            className="bg-gold-accent/10 border border-gold-accent/25 hover:bg-gold-accent/20 text-gold-accent px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition"
                          >
                            Vincent (Diamond)
                          </button>
                          <button
                            onClick={() => {
                              setEmail("jane@mellodi.com");
                              setPassword("password");
                              setAuthMode("signin");
                            }}
                            className="bg-gold-accent/10 border border-gold-accent/25 hover:bg-gold-accent/20 text-gold-accent px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition"
                          >
                            Jane (Gold)
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {authMode === "signin" && (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <button
                        onClick={() => setAuthMode("welcome")}
                        className="flex items-center space-x-1 text-text-light hover:text-premium-brown text-xs font-bold uppercase tracking-wider py-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{language === "vi" ? "Quay lại" : "Back"}</span>
                      </button>

                      <div className="space-y-1 mt-4">
                        <h3 className="text-xl font-serif font-black text-premium-brown uppercase tracking-wider">
                          {language === "vi" ? "Chào Mừng Trở Lại" : "Welcome Back"}
                        </h3>
                        <p className="text-xs text-text-light">
                          {language === "vi" ? "Đăng nhập vào ví trà Mellodi của bạn" : "Sign in to your Mellodi tea wallet"}
                        </p>
                      </div>

                      <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-light uppercase tracking-wider">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. vincent@mellodi.com"
                              className="w-full bg-white border border-premium-brown/15 p-3.5 pl-10 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-light uppercase tracking-wider">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-white border border-premium-brown/15 p-3.5 pl-10 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                            />
                          </div>
                        </div>

                        {authError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-none font-medium">
                            {authError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-3.5 font-bold uppercase tracking-[0.15em] text-xs transition border border-gold-accent/20 shadow-md mt-2"
                        >
                          {language === "vi" ? "Xác Nhận Đăng Nhập" : "Authorize Sign In"}
                        </button>
                      </form>
                    </div>

                    <div className="pt-4 text-center">
                      <p className="text-xs text-text-light">
                        {language === "vi" ? "Chưa có tài khoản?" : "New to Mellodi?"}{" "}
                        <button
                          onClick={() => {
                            setAuthMode("signup");
                            setAuthError("");
                          }}
                          className="text-gold-accent font-bold hover:underline"
                        >
                          {language === "vi" ? "Đăng ký ngay" : "Create Account"}
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {authMode === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <button
                        onClick={() => setAuthMode("welcome")}
                        className="flex items-center space-x-1 text-text-light hover:text-premium-brown text-xs font-bold uppercase tracking-wider py-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{language === "vi" ? "Quay lại" : "Back"}</span>
                      </button>

                      <div className="space-y-1 mt-4">
                        <h3 className="text-xl font-serif font-black text-premium-brown uppercase tracking-wider">
                          {language === "vi" ? "Đăng Ký Ví Trà" : "Register Wallet"}
                        </h3>
                        <p className="text-xs text-text-light">
                          {language === "vi" ? "Bắt đầu hành trình thưởng thức trà Mellodi" : "Begin your Mellodi premium membership"}
                        </p>
                      </div>

                      <form onSubmit={handleSignUp} className="mt-4 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-text-light uppercase tracking-wider">Full Name *</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Vincent Vuong"
                            className="w-full bg-white border border-premium-brown/15 p-2.5 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-text-light uppercase tracking-wider">Email Address *</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. customer@example.com"
                            className="w-full bg-white border border-premium-brown/15 p-2.5 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-text-light uppercase tracking-wider">Password *</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-premium-brown/15 p-2.5 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-text-light uppercase tracking-wider">Referral Code (Optional)</label>
                          <input
                            type="text"
                            value={referral}
                            onChange={(e) => setReferral(e.target.value)}
                            placeholder="e.g. MELLODI-847291"
                            className="w-full bg-white border border-premium-brown/15 p-2.5 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                          />
                        </div>

                        {authError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2.5 rounded-none font-medium">
                            {authError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-3 font-bold uppercase tracking-[0.15em] text-xs transition border border-gold-accent/20 shadow-md mt-1"
                        >
                          {language === "vi" ? "Hoàn Tất Đăng Ký" : "Complete Registration"}
                        </button>
                      </form>
                    </div>

                    <div className="pt-4 text-center">
                      <p className="text-xs text-text-light">
                        {language === "vi" ? "Đã có tài khoản?" : "Already a member?"}{" "}
                        <button
                          onClick={() => {
                            setAuthMode("signin");
                            setAuthError("");
                          }}
                          className="text-gold-accent font-bold hover:underline"
                        >
                          {language === "vi" ? "Đăng nhập" : "Sign In"}
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-cream/10 pb-20">
              {orderSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-4 mt-3 p-3 bg-premium-brown text-cream rounded-none border border-gold-accent/40 text-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-gold-accent" />
                <h4 className="font-serif text-xs font-semibold uppercase tracking-wider text-gold-accent">
                  {language === "vi" ? "Đã đặt Mellodi!" : "Mellodi Order Placed!"}
                </h4>
                <p className="text-[10px] opacity-90 mt-0.5 font-mono">
                  {translate("order_id", language)}: {orderSuccess}. Check Staff App queue.
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* HOME TAB */}
              {activeTab === "home" && (
                <motion.div 
                  key="home" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="p-4 space-y-4"
                >
                  {/* Membership Card */}
                  <div 
                    onClick={() => setShowQR(true)}
                    className="relative rounded-none border border-gold-accent/30 bg-rich-espresso p-5 text-cream shadow-md overflow-hidden cursor-pointer group"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-gold-accent/5 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-gold-accent/15 text-gold-accent border border-gold-accent/25 px-2 py-0.5 rounded-none font-bold uppercase tracking-[0.15em]">
                          {userTier} {translate("member", language)}
                        </span>
                        <h3 className="text-lg font-serif font-semibold tracking-wide mt-1.5 text-white">{currentCustomer ? currentCustomer.name : "Vincent Vuong"}</h3>
                        <p className="text-text-light text-[10px] mt-0.5">ID: {currentCustomer ? currentCustomer.referralCode : "MELLODI-847291"}</p>
                      </div>
                      <Award className="w-8 h-8 text-gold-accent" />
                    </div>
                    <div className="mt-8 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-text-light uppercase tracking-wider block">{translate("points_balance", language)}</span>
                        <span className="text-2xl font-serif text-gold-accent">{lenPoints} <span className="text-xs text-cream font-medium tracking-normal font-sans">{translate("points_suffix", language)}</span></span>
                      </div>
                      <div className="border border-gold-accent/30 bg-white/5 hover:bg-white/10 transition px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                        <span>{translate("show_card", language)}</span>
                        <ArrowRight className="w-3 h-3 text-gold-accent" />
                      </div>
                    </div>
                  </div>

                  {/* Starbucks Reserve-Style Star Tracker */}
                  <div id="rewards-tracker-card" className="bg-white border border-premium-brown/10 p-4 rounded-none shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-serif font-bold text-premium-brown text-xs uppercase tracking-wider">
                          {language === "vi" ? "LỘ TRÌNH ĐỔI QUÀ MELLODI" : "MELLODI REWARDS MILESTONES"}
                        </h4>
                        <p className="text-[10px] text-text-light italic mt-0.5">
                          {language === "vi" ? "Tích lũy điểm để nhận quà lưu niệm giới hạn." : "Earn points to redeem exclusive merchandise."}
                        </p>
                      </div>
                      
                      {activeVouchers.length > 0 && (
                        <button 
                          onClick={() => setShowVouchersList(true)}
                          className="bg-gold-accent/10 border border-gold-accent/30 text-premium-brown py-1 px-2 text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1 hover:bg-gold-accent/20 transition rounded-none"
                        >
                          <Ticket className="w-3 h-3 text-gold-accent" />
                          <span>{language === "vi" ? `QUÀ CỦA TÔI (${activeVouchers.length})` : `MY GIFTS (${activeVouchers.length})`}</span>
                        </button>
                      )}
                    </div>

                    {/* Progress Bar & Milestone Line */}
                    <div className="pt-2 pb-1 relative">
                      {/* Bar Background */}
                      <div className="h-2 w-full bg-cream rounded-full overflow-hidden relative border border-premium-brown/5">
                        <div 
                          className="h-full bg-gradient-to-r from-premium-brown to-gold-accent transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min((lenPoints / 2000) * 100, 100)}%` }}
                        ></div>
                      </div>

                      {/* Milestones Markers */}
                      <div className="relative flex justify-between text-[8px] font-bold text-text-light/80 mt-2 font-mono">
                        {[
                          { val: 150, label: "Keychain", labelVi: "Móc khóa" },
                          { val: 400, label: "T-Shirt", labelVi: "Áo thun" },
                          { val: 800, label: "Bottle", labelVi: "Bình giữ nhiệt" },
                          { val: 1200, label: "Tumbler", labelVi: "Ly thủy tinh" },
                          { val: 2000, label: "Ceremony", labelVi: "Hộp trà đạo" }
                        ].map((m, i) => {
                          const isUnlocked = lenPoints >= m.val;
                          return (
                            <div key={i} className="flex flex-col items-center justify-center text-center">
                              <span className={`w-2.5 h-2.5 rounded-full border border-white -mt-4.5 mb-1.5 z-10 transition ${isUnlocked ? "bg-gold-accent scale-110 shadow-sm" : "bg-stone-300"}`} />
                              <span className={`${isUnlocked ? "text-premium-brown font-bold" : "text-text-light/50"}`}>{m.val}</span>
                              <span className={`text-[7px] max-w-[45px] leading-tight truncate mt-0.5 ${isUnlocked ? "text-gold-accent" : "text-text-light/40"}`}>{language === "vi" ? m.labelVi : m.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Loyalty Merchandise Boutique Catalog */}
                  <div id="rewards-merch-boutique" className="bg-white border border-premium-brown/10 p-4 rounded-none shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-premium-brown/10 pb-2">
                      <div>
                        <h4 className="font-serif font-bold text-premium-brown text-xs uppercase tracking-wide flex items-center space-x-1.5">
                          <Gift className="w-4 h-4 text-gold-accent" />
                          <span>{language === "vi" ? "CỬA HÀNG QUÀ TẶNG" : "LOYALTY MERCH BOUTIQUE"}</span>
                        </h4>
                        <p className="text-[10px] text-text-light mt-0.5 italic">{language === "vi" ? "Dùng LEN POINT đổi sản phẩm độc quyền." : "Use LEN POINTs to redeem signature merch."}</p>
                      </div>
                    </div>

                    {/* Horizontal scrollable merch catalog */}
                    <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-premium-brown/25">
                      {REWARD_ITEMS.map((item: any) => {
                        const canRedeem = lenPoints >= item.pointsCost && item.stock > 0;
                        const pointsDiff = item.pointsCost - lenPoints;
                        return (
                          <div key={item.id} className="w-[145px] shrink-0 bg-cream p-2.5 border border-premium-brown/10 flex flex-col justify-between">
                            <div>
                              <div className="relative aspect-square bg-white border border-premium-brown/5 overflow-hidden mb-2">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                {item.stock <= 5 && item.stock > 0 && (
                                  <span className="absolute top-1 left-1 bg-red-600 text-white font-bold text-[7px] uppercase tracking-wider py-0.5 px-1">
                                    {language === "vi" ? "SẮP HẾT" : "LOW STOCK"}
                                  </span>
                                )}
                                {item.stock === 0 && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-[9px] uppercase tracking-wider">
                                    {language === "vi" ? "HẾT QUÀ" : "OUT OF STOCK"}
                                  </div>
                                )}
                              </div>
                              <h5 className="font-serif font-bold text-premium-brown text-xs leading-snug line-clamp-2 h-8">
                                {getLocalizedRewardName(item.id)}
                              </h5>
                              <div className="flex justify-between items-center mt-1.5 font-mono">
                                <span className="text-gold-accent font-bold text-[10px] uppercase flex items-center">
                                  ★ {item.pointsCost} <span className="text-[7px] text-text-light/80 ml-0.5">PTS</span>
                                </span>
                                <span className="text-[8px] text-text-light/60">Qty: {item.stock}</span>
                              </div>
                            </div>

                            <div className="mt-3">
                              {canRedeem ? (
                                <button
                                  onClick={() => setSelectedReward(item)}
                                  className="w-full bg-premium-brown hover:bg-rich-espresso text-cream font-bold uppercase text-[9px] py-1.5 transition rounded-none tracking-widest border border-gold-accent/20 cursor-pointer"
                                >
                                  {language === "vi" ? "ĐỔI QUÀ" : "REDEEM"}
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="w-full bg-stone-200 text-stone-400 font-bold text-[8px] py-1.5 rounded-none cursor-not-allowed uppercase"
                                >
                                  {item.stock === 0
                                    ? (language === "vi" ? "HẾT HÀNG" : "SOLD OUT")
                                    : (language === "vi" ? `THIẾU ${pointsDiff} ĐIỂM` : `NEED ${pointsDiff} PTS`)
                                  }
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Banners from Sync'd CMS */}
                  <div className="space-y-3">
                    {promoBanners && promoBanners.length > 0 ? (
                      promoBanners.map((banner: any, idx: number) => (
                        <div key={banner.id || idx} className="rounded-none overflow-hidden relative h-32 bg-stone-300 shadow-sm border border-premium-brown/10">
                          <img 
                            src={idx % 2 === 0 
                              ? "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500&auto=format&fit=crop&q=80"
                              : "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=500&auto=format&fit=crop&q=80"
                            } 
                            alt="Campaign banner" 
                            className="w-full h-full object-cover animate-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-rich-espresso via-rich-espresso/50 to-transparent p-4 flex flex-col justify-end">
                            <span className="text-[9px] text-gold-accent font-bold uppercase tracking-[0.2em]">
                              {language === "vi" ? "CHIẾN DỊCH HỆ THỐNG" : "SYSTEM CAMPAIGN"}
                            </span>
                            <h4 className="text-white text-sm font-serif font-bold tracking-wide leading-tight mt-0.5">
                              {banner.title}
                            </h4>
                            <p className="text-cream/95 text-[9px] mt-0.5 leading-snug">
                              {banner.subtitle}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-none overflow-hidden relative h-28 bg-premium-brown/5 border border-premium-brown/10 p-4 flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] text-gold-accent font-bold uppercase tracking-widest">{language === "vi" ? "KHÔNG CÓ CHIẾN DỊCH" : "NO ACTIVE CAMPAIGNS"}</span>
                        <p className="text-[11px] text-text-light/85 mt-1">{language === "vi" ? "Đang chờ Admin kích hoạt chiến dịch mới..." : "Awaiting active campaigns from HQ Admin..."}</p>
                      </div>
                    )}
                  </div>

                  {/* Fast Ordering Button */}
                  <button 
                    onClick={() => setActiveTab("menu")}
                    className="w-full bg-premium-brown hover:bg-rich-espresso text-cream p-3.5 rounded-none font-bold uppercase tracking-[0.12em] text-xs transition flex justify-between items-center shadow-sm border border-gold-accent/25"
                  >
                    <span className="flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-gold-accent" />
                      <span>{language === "vi" ? "ĐẶT TRÀ NGAY BÂY GIỜ" : "Order Fresh Tea Now"}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-gold-accent" />
                  </button>

                  {/* Best Sellers */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-serif text-base text-premium-brown tracking-tight font-semibold">
                        {language === "vi" ? "Gợi Ý Từ Barista Trưởng" : "Chef Recommendations"}
                      </h3>
                      <button onClick={() => setActiveTab("menu")} className="text-xs text-gold-accent font-bold hover:underline">
                        {language === "vi" ? "Xem tất cả" : "View All"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {PRODUCTS.slice(0, 2).map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => handleOpenProduct(p)}
                          className="bg-white rounded-none overflow-hidden border border-premium-brown/10 hover:shadow-sm transition cursor-pointer"
                        >
                          <div className="h-28 bg-stone-100 relative">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1.5 right-1.5 bg-rich-espresso/90 text-cream px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider border border-gold-accent/20">
                              {formatPrice(p.priceUSD)}
                            </span>
                          </div>
                          <div className="p-2">
                            <h4 className="font-serif text-xs font-semibold text-premium-brown line-clamp-1">
                              {translateProduct(p.id, language).name}
                            </h4>
                            <p className="text-[9px] text-text-light font-medium mt-0.5 uppercase tracking-wide">
                              {language === "zh" ? p.chineseName : p.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MENU TAB */}
              {activeTab === "menu" && (
                <motion.div 
                  key="menu" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  {/* Categories Horizontal */}
                  <div className="flex space-x-2 overflow-x-auto p-4 bg-white border-b border-premium-brown/10 scrollbar-none">
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedCategory(c)}
                        className={`px-3 py-1.5 rounded-none text-xs tracking-wider uppercase font-semibold whitespace-nowrap transition ${
                          selectedCategory === c 
                            ? "border-b-2 border-gold-accent bg-gold-accent/5 text-premium-brown font-bold" 
                            : "bg-cream/40 border border-premium-brown/10 text-text-light hover:text-premium-brown hover:bg-gold-accent/5"
                        }`}
                      >
                        {translateCategory(c, language)}
                      </button>
                    ))}
                  </div>

                  {/* Product List */}
                  <div className="p-4 grid grid-cols-1 gap-3 overflow-y-auto">
                    {PRODUCTS.filter(p => p.category === selectedCategory).map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleOpenProduct(product)}
                        className="bg-white rounded-none p-3 border border-premium-brown/10 flex space-x-3 cursor-pointer hover:shadow-sm transition"
                      >
                        <div className="w-20 h-20 bg-stone-100 rounded-none overflow-hidden shrink-0 border border-premium-brown/10">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif font-semibold text-xs text-premium-brown line-clamp-1">
                              {translateProduct(product.id, language).name}
                            </h4>
                            {product.chineseName && (
                              <p className="text-[10px] text-text-light font-semibold uppercase tracking-wide">
                                {language === "zh" ? product.chineseName : product.name}
                              </p>
                            )}
                            <p className="text-[10px] text-text-light line-clamp-1 mt-1">
                              {translateProduct(product.id, language).description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-serif font-bold text-premium-brown">{formatPrice(product.priceUSD)}</span>
                            <div className="bg-cream border border-premium-brown/15 hover:bg-gold-accent/10 hover:text-premium-brown transition p-1 rounded-none text-text-light">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STORES TAB */}
              {activeTab === "stores" && (
                <motion.div 
                  key="stores" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="p-4 space-y-3"
                >
                  <h3 className="font-serif text-base text-premium-brown tracking-tight font-semibold">
                    {translate("global_boutiques", language)}
                  </h3>
                  {STORES.map(store => (
                    <div 
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`p-3.5 rounded-none border transition cursor-pointer ${
                        selectedStore.id === store.id 
                          ? "bg-gold-accent/5 border-gold-accent text-premium-brown" 
                          : "bg-white border-premium-brown/10 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-semibold text-xs text-premium-brown">{store.name}</h4>
                        <span className="text-[9px] bg-cream border border-premium-brown/15 px-2 py-0.5 rounded-none text-text-light font-bold uppercase tracking-wider">{store.country}</span>
                      </div>
                      <p className="text-[10px] text-text-light mt-1">{store.address}, {store.city}</p>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-text-light font-mono">
                        <span>🕒 {store.hours}</span>
                        <span>🛋️ {store.capacity} {translate("seats", language)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {store.services.map(s => (
                          <span key={s} className="text-[8px] bg-cream text-text-light/90 border border-premium-brown/10 px-1.5 py-0.5 rounded-none uppercase tracking-wide">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <motion.div 
                  key="profile" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="p-4 space-y-4"
                >
                   <div className="flex items-center space-x-3 bg-white p-4 rounded-none border border-premium-brown/10">
                    <div className="w-12 h-12 rounded-none border border-gold-accent/30 bg-rich-espresso flex items-center justify-center text-gold-accent font-serif font-bold text-lg">
                      {currentCustomer ? currentCustomer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "VV"}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-premium-brown text-sm">{currentCustomer ? currentCustomer.name : "Vincent Vuong"}</h4>
                      <p className="text-[10px] text-text-light font-mono">{currentCustomer ? currentCustomer.email : "vincenvuonggg@gmail.com"}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-none border border-premium-brown/10 overflow-hidden divide-y divide-premium-brown/10 text-premium-brown">
                    <div onClick={() => setShowQR(true)} className="p-3.5 flex justify-between items-center hover:bg-gold-accent/5 cursor-pointer">
                      <span className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                        <Award className="w-4 h-4 text-gold-accent" />
                        <span>{translate("member_qr_code", language)}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-gold-accent" />
                    </div>
                    <div className="p-3.5 flex justify-between items-center hover:bg-gold-accent/5 cursor-pointer">
                      <span className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                        <CreditCard className="w-4 h-4 text-premium-brown" />
                        <span>{translate("saved_payments", language)}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-premium-brown/40" />
                    </div>
                    <div className="p-3.5 flex justify-between items-center hover:bg-gold-accent/5 cursor-pointer">
                      <span className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{translate("security_biometrics", language)}</span>
                      </span>
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
                        {translate("faceid_active", language)}
                      </span>
                    </div>
                    <div 
                      onClick={() => {
                        setCurrentCustomer(null);
                        localStorage.removeItem("current_customer");
                      }} 
                      className="p-3.5 flex justify-between items-center hover:bg-red-50/70 cursor-pointer text-red-600"
                    >
                      <span className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{language === "vi" ? "Đăng xuất" : "Sign Out"}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-red-300" />
                    </div>
                  </div>

                  {/* Tier Settings */}
                  <div className="bg-white p-4 rounded-none border border-premium-brown/10 space-y-2">
                    <h5 className="font-serif font-bold text-premium-brown text-xs">
                      {translate("simulate_tier", language)}
                    </h5>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["BRONZE", "GOLD", "VIP_BLACK"] as MembershipTier[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setUserTier(t)}
                          className={`py-1 rounded-none text-[9px] font-bold uppercase tracking-wider transition border ${
                            userTier === t 
                              ? "bg-premium-brown text-cream border-premium-brown" 
                              : "bg-cream/40 text-text-light border-premium-brown/10 hover:bg-gold-accent/5"
                          }`}
                        >
                          {t.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          )}

          {/* Floating Cart Button */}
          {currentCustomer && cart.length > 0 && (
            <motion.button
              onClick={() => setShowCart(true)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-16 right-5 bg-premium-brown border border-gold-accent/30 hover:bg-rich-espresso text-gold-accent p-3.5 rounded-full shadow-lg z-20 flex items-center justify-center"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-gold-accent text-premium-brown font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-premium-brown shadow-sm font-mono">
                  {cart.length}
                </span>
              </div>
            </motion.button>
          )}

          {/* Bottom Bar Navigation */}
          {currentCustomer && (
            <div className="absolute bottom-0 inset-x-0 h-14 bg-white border-t border-premium-brown/15 flex justify-around items-center px-4 pb-2 z-10">
            <button 
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center justify-center transition ${activeTab === "home" ? "text-gold-accent" : "text-text-light hover:text-premium-brown"}`}
            >
              <Compass className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider">{translate("home", language)}</span>
            </button>
            <button 
              onClick={() => setActiveTab("menu")}
              className={`flex flex-col items-center justify-center transition ${activeTab === "menu" ? "text-gold-accent" : "text-text-light hover:text-premium-brown"}`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider">{translate("menu", language)}</span>
            </button>
            <button 
              onClick={() => setActiveTab("stores")}
              className={`flex flex-col items-center justify-center transition ${activeTab === "stores" ? "text-gold-accent" : "text-text-light hover:text-premium-brown"}`}
            >
              <MapPin className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider">{translate("stores", language)}</span>
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center justify-center transition ${activeTab === "profile" ? "text-gold-accent" : "text-text-light hover:text-premium-brown"}`}
            >
              <User className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider">{translate("card", language)}</span>
            </button>
          </div>
          )}

          {/* PRODUCT DETAIL DRAWER / OVERLAY */}
          <AnimatePresence>
            {selectedProduct && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rich-espresso/60 z-30 flex flex-col justify-end"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-white rounded-t-none border-t-2 border-gold-accent p-4 flex flex-col max-h-[90%] overflow-y-auto"
                >
                  {/* Close Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-premium-brown/10">
                    <div>
                      <h3 className="font-serif font-semibold text-premium-brown text-sm line-clamp-1">
                        {translateProduct(selectedProduct.id, language).name}
                      </h3>
                      <p className="text-[10px] text-text-light uppercase tracking-wider font-bold">
                        {language === "zh" ? selectedProduct.chineseName : selectedProduct.name}
                      </p>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="bg-cream p-1.5 rounded-none text-premium-brown hover:bg-gold-accent/10 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="py-3 flex space-x-3">
                    <img src={selectedProduct.image} alt="" className="w-16 h-16 object-cover rounded-none border border-premium-brown/10" />
                    <div className="flex-1">
                      <p className="text-[11px] text-text-light leading-relaxed">
                        {translateProduct(selectedProduct.id, language).description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5 text-[8px] font-bold uppercase tracking-wider text-gold-accent">
                        {selectedProduct.allergens.map(a => (
                          <span key={a} className="bg-gold-accent/10 border border-gold-accent/25 px-1.5 py-0.5 rounded-none">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="space-y-3 mt-1 flex-1">
                    {selectedProduct.variants.map(variant => (
                      <div key={variant.name} className="space-y-1">
                        <span className="text-[10px] font-bold text-text-light uppercase tracking-wider">{variant.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {variant.options.map(option => (
                            <button
                              key={option}
                              onClick={() => setVariantOptions({ ...variantOptions, [variant.name]: option })}
                              className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition uppercase tracking-wider ${
                                variantOptions[variant.name] === option 
                                  ? "bg-premium-brown text-cream border-premium-brown" 
                                  : "bg-white text-text-light border-premium-brown/15 hover:bg-gold-accent/5"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Toppings Selection */}
                    {selectedProduct.category !== "Desserts" && selectedProduct.category !== "Merchandise" && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-text-light uppercase tracking-wider">
                          {translate("premium_toppings", language)}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {TOPPINGS.map(topping => {
                            const isSelected = selectedToppings.some(t => t.id === topping.id);
                            return (
                              <button
                                key={topping.id}
                                onClick={() => handleToggleTopping(topping)}
                                className={`px-2.5 py-1.5 rounded-none text-[10px] font-semibold border transition flex items-center space-x-1 ${
                                  isSelected 
                                    ? "bg-gold-accent/10 text-premium-brown border-gold-accent" 
                                    : "bg-white text-text-light border-premium-brown/15 hover:bg-gold-accent/5"
                                }`}
                              >
                                <span>{translateTopping(topping.id, language)}</span>
                                <span className="opacity-75 font-mono">(+{formatPrice(topping.priceUSD)})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Nutrition Drawer Accordion */}
                    <div className="bg-cream p-2.5 rounded-none border border-premium-brown/10 text-[10px] text-text-light flex justify-between font-mono">
                      <span>{translate("calories", language)}: <strong>{selectedProduct.nutrition.calories} kcal</strong></span>
                      <span>{translate("sugar", language)}: <strong>{selectedProduct.nutrition.sugarGrams}g</strong></span>
                      <span>{translate("fat", language)}: <strong>{selectedProduct.nutrition.fatGrams}g</strong></span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-2 border-t border-premium-brown/10">
                      <span className="font-bold text-premium-brown text-xs uppercase tracking-wider">
                        {translate("quantity", language)}
                      </span>
                      <div className="flex items-center space-x-2 bg-cream border border-premium-brown/15 rounded-none p-1 font-mono">
                        <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-1 text-premium-brown">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-premium-brown text-xs w-6 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(prev => prev + 1)} className="p-1 text-premium-brown">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add To Cart Trigger */}
                  <div className="mt-4 pt-3 border-t border-premium-brown/10">
                    <button 
                      onClick={handleAddToCart}
                      className="w-full bg-premium-brown hover:bg-rich-espresso text-cream p-3.5 rounded-none font-bold uppercase tracking-[0.15em] text-xs transition flex justify-between items-center shadow-lg border border-gold-accent/20"
                    >
                      <span>{translate("add_to_bag", language)}</span>
                      <span className="text-gold-accent font-serif text-sm">
                        {formatPrice((selectedProduct.priceUSD + selectedToppings.reduce((sum, t) => sum + t.priceUSD, 0)) * quantity)}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CART DRAWER OVERLAY */}
          <AnimatePresence>
            {showCart && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-rich-espresso/60 z-30 flex flex-col justify-end"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-white rounded-t-none border-t-2 border-gold-accent p-4 flex flex-col max-h-[90%] overflow-y-auto"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-premium-brown/10">
                    <h3 className="font-serif font-semibold text-premium-brown text-sm">
                      {translate("shopping_bag", language)} ({cart.length} {translate("items", language)})
                    </h3>
                    <button onClick={() => setShowCart(false)} className="bg-cream p-1.5 rounded-none text-premium-brown hover:bg-gold-accent/10 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="flex bg-cream border border-premium-brown/10 rounded-none p-1 my-3">
                    <button 
                      onClick={() => setOrderType(OrderType.PICKUP)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-none uppercase tracking-wider transition ${orderType === OrderType.PICKUP ? "bg-white text-premium-brown border border-premium-brown/15 shadow-sm" : "text-text-light hover:text-premium-brown"}`}
                    >
                      {translate("pickup", language)}
                    </button>
                    <button 
                      onClick={() => setOrderType(OrderType.DELIVERY)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-none uppercase tracking-wider transition ${orderType === OrderType.DELIVERY ? "bg-white text-premium-brown border border-premium-brown/15 shadow-sm" : "text-text-light hover:text-premium-brown"}`}
                    >
                      {translate("delivery", language)}
                    </button>
                    <button 
                      onClick={() => setOrderType(OrderType.DINE_IN)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-none uppercase tracking-wider transition ${orderType === OrderType.DINE_IN ? "bg-white text-premium-brown border border-premium-brown/15 shadow-sm" : "text-text-light hover:text-premium-brown"}`}
                    >
                      {translate("dine_in", language)}
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="divide-y divide-premium-brown/10 flex-1 overflow-y-auto space-y-2.5 font-sans">
                    {cart.map((item, idx) => {
                      const toppingPrice = item.selectedToppings.reduce((sum, t) => sum + t.priceUSD, 0);
                      return (
                        <div key={idx} className="pt-2 flex justify-between">
                          <div>
                            <h5 className="font-serif font-semibold text-xs text-premium-brown">
                              {translateProduct(item.product.id, language).name}
                            </h5>
                            <p className="text-[9px] text-text-light mt-0.5">
                              {Object.entries(item.selectedVariantOptions).map(([k, v]) => `${k}: ${v}`).join(" | ")}
                            </p>
                            {item.selectedToppings.length > 0 && (
                              <p className="text-[9px] text-gold-accent mt-0.5 font-semibold">
                                + {item.selectedToppings.map(t => translateTopping(t.id, language)).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-serif font-bold text-premium-brown text-xs">
                              {formatPrice((item.product.priceUSD + toppingPrice) * item.quantity)}
                            </span>
                            <div className="flex items-center space-x-1.5 mt-1 bg-cream px-2 py-0.5 rounded-none border border-premium-brown/10 justify-end font-mono">
                              <span className="text-[10px] font-bold">Qty: {item.quantity}</span>
                              <button 
                                onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                className="text-red-600 hover:underline font-bold text-[9px] uppercase tracking-wider pl-1 border-l border-premium-brown/10"
                              >
                                {translate("delete", language)}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment checkout triggers */}
                  <div className="border-t border-premium-brown/10 pt-3 mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-premium-brown uppercase tracking-wider">
                      <span>{translate("grand_total", language)}</span>
                      <span className="font-serif font-bold text-sm text-gold-accent">{formatPrice(calculateCartTotalUSD())}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={() => handleCheckout("Stripe")}
                        className="bg-premium-brown hover:bg-rich-espresso text-cream p-3 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition border border-gold-accent/20"
                      >
                        <CreditCard className="w-4 h-4 text-gold-accent" />
                        <span>Stripe Pay</span>
                      </button>
                      <button 
                        onClick={() => handleCheckout("GooglePay")}
                        className="bg-rich-espresso hover:bg-black text-cream p-3 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition border border-gold-accent/25"
                      >
                        <Sparkles className="w-4 h-4 text-gold-accent" />
                        <span>Apple/Google</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DIGITAL QR ID OVERLAY */}
          <AnimatePresence>
            {showQR && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQR(false)}
                className="absolute inset-0 bg-rich-espresso/85 z-40 flex flex-col items-center justify-center p-5 cursor-pointer"
              >
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-cream rounded-none p-6 w-full max-w-[300px] text-center space-y-4 shadow-2xl border border-gold-accent/50"
                >
                  <div>
                    <h3 className="font-serif font-semibold text-premium-brown tracking-wider text-sm">MELLODI DIGITAL CARD</h3>
                    <p className="text-[10px] text-text-light mt-0.5">Scan at any POS to redeem points & pay</p>
                  </div>

                  {/* QR Code Graphic Representation */}
                  <div className="bg-white p-4 rounded-none inline-block mx-auto border border-premium-brown/10">
                    <div className="w-40 h-40 bg-premium-brown rounded-none flex flex-col justify-between p-2.5">
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-white bg-transparent"></div>
                        <div className="w-10 h-10 border-4 border-white bg-transparent"></div>
                      </div>
                      <div className="text-white text-[9px] font-serif tracking-[0.2em] text-center uppercase font-bold">
                        MELLODI QR
                      </div>
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-white bg-transparent"></div>
                        <div className="w-6 h-6 bg-gold-accent self-end"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-premium-brown text-xs font-serif uppercase tracking-wider">{currentCustomer ? currentCustomer.name : "Vincent Vuong"}</p>
                    <div className="flex items-center justify-center space-x-1.5">
                      <span className="text-[9px] text-text-light font-bold uppercase tracking-widest">{userTier} Tier</span>
                      <span className="w-1 h-1 bg-gold-accent rounded-full"></span>
                      <span className="text-gold-accent font-bold text-xs">{lenPoints} LEN PTS</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowQR(false)}
                    className="w-full bg-premium-brown hover:bg-rich-espresso text-cream font-bold py-2 rounded-none text-xs uppercase tracking-wider border border-gold-accent/20 transition"
                  >
                    Done
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOYALTY REWARDS MODALS */}
          <AnimatePresence>
            {/* 1. CONFIRM REDEMPTION MODAL */}
            {selectedReward && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedReward(null)}
                className="absolute inset-0 bg-rich-espresso/80 z-40 flex flex-col items-center justify-center p-5"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-cream rounded-none p-5 w-full max-w-[310px] space-y-4 shadow-2xl border border-gold-accent/40"
                >
                  <div className="text-center">
                    <span className="text-[9px] bg-gold-accent/15 text-gold-accent border border-gold-accent/25 px-2.5 py-0.5 rounded-none font-bold uppercase tracking-[0.15em] inline-block mb-1">
                      {language === "vi" ? "XÁC NHẬN ĐỔI QUÀ" : "CONFIRM REDEMPTION"}
                    </span>
                    <h3 className="font-serif font-bold text-premium-brown text-sm leading-snug mt-1">
                      {getLocalizedRewardName(selectedReward.id)}
                    </h3>
                  </div>

                  <div className="aspect-video bg-white border border-premium-brown/10 overflow-hidden">
                    <img src={selectedReward.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  {/* Points Ledger */}
                  <div className="bg-white border border-premium-brown/5 p-3 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-light">{language === "vi" ? "Điểm hiện tại:" : "Current Balance:"}</span>
                      <span className="font-bold text-premium-brown">{lenPoints} PTS</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>{language === "vi" ? "Trừ điểm đổi quà:" : "Points Deducted:"}</span>
                      <span>-{selectedReward.pointsCost} PTS</span>
                    </div>
                    <div className="border-t border-dashed border-premium-brown/10 pt-1.5 flex justify-between font-serif text-xs font-bold text-premium-brown">
                      <span>{language === "vi" ? "Số dư còn lại:" : "Remaining Balance:"}</span>
                      <span className="text-gold-accent">{lenPoints - selectedReward.pointsCost} PTS</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedReward(null)}
                      className="flex-1 bg-white hover:bg-stone-50 text-text-light font-bold py-2 px-3 border border-premium-brown/15 rounded-none text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      {language === "vi" ? "Hủy" : "Cancel"}
                    </button>
                    <button 
                      onClick={() => {
                        const code = `MLD-RW-${Math.floor(100000 + Math.random() * 900000)}`;
                        const newVoucher = {
                          id: `v-${Date.now()}`,
                          reward: selectedReward,
                          code,
                          date: new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { month: "short", day: "numeric", year: "numeric" })
                        };
                        
                        // Deduct points
                        setLenPoints(prev => prev - selectedReward.pointsCost);
                        
                        // Save voucher
                        setActiveVouchers([newVoucher, ...activeVouchers]);

                        // Notify
                        if (addSystemNotification) {
                          const title = language === "vi" ? "Đổi Quà Thành Công! 🎉" : "Redemption Successful! 🎉";
                          const body = language === "vi" 
                            ? `Bạn đã đổi thành công "${getLocalizedRewardName(selectedReward.id)}". Nhận quà tại quầy thu ngân.`
                            : `Successfully redeemed "${getLocalizedRewardName(selectedReward.id)}". Collect your merchandise at the cashier.`;
                          addSystemNotification(title, body, "PROMO");
                        }

                        setShowRewardSuccess(newVoucher);
                        setSelectedReward(null);
                      }}
                      className="flex-1 bg-premium-brown hover:bg-rich-espresso text-cream font-bold py-2 px-3 border border-gold-accent/20 rounded-none text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      {language === "vi" ? "Xác Nhận" : "Confirm"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 2. REDEMPTION SUCCESS VOUCHER CODE */}
            {showRewardSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRewardSuccess(null)}
                className="absolute inset-0 bg-rich-espresso/85 z-40 flex flex-col items-center justify-center p-5"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 30 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-cream rounded-none p-5 w-full max-w-[310px] text-center space-y-4 shadow-2xl border border-gold-accent"
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 bg-gold-accent/10 border border-gold-accent/30 rounded-full flex items-center justify-center mx-auto mb-2 text-gold-accent">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-black text-premium-brown tracking-wider text-sm uppercase">
                      {language === "vi" ? "ĐỔI QUÀ THÀNH CÔNG!" : "REDEMPTION SUCCESSFUL!"}
                    </h3>
                    <p className="text-[10px] text-text-light">
                      {language === "vi" ? "Đã lưu vào danh sách quà tặng của bạn" : "Voucher successfully generated and saved"}
                    </p>
                  </div>

                  <div className="bg-white border border-premium-brown/10 p-3 rounded-none flex items-center space-x-3 text-left">
                    <img src={showRewardSuccess.reward.image} alt="" className="w-12 h-12 object-cover border border-premium-brown/5 rounded-none" referrerPolicy="no-referrer" />
                    <div>
                      <span className="font-serif font-bold text-premium-brown text-[11px] block leading-snug">
                        {getLocalizedRewardName(showRewardSuccess.reward.id)}
                      </span>
                      <span className="text-[9px] text-gold-accent font-semibold uppercase tracking-wider block mt-0.5">
                        ★ {showRewardSuccess.reward.pointsCost} LEN PTS
                      </span>
                    </div>
                  </div>

                  {/* Starbucks Voucher QR Code Box */}
                  <div className="bg-white p-4 rounded-none inline-block mx-auto border border-premium-brown/10 space-y-2">
                    <div className="w-36 h-36 bg-rich-espresso rounded-none flex flex-col justify-between p-2 mx-auto">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-4 border-gold-accent bg-transparent"></div>
                        <div className="w-8 h-8 border-4 border-gold-accent bg-transparent"></div>
                      </div>
                      <div className="text-gold-accent text-[9px] font-mono tracking-[0.1em] text-center uppercase font-bold leading-none">
                        VOUCHER QR
                        <span className="block text-[8px] opacity-80 mt-1">{showRewardSuccess.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-4 border-gold-accent bg-transparent"></div>
                        <div className="w-5 h-5 bg-gold-accent self-end"></div>
                      </div>
                    </div>
                    <p className="text-[9px] text-text-light leading-snug">
                      {language === "vi" 
                        ? "Xuất trình mã này cho Barista để nhận quà vật lý của bạn." 
                        : "Show this barcode/QR to the Barista at the counter to claim."}
                    </p>
                  </div>

                  <button 
                    onClick={() => setShowRewardSuccess(null)}
                    className="w-full bg-premium-brown hover:bg-rich-espresso text-cream font-bold py-2 rounded-none text-xs uppercase tracking-wider border border-gold-accent/20 transition cursor-pointer"
                  >
                    {language === "vi" ? "ĐÓNG" : "DONE"}
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* 3. MY VOUCHERS LIST SLIDE-UP */}
            {showVouchersList && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowVouchersList(false)}
                className="absolute inset-0 bg-rich-espresso/80 z-40 flex flex-col justify-end"
              >
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-cream rounded-t-[32px] p-5 w-full h-[85%] flex flex-col border-t border-gold-accent/35"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-premium-brown/10">
                    <div className="flex items-center space-x-2">
                      <Ticket className="w-5 h-5 text-gold-accent" />
                      <div>
                        <h3 className="font-serif font-black text-premium-brown text-sm uppercase tracking-wide">
                          {language === "vi" ? "QUÀ TẶNG CỦA TÔI" : "MY BOUTIQUE GIFTS"}
                        </h3>
                        <p className="text-[10px] text-text-light italic">{language === "vi" ? "Mã ưu đãi đã đổi chờ xuất trình nhận quà" : "Your active unclaimed reward vouchers"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowVouchersList(false)}
                      className="p-1 rounded-full bg-white border border-premium-brown/10 text-premium-brown hover:bg-stone-50 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
                    {activeVouchers.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-2">
                        <Gift className="w-10 h-10 text-stone-300" />
                        <h4 className="font-serif text-xs font-bold text-premium-brown">
                          {language === "vi" ? "CHƯA CÓ QUÀ NÀO ĐƯỢC ĐỔI" : "NO REWARD VOUCHERS YET"}
                        </h4>
                        <p className="text-[10px] text-text-light max-w-[180px]">
                          {language === "vi" ? "Tích lũy thêm điểm và đổi lấy áo thun, móc khóa giới hạn nhé!" : "Earn points to redeem for t-shirts, custom keychains, and more!"}
                        </p>
                      </div>
                    ) : (
                      activeVouchers.map((v) => (
                        <div key={v.id} className="bg-white border border-premium-brown/10 p-4 space-y-3.5 relative shadow-sm">
                          {/* Ticket edge cutout decoration */}
                          <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-cream rounded-full border-r border-premium-brown/10 z-10" />
                          <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-cream rounded-full border-l border-premium-brown/10 z-10" />
                          
                          <div className="flex items-start justify-between">
                            <div className="flex space-x-3">
                              <img src={v.reward.image} alt="" className="w-12 h-12 object-cover border border-premium-brown/5 shrink-0 rounded-none" referrerPolicy="no-referrer" />
                              <div>
                                <h4 className="font-serif font-bold text-premium-brown text-[11px] leading-snug pr-2">
                                  {getLocalizedRewardName(v.reward.id)}
                                </h4>
                                <span className="text-[9px] text-gold-accent font-mono block mt-1">★ {v.reward.pointsCost} PTS</span>
                                <span className="text-[8px] text-text-light block mt-0.5">Redeemed: {v.date}</span>
                              </div>
                            </div>
                            
                            {/* Actions / Status */}
                            <button 
                              onClick={() => {
                                // Simulate Claiming the item (removes it or marks as claimed)
                                if (confirm(language === "vi" ? "Bạn muốn đánh dấu quà tặng này đã nhận?" : "Mark this reward voucher as collected?")) {
                                  setActiveVouchers(activeVouchers.filter(item => item.id !== v.id));
                                }
                              }}
                              className="text-[9px] text-red-600 hover:bg-red-50 py-1 px-2 border border-red-150 transition font-bold uppercase rounded-none shrink-0"
                            >
                              {language === "vi" ? "HỦY/ĐÃ NHẬN" : "CLAIMED / REMOVE"}
                            </button>
                          </div>

                          <div className="border-t border-dashed border-premium-brown/10 pt-3 flex flex-col items-center justify-center space-y-2">
                            {/* Mini simulated barcode */}
                            <div className="w-full h-8 bg-stone-900 flex justify-between px-6 py-1 text-[7px] text-white/10 font-mono tracking-widest uppercase">
                              ||| || | ||| |||| | | ||| || ||| |||| | | ||| || ||||
                            </div>
                            <span className="font-mono text-[9px] text-premium-brown font-bold uppercase tracking-wider">{v.code}</span>
                            <p className="text-[8px] text-text-light italic text-center">
                              {language === "vi" ? "Xuất trình mã này tại quầy để nhận quà." : "Present this barcode at the boutique counter to collect."}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button 
                    onClick={() => setShowVouchersList(false)}
                    className="w-full bg-premium-brown hover:bg-rich-espresso text-cream font-bold py-3 mt-4 rounded-none text-xs uppercase tracking-wider border border-gold-accent/20 transition cursor-pointer"
                  >
                    {language === "vi" ? "QUAY LẠI CỬA HÀNG" : "BACK TO STORE"}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
