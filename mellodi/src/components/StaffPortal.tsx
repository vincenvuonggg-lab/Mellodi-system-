import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardList, Check, RotateCcw, AlertTriangle, ArrowRight, ScanLine, 
  Layers, Package, ChevronRight, UserCheck, BellRing, PlusCircle
} from "lucide-react";
import { Order, OrderStatus, InventoryItem, Country, Product, Notification } from "../types";

interface StaffPortalProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  selectedCountry: Country;
  language: string;
  notifications?: Notification[];
  products?: Product[];
}

export default function StaffPortal({
  orders,
  onUpdateOrderStatus,
  inventory,
  setInventory,
  selectedCountry,
  language,
  notifications = [],
  products = []
}: StaffPortalProps) {
  const [viewTab, setViewTab] = useState<"KITCHEN_QUEUE" | "INVENTORY_STORES" | "QR_VERIFY">("KITCHEN_QUEUE");
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState<string | null>(null);

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

  const handleRestock = (itemId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const restockQty = item.category === "Ingredients" ? 100 : 1000;
        return { ...item, stockLevel: item.stockLevel + restockQty };
      }
      return item;
    }));
  };

  const handleScanVerify = () => {
    const cleanId = scanInput.trim().toUpperCase();
    const foundOrder = orders.find(o => o.id === cleanId || o.id.endsWith(cleanId));
    if (foundOrder) {
      if (foundOrder.status === OrderStatus.READY) {
        onUpdateOrderStatus(foundOrder.id, OrderStatus.COMPLETED);
        setScanMessage(`Success: Order ${foundOrder.id} verified and hand-delivered!`);
      } else {
        setScanMessage(`Warning: Order ${foundOrder.id} is currently in status [${foundOrder.status}]. Must be READY to hand over.`);
      }
    } else {
      setScanMessage("Error: Ticket ID not found in global register database.");
    }
    setScanInput("");
    setTimeout(() => setScanMessage(null), 6000);
  };

  const activeOrdersCount = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length;

  return (
    <div id="staff-portal-root" className="w-full h-full bg-cream text-rich-espresso flex flex-col font-sans text-sm p-4 select-none">
      
      {/* Staff Application Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-premium-brown/10">
        <div className="flex items-center space-x-3">
          <div className="bg-premium-brown border border-gold-accent/30 text-gold-accent p-2 rounded-none flex items-center justify-center font-bold">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-serif font-black tracking-[0.12em] text-premium-brown uppercase">Mellodi Staff Outlet</h2>
            <p className="text-xs text-text-light mt-0.5">
              Role: <strong>Kitchen Supervisor</strong> | Station: <strong>Hot & Cold Drinks Bar</strong>
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-premium-brown text-cream border border-gold-accent/20 px-3 py-1.5 rounded-none font-bold uppercase tracking-wider">
            🔥 {activeOrdersCount} Active Order Tickets
          </span>
        </div>
      </div>

      {/* REAL-TIME LOW-STOCK TELEMETRY TICKER */}
      {(() => {
        const lowIngredients = inventory.filter(i => i.stockLevel <= i.minAlert);
        const lowProducts = products.filter(p => p.stockLevel !== undefined && p.minAlert !== undefined && p.stockLevel <= p.minAlert);
        const totalLowCount = lowIngredients.length + lowProducts.length;

        if (totalLowCount === 0) return null;

        return (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-red-50 border border-red-200 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-red-800 font-sans shadow-sm"
          >
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 text-red-900">
                  <span>CRITICAL KITCHEN ALARM: {totalLowCount} Items Under Threshold</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </h4>
                <p className="text-xs text-red-700/90 mt-0.5 font-medium leading-relaxed">
                  {lowIngredients.length > 0 && (
                    <span>Ingredients: <strong className="font-bold font-mono">{lowIngredients.map(i => `${i.name} (${i.stockLevel} ${i.unit})`).join(", ")}</strong>. </span>
                  )}
                  {lowProducts.length > 0 && (
                    <span>Products: <strong className="font-bold font-mono">{lowProducts.map(p => `${p.name} (${p.stockLevel} ${p.unit || "pcs"})`).join(", ")}</strong>. </span>
                  )}
                </p>
                <p className="text-[10px] text-red-600 font-serif italic mt-1">
                  Automated alert logged in the Admin push notifications database. Baristas: Adjust menu availability accordingly.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setInventory(prev => prev.map(item => {
                  if (item.stockLevel <= item.minAlert) {
                    return { ...item, stockLevel: item.minAlert * 2 + 50 };
                  }
                  return item;
                }));
                alert("Restocked low ingredients to safe operational level! Threshold notification cleared.");
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-none transition border border-red-800 shrink-0 cursor-pointer text-center"
            >
              Express Barista Replenish
            </button>
          </motion.div>
        );
      })()}

      {/* Mode Select Tabs */}
      <div className="flex space-x-1.5 mt-4 pb-3 border-b border-premium-brown/10 shrink-0">
        <button
          onClick={() => setViewTab("KITCHEN_QUEUE")}
          className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider border transition flex items-center space-x-2 ${
            viewTab === "KITCHEN_QUEUE" 
              ? "bg-premium-brown text-cream border-premium-brown border-b-2 border-b-gold-accent shadow-sm" 
              : "bg-white text-text-light border-premium-brown/10 hover:bg-gold-accent/5 hover:text-premium-brown"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kitchen Ticket Queue</span>
        </button>
        <button
          onClick={() => setViewTab("INVENTORY_STORES")}
          className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider border transition flex items-center space-x-2 ${
            viewTab === "INVENTORY_STORES" 
              ? "bg-premium-brown text-cream border-premium-brown border-b-2 border-b-gold-accent shadow-sm" 
              : "bg-white text-text-light border-premium-brown/10 hover:bg-gold-accent/5 hover:text-premium-brown"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Real-time Ingredients</span>
        </button>
        <button
          onClick={() => setViewTab("QR_VERIFY")}
          className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider border transition flex items-center space-x-2 ${
            viewTab === "QR_VERIFY" 
              ? "bg-premium-brown text-cream border-premium-brown border-b-2 border-b-gold-accent shadow-sm" 
              : "bg-white text-text-light border-premium-brown/10 hover:bg-gold-accent/5 hover:text-premium-brown"
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>Barista Scan & Handover</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden mt-4">
        
        {/* KITCHEN TICKET QUEUE PANEL */}
        {viewTab === "KITCHEN_QUEUE" && (
          <div className="h-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-1.5 pb-4">
            {orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED).length === 0 ? (
              <div className="col-span-full h-full flex flex-col justify-center items-center text-text-light/60 space-y-2 py-20">
                <ClipboardList className="w-16 h-16 stroke-1 text-premium-brown/20 animate-pulse" />
                <p className="font-serif italic text-sm">Clean Desk Protocol. No active tickets in prep.</p>
                <p className="text-xs text-text-light">Simulate placing an order in the Customer App or POS System above.</p>
              </div>
            ) : (
              orders
                .filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED)
                .map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-none border bg-white p-4 flex flex-col justify-between space-y-3 shadow-sm ${
                      order.status === OrderStatus.PENDING 
                        ? "border-premium-brown/20" 
                        : order.status === OrderStatus.PREPARING 
                          ? "border-blue-200" 
                          : "border-emerald-200"
                    }`}
                  >
                    {/* Ticket Header metadata */}
                    <div className="flex justify-between items-start pb-2.5 border-b border-premium-brown/10">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-premium-brown text-xs">{order.id}</span>
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-none ${
                            order.type === "PICKUP" 
                              ? "bg-premium-brown text-cream border border-gold-accent/20" 
                              : order.type === "DELIVERY"
                                ? "bg-purple-900/10 text-purple-700 border border-purple-200"
                                : "bg-blue-900/10 text-blue-700 border border-blue-200"
                          }`}>
                            {order.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-light mt-1">
                          🕒 {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      {/* Ticket Status Label */}
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-none uppercase ${
                        order.status === OrderStatus.PENDING 
                          ? "bg-gold-accent/15 text-premium-brown border border-gold-accent/20" 
                          : order.status === OrderStatus.PREPARING
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Drink & Dessert items inside ticket */}
                    <div className="flex-1 space-y-2.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between text-premium-brown font-semibold leading-none">
                            <span>{item.quantity}x {item.productName}</span>
                          </div>
                          {item.variants.length > 0 && (
                            <p className="text-[10px] text-text-light mt-0.5">
                              ↳ {item.variants.join(", ")}
                            </p>
                          )}
                          {item.toppings.length > 0 && (
                            <p className="text-[10px] text-gold-accent font-semibold mt-0.5">
                              ↳ + Toppings: {item.toppings.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Customer metadata summary */}
                    <div className="pt-2 border-t border-premium-brown/10 flex justify-between items-center text-[10px] text-text-light">
                      <span>Customer: <strong>{order.customerName}</strong></span>
                      <span className="font-bold text-premium-brown font-serif">{formatPrice(order.totalUSD)}</span>
                    </div>

                    {/* Operational controls */}
                    <div className="pt-2">
                      {order.status === OrderStatus.PENDING && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, OrderStatus.PREPARING)}
                          className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-2 rounded-none text-xs font-bold uppercase tracking-wider transition border border-gold-accent/20 flex items-center justify-center space-x-1.5"
                        >
                          <span>Accept & Begin Brewing</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gold-accent" />
                        </button>
                      )}
                      {order.status === OrderStatus.PREPARING && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, OrderStatus.READY)}
                          className="w-full bg-premium-brown hover:bg-rich-espresso text-cream py-2 rounded-none text-xs font-bold uppercase tracking-wider transition border border-gold-accent/20 flex items-center justify-center space-x-1.5"
                        >
                          <BellRing className="w-3.5 h-3.5 text-gold-accent" />
                          <span>Mark Ready & Notify Client</span>
                        </button>
                      )}
                      {order.status === OrderStatus.READY && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COMPLETED)}
                          className="w-full bg-gold-accent hover:bg-premium-brown hover:text-cream text-rich-espresso py-2 rounded-none text-xs font-bold uppercase tracking-wider transition border border-premium-brown/10 flex items-center justify-center space-x-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Hand Over & Archive</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        )}

        {/* REAL-TIME INGREDIENTS STOCK PANEL */}
        {viewTab === "INVENTORY_STORES" && (
          <div className="h-full overflow-y-auto bg-white rounded-none border border-premium-brown/10 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-premium-brown/10">
              <div>
                <h3 className="font-serif font-semibold text-premium-brown text-sm uppercase tracking-wider">Central Hub Raw Ingredient Sinks</h3>
                <p className="text-[11px] text-text-light mt-0.5">Deducted automatically as orders are checked out at POS register.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map(item => {
                const isLow = item.stockLevel <= item.minAlert;
                const percent = Math.min(100, Math.round((item.stockLevel / (item.minAlert * 3)) * 100));
                return (
                  <div key={item.id} className="p-4 bg-cream rounded-none border border-premium-brown/10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-premium-brown text-xs">{item.name}</h4>
                        <span className="text-[9px] bg-white text-text-light border border-premium-brown/10 px-2 py-0.5 rounded-none mt-1.5 inline-block uppercase tracking-wider font-semibold">{item.category}</span>
                      </div>
                      {isLow && (
                        <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] px-2 py-0.5 rounded-none flex items-center space-x-1 font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>Low Stock Alert</span>
                        </span>
                      )}
                    </div>

                    {/* Stock level bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono text-text-light">
                        <span>Current Stock:</span>
                        <strong className={isLow ? "text-red-700 font-bold" : "text-premium-brown"}>
                          {item.stockLevel} {item.unit}
                        </strong>
                      </div>
                      <div className="w-full bg-premium-brown/10 h-2 rounded-none overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isLow ? "bg-red-600" : "bg-gold-accent"}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-text-light/60">
                        <span>Alert Level: {item.minAlert} {item.unit}</span>
                        <span>Inventory Target Capacity</span>
                      </div>
                    </div>

                    {/* Replenish Buttons */}
                    <button
                      onClick={() => handleRestock(item.id)}
                      className="mt-3 bg-white hover:bg-premium-brown hover:text-cream text-premium-brown py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1 border border-premium-brown/10"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-gold-accent" />
                      <span>Replenish +{item.category === "Ingredients" ? "100 kg" : "1000 pcs"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QR SCAN HANDOVER PANEL */}
        {viewTab === "QR_VERIFY" && (
          <div className="h-full flex justify-center items-center pb-4">
            <div className="bg-white rounded-none border border-premium-brown/10 p-6 w-full max-w-md text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-premium-brown text-gold-accent border border-gold-accent/20 rounded-none flex items-center justify-center mx-auto mb-2">
                <ScanLine className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-premium-brown text-sm uppercase tracking-wider">Automated Order Dispatch Scanner</h3>
                <p className="text-[11px] text-text-light max-w-xs mx-auto mt-1 font-serif italic">
                  Type order code manually or select a pending dispatch ticket below to execute immediate client handoff verification.
                </p>
              </div>

              {scanMessage && (
                <div className={`p-3 rounded-none text-[11px] font-semibold text-center leading-snug uppercase tracking-wider ${
                  scanMessage.startsWith("Success") 
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                    : scanMessage.startsWith("Warning")
                      ? "bg-amber-50 border border-amber-200 text-amber-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {scanMessage}
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Paste or enter Order ID (e.g. MEL-9281)..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="flex-1 bg-cream border border-premium-brown/15 rounded-none py-2 px-3.5 text-xs text-rich-espresso focus:outline-none focus:border-premium-brown focus:ring-1 focus:ring-premium-brown placeholder-text-light/40"
                />
                <button
                  onClick={handleScanVerify}
                  className="bg-premium-brown hover:bg-rich-espresso text-cream px-4 py-2 rounded-none text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1 border border-gold-accent/20"
                >
                  <UserCheck className="w-4 h-4 text-gold-accent" />
                  <span>Verify</span>
                </button>
              </div>

              {/* Ready tickets shortcuts */}
              <div className="text-left pt-2">
                <h4 className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-2">Ready for Immediate Delivery:</h4>
                <div className="space-y-1.5">
                  {orders.filter(o => o.status === OrderStatus.READY).map(o => (
                    <div 
                      key={o.id}
                      onClick={() => setScanInput(o.id)}
                      className="p-2.5 bg-cream hover:bg-gold-accent/5 rounded-none border border-premium-brown/10 cursor-pointer flex justify-between items-center text-[10px] text-premium-brown transition font-medium"
                    >
                      <span>🔖 {o.id} ({o.customerName})</span>
                      <span className="text-gold-accent font-bold uppercase tracking-wider flex items-center space-x-0.5">
                        <span>Load Code</span>
                        <ChevronRight className="w-3 h-3 text-premium-brown" />
                      </span>
                    </div>
                  ))}
                  {orders.filter(o => o.status === OrderStatus.READY).length === 0 && (
                    <p className="text-[10px] text-text-light/60 font-serif italic text-center">No ready-for-handover orders in stack.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
