import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, ShoppingCart, Globe, Award, DollarSign, Edit, Send, 
  MapPin, Plus, Save, Trash, AlertCircle, FileSpreadsheet, FileText, 
  CheckCircle, RefreshCw, BarChart2, BellRing, Settings, Users,
  Package, AlertTriangle
} from "lucide-react";
import { Order, Product, Country, Store, MembershipTier, Notification, InventoryItem, SystemUser } from "../types";
import { PRODUCTS, TOPPINGS, STORES, COUNTRIES, REWARD_ITEMS } from "../data";

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  countries: Country[];
  setCountries: React.Dispatch<React.SetStateAction<Country[]>>;
  selectedCountry?: Country;
  setSelectedCountry?: (country: Country) => void;
  language: string;
  setLanguage: (lang: string) => void;
  lenPoints: number;
  userTier: MembershipTier;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  promoBanners: any[];
  setPromoBanners: React.Dispatch<React.SetStateAction<any[]>>;
  addSystemNotification: (title: string, body: string, type?: "ORDER" | "PROMO" | "ALERT") => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function AdminDashboard({
  orders,
  products,
  setProducts,
  countries,
  setCountries,
  selectedCountry,
  setSelectedCountry,
  language,
  setLanguage,
  lenPoints,
  userTier,
  notifications,
  setNotifications,
  promoBanners,
  setPromoBanners,
  addSystemNotification,
  inventory,
  setInventory
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"STATS" | "CATALOG" | "CMS" | "USERS" | "NOTIFS" | "STOCK">("STATS");

  // CRM / User list simulation
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
    { email: "admin@mellodi.com", name: "Super Admin", role: "SUPER_ADMIN", lenPoints: 99999, tier: "VIP_BLACK", referralCode: "MELLO-BOSS" },
    { email: "vincenvuonggg@gmail.com", name: "Vincent Vuong", role: "CUSTOMER", lenPoints, tier: userTier, referralCode: "VINCE-M" },
    { email: "emily.chen@mellodi.jp", name: "Emily Chen", role: "STAFF", lenPoints: 450, tier: "GOLD", referralCode: "EMILY-TOKYO" },
    { email: "gregory.hall@mellodi.us", name: "Gregory Hall", role: "MANAGER", lenPoints: 1200, tier: "PLATINUM", referralCode: "GREGO-NYC" }
  ]);

  // Pricing Localization State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

  // Push Notification state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifSegment, setNotifSegment] = useState<"ALL" | "VIP_BLACK" | "VIETNAM">("ALL");
  const [sentAlert, setSentAlert] = useState<string | null>(null);

  // Campaign Banner CMS (managed globally in App.tsx)
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerSubtitle, setNewBannerSubtitle] = useState("");

  // Calculated aggregates
  const totalRevenueUSD = orders.reduce((sum, o) => sum + o.totalUSD, 0);
  const totalOrders = orders.length;
  const uniqueCustomers = Array.from(new Set(orders.map(o => o.customerName))).length;

  const handleUpdatePrice = (id: string) => {
    const numeric = parseFloat(tempPrice);
    if (!isNaN(numeric) && numeric > 0) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        const title = language === "vi" ? "Đồng bộ Giá bán" : "Ecosystem Price Sync";
        const body = language === "vi"
          ? `Giá sản phẩm ${prod.name} vừa được Admin điều chỉnh thành $${numeric.toFixed(2)} USD. Toàn bộ các máy POS và ứng dụng Khách hàng đã cập nhật menu.`
          : `Price for ${prod.name} has been adjusted to $${numeric.toFixed(2)} USD. Localized prices synchronized to all POS terminals and customer menus.`;
        addSystemNotification(title, body, "ALERT");
      }
      setProducts(prev => prev.map(p => p.id === id ? { ...p, priceUSD: numeric } : p));
      setEditingPriceId(null);
    }
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;

    const newNotif: Notification = {
      id: `NTF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: notifTitle,
      body: notifBody,
      timestamp: new Date().toISOString(),
      type: "PROMO",
      read: false
    };

    setNotifications([newNotif, ...notifications]);
    setSentAlert(`Successfully pushed notification to ${notifSegment.replace("_", " ")} segment!`);
    setNotifTitle("");
    setNotifBody("");
    setTimeout(() => setSentAlert(null), 5000);
  };

  const handleCreateBanner = () => {
    if (!newBannerTitle || !newBannerSubtitle) return;
    setPromoBanners([
      ...promoBanners,
      { id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, title: newBannerTitle, subtitle: newBannerSubtitle, active: true }
    ]);
    
    const title = language === "vi" ? "Đồng bộ Chiến dịch CMS" : "Ecosystem CMS Sync";
    const body = language === "vi"
      ? `Chiến dịch mới "${newBannerTitle}" vừa được tạo bởi Admin và đồng bộ tức thì tới tất cả ứng dụng di động Khách hàng.`
      : `New marketing banner "${newBannerTitle}" launched. Real-time sync updated across all active client mobile views.`;
    addSystemNotification(title, body, "PROMO");

    setNewBannerTitle("");
    setNewBannerSubtitle("");
  };

  // Helper for currency conversion
  const formatPrice = (usd: number, countryCode: string = "US") => {
    const country = countries.find(c => c.code === countryCode) || countries[0];
    const localAmount = usd * country.exchangeRate;
    if (country.code === "VN") {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Math.round(localAmount / 1000) * 1000);
    }
    if (country.code === "JP") {
      return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(Math.round(localAmount));
    }
    if (country.code === "KR") {
      return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(Math.round(localAmount));
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: country.currency,
    }).format(localAmount);
  };

  return (
    <div id="admin-dashboard-root" className="w-full h-full bg-cream text-rich-espresso flex flex-col font-sans text-sm p-5 overflow-y-auto select-none">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-premium-brown/10 pb-4 gap-4">
        <div>
          <span className="text-[10px] text-gold-accent font-bold uppercase tracking-[0.2em] block">Global Executive Suite</span>
          <h1 className="text-2xl font-serif font-black text-premium-brown tracking-[0.08em] mt-1 flex items-center space-x-2 uppercase">
            <span>MELLODI HQ</span>
            <span className="text-[9px] bg-premium-brown text-cream border border-gold-accent/25 font-bold py-0.5 px-2.5 rounded-none uppercase tracking-widest">Enterprise Mode</span>
          </h1>
          <p className="text-xs text-text-light mt-1 font-serif italic">Franchise Portal, CRM Segmenters, dynamic localizers, and CMS Campaign engines.</p>
        </div>

        {/* Dashboard Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {selectedCountry && setSelectedCountry && (
            <div className="flex items-center space-x-1.5 bg-white border border-premium-brown/15 p-1.5 rounded-none text-xs">
              <span className="font-bold text-premium-brown uppercase text-[9px] tracking-wider px-1">Region:</span>
              <select 
                value={selectedCountry.code} 
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="bg-cream border border-premium-brown/10 text-premium-brown font-bold py-0.5 px-1.5 cursor-pointer text-[10px] focus:outline-none rounded-none uppercase tracking-wider"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-white text-premium-brown">{c.flag} {c.currency}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-1.5 bg-white border border-premium-brown/15 p-1.5 rounded-none text-xs">
            <span className="font-bold text-premium-brown uppercase text-[9px] tracking-wider px-1">Lang:</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-cream border border-premium-brown/10 text-premium-brown font-bold py-0.5 px-1 focus:outline-none cursor-pointer text-[10px] rounded-none uppercase tracking-wider"
            >
              <option value="vi" className="bg-white text-premium-brown">🇻🇳 VI</option>
              <option value="en" className="bg-white text-premium-brown">🇺🇸 EN</option>
              <option value="ja" className="bg-white text-premium-brown">🇯🇵 JA</option>
              <option value="zh" className="bg-white text-premium-brown">🇨🇳 ZH</option>
              <option value="ko" className="bg-white text-premium-brown">🇰🇷 KO</option>
              <option value="th" className="bg-white text-premium-brown">🇹🇭 TH</option>
            </select>
          </div>

          <button 
            onClick={() => {
              // Generate CSV download representation
              const text = "Order ID,Customer,Total USD,Store,Country,Status\n" + 
                orders.map(o => `${o.id},${o.customerName},${o.totalUSD},"${o.storeName}",${o.country},${o.status}`).join("\n");
              const blob = new Blob([text], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Mellodi_Global_Report_${new Date().toISOString().substring(0, 10)}.csv`;
              a.click();
            }}
            className="bg-white hover:bg-gold-accent/5 text-premium-brown border border-premium-brown/15 py-2 px-3.5 rounded-none text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dashboard Top Menu Selector */}
      <div className="flex flex-wrap gap-1.5 mt-4 pb-4 border-b border-premium-brown/10 shrink-0">
        {[
          { id: "STATS", label: "Executive Analytics", icon: BarChart2 },
          { id: "CATALOG", label: "Products & Local Pricing", icon: DollarSign },
          { id: "STOCK", label: "Inventory & Alerts", icon: Package },
          { id: "CMS", label: "Campaign CMS Manager", icon: Edit },
          { id: "USERS", label: "Global Users & Roles", icon: Users },
          { id: "NOTIFS", label: "Audience Push Center", icon: BellRing }
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition flex items-center space-x-2 border ${
                activeTab === tab.id 
                  ? "bg-premium-brown text-cream border-premium-brown border-b-2 border-b-gold-accent shadow-sm" 
                  : "bg-white text-text-light border-premium-brown/10 hover:bg-gold-accent/5 hover:text-premium-brown"
              }`}
            >
              <IconComp className="w-4 h-4 text-gold-accent" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TABS */}
      <div className="flex-1 mt-5">
        <AnimatePresence mode="wait">
          
          {/* EXECUTIVE ANALYTICS STATS TAB */}
          {activeTab === "STATS" && (
            <motion.div 
              key="stats" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Bento grid aggregates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-none border border-premium-brown/10 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-text-light/80 uppercase tracking-widest">Consolidated Sales</span>
                    <DollarSign className="w-4 h-4 text-gold-accent" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-serif font-bold text-premium-brown tracking-tight">
                      ${totalRevenueUSD.toFixed(2)}
                    </h3>
                    <p className="text-[10px] text-text-light mt-1 flex items-center space-x-1 font-mono">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      <span className="text-emerald-700 font-bold">+18.4%</span>
                      <span>vs last week</span>
                    </p>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-5 rounded-none border border-premium-brown/10 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-text-light/80 uppercase tracking-widest">Total Registers</span>
                    <ShoppingCart className="w-4 h-4 text-gold-accent" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-serif font-bold text-premium-brown tracking-tight">
                      {totalOrders}
                    </h3>
                    <p className="text-[10px] text-text-light mt-1 font-serif italic">
                      <span>Live transactional tickets</span>
                    </p>
                  </div>
                </div>

                {/* Loyal Customers */}
                <div className="bg-white p-5 rounded-none border border-premium-brown/10 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-text-light/80 uppercase tracking-widest">Active Customers</span>
                    <Users className="w-4 h-4 text-gold-accent" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-serif font-bold text-premium-brown tracking-tight">
                      {uniqueCustomers}
                    </h3>
                    <p className="text-[10px] text-text-light mt-1 font-serif italic">
                      <span>Unique database IDs synced</span>
                    </p>
                  </div>
                </div>

                {/* Membership Loyalty Multiplier */}
                <div className="bg-white p-5 rounded-none border border-premium-brown/10 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-text-light/80 uppercase tracking-widest">Active Outlets</span>
                    <Globe className="w-4 h-4 text-gold-accent" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-serif font-bold text-premium-brown tracking-tight flex items-baseline">
                      {STORES.length} <span className="text-[9px] text-text-light font-bold uppercase tracking-wider ml-1.5">Stores</span>
                    </h3>
                    <p className="text-[10px] text-text-light mt-1 font-serif italic">
                      <span>5 Major Hub Cities</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Multi-country performance ledger */}
              <div className="bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Multi-country Sales Localizer Ledger</h3>
                  <p className="text-xs text-text-light mt-0.5 font-serif italic">Real-time exchange rate configurations and localized pricing projections.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-premium-brown/10">
                    <thead>
                      <tr className="text-text-light/80 uppercase font-bold tracking-widest text-[9px] bg-cream">
                        <th className="p-3">Country Code</th>
                        <th className="p-3">Currency</th>
                        <th className="p-3">Exchange rate (1 USD)</th>
                        <th className="p-3">Signature Tea Cost</th>
                        <th className="p-3">Regional Sales</th>
                        <th className="p-3 text-right">Operational Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-brown/5 text-rich-espresso font-medium">
                      {COUNTRIES.map(country => {
                        const localValue = formatPrice(4.95, country.code);
                        const countrySales = orders.filter(o => o.country === country.name).reduce((sum, o) => sum + o.totalUSD, 0);
                        return (
                          <tr key={country.code} className="hover:bg-gold-accent/5 transition">
                            <td className="p-3 font-bold text-premium-brown flex items-center space-x-1.5">
                              <span>{country.flag}</span>
                              <span className="font-serif">{country.name}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-text-light">{country.currency}</td>
                            <td className="p-3 font-mono text-text-light">{country.exchangeRate.toLocaleString()}</td>
                            <td className="p-3 font-serif font-bold text-premium-brown">{localValue}</td>
                            <td className="p-3 font-bold text-premium-brown font-mono">${countrySales.toFixed(2)} USD</td>
                            <td className="p-3 text-right">
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 py-0.5 px-2 rounded-none text-[8px] font-bold uppercase tracking-widest">
                                Live In-App
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historic Global Order Ledger */}
              <div className="bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Consolidated Transaction Ledger</h3>
                  <p className="text-xs text-text-light mt-0.5 font-serif italic">Raw transaction logs generated across POS cashiers, mobile app checkout gateways, and dine-in scanning.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-premium-brown/10">
                    <thead>
                      <tr className="text-text-light/80 uppercase font-bold tracking-widest text-[9px] bg-cream">
                        <th className="p-3">Order Code</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Total Cost</th>
                        <th className="p-3">Store Location</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-brown/5 text-rich-espresso font-medium">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gold-accent/5 transition">
                          <td className="p-3 font-mono font-bold text-premium-brown">{order.id}</td>
                          <td className="p-3">{order.customerName}</td>
                          <td className="p-3">
                            <span className="bg-cream border border-premium-brown/10 text-text-light py-0.5 px-2 rounded-none font-bold text-[8px] uppercase">
                              {order.type}
                            </span>
                          </td>
                          <td className="p-3 font-serif font-bold text-premium-brown">
                            {formatPrice(order.totalUSD, "US")}
                          </td>
                          <td className="p-3 text-text-light">{order.storeName}</td>
                          <td className="p-3 text-right">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider border ${
                              order.status === "COMPLETED" 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : order.status === "READY"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* PRODUCT & LOCAL PRICING TAB */}
          {activeTab === "CATALOG" && (
            <motion.div 
              key="catalog" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm"
            >
              <div>
                <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Enterprise Recipe Master Price Matrix</h3>
                <p className="text-xs text-text-light mt-0.5 font-serif italic">Configure base USD price anchors which will ripple and localize into all countries and currencies dynamically.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-premium-brown/10">
                  <thead>
                    <tr className="text-text-light/80 uppercase font-bold tracking-widest text-[9px] bg-cream">
                      <th className="p-3">Recipe Detail</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Allergens</th>
                      <th className="p-3">Base Price (USD)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-premium-brown/5 text-rich-espresso font-medium">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gold-accent/5 transition">
                        <td className="p-3 flex items-center space-x-3">
                          <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-none border border-premium-brown/10" />
                          <div>
                            <span className="font-serif font-semibold text-premium-brown block">{product.name}</span>
                            <span className="text-[10px] text-text-light/75 font-serif italic">{product.chineseName || "No translation"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="bg-cream border border-premium-brown/10 text-text-light py-0.5 px-2 rounded-none font-bold text-[8px] uppercase tracking-wide">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {product.allergens.map(a => (
                              <span key={a} className="bg-gold-accent/15 text-premium-brown border border-gold-accent/25 px-1.5 py-0.2 rounded-none text-[8px] font-bold uppercase tracking-wider">
                                {a}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-serif font-bold text-premium-brown text-xs">
                          {editingPriceId === product.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-16 bg-cream border border-premium-brown/15 rounded-none text-xs p-1 focus:outline-none"
                            />
                          ) : (
                            <span>${product.priceUSD.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {editingPriceId === product.id ? (
                            <button
                              onClick={() => handleUpdatePrice(product.id)}
                              className="bg-premium-brown text-cream hover:bg-rich-espresso px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider border border-gold-accent/25 transition inline-flex items-center space-x-1"
                            >
                              <Save className="w-3.5 h-3.5 text-gold-accent" />
                              <span>Save</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPriceId(product.id);
                                setTempPrice(product.priceUSD.toString());
                              }}
                              className="bg-cream hover:bg-gold-accent/15 text-premium-brown border border-premium-brown/10 px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider transition inline-flex items-center space-x-1"
                            >
                              <Edit className="w-3.5 h-3.5 text-gold-accent" />
                              <span>Adjust</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* CMS MANAGEMENT TAB */}
          {activeTab === "CMS" && (
            <motion.div 
              key="cms" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Promotional CMS Section */}
              <div className="bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Dynamic Banner CMS Manager</h3>
                  <p className="text-xs text-text-light mt-0.5 font-serif italic">Manage carousel campaigns displayed in client mobile application home pages globally.</p>
                </div>

                <div className="space-y-3">
                  {promoBanners.map(b => (
                    <div key={b.id} className="p-3 bg-cream rounded-none border border-premium-brown/10 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-premium-brown text-xs">{b.title}</h4>
                        <p className="text-[10px] text-text-light mt-0.5">{b.subtitle}</p>
                      </div>
                      <button 
                        onClick={() => {
                          const title = language === "vi" ? "Đồng bộ Chiến dịch CMS" : "Ecosystem CMS Sync";
                          const body = language === "vi"
                            ? `Chiến dịch "${b.title}" đã được gỡ bỏ bởi Admin. Banners tại các cổng Khách hàng đã cập nhật.`
                            : `Campaign "${b.title}" deleted by Admin. Updated all customer app banners.`;
                          addSystemNotification(title, body, "PROMO");
                          setPromoBanners(promoBanners.filter(x => x.id !== b.id));
                        }}
                        className="text-text-light hover:text-red-600 transition"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Create Banner Form */}
                <div className="pt-3 border-t border-premium-brown/10 space-y-2.5">
                  <h4 className="font-bold text-xs text-premium-brown uppercase tracking-wider">Launch New Live Banner</h4>
                  <input
                    type="text"
                    placeholder="Campaign Title (e.g. Cherry Autumn Brew)..."
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    className="w-full bg-cream border border-premium-brown/15 rounded-none py-1.5 px-3 text-xs placeholder-text-light/50 focus:outline-none focus:border-premium-brown focus:ring-1 focus:ring-premium-brown"
                  />
                  <input
                    type="text"
                    placeholder="Description / Subtitle..."
                    value={newBannerSubtitle}
                    onChange={(e) => setNewBannerSubtitle(e.target.value)}
                    className="w-full bg-cream border border-premium-brown/15 rounded-none py-1.5 px-3 text-xs placeholder-text-light/50 focus:outline-none focus:border-premium-brown focus:ring-1 focus:ring-premium-brown"
                  />
                  <button
                    onClick={handleCreateBanner}
                    className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-2 rounded-none text-xs font-bold uppercase tracking-wider transition border border-gold-accent/25 flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4 text-gold-accent" />
                    <span>Publish Banner</span>
                  </button>
                </div>
              </div>

              {/* Reward Store CMS Inventory */}
              <div className="bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Reward Catalog Inventory Matrix</h3>
                  <p className="text-xs text-text-light mt-0.5 font-serif italic">Configure gifts customers can redeem using earned LEN POINTs.</p>
                </div>

                <div className="space-y-3">
                  {REWARD_ITEMS.map(gift => (
                    <div key={gift.id} className="flex space-x-3 p-2 bg-cream rounded-none border border-premium-brown/10 items-center">
                      <img src={gift.image} alt="" className="w-10 h-10 object-cover rounded-none border border-premium-brown/10 shrink-0" />
                      <div className="flex-1 min-w-0 font-medium">
                        <span className="font-serif font-bold text-premium-brown text-xs block truncate">{gift.name}</span>
                        <span className="text-[10px] text-gold-accent font-bold uppercase tracking-wider">{gift.pointsCost} LEN PTS</span>
                      </div>
                      <span className="text-[10px] text-text-light font-mono pr-1 shrink-0">Qty: {gift.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS & ROLES TAB */}
          {activeTab === "USERS" && (
            <motion.div 
              key="users" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm"
            >
              <div>
                <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">CRM & Access Control Roles Registry</h3>
                <p className="text-xs text-text-light mt-0.5 font-serif italic">Simulated database of users, customers, and active branch baristas along with system scopes.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-premium-brown/10">
                  <thead>
                    <tr className="text-text-light/80 uppercase font-bold tracking-widest text-[9px] bg-cream">
                      <th className="p-3">User</th>
                      <th className="p-3">System Role</th>
                      <th className="p-3">Member Tier</th>
                      <th className="p-3">LEN POINT balance</th>
                      <th className="p-3 text-right">Franchise Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-premium-brown/5 text-rich-espresso font-medium">
                    {systemUsers.map(user => (
                      <tr key={user.email} className="hover:bg-gold-accent/5 transition">
                        <td className="p-3">
                          <span className="font-serif font-bold text-premium-brown block">{user.name}</span>
                          <span className="text-[10px] text-text-light/75 font-mono">{user.email}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none border ${
                            user.role === "SUPER_ADMIN" 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : user.role === "MANAGER"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : user.role === "STAFF"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-cream text-text-light border-premium-brown/10"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 font-bold uppercase tracking-wider text-[9px] text-text-light">
                          {user.tier.replace("_", " ")}
                        </td>
                        <td className="p-3 font-bold text-premium-brown font-mono text-xs">
                          {user.lenPoints.toLocaleString()} PTS
                        </td>
                        <td className="p-3 text-right font-mono text-[9px] text-text-light">
                          {user.role === "SUPER_ADMIN" ? "GLOBAL" : "OUTLET_05_HANOI"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* AUDIENCE PUSH CENTER TAB */}
          {activeTab === "NOTIFS" && (
            <motion.div 
              key="notifs" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-5"
            >
              {/* Send Push Notification Form */}
              <div className="md:col-span-5 bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm h-fit">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Push & In-App Segmenter</h3>
                  <p className="text-xs text-text-light mt-0.5 font-serif italic">Broadcast localized micro-notifications targeting dynamic groups.</p>
                </div>

                {sentAlert && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-none text-xs font-semibold uppercase tracking-wider">
                    {sentAlert}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-light uppercase tracking-wider block">Target Audience Segment</label>
                    <select
                      value={notifSegment}
                      onChange={(e) => setNotifSegment(e.target.value as any)}
                      className="w-full bg-cream border border-premium-brown/15 rounded-none py-1.5 px-3 text-xs text-premium-brown focus:outline-none"
                    >
                      <option value="ALL">All Mellodi App Installs (Global)</option>
                      <option value="VIP_BLACK">VIP Black Premium Members Only</option>
                      <option value="VIETNAM">All Users in Vietnam Outlet Area</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-light uppercase tracking-wider block">Alert Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Free Topping Weekend!"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-cream border border-premium-brown/15 rounded-none py-1.5 px-3 text-xs placeholder-text-light/40 focus:outline-none focus:border-premium-brown"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-text-light uppercase tracking-wider block">Body Message Copy</label>
                    <textarea
                      placeholder="e.g. Flash sale starts in Shibuya! Get 20% off all Camellia series tea."
                      rows={3}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full bg-cream border border-premium-brown/15 rounded-none py-1.5 px-3 text-xs placeholder-text-light/40 focus:outline-none resize-none focus:border-premium-brown"
                    />
                  </div>

                  <button
                    onClick={handleSendNotification}
                    className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-2.5 rounded-none text-xs font-bold uppercase tracking-[0.15em] transition border border-gold-accent/25 flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Send className="w-4 h-4 text-gold-accent" />
                    <span>Deliver Push Campaign</span>
                  </button>
                </div>
              </div>

              {/* History of broadcasts */}
              <div className="md:col-span-7 bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Broadcast Campaign History</h3>
                  <p className="text-xs text-text-light mt-0.5 font-serif italic">Historic audit log of push, SMS, and Firebase Cloud Messaging dispatches.</p>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3.5 bg-cream rounded-none border border-premium-brown/10 space-y-1 text-xs font-medium">
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-bold text-premium-brown">{n.title}</span>
                        <span className="text-[9px] text-text-light font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-text-light text-[11px] leading-relaxed font-serif italic">{n.body}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-text-light/50 font-serif italic text-center py-10">No broadcast history on record.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STOCK MONITORING & ALERTS TAB */}
          {activeTab === "STOCK" && (
            <motion.div
              key="stock-alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Executive Stock Health Banner & Sim Control */}
              <div className="bg-white rounded-none border border-premium-brown/10 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-premium-brown/10 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-5 h-5 text-gold-accent" />
                      <span>Enterprise Stock Control & Threshold Center</span>
                    </h3>
                    <p className="text-xs text-text-light mt-0.5 font-serif italic">
                      Configure custom low-stock alert thresholds for ingredients and menu products. Automated staff alerts activate instantly.
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        // Simulate Consumption: deduct random amounts
                        setInventory(prev => prev.map(item => {
                          const deduct = Math.floor(Math.random() * (item.minAlert / 2));
                          return { ...item, stockLevel: Math.max(0, item.stockLevel - deduct) };
                        }));
                        setProducts(prev => prev.map(item => {
                          if (item.stockLevel !== undefined) {
                            const deduct = Math.floor(Math.random() * ((item.minAlert || 10) / 2));
                            return { ...item, stockLevel: Math.max(0, item.stockLevel - deduct) };
                          }
                          return item;
                        }));
                        addSystemNotification(
                          "⚡ Stock Drain Simulated",
                          "Simulated daily operation consumption. Stock levels have been reduced.",
                          "ALERT"
                        );
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 px-3 rounded-none text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Simulate Operation Drain</span>
                    </button>
                    <button
                      onClick={() => {
                        // Restock all items
                        setInventory(prev => prev.map(item => ({
                          ...item,
                          stockLevel: item.minAlert * 3
                        })));
                        setProducts(prev => prev.map(item => {
                          if (item.stockLevel !== undefined) {
                            return {
                              ...item,
                              stockLevel: (item.minAlert || 10) * 3
                            };
                          }
                          return item;
                        }));
                        addSystemNotification(
                          "✅ Full Stock Restored",
                          "All ingredients and products replenished to maximum safe capacity.",
                          "ALERT"
                        );
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-1.5 px-3 rounded-none text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Replenish All to Safe Level</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-cream p-3 border border-premium-brown/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-light uppercase tracking-wider">Low Stock Alarm Count</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-red-600">
                        {inventory.filter(i => i.stockLevel <= i.minAlert).length + products.filter(p => p.stockLevel !== undefined && p.minAlert !== undefined && p.stockLevel <= p.minAlert).length}
                      </span>
                      <span className="text-[9px] text-text-light/80 font-medium">Active alerts requiring attention</span>
                    </div>
                  </div>

                  <div className="bg-cream p-3 border border-premium-brown/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-light uppercase tracking-wider">Monitored Items</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-premium-brown">
                        {inventory.length + products.filter(p => p.stockLevel !== undefined).length} Items
                      </span>
                      <span className="text-[9px] text-text-light/80 font-medium font-serif italic">Active in global registry</span>
                    </div>
                  </div>

                  <div className="bg-cream p-3 border border-premium-brown/5 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-text-light uppercase tracking-wider">System Integration Status</span>
                    <div className="flex items-center gap-1.5 mt-1 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Staff Portal Sync Armed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients & Products Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* INGREDIENTS MONITOR */}
                <div className="bg-white border border-premium-brown/10 p-4 rounded-none shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-premium-brown/10 pb-2">
                    <h4 className="font-serif font-bold text-premium-brown text-xs uppercase tracking-wide">
                      Raw Ingredients & Consumables
                    </h4>
                    <span className="text-[9px] text-text-light italic font-serif">Deducts automatically on checkout</span>
                  </div>

                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {inventory.map(item => {
                      const isLow = item.stockLevel <= item.minAlert;
                      return (
                        <div key={item.id} className="p-3 bg-cream border border-premium-brown/5 flex flex-col justify-between gap-2 text-xs font-medium">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-serif font-bold text-premium-brown block leading-tight">{item.name}</span>
                              <span className="text-[8px] uppercase font-bold tracking-wider text-text-light/60">{item.category}</span>
                            </div>
                            <span className={`px-2 py-0.5 font-bold uppercase text-[8px] border ${
                              isLow 
                                ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {isLow ? "Low Stock" : "Safe"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-1">
                            {/* Current Stock Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-text-light tracking-wider block">Current Stock ({item.unit})</label>
                              <div className="flex items-center">
                                <button
                                  onClick={() => {
                                    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, stockLevel: Math.max(0, inv.stockLevel - 10) } : inv));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-l border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={item.stockLevel}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, stockLevel: val } : inv));
                                  }}
                                  className="bg-white text-center text-xs font-mono font-bold text-premium-brown border border-premium-brown/15 py-1 px-1.5 w-16 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, stockLevel: inv.stockLevel + 10 } : inv));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-r border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Threshold Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-text-light tracking-wider block">Alert Threshold ({item.unit})</label>
                              <div className="flex items-center">
                                <button
                                  onClick={() => {
                                    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, minAlert: Math.max(0, inv.minAlert - 10) } : inv));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-l border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={item.minAlert}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, minAlert: val } : inv));
                                  }}
                                  className="bg-white text-center text-xs font-mono font-bold text-gold-accent border border-premium-brown/15 py-1 px-1.5 w-16 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, minAlert: inv.minAlert + 10 } : inv));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-r border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MENU PRODUCTS MONITOR */}
                <div className="bg-white border border-premium-brown/10 p-4 rounded-none shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-premium-brown/10 pb-2">
                    <h4 className="font-serif font-bold text-premium-brown text-xs uppercase tracking-wide">
                      Menu Products & Merchandise
                    </h4>
                    <span className="text-[9px] text-text-light italic font-serif">Storefront Retail Stock</span>
                  </div>

                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {products.map(item => {
                      if (item.stockLevel === undefined || item.minAlert === undefined) return null;
                      const isLow = item.stockLevel <= item.minAlert;
                      return (
                        <div key={item.id} className="p-3 bg-cream border border-premium-brown/5 flex flex-col justify-between gap-2 text-xs font-medium">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <img src={item.image} alt="" className="w-8 h-8 object-cover border border-premium-brown/10" />
                              <div>
                                <span className="font-serif font-bold text-premium-brown block leading-tight">{item.name}</span>
                                <span className="text-[8px] uppercase font-bold tracking-wider text-text-light/60">{item.category}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 font-bold uppercase text-[8px] border ${
                              isLow 
                                ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {isLow ? "Low Stock" : "Safe"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-1">
                            {/* Current Stock Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-text-light tracking-wider block">Current Stock ({item.unit || "pcs"})</label>
                              <div className="flex items-center">
                                <button
                                  onClick={() => {
                                    setProducts(prev => prev.map(prod => prod.id === item.id ? { ...prod, stockLevel: Math.max(0, (prod.stockLevel || 0) - 5) } : prod));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-l border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={item.stockLevel}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    setProducts(prev => prev.map(prod => prod.id === item.id ? { ...prod, stockLevel: val } : prod));
                                  }}
                                  className="bg-white text-center text-xs font-mono font-bold text-premium-brown border border-premium-brown/15 py-1 px-1.5 w-16 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    setProducts(prev => prev.map(prod => prod.id === item.id ? { ...prod, stockLevel: (prod.stockLevel || 0) + 5 } : prod));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-r border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Threshold Input */}
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-text-light tracking-wider block">Alert Threshold ({item.unit || "pcs"})</label>
                              <div className="flex items-center">
                                <button
                                  onClick={() => {
                                    setProducts(prev => prev.map(prod => prod.id === item.id ? { ...prod, minAlert: Math.max(0, (prod.minAlert || 0) - 5) } : prod));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-l border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={item.minAlert}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    setProducts(prev => prev.map(prod => prod.id === item.id ? { ...prod, minAlert: val } : prod));
                                  }}
                                  className="bg-white text-center text-xs font-mono font-bold text-gold-accent border border-premium-brown/15 py-1 px-1.5 w-16 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    setProducts(prev => prev.map(prod => prod.id === item.id ? { ...prod, minAlert: (prod.minAlert || 0) + 5 } : prod));
                                  }}
                                  className="bg-white hover:bg-stone-100 text-premium-brown border-y border-r border-premium-brown/15 p-1 text-[9px] font-bold w-6 text-center cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
