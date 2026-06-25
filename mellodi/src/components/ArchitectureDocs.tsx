import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, Globe, Server, Terminal, Play, Cpu, Check, FileCode, Code, 
  Layers, Lock, HelpCircle, HardDrive
} from "lucide-react";

export default function ArchitectureDocs() {
  const [activeSubTab, setActiveSubTab] = useState<"ERD" | "SWAGGER" | "DEVOPS">("ERD");
  const [activeERDTable, setActiveERDTable] = useState<string>("users");

  // Swagger state
  const [swaggerResponse, setSwaggerResponse] = useState<any>(null);
  const [swaggerLoading, setSwaggerLoading] = useState<string | null>(null);

  const erdTables = {
    users: [
      { name: "id", type: "UUID (PK)", desc: "Unique user identifier" },
      { name: "email", type: "VARCHAR(255)", desc: "Primary communication email" },
      { name: "password_hash", type: "VARCHAR(255)", desc: "Bcrypt hash" },
      { name: "name", type: "VARCHAR(100)", desc: "Human readable profile name" },
      { name: "phone_number", type: "VARCHAR(20)", desc: "OTP verification target" },
      { name: "tier_id", type: "UUID (FK)", desc: "References membership_tiers.id" },
      { name: "created_at", type: "TIMESTAMP", desc: "Creation epoch timestamp" }
    ],
    countries: [
      { name: "id", type: "UUID (PK)", desc: "Country identifier" },
      { name: "name", type: "VARCHAR(100)", desc: "e.g. Vietnam, Singapore" },
      { name: "iso_code", type: "VARCHAR(5)", desc: "e.g. VN, SG, US" },
      { name: "currency_code", type: "VARCHAR(3)", desc: "References currencies.code" },
      { name: "is_active", type: "BOOLEAN", desc: "Flag for enabled regional menus" }
    ],
    currencies: [
      { name: "code", type: "VARCHAR(3) (PK)", desc: "ISO Currency Code e.g. VND, USD" },
      { name: "symbol", type: "VARCHAR(10)", desc: "e.g. ₫, $, ¥" },
      { name: "exchange_rate_usd", type: "DECIMAL(12, 4)", desc: "Pegged exchange multiplier against USD" }
    ],
    stores: [
      { name: "id", type: "UUID (PK)", desc: "Store outlet ID" },
      { name: "name", type: "VARCHAR(150)", desc: "Store name e.g. Shibuya Flagship" },
      { name: "country_id", type: "UUID (FK)", desc: "References countries.id" },
      { name: "address", type: "TEXT", desc: "Physical localization address" },
      { name: "operating_hours", type: "VARCHAR(100)", desc: "e.g. 07:00 - 23:00" },
      { name: "capacity_seats", type: "INT", desc: "Seating density" }
    ],
    products: [
      { name: "id", type: "UUID (PK)", desc: "Item identifier" },
      { name: "name", type: "VARCHAR(150)", desc: "Human readable name" },
      { name: "chinese_name", type: "VARCHAR(150)", desc: "Traditional/Simplified Mandarin name" },
      { name: "category_id", type: "UUID (FK)", desc: "References product_categories.id" },
      { name: "price_usd", type: "DECIMAL(10, 2)", desc: "Base global pricing anchor" }
    ],
    inventory: [
      { name: "id", type: "UUID (PK)", desc: "Raw item tracking" },
      { name: "store_id", type: "UUID (FK)", desc: "References stores.id" },
      { name: "ingredient_name", type: "VARCHAR(150)", desc: "e.g. Jasmine Oolong Leaves" },
      { name: "stock_quantity", type: "DECIMAL(10, 2)", desc: "Current weight/count in stock" },
      { name: "unit", type: "VARCHAR(20)", desc: "kg, Liters, pcs" },
      { name: "min_alert_level", type: "DECIMAL(10, 2)", desc: "Trigger low stock pushes" }
    ],
    orders: [
      { name: "id", type: "UUID (PK)", desc: "Global receipt identifier" },
      { name: "user_id", type: "UUID (FK)", desc: "References users.id (nullable for walk-ins)" },
      { name: "store_id", type: "UUID (FK)", desc: "References stores.id" },
      { name: "total_usd", type: "DECIMAL(10, 2)", desc: "Total basket sum value" },
      { name: "status", type: "VARCHAR(50)", desc: "PENDING, PREPARING, READY, COMPLETED" },
      { name: "payment_status", type: "VARCHAR(50)", desc: "UNPAID, PAID, REFUNDED" },
      { name: "created_at", type: "TIMESTAMP", desc: "Order timestamp" }
    ]
  };

  const swaggerEndpoints = [
    {
      method: "GET",
      path: "/api/v1/products",
      desc: "Retrieve all menu products with localized prices dynamically based on country query.",
      params: "?country=VN",
      mockResponse: {
        status: "success",
        country: "Vietnam",
        currency: "VND",
        exchangeRate: 25400,
        data: [
          { id: "p1", name: "Mellodi Signature Jasmine Green Milk Tea", basePriceUSD: 4.95, localizedPrice: "125,000 ₫", allergens: ["Milk"] }
        ]
      }
    },
    {
      method: "POST",
      path: "/api/v1/orders/checkout",
      desc: "Processes customer carts, deducts ingredient inventories, and locks Stripe payment tokens.",
      params: "Body JSON",
      mockResponse: {
        status: "approved",
        transactionId: "ch_stripe_3M29108K",
        orderId: "MEL-POS-4281",
        pointsEarned: 19,
        inventoryDeductions: ["cups: -1", "boba: -2.0kg"]
      }
    },
    {
      method: "GET",
      path: "/api/v1/loyalty/points",
      desc: "Fetches user loyalty card details, tier advantages, and historic redeem list.",
      params: "?userId=vince-uuid",
      mockResponse: {
        userId: "vince-uuid",
        currentTier: "DIAMOND",
        pointsBalance: 1245,
        multiplier: 1.5,
        benefits: ["Free Toppings Unlimited", "Birthday Gift Set Box"]
      }
    }
  ];

  const handleTrySwagger = (endpointPath: string, responseObj: any) => {
    setSwaggerLoading(endpointPath);
    setSwaggerResponse(null);
    setTimeout(() => {
      setSwaggerLoading(null);
      setSwaggerResponse(responseObj);
    }, 1000);
  };

  return (
    <div id="architecture-docs-root" className="w-full h-full bg-cream text-rich-espresso flex flex-col font-sans text-sm p-5 overflow-y-auto">
      
      {/* Blueprint Tab Navigator */}
      <div className="pb-3 border-b border-premium-brown/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif font-black text-premium-brown tracking-[0.1em] flex items-center space-x-2 uppercase">
            <Cpu className="w-5 h-5 text-gold-accent" />
            <span>Mellodi Tech Blueprints</span>
          </h1>
          <p className="text-xs text-text-light mt-0.5 font-serif italic">Enterprise engineering specifications and production setups.</p>
        </div>

        {/* Subtab Selectors */}
        <div className="flex bg-white border border-premium-brown/10 p-1 rounded-none shrink-0 shadow-sm">
          <button
            onClick={() => { setActiveSubTab("ERD"); setSwaggerResponse(null); }}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeSubTab === "ERD" 
                ? "bg-premium-brown text-cream border-b-2 border-b-gold-accent" 
                : "text-text-light hover:text-premium-brown"
            }`}
          >
            <Database className="w-4 h-4 text-gold-accent" />
            <span>PostgreSQL ERD Layout</span>
          </button>
          <button
            onClick={() => { setActiveSubTab("SWAGGER"); setSwaggerResponse(null); }}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeSubTab === "SWAGGER" 
                ? "bg-premium-brown text-cream border-b-2 border-b-gold-accent" 
                : "text-text-light hover:text-premium-brown"
            }`}
          >
            <Server className="w-4 h-4 text-gold-accent" />
            <span>NestJS API Sandbox</span>
          </button>
          <button
            onClick={() => { setActiveSubTab("DEVOPS"); setSwaggerResponse(null); }}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeSubTab === "DEVOPS" 
                ? "bg-premium-brown text-cream border-b-2 border-b-gold-accent" 
                : "text-text-light hover:text-premium-brown"
            }`}
          >
            <Terminal className="w-4 h-4 text-gold-accent" />
            <span>Kubernetes & DevOps</span>
          </button>
        </div>
      </div>

      {/* RENDER SPECIFIC BLUEPRINTS */}
      <div className="flex-1 mt-5">
        <AnimatePresence mode="wait">
          
          {/* ERD EXPANDABLE DIAGRAM */}
          {activeSubTab === "ERD" && (
            <motion.div 
              key="erd" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="grid grid-cols-1 md:grid-cols-12 gap-5"
            >
              <div className="md:col-span-4 bg-white border border-premium-brown/10 rounded-none p-4 space-y-3 shadow-sm">
                <h3 className="font-serif font-bold text-premium-brown text-xs uppercase tracking-wider flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-gold-accent" />
                  <span>28 Core System Tables</span>
                </h3>
                <p className="text-[11px] text-text-light leading-relaxed font-serif italic">
                  Below are the relational database schema structures configured inside the PostgreSQL instance. Click any core table to view relationships.
                </p>

                <div className="space-y-1 pt-2">
                  {Object.keys(erdTables).map(tbl => (
                    <button
                      key={tbl}
                      onClick={() => setActiveERDTable(tbl)}
                      className={`w-full text-left p-2.5 rounded-none font-mono text-xs transition flex justify-between items-center border ${
                        activeERDTable === tbl 
                          ? "bg-premium-brown text-cream border-premium-brown" 
                          : "bg-cream text-premium-brown border-premium-brown/10 hover:bg-gold-accent/5"
                      }`}
                    >
                      <span>🗄️ {tbl}</span>
                      <span className={`text-[8px] font-bold uppercase ${activeERDTable === tbl ? "text-gold-accent" : "text-text-light/70"}`}>PK/FK Matrix</span>
                    </button>
                  ))}
                  <div className="text-[10px] text-text-light p-2.5 border border-dashed border-premium-brown/25 rounded-none text-center font-mono">
                    + 21 other schemas in DB
                  </div>
                </div>
              </div>

              {/* Table Column details display */}
              <div className="md:col-span-8 bg-white border border-premium-brown/10 rounded-none p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2.5 border-b border-premium-brown/10">
                  <div>
                    <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Table: {activeERDTable}</h3>
                    <p className="text-xs text-text-light mt-1 font-serif italic">Full columns schema, type associations, and logical relations.</p>
                  </div>
                  <span className="text-[9px] bg-premium-brown text-cream border border-gold-accent/20 font-bold py-0.5 px-2 rounded-none uppercase tracking-widest">
                    PostgreSQL
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-text-light border-b border-premium-brown/10 pb-2">
                        <th className="pb-2">Column Name</th>
                        <th className="pb-2">SQL Data Type</th>
                        <th className="pb-2">Constraint/Relation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-premium-brown/5 text-rich-espresso font-medium">
                      {(erdTables as any)[activeERDTable].map((col: any) => (
                        <tr key={col.name} className="hover:bg-gold-accent/5">
                          <td className="py-2.5 font-bold text-premium-brown">{col.name}</td>
                          <td className="py-2.5 text-gold-accent font-bold font-mono">{col.type}</td>
                          <td className="py-2.5 text-text-light font-sans text-xs">{col.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Relationships summary */}
                <div className="bg-cream p-4 rounded-none border border-premium-brown/10 mt-4 space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-premium-brown text-xs uppercase tracking-wider">Relation Mappings:</h4>
                  {activeERDTable === "users" && (
                    <p className="text-text-light leading-relaxed font-mono text-[11px]">
                      users.tier_id ➜ membership_tiers.id (1-to-Many)<br />
                      users.id ➜ orders.user_id (1-to-Many)<br />
                      users.id ➜ reward_redemptions.user_id (1-to-Many)
                    </p>
                  )}
                  {activeERDTable === "stores" && (
                    <p className="text-text-light leading-relaxed font-mono text-[11px]">
                      stores.country_id ➜ countries.id (Many-to-1)<br />
                      stores.id ➜ inventory.store_id (1-to-Many)<br />
                      stores.id ➜ store_staff.store_id (1-to-Many)
                    </p>
                  )}
                  {activeERDTable === "orders" && (
                    <p className="text-text-light leading-relaxed font-mono text-[11px]">
                      orders.user_id ➜ users.id (Many-to-1, Nullable)<br />
                      orders.store_id ➜ stores.id (Many-to-1)<br />
                      orders.id ➜ order_items.order_id (1-to-Many cascade)
                    </p>
                  )}
                  {activeERDTable !== "users" && activeERDTable !== "stores" && activeERDTable !== "orders" && (
                    <p className="text-text-light/70 font-mono text-[11px]">Standard relational foreign key mapping initialized.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* INTERACTIVE SWAGGER SANDBOX */}
          {activeSubTab === "SWAGGER" && (
            <motion.div 
              key="swagger" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-6"
            >
              <div className="bg-white border border-premium-brown/10 rounded-none p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="font-serif font-bold text-premium-brown text-sm uppercase tracking-wider">Interactive Swagger REST Sandbox</h3>
                  <p className="text-xs text-text-light mt-1 font-serif italic">
                    Execute simulated live client requests to NestJS server microservices and check compiled responses.
                  </p>
                </div>

                <div className="space-y-3">
                  {swaggerEndpoints.map((ep, idx) => (
                    <div key={idx} className="bg-cream p-4 rounded-none border border-premium-brown/10 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-none uppercase tracking-widest border ${
                            ep.method === "GET" 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}>
                            {ep.method}
                          </span>
                          <span className="font-mono font-bold text-premium-brown text-xs">{ep.path}</span>
                          <span className="text-[10px] text-text-light font-mono">{ep.params}</span>
                        </div>
                        
                        <button
                          onClick={() => handleTrySwagger(ep.path, ep.mockResponse)}
                          className="bg-premium-brown hover:bg-rich-espresso text-cream text-xs font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-none flex items-center space-x-1.5 transition border border-gold-accent/25"
                        >
                          <Play className="w-3 h-3 text-gold-accent" />
                          <span>Test Endpoint</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-text-light font-medium">{ep.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response output terminal */}
              <div className="bg-white border border-premium-brown/10 rounded-none p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-premium-brown/10">
                  <span className="text-xs font-bold text-text-light uppercase tracking-widest">REST Response Terminal</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>

                {swaggerLoading ? (
                  <div className="py-12 text-center text-text-light space-y-2 font-mono text-xs">
                    <span className="inline-block animate-spin text-gold-accent">⏳</span>
                    <p>Executing request: {swaggerLoading}...</p>
                  </div>
                ) : swaggerResponse ? (
                  <div className="bg-rich-espresso p-4 rounded-none overflow-x-auto border border-premium-brown/20 shadow-inner">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {JSON.stringify(swaggerResponse, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="py-10 text-center text-text-light font-serif italic text-xs">
                    No active responses loaded. Press "Test Endpoint" above to simulate.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* DOCKER & DEVOPS SPECIFICATION PLAYGROUND */}
          {activeSubTab === "DEVOPS" && (
            <motion.div 
              key="devops" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="space-y-6"
            >
              {/* Docker section */}
              <div className="bg-white border border-premium-brown/10 rounded-none p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-premium-brown/10">
                  <span className="font-mono text-xs font-bold text-premium-brown uppercase tracking-wider">production.Dockerfile (Multi-Stage Node)</span>
                  <span className="text-[8px] bg-cream border border-premium-brown/10 px-2.5 py-0.5 rounded-none text-text-light font-bold uppercase tracking-widest">Node Alpine</span>
                </div>
                <div className="bg-rich-espresso p-4 rounded-none border border-premium-brown/25 overflow-x-auto shadow-inner">
                  <pre className="text-xs text-cream/90 font-mono leading-relaxed whitespace-pre">
{`# STEP 1: Dependencies and Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STEP 2: Minimalist Container Execution
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.cjs"]`}
                  </pre>
                </div>
              </div>

              {/* Compose section */}
              <div className="bg-white border border-premium-brown/10 rounded-none p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-premium-brown/10">
                  <span className="font-mono text-xs font-bold text-premium-brown uppercase tracking-wider">docker-compose.yml (Global Services Stack)</span>
                  <span className="text-[8px] bg-cream border border-premium-brown/10 px-2.5 py-0.5 rounded-none text-text-light font-bold uppercase tracking-widest">PostgreSQL + Redis + Elastic</span>
                </div>
                <div className="bg-rich-espresso p-4 rounded-none border border-premium-brown/25 overflow-x-auto shadow-inner">
                  <pre className="text-xs text-cream/90 font-mono leading-relaxed whitespace-pre">
{`version: '3.8'

services:
  mellodi-api:
    build:
      context: .
      dockerfile: production.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://mellodi_user:Abc123pwd@db:5432/mellodi_prod
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: mellodi_user
      POSTGRES_PASSWORD: Abc123pwd
      POSTGRES_DB: mellodi_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`}
                  </pre>
                </div>
              </div>

              {/* Kubernetes manifests */}
              <div className="bg-white border border-premium-brown/10 rounded-none p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-premium-brown/10">
                  <span className="font-mono text-xs font-bold text-premium-brown uppercase tracking-wider">k8s-ingress-deployment.yaml</span>
                  <span className="text-[8px] bg-cream border border-premium-brown/10 px-2.5 py-0.5 rounded-none text-text-light font-bold uppercase tracking-widest">Helm Ready</span>
                </div>
                <div className="bg-rich-espresso p-4 rounded-none border border-premium-brown/25 overflow-x-auto shadow-inner">
                  <pre className="text-xs text-cream/90 font-mono leading-relaxed whitespace-pre">
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: mellodi-backend-deployment
  labels:
    app: mellodi-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mellodi-api
  template:
    metadata:
      labels:
        app: mellodi-api
    spec:
      containers:
      - name: api
        image: gcr.io/mellodi-global/backend:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "1"
            memory: 1024Mi
          requests:
            cpu: 500m
            memory: 512Mi
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10`}
                  </pre>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
