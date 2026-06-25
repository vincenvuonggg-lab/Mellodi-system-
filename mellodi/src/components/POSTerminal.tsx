import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, ShoppingCart, User, Percent, Receipt, Printer, Trash2, 
  Tag, CreditCard, DollarSign, RefreshCw, Barcode, Plus, Minus, CheckCircle
} from "lucide-react";
import { Product, Store, Country, Order, OrderStatus, OrderType, MembershipTier, Topping, InventoryItem } from "../types";
import { PRODUCTS, TOPPINGS, STORES, INVENTORY, COUNTRIES } from "../data";
import { translate, translateProduct, translateTopping, translateCategory } from "../locales";

interface POSTerminalProps {
  orders: Order[];
  onAddOrder: (order: Order) => void;
  selectedCountry: Country;
  setSelectedCountry?: (country: Country) => void;
  language: string;
  setLanguage: (lang: string) => void;
  lenPoints: number;
  setLenPoints: React.Dispatch<React.SetStateAction<number>>;
  userTier: MembershipTier;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function POSTerminal({
  orders,
  onAddOrder,
  selectedCountry,
  setSelectedCountry,
  language,
  setLanguage,
  lenPoints,
  setLenPoints,
  userTier,
  inventory,
  setInventory
}: POSTerminalProps) {
  // Cashier State
  const [activeStore, setActiveStore] = useState<Store>(STORES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // POS Cart State (simple flat array for POS speed)
  const [posCart, setPosCart] = useState<Array<{
    product: Product;
    quantity: number;
    selectedVariants: string[];
    selectedToppings: Topping[];
    notes: string;
  }>>([]);

  // Customer Loyalty Linking State
  const [customerLookup, setCustomerLookup] = useState("");
  const [isCustomerLinked, setIsCustomerLinked] = useState(false);
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);

  // Receipt modal state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "CARD" | "LEN_POINTS">("CARD");

  const categories = ["All", "Milk Tea", "Pure Tea", "Fruit Tea", "Coffee", "Desserts", "Merchandise"];

  // Helper for price
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

  const handleAddProduct = (product: Product) => {
    // Generate simple defaults for speed-checkout
    const selectedVariants: string[] = [];
    product.variants.forEach(v => {
      if (v.options.length > 0) selectedVariants.push(`${v.name}: ${v.options[0]}`);
    });

    setPosCart([
      ...posCart,
      {
        product,
        quantity: 1,
        selectedVariants,
        selectedToppings: [],
        notes: ""
      }
    ]);
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    const updated = [...posCart];
    updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
    setPosCart(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setPosCart(posCart.filter((_, i) => i !== idx));
  };

  const handleAddTopToItem = (idx: number, topping: Topping) => {
    const updated = [...posCart];
    const toppings = updated[idx].selectedToppings;
    if (toppings.some(t => t.id === topping.id)) {
      updated[idx].selectedToppings = toppings.filter(t => t.id !== topping.id);
    } else {
      updated[idx].selectedToppings = [...toppings, topping];
    }
    setPosCart(updated);
  };

  const calculateSubtotal = () => {
    return posCart.reduce((sum, item) => {
      const topCost = item.selectedToppings.reduce((s, t) => s + t.priceUSD, 0);
      return sum + (item.product.priceUSD + topCost) * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    // Add 10% auto discount if user is Diamond tier, 5% for Gold, etc.
    let tierDiscountPercent = 0;
    if (isCustomerLinked) {
      if (userTier === "VIP_BLACK") tierDiscountPercent = 20;
      else if (userTier === "DIAMOND") tierDiscountPercent = 15;
      else if (userTier === "PLATINUM") tierDiscountPercent = 10;
      else if (userTier === "GOLD") tierDiscountPercent = 5;
    }
    const finalPercent = Math.max(customDiscountPercent, tierDiscountPercent);
    return subtotal * (finalPercent / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.max(0, subtotal - discount);
  };

  const handleCheckout = () => {
    if (posCart.length === 0) return;

    const finalTotalUSD = calculateTotal();
    const orderItems = posCart.map(item => ({
      productName: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      priceUSD: item.product.priceUSD + item.selectedToppings.reduce((sum, t) => sum + t.priceUSD, 0),
      variants: item.selectedVariants,
      toppings: item.selectedToppings.map(t => t.name)
    }));

    const orderId = `MEL-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const pointsToEarn = Math.floor(finalTotalUSD);

    // Deduct stock levels in Inventory
    setInventory(prevInv => {
      return prevInv.map(inv => {
        // Simple mock inventory association based on tea/coffee categories
        if (inv.id === "i5") { // cups
          return { ...inv, stockLevel: Math.max(0, inv.stockLevel - posCart.length) };
        }
        if (inv.id === "i3" && posCart.some(x => x.product.category === "Milk Tea")) { // Cream
          return { ...inv, stockLevel: Math.max(0, inv.stockLevel - 1.5) };
        }
        if (inv.id === "i4" && posCart.some(x => x.selectedToppings.some(t => t.id === "t1"))) { // Boba
          return { ...inv, stockLevel: Math.max(0, inv.stockLevel - 2.0) };
        }
        return inv;
      });
    });

    const newOrder: Order = {
      id: orderId,
      customerName: isCustomerLinked ? "Vincent Vuong" : "Walk-in Customer",
      customerPhone: isCustomerLinked ? "+84 908 123 456" : undefined,
      items: orderItems,
      totalUSD: finalTotalUSD,
      status: OrderStatus.COMPLETED,
      type: OrderType.DINE_IN,
      storeId: activeStore.id,
      storeName: activeStore.name,
      timestamp: new Date().toISOString(),
      country: selectedCountry.name,
      currency: selectedCountry.currency,
      exchangeRate: selectedCountry.exchangeRate,
      pointsEarned: isCustomerLinked ? pointsToEarn : 0,
      isPaid: true
    };

    onAddOrder(newOrder);

    if (isCustomerLinked) {
      if (paymentMode === "LEN_POINTS") {
        setLenPoints(prev => Math.max(0, prev - Math.round(finalTotalUSD * 10)));
      } else {
        setLenPoints(prev => prev + pointsToEarn);
      }
    }

    setCompletedOrder(newOrder);
    setPosCart([]);
    setIsCustomerLinked(false);
    setCustomerLookup("");
    setCustomDiscountPercent(0);
  };

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.chineseName && p.chineseName.includes(searchQuery));
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="pos-terminal-root" className="w-full h-full bg-cream text-rich-espresso flex flex-col font-sans text-sm p-4 select-none">
      
      {/* Top Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-premium-brown/10">
        <div className="flex items-center space-x-3">
          <div className="bg-premium-brown border border-gold-accent/30 text-gold-accent p-2 rounded-none flex items-center justify-center font-bold">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-serif font-black tracking-[0.12em] text-premium-brown uppercase">Mellodi POS Pro</h2>
            <div className="flex items-center space-x-1.5 text-xs text-text-light mt-0.5">
              <span>Cashier: <strong>Emily Chen</strong></span>
              <span className="w-1 h-1 bg-premium-brown/20 rounded-full"></span>
              <select 
                value={activeStore.id} 
                onChange={(e) => {
                  const s = STORES.find(st => st.id === e.target.value);
                  if (s) setActiveStore(s);
                }}
                className="bg-cream border border-premium-brown/10 text-premium-brown font-bold p-1 focus:ring-0 cursor-pointer text-xs rounded-none"
              >
                {STORES.map(s => (
                  <option key={s.id} value={s.id} className="bg-white text-premium-brown">{s.name}</option>
                ))}
              </select>

              <span className="w-1 h-1 bg-premium-brown/20 rounded-full"></span>
              <select 
                value={selectedCountry.code} 
                onChange={(e) => {
                  if (setSelectedCountry) {
                    const country = COUNTRIES.find(c => c.code === e.target.value);
                    if (country) setSelectedCountry(country);
                  }
                }}
                className="bg-cream border border-premium-brown/10 text-premium-brown font-bold p-1 focus:ring-0 cursor-pointer text-xs rounded-none"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-white text-premium-brown">{c.flag} {c.currency} ({c.symbol})</option>
                ))}
              </select>

              <span className="w-1 h-1 bg-premium-brown/20 rounded-full"></span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-cream border border-premium-brown/10 text-premium-brown font-bold p-1 focus:ring-0 cursor-pointer text-xs rounded-none"
              >
                <option value="vi" className="bg-white text-premium-brown">🇻🇳 VI</option>
                <option value="en" className="bg-white text-premium-brown">🇺🇸 EN</option>
                <option value="ja" className="bg-white text-premium-brown">🇯🇵 JA</option>
                <option value="zh" className="bg-white text-premium-brown">🇨🇳 ZH</option>
                <option value="ko" className="bg-white text-premium-brown">🇰🇷 KO</option>
                <option value="th" className="bg-white text-premium-brown">🇹🇭 TH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rapid Product Search */}
        <div className="flex-1 max-w-md relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-text-light/60">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Scan barcode, search drink name, or chinese tea tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-premium-brown/15 rounded-none py-2 pl-9 pr-4 text-xs text-rich-espresso focus:outline-none focus:border-premium-brown focus:ring-1 focus:ring-premium-brown placeholder-text-light/50"
          />
        </div>

        {/* Customer Quick Lookup Card */}
        <div className="flex items-center space-x-2 bg-white border border-premium-brown/15 px-3 py-1.5 rounded-none">
          <User className="w-4 h-4 text-gold-accent" />
          {isCustomerLinked ? (
            <div className="flex items-center space-x-2 text-xs">
              <div>
                <span className="font-bold text-premium-brown block leading-none">Vincent Vuong</span>
                <span className="text-[10px] text-gold-accent font-semibold uppercase tracking-wider">Diamond Tier ({lenPoints} pts)</span>
              </div>
              <button 
                onClick={() => setIsCustomerLinked(false)} 
                className="text-red-600 hover:text-red-700 font-bold ml-1.5"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                placeholder="Lookup Member..."
                value={customerLookup}
                onChange={(e) => setCustomerLookup(e.target.value)}
                className="bg-transparent border-0 text-xs p-0 w-24 text-rich-espresso focus:ring-0 focus:outline-none placeholder-text-light/40"
              />
              <button
                onClick={() => {
                  if (customerLookup.trim().toLowerCase().includes("vin") || customerLookup.trim().length > 1) {
                    setIsCustomerLinked(true);
                  }
                }}
                className="bg-premium-brown hover:bg-rich-espresso text-cream text-[10px] px-2.5 py-1 rounded-none font-bold uppercase tracking-wider border border-gold-accent/20 transition"
              >
                Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Terminal Grid Splitter */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 overflow-hidden">
        
        {/* Left Grid: Products Menu Catalog (8/12 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col overflow-hidden h-full">
          {/* Horizontal Category Pill selector */}
          <div className="flex space-x-1.5 overflow-x-auto pb-3 scrollbar-none shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-none text-xs tracking-wider uppercase font-bold transition whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? "bg-premium-brown text-cream border-premium-brown border-b-2 border-b-gold-accent shadow-sm" 
                    : "bg-white text-text-light border-premium-brown/10 hover:bg-gold-accent/5 hover:text-premium-brown"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Menu Responsive Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1.5">
            {filteredProducts.map(product => {
              // Quick mock check for inventory level
              const isOut = product.id === "p1" && inventory.find(i => i.id === "i1")?.stockLevel === 0;
              return (
                <div
                  key={product.id}
                  onClick={() => !isOut && handleAddProduct(product)}
                  className={`relative rounded-none bg-white p-2.5 flex flex-col justify-between cursor-pointer group select-none transition border border-premium-brown/10 hover:border-gold-accent hover:shadow-sm ${
                    isOut ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="h-24 rounded-none bg-cream overflow-hidden relative mb-2 border border-premium-brown/10">
                    <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span className="absolute bottom-1.5 right-1.5 bg-rich-espresso/90 text-cream text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-none border border-gold-accent/20">
                      {formatPrice(product.priceUSD)}
                    </span>
                    {product.chineseName && (
                      <span className="absolute top-1.5 left-1.5 bg-premium-brown text-gold-accent text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-none">
                        {product.chineseName}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-xs text-premium-brown line-clamp-1 leading-tight">{product.name}</h4>
                    <p className="text-[9px] text-text-light mt-1 uppercase tracking-[0.12em] font-bold">{product.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Grid: Cashier Order Cart Panel (4/12 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-premium-brown/10 rounded-none p-4 flex flex-col overflow-hidden h-full">
          <div className="flex justify-between items-center pb-2 border-b border-premium-brown/10 shrink-0">
            <span className="font-serif font-semibold text-premium-brown text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShoppingCart className="w-4 h-4 text-gold-accent" />
              <span>Register Basket ({posCart.length})</span>
            </span>
            {posCart.length > 0 && (
              <button 
                onClick={() => setPosCart([])}
                className="text-text-light hover:text-red-600 text-xs font-semibold flex items-center space-x-1 transition uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Cart Items scroll area */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 divide-y divide-premium-brown/10 pr-0.5">
            {posCart.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-text-light/50 space-y-2 py-10">
                <ShoppingCart className="w-12 h-12 stroke-1 text-premium-brown/25" />
                <p className="text-xs font-serif italic text-text-light">Cart is empty. Select products on the left.</p>
              </div>
            ) : (
              posCart.map((item, idx) => (
                <div key={idx} className={`pt-2.5 ${idx === 0 ? "pt-0" : ""} space-y-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-serif font-semibold text-xs text-premium-brown leading-snug">{item.product.name}</h5>
                      <span className="text-[10px] text-gold-accent block uppercase tracking-wider font-semibold">
                        {item.selectedVariants.join(" | ")}
                      </span>
                    </div>
                    <span className="font-serif font-bold text-premium-brown text-xs shrink-0 pl-1">
                      {formatPrice(item.product.priceUSD)}
                    </span>
                  </div>

                  {/* Quick Toppings Selector in POS cart */}
                  {item.product.category !== "Desserts" && item.product.category !== "Merchandise" && (
                    <div className="flex flex-wrap gap-1">
                      {TOPPINGS.slice(0, 3).map(top => {
                        const hasTop = item.selectedToppings.some(t => t.id === top.id);
                        return (
                          <button
                            key={top.id}
                            onClick={() => handleAddTopToItem(idx, top)}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-none border transition ${
                              hasTop 
                                ? "bg-gold-accent/15 text-premium-brown border-gold-accent" 
                                : "bg-transparent text-text-light/80 border-premium-brown/10 hover:bg-gold-accent/5"
                            }`}
                          >
                            + {top.name.split(" ")[0]} (+{formatPrice(top.priceUSD)})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Quantity & Actions Row */}
                  <div className="flex justify-between items-center pt-1.5">
                    <div className="flex items-center space-x-1 bg-cream border border-premium-brown/10 rounded-none p-0.5 font-mono">
                      <button onClick={() => handleUpdateQuantity(idx, -1)} className="p-1 text-premium-brown hover:text-gold-accent">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-premium-brown w-5 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(idx, 1)} className="p-1 text-premium-brown hover:text-gold-accent">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button onClick={() => handleRemoveItem(idx)} className="text-text-light/70 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Controls and Totals */}
          <div className="border-t border-premium-brown/10 pt-3 space-y-3 shrink-0">
            
            {/* Discount application buttons */}
            <div className="flex items-center justify-between text-xs text-text-light">
              <span className="flex items-center space-x-1 uppercase tracking-wider font-semibold">
                <Tag className="w-3.5 h-3.5 text-gold-accent" />
                <span>Preset Discount:</span>
              </span>
              <div className="flex space-x-1">
                {[0, 10, 20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setCustomDiscountPercent(pct)}
                    className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider transition border ${
                      customDiscountPercent === pct 
                        ? "bg-premium-brown text-cream border-premium-brown" 
                        : "bg-cream text-text-light border-premium-brown/10 hover:bg-gold-accent/5"
                    }`}
                  >
                    {pct === 0 ? "None" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-text-light pt-1">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-mono">{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-red-700">
                <span>Discounts applied</span>
                <span className="font-mono">-{formatPrice(calculateDiscount())}</span>
              </div>
              <div className="flex justify-between text-premium-brown font-black text-sm pt-1 border-t border-premium-brown/10">
                <span>GRAND TOTAL</span>
                <span className="text-gold-accent font-serif font-bold text-base">{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-1 bg-cream border border-premium-brown/10 p-1 rounded-none">
              <button
                onClick={() => setPaymentMode("CARD")}
                className={`py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition flex flex-col items-center justify-center space-y-0.5 ${
                  paymentMode === "CARD" ? "bg-premium-brown text-cream shadow-sm" : "text-text-light hover:text-premium-brown"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Debit/Card</span>
              </button>
              <button
                onClick={() => setPaymentMode("CASH")}
                className={`py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition flex flex-col items-center justify-center space-y-0.5 ${
                  paymentMode === "CASH" ? "bg-premium-brown text-cream shadow-sm" : "text-text-light hover:text-premium-brown"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Cash Drawer</span>
              </button>
              <button
                onClick={() => {
                  if (isCustomerLinked) setPaymentMode("LEN_POINTS");
                }}
                disabled={!isCustomerLinked}
                className={`py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition flex flex-col items-center justify-center space-y-0.5 ${
                  !isCustomerLinked ? "opacity-30 cursor-not-allowed" : ""
                } ${
                  paymentMode === "LEN_POINTS" ? "bg-premium-brown text-cream shadow-sm" : "text-text-light hover:text-premium-brown"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Use Points</span>
              </button>
            </div>

            {/* Large Complete Order Trigger */}
            <button
              onClick={handleCheckout}
              disabled={posCart.length === 0}
              className="w-full bg-premium-brown hover:bg-rich-espresso disabled:opacity-45 text-cream p-3.5 rounded-none font-bold transition flex justify-between items-center shadow-md uppercase tracking-[0.15em] text-xs border border-gold-accent/20"
            >
              <span>Complete Sale</span>
              <span className="font-serif text-sm">{formatPrice(calculateTotal())}</span>
            </button>
          </div>
        </div>
      </div>

      {/* THERMAL RECEIPT DRAWER OVERLAY */}
      <AnimatePresence>
        {completedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-rich-espresso/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-cream text-rich-espresso rounded-none p-6 w-full max-w-sm max-h-[90%] overflow-y-auto relative shadow-2xl flex flex-col border border-gold-accent/40"
            >
              <div className="flex-1 font-mono text-[11px] leading-relaxed select-text">
                {/* Header brand details */}
                <div className="text-center space-y-1.5 border-b border-dashed border-premium-brown/25 pb-3">
                  <h3 className="font-serif font-black text-lg tracking-[0.2em] text-premium-brown">MELLODI TEA</h3>
                  <p className="text-[10px] text-text-light">{activeStore.name}</p>
                  <p className="text-[10px] text-text-light">{activeStore.address}</p>
                  <p className="text-[9px] text-text-light/80">{activeStore.hours}</p>
                </div>

                {/* Meta transaction timestamps */}
                <div className="py-2.5 border-b border-dashed border-premium-brown/25 space-y-1 text-text-light">
                  <div className="flex justify-between">
                    <span>RECEIPT NO:</span>
                    <span>{completedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{new Date(completedOrder.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAY METHOD:</span>
                    <span>{paymentMode}</span>
                  </div>
                  <div className="flex justify-between font-sans text-xs">
                    <span className="uppercase tracking-wider">CUSTOMER:</span>
                    <span className="font-bold text-premium-brown">{completedOrder.customerName}</span>
                  </div>
                </div>

                {/* Receipt Items list */}
                <div className="py-2.5 border-b border-dashed border-premium-brown/25 space-y-2">
                  <div className="flex justify-between text-text-light font-bold">
                    <span>ITEM</span>
                    <span>TOTAL</span>
                  </div>
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-bold text-premium-brown">
                        <span>{it.quantity}x {it.productName.substring(0, 22)}...</span>
                        <span>{formatPrice(it.priceUSD * it.quantity)}</span>
                      </div>
                      {it.variants.length > 0 && (
                        <p className="text-[10px] text-text-light/70 pl-2">↳ {it.variants.join(", ")}</p>
                      )}
                      {it.toppings.length > 0 && (
                        <p className="text-[10px] text-gold-accent pl-2">↳ + Topping: {it.toppings.join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Loyalty and total calculations */}
                <div className="py-2.5 space-y-1 text-premium-brown">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatPrice(completedOrder.totalUSD)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xs border-t border-dashed border-premium-brown/25 pt-1.5">
                    <span>PAID TOTAL:</span>
                    <span className="text-gold-accent font-serif font-bold text-sm">{formatPrice(completedOrder.totalUSD)}</span>
                  </div>
                  {completedOrder.pointsEarned > 0 && (
                    <div className="bg-gold-accent/10 p-1.5 rounded-none text-premium-brown border border-gold-accent/25 mt-2 text-center text-[10px] font-bold uppercase tracking-wider">
                      🎉 MEMBERSHIP EARNED: +{completedOrder.pointsEarned} LEN PTS
                    </div>
                  )}
                </div>

                <div className="text-center pt-4 border-t border-dashed border-premium-brown/25 text-[10px] text-text-light/80 leading-snug font-serif italic">
                  <p>Mellodi Lifestyle Ecosystem</p>
                  <p>Thank you for your premium tea experience!</p>
                </div>
              </div>

              {/* Back to register trigger */}
              <button
                onClick={() => setCompletedOrder(null)}
                className="mt-5 w-full bg-premium-brown hover:bg-rich-espresso text-cream py-2 rounded-none text-xs font-bold uppercase tracking-wider border border-gold-accent/20 flex items-center justify-center space-x-1.5 transition"
              >
                <Printer className="w-4 h-4 text-gold-accent" />
                <span>Print & Resume Sales</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
