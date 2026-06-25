import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, Monitor, ClipboardCheck, LayoutDashboard, Database, 
  Sparkles, Coffee, ArrowUpRight, Bell, Zap
} from "lucide-react";
import { Order, Product, Country, OrderStatus, MembershipTier, InventoryItem, Notification, SystemUser } from "./types";
import { PRODUCTS, COUNTRIES, INVENTORY, INITIAL_ORDERS, LANGUAGES } from "./data";
import { COUNTRY_TO_LANG, translate } from "./locales";

// Subcomponents
import CustomerApp from "./components/CustomerApp";
import POSTerminal from "./components/POSTerminal";
import StaffPortal from "./components/StaffPortal";
import AdminDashboard from "./components/AdminDashboard";
import ArchitectureDocs from "./components/ArchitectureDocs";

export default function App() {
  const [activePortal, setActivePortal] = useState<"CUSTOMER" | "POS" | "STAFF" | "ADMIN" | "TECH">("CUSTOMER");
  
  // SHARED REACTIVE STATES
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // VN by default
  const [language, setLanguage] = useState<string>("vi");
  const [inventory, setInventory] = useState<InventoryItem[]>(INVENTORY);
  const [lenPoints, setLenPoints] = useState<number>(385); // Initial loyalty points
  const [userTier, setUserTier] = useState<MembershipTier>(MembershipTier.DIAMOND);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Automated Low Stock Alerts Checking Hook
  const [notifiedLowStock, setNotifiedLowStock] = useState<string[]>([]);

  useEffect(() => {
    const newlyNotified: string[] = [...notifiedLowStock];
    let changed = false;

    // Check raw ingredients (inventory)
    inventory.forEach(item => {
      const key = `inv-${item.id}`;
      const isLow = item.stockLevel <= item.minAlert;
      const isAlreadyNotified = notifiedLowStock.includes(key);

      if (isLow && !isAlreadyNotified) {
        newlyNotified.push(key);
        changed = true;
        addSystemNotification(
          `⚠️ LOW STOCK: ${item.name}`,
          `Ingredient stock is currently ${item.stockLevel} ${item.unit} (Threshold: ${item.minAlert} ${item.unit}). Please order replenishment soon.`,
          "ALERT"
        );
      } else if (!isLow && isAlreadyNotified) {
        const idx = newlyNotified.indexOf(key);
        if (idx > -1) {
          newlyNotified.splice(idx, 1);
          changed = true;
        }
      }
    });

    // Check menu products
    products.forEach(item => {
      if (item.stockLevel !== undefined && item.minAlert !== undefined) {
        const key = `prod-${item.id}`;
        const isLow = item.stockLevel <= item.minAlert;
        const isAlreadyNotified = notifiedLowStock.includes(key);

        if (isLow && !isAlreadyNotified) {
          newlyNotified.push(key);
          changed = true;
          addSystemNotification(
            `⚠️ LOW STOCK: ${item.name}`,
            `Menu product stock is currently ${item.stockLevel} ${item.unit || "pcs"} (Threshold: ${item.minAlert} ${item.unit || "pcs"}). Please prepare more units soon.`,
            "ALERT"
          );
        } else if (!isLow && isAlreadyNotified) {
          const idx = newlyNotified.indexOf(key);
          if (idx > -1) {
            newlyNotified.splice(idx, 1);
            changed = true;
          }
        }
      }
    });

    if (changed) {
      setNotifiedLowStock(newlyNotified);
    }
  }, [inventory, products, notifiedLowStock]);
  
  // SHARED MARKETING CAMPAIGNS
  const [promoBanners, setPromoBanners] = useState([
    { id: "b1", title: "Camellia Blossom Series", subtitle: "Double Points on White Tea collections", active: true },
    { id: "b2", title: "Referral Campaign", subtitle: "Invite a tea enthusiast and earn 150 points", active: true }
  ]);

  // Unified Synchronization Notification Function
  const addSystemNotification = (title: string, body: string, type: "ORDER" | "PROMO" | "ALERT" = "ALERT") => {
    const newNotif: Notification = {
      id: `NTF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title,
      body,
      timestamp: new Date().toISOString(),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    addSimLog(`[Ecosystem Sync] ${title}: ${body}`);
  };

  // Globally Managed Authentication Sessions
  const [currentCustomer, setCurrentCustomer] = useState<SystemUser | null>(null);
  const [currentStaff, setCurrentStaff] = useState<SystemUser | null>(null);

  // Load initial sessions from localStorage
  useEffect(() => {
    const cust = localStorage.getItem("current_customer");
    if (cust) {
      setCurrentCustomer(JSON.parse(cust));
    } else {
      const seedCustomer: SystemUser = {
        email: "vincent@mellodi.com",
        name: "Vincent Vuong",
        role: "CUSTOMER",
        lenPoints: 385,
        tier: MembershipTier.DIAMOND,
        referralCode: "MELLODI-847291"
      };
      setCurrentCustomer(seedCustomer);
      localStorage.setItem("current_customer", JSON.stringify(seedCustomer));
    }

    const staff = localStorage.getItem("current_staff");
    if (staff) {
      setCurrentStaff(JSON.parse(staff));
    }
  }, []);

  // Keep state sync'd when customer updates or switches
  useEffect(() => {
    if (currentCustomer) {
      setLenPoints(currentCustomer.lenPoints);
      setUserTier(currentCustomer.tier);
    }
  }, [currentCustomer]);

  // Staff / Admin Login States & Logic
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffError, setStaffError] = useState("");

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    
    const accounts = [
      { email: "admin@mellodi.com", password: "admin", name: "Vincent Vuong", role: "SUPER_ADMIN" },
      { email: "barista@mellodi.com", password: "staff", name: "Minh Thu", role: "STAFF" }
    ];

    const match = accounts.find(a => a.email.toLowerCase() === staffEmail.toLowerCase());
    if (!match || match.password !== staffPassword) {
      setStaffError(language === "vi" ? "Thông tin đăng nhập của nhân viên không hợp lệ" : "Invalid corporate credentials");
      return;
    }

    const systemUser: SystemUser = {
      email: match.email,
      name: match.name,
      role: match.role as any,
      lenPoints: 0,
      tier: MembershipTier.BRONZE,
      referralCode: ""
    };

    setCurrentStaff(systemUser);
    localStorage.setItem("current_staff", JSON.stringify(systemUser));
    addSimLog(`[Auth System] User ${match.name} authenticated successfully as ${match.role}.`);
    setStaffEmail("");
    setStaffPassword("");
  };

  const renderStaffLoginGate = () => {
    return (
      <motion.div
        key="staff-login-gate"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="w-full flex items-center justify-center py-12 px-4 bg-cream/10 min-h-[500px]"
      >
        <div className="w-full max-w-md bg-white border border-premium-brown/15 p-8 text-rich-espresso shadow-xl relative rounded-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-accent via-premium-brown to-gold-accent"></div>
          
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-full border border-gold-accent/30 bg-premium-brown flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-gold-accent animate-none" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black tracking-widest text-premium-brown">MELLODI HQ</h2>
              <p className="text-[10px] text-text-light uppercase tracking-[0.25em] font-bold mt-0.5">Secure Staff Terminal</p>
            </div>
            <p className="text-xs text-text-light max-w-xs leading-relaxed">
              Authorized personnel only. Please verify your corporate security credentials to access administrative, cashier, or kitchen features.
            </p>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-light uppercase tracking-wider block">Corporate Email</label>
              <input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="barista@mellodi.com or admin@mellodi.com"
                className="w-full bg-cream/30 border border-premium-brown/15 p-3 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-light uppercase tracking-wider block">Security Password</label>
              <input
                type="password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream/30 border border-premium-brown/15 p-3 text-xs text-rich-espresso focus:outline-none focus:border-gold-accent/60 bg-white"
                required
              />
            </div>

            {staffError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-[11px] p-3 rounded-none font-medium">
                {staffError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-3.5 font-bold uppercase tracking-[0.15em] text-xs transition border border-gold-accent/20 shadow-md"
            >
              Verify Identity & Access
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-premium-brown/10">
            <p className="text-[10px] text-center uppercase font-bold text-text-light/80 tracking-wider mb-2">
              Quick Demo Portal Entries
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setStaffEmail("admin@mellodi.com");
                  setStaffPassword("admin");
                }}
                className="bg-gold-accent/10 border border-gold-accent/25 hover:bg-gold-accent/20 text-gold-accent py-2 text-[10px] font-bold uppercase tracking-wider transition"
              >
                HQ Admin (Vincent)
              </button>
              <button
                onClick={() => {
                  setStaffEmail("barista@mellodi.com");
                  setStaffPassword("staff");
                }}
                className="bg-gold-accent/10 border border-gold-accent/25 hover:bg-gold-accent/20 text-gold-accent py-2 text-[10px] font-bold uppercase tracking-wider transition"
              >
                Mellodi Barista
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Automatically sync language with country selection
  useEffect(() => {
    const defaultLang = COUNTRY_TO_LANG[selectedCountry.code];
    if (defaultLang) {
      setLanguage(defaultLang);
    }
  }, [selectedCountry]);

  // Synchronize country and currency changes globally
  const isFirstCountryMount = useRef(true);
  useEffect(() => {
    if (isFirstCountryMount.current) {
      isFirstCountryMount.current = false;
      return;
    }
    const title = language === "vi" ? "Đồng bộ Vùng miền & Tiền tệ" : "Regional & Currency Sync";
    const body = language === "vi"
      ? `Toàn hệ thống Mellodi đã chuyển vùng sang ${selectedCountry.name} (${selectedCountry.flag}). Hiển thị tiền tệ đồng bộ sang ${selectedCountry.currency} (${selectedCountry.symbol}) với tỷ giá x${selectedCountry.exchangeRate}.`
      : `Ecosystem synchronized to ${selectedCountry.name} (${selectedCountry.flag}). Base currencies localized to ${selectedCountry.currency} (${selectedCountry.symbol}) at rate x${selectedCountry.exchangeRate}.`;
    
    addSystemNotification(title, body, "ALERT");
  }, [selectedCountry]);

  // Synchronize language changes globally
  const isFirstLangMount = useRef(true);
  useEffect(() => {
    if (isFirstLangMount.current) {
      isFirstLangMount.current = false;
      return;
    }
    const title = language === "vi" ? "Đồng bộ Ngôn ngữ" : "Language Translation Sync";
    const body = language === "vi"
      ? `Ngôn ngữ hiển thị trên toàn bộ các cổng hệ thống đã chuyển đổi đồng loạt sang Tiếng Việt.`
      : `All active portal interfaces synchronized and updated to ${language.toUpperCase()} translation.`;
    
    addSystemNotification(title, body, "ALERT");
  }, [language]);
  
  // Simulation log events list
  const [simLogs, setSimLogs] = useState<Array<{ id: string, msg: string, time: string }>>([
    { id: "1", msg: "MELLODI database successfully initialized on Cloud PostgreSQL cluster.", time: "11:07:34" },
    { id: "2", msg: "Redis active-session caches linked for rapid loyalty QR scan verification.", time: "11:07:35" }
  ]);

  const addSimLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSimLogs(prev => [{ id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, msg, time }, ...prev].slice(0, 5));
  };

  // Add order callback
  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    
    const title = language === "vi" ? "Đồng bộ Đơn hàng" : "Ecosystem Order Sync";
    const body = language === "vi"
      ? `Đơn hàng mới ${newOrder.id} ($${newOrder.totalUSD.toFixed(2)}) đã được đặt và đồng bộ tức thì trên toàn hệ thống (POS, Bếp Staff, và Quản Trị Admin).`
      : `New order ${newOrder.id} ($${newOrder.totalUSD.toFixed(2)}) has been synchronized across POS, Kitchen Staff, and HQ Admin.`;
    
    addSystemNotification(title, body, "ORDER");
  };

  // Update order status callback
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const isCompleted = status === OrderStatus.COMPLETED;
    const isReady = status === OrderStatus.READY;
    const statusMsg = isCompleted 
      ? (language === "vi" ? "Đơn hàng đã được giao tận tay! Chúc quý khách ngon miệng!" : "Delivered & Handed Over. Enjoy your premium Mellodi tea!")
      : isReady 
        ? (language === "vi" ? "Trà sữa đã pha xong! Quét mã QR tại quầy để nhận món." : "Your tea is ready for pickup! Show QR ticket to barista.") 
        : (language === "vi" ? "Barista đang tiến hành pha chế công thức của bạn." : "Our baristas are crafting your recipe now.");

    const title = language === "vi" ? `Cập nhật Trạng thái đơn: ${status}` : `Order Sync: ${status}`;
    const body = language === "vi"
      ? `Đơn hàng ${orderId} chuyển sang trạng thái [${status}]. ${statusMsg}`
      : `Order ${orderId} is now ${status}. ${statusMsg}`;

    addSystemNotification(title, body, "ORDER");

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    }));
  };

  return (
    <div className="min-h-screen bg-cream text-rich-espresso flex flex-col antialiased selection:bg-gold-accent/20 font-sans">
      
      {/* Dynamic Global Top Header */}
      <header className="bg-white border-b border-premium-brown/10 py-3.5 px-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border border-gold-accent/30 bg-premium-brown flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5 text-gold-accent" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-black tracking-[0.15em] text-premium-brown">MELLODI</h1>
            <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-text-light mt-0.5">Global Ecosystem</p>
          </div>
        </div>

        {/* Executive Quick portal hubs selector and staff indicator */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {currentStaff && (
            <div className="flex items-center bg-premium-brown/5 border border-premium-brown/10 px-2.5 py-1.5 space-x-2.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-mono text-[10px] text-text-light font-bold uppercase tracking-wider">
                {currentStaff.role === "SUPER_ADMIN" ? "ADMIN" : "STAFF"}: {currentStaff.name}
              </span>
              <button
                onClick={() => {
                  setCurrentStaff(null);
                  localStorage.removeItem("current_staff");
                  addSimLog("[Auth System] Staff member signed out.");
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-red-200 transition"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1 bg-cream/70 p-1 border border-premium-brown/10">
          {[
            { id: "CUSTOMER", label: "mellodi", sub: "mobile", icon: Smartphone },
            { id: "POS", label: "mellodi", sub: "pos", icon: Monitor },
            { id: "STAFF", label: "mellodi", sub: "kitchen", icon: ClipboardCheck },
            { id: "ADMIN", label: "mellodi", sub: "analytics", icon: LayoutDashboard },
            { id: "TECH", label: "mellodi", sub: "tech", icon: Database }
          ].map(portal => {
            const Icon = portal.icon;
            const isSelected = activePortal === portal.id;
            return (
              <button
                key={portal.id}
                onClick={() => setActivePortal(portal.id as any)}
                className={`py-1.5 px-3 sm:px-4 text-[10px] font-bold transition flex items-center space-x-2 border-b-2 ${
                  isSelected 
                    ? "bg-premium-brown text-cream border-gold-accent" 
                    : "text-text-light hover:text-premium-brown hover:bg-gold-accent/10 border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-serif font-black tracking-widest uppercase">{portal.label}</span>
                  <span className="text-[8px] tracking-wider text-gold-accent font-bold uppercase">{portal.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
        </div>
      </header>

      {/* Main Content Workspace Splitter */}
      <main className="flex-1 flex flex-col xl:flex-row overflow-hidden relative">
        
        {/* Core Screen Space */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-cream/30">
          
          {/* Notification Toast Stream Alert ticker */}
          {notifications.length > 0 && !notifications[0].read && (
            <motion.div 
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-premium-brown text-cream py-2.5 px-4 text-xs font-medium border-b border-gold-accent/20 flex justify-between items-center z-10 shrink-0"
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gold-accent animate-bounce" />
                <span className="tracking-wide"><strong>{notifications[0].title}:</strong> {notifications[0].body}</span>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.map((n, i) => i === 0 ? { ...n, read: true } : n))}
                className="bg-cream/15 hover:bg-cream/25 text-gold-accent text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest transition"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Active view renderer */}
          <div className="flex-1 overflow-hidden h-full">
            <AnimatePresence mode="wait">
              {activePortal === "CUSTOMER" && (
                <motion.div 
                  key="customer-portal" 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full overflow-y-auto"
                >
                  <CustomerApp 
                    onAddOrder={handleAddOrder}
                    countries={countries}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    language={language}
                    setLanguage={setLanguage}
                    lenPoints={lenPoints}
                    setLenPoints={setLenPoints}
                    userTier={userTier}
                    setUserTier={setUserTier}
                    currentCustomer={currentCustomer}
                    setCurrentCustomer={setCurrentCustomer}
                    promoBanners={promoBanners}
                    addSystemNotification={addSystemNotification}
                  />
                </motion.div>
              )}

              {activePortal === "POS" && (
                !currentStaff ? renderStaffLoginGate() : (
                  <motion.div 
                    key="pos-portal" 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full overflow-y-auto"
                  >
                    <POSTerminal 
                      orders={orders}
                      onAddOrder={handleAddOrder}
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      language={language}
                      setLanguage={setLanguage}
                      lenPoints={lenPoints}
                      setLenPoints={setLenPoints}
                      userTier={userTier}
                      inventory={inventory}
                      setInventory={setInventory}
                    />
                  </motion.div>
                )
              )}

              {activePortal === "STAFF" && (
                !currentStaff ? renderStaffLoginGate() : (
                  <motion.div 
                    key="staff-portal" 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full overflow-y-auto"
                  >
                    <StaffPortal 
                      orders={orders}
                      onUpdateOrderStatus={handleUpdateOrderStatus}
                      inventory={inventory}
                      setInventory={setInventory}
                      selectedCountry={selectedCountry}
                      language={language}
                      products={products}
                      notifications={notifications}
                    />
                  </motion.div>
                )
              )}

              {activePortal === "ADMIN" && (
                !currentStaff ? renderStaffLoginGate() : (
                  <motion.div 
                    key="admin-portal" 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full overflow-y-auto"
                  >
                    <AdminDashboard 
                      orders={orders}
                      products={products}
                      setProducts={setProducts}
                      countries={countries}
                      setCountries={setCountries}
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      language={language}
                      setLanguage={setLanguage}
                      lenPoints={lenPoints}
                      userTier={userTier}
                      notifications={notifications}
                      setNotifications={setNotifications}
                      promoBanners={promoBanners}
                      setPromoBanners={setPromoBanners}
                      addSystemNotification={addSystemNotification}
                      inventory={inventory}
                      setInventory={setInventory}
                    />
                  </motion.div>
                )
              )}

              {activePortal === "TECH" && (
                <motion.div 
                  key="tech-portal" 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full overflow-y-auto"
                >
                  <ArchitectureDocs />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right-Sidebar: Reactive System Logs Simulator */}
        <aside className="w-full xl:w-[320px] bg-rich-espresso border-t xl:border-t-0 xl:border-l border-premium-brown/20 p-5 shrink-0 flex flex-col justify-between text-text-light font-mono text-xs h-[200px] xl:h-auto overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-premium-brown/20">
              <span className="text-cream text-[10px] font-bold tracking-[0.15em] uppercase flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-gold-accent animate-pulse" />
                <span className="font-serif italic font-normal text-[11px] text-gold-accent tracking-normal">Telemetry Feed</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent animate-ping"></span>
            </div>
            
            <div className="space-y-2.5 overflow-y-auto max-h-[120px] xl:max-h-[500px]">
              {simLogs.map(log => (
                <div key={log.id} className="text-[10px] leading-relaxed border-l border-gold-accent/40 pl-2 text-stone-300">
                  <span className="text-gold-accent font-semibold">[{log.time}]</span> {log.msg}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-premium-brown/20 text-[9px] text-text-light/80 text-center leading-normal">
            <p className="font-serif tracking-wider text-cream">MELLODI GLOBAL HUB • PORT 3000</p>
            <p className="mt-1 opacity-70">Active PostgreSQL, Redis, Stripe, Firebase</p>
          </div>
        </aside>

      </main>

    </div>
  );
}
