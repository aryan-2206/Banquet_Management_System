import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const T = {
  bg: "#080810", surface: "rgba(255,255,255,.025)", border: "rgba(201,168,76,.14)",
  gold: "#C9A84C", goldText: "#E8D08A", text: "#F5F0E8",
  muted: "rgba(245,240,232,.6)", dim: "rgba(245,240,232,.35)",
  green: "#3A7A6E", red: "#E85555", amber: "#C07A2A", radius: 18,
};

const STOCK_ITEMS = [
  { id: "s1", name: "Paneer", unit: "kg", current: 48, required: 55, category: "Dairy" },
  { id: "s2", name: "Chicken", unit: "kg", current: 60, required: 58, category: "Protein" },
  { id: "s3", name: "Mutton", unit: "kg", current: 16, required: 25, category: "Protein" },
  { id: "s4", name: "Basmati Rice", unit: "kg", current: 70, required: 68, category: "Grains" },
  { id: "s5", name: "Atta (Wheat)", unit: "kg", current: 35, required: 32, category: "Grains" },
  { id: "s6", name: "Tomatoes", unit: "kg", current: 22, required: 20, category: "Produce" },
  { id: "s7", name: "Onions", unit: "kg", current: 18, required: 20, category: "Produce" },
  { id: "s8", name: "Cream", unit: "L", current: 12, required: 15, category: "Dairy" },
  { id: "s9", name: "Cooking Oil", unit: "L", current: 30, required: 28, category: "Pantry" },
  { id: "s10", name: "Dal (Makhani)", unit: "kg", current: 28, required: 22, category: "Pantry" },
  { id: "s11", name: "Chocolate", unit: "kg", current: 8, required: 10, category: "Pastry" },
  { id: "s12", name: "Gulab Jamun Mix", unit: "kg", current: 14, required: 12, category: "Pastry" },
];

const PREP_QUEUE = [
  { id: "p1", dish: "Paneer Tikka", event: "Mehta Wedding", station: "Tandoor", status: "active", chef: "Rajan K.", eta: "18:45", urgent: false },
  { id: "p2", dish: "Chicken Seekh Kebab", event: "Mehta Wedding", station: "Tandoor", status: "active", chef: "Priya M.", eta: "18:50", urgent: false },
  { id: "p3", dish: "Dal Makhani", event: "Both Events", station: "Hot Kitchen", status: "pending", chef: "Suman R.", eta: "19:15", urgent: true },
  { id: "p4", dish: "Tomato Basil Shorba", event: "Mehta Wedding", station: "Hot Kitchen", status: "pending", chef: "Suman R.", eta: "19:00", urgent: false },
  { id: "p5", dish: "Dum Biryani (Veg)", event: "Mehta Wedding", station: "Dum Station", status: "pending", chef: "Arvind T.", eta: "19:30", urgent: false },
  { id: "p6", dish: "Chicken Biryani", event: "Mehta Wedding", station: "Dum Station", status: "pending", chef: "Arvind T.", eta: "19:30", urgent: false },
  { id: "p7", dish: "Bruschetta", event: "Sharma Corporate", station: "Cold", status: "pending", chef: "Neha D.", eta: "20:00", urgent: false },
  { id: "p8", dish: "Tiramisu", event: "Sharma Corporate", station: "Pastry", status: "done", chef: "Neha D.", eta: "20:30", urgent: false },
  { id: "p9", dish: "Gulab Jamun", event: "Mehta Wedding", station: "Pastry", status: "done", chef: "Riya S.", eta: "21:00", urgent: false },
];

const TODAY_EVENTS = [
  { id: 1, name: "Mehta Wedding", hall: "Grand Ballroom", time: "19:00", pax: 320, arrived: 287, tier: "Elite", color: "#C9A84C" },
  { id: 2, name: "Sharma Corporate", hall: "Crystal Hall", time: "20:30", pax: 85, arrived: 71, tier: "Premium", color: "#5B8FE8" },
];

function stockLevel(item) {
  const r = item.current / item.required;
  if (r >= 1) return { status: "ok", color: T.green, label: "Full" };
  if (r >= 0.75) return { status: "warn", color: T.amber, label: "Low" };
  return { status: "bad", color: T.red, label: "Critical" };
}

function useCountup(target, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = null;
    const f = ts => { if (!s) s = ts; const p = Math.min((ts - s) / ms, 1); setV(Math.floor(p * target)); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }, [target]);
  return v;
}

function Card({ children, style }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "20px 22px", ...style }}>{children}</div>;
}
function SecTitle({ children }) {
  return <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 14 }}>{children}</div>;
}

export default function KitchenDashboard() {
  const navigate = useNavigate();
  const [qFilter, setQFilter] = useState("all");
  const [sFilter, setSFilter] = useState("all");
  const [queue, setQueue] = useState(PREP_QUEUE);

  const totalPax = TODAY_EVENTS.reduce((s, e) => s + e.pax, 0);
  const totalArrived = TODAY_EVENTS.reduce((s, e) => s + e.arrived, 0);
  const cPax = useCountup(totalPax);
  const cArrived = useCountup(totalArrived);
  const cActive = useCountup(queue.filter(p => p.status === "active").length);
  const cLow = useCountup(STOCK_ITEMS.filter(i => stockLevel(i).status !== "ok").length);

  const filteredQ = queue.filter(p => qFilter === "all" || p.status === qFilter);
  const filteredS = STOCK_ITEMS.filter(i => sFilter === "all" || stockLevel(i).status === sFilter);

  const now = new Date();

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "28px 32px 80px", fontFamily: "'DM Sans',sans-serif", color: T.text }}>
      <style>{`
        @keyframes kdf { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kdp { 0%,100%{opacity:1} 50%{opacity:.4} }
        .kd-st:hover { transform:translateY(-3px) !important; }
        .kd-row:hover { background:rgba(201,168,76,.05) !important; border-color:rgba(201,168,76,.28) !important; }
        .kd-nav:hover { transform:translateY(-4px) !important; border-color:rgba(201,168,76,.45) !important; }
        .kd-bg:hover  { background:rgba(201,168,76,.15) !important; }
        .kd-fb:hover  { border-color:rgba(201,168,76,.45) !important; background:rgba(201,168,76,.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28, animation: "kdf .35s ease both" }}>
        <div style={{ fontSize: 11, color: "rgba(201,168,76,.7)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>Operations Centre</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, lineHeight: 1 }}>Kitchen Dashboard</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 5 }}>
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · <span style={{ color: T.goldText }}>{TODAY_EVENTS.length} events tonight</span>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Pax", val: cPax, sub: "across all events", accent: T.gold },
          { label: "Guests Arrived", val: cArrived, sub: `${Math.round((totalArrived / totalPax) * 100)}% check-in`, accent: T.green },
          { label: "Dishes Active", val: cActive, sub: "currently being prepared", accent: "#9B6DE8" },
          { label: "Stock Alerts", val: cLow, sub: "items below threshold", accent: T.red },
        ].map((s, i) => (
          <div key={i} className="kd-st" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "18px 20px", position: "relative", overflow: "hidden", transition: "transform .2s", animation: `kdf .4s ease ${i * 0.07}s both` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.accent }} />
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: s.accent, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Nav tiles */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>Quick access</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { label: "Menu Manifest", desc: "Dishes by course — mark prep status", img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=480&q=80", route: "/kitchen/manifest" },
            { label: "Waste Logger", desc: "Log consumption & download CSV report", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=480&q=80", route: "/kitchen/waste" },
            { label: "Tonight's Menu", desc: "Full client-selected menu by event", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=480&q=80", route: "/kitchen/manifest" },
          ].map((t, i) => (
            <div key={i} className="kd-nav" onClick={() => navigate(t.route)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, overflow: "hidden", cursor: "pointer", transition: "transform .22s, border-color .18s", animation: `kdf .45s ease ${0.1 + i * 0.08}s both` }}>
              <div style={{ height: 110, overflow: "hidden" }}>
                <img src={t.img} alt={t.label} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.6) saturate(.7)" }} />
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: T.text, marginBottom: 4 }}>{t.label} <span style={{ color: T.gold, float: "right" }}>›</span></div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prep queue + live events */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, marginBottom: 24 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <SecTitle>Prep queue</SecTitle>
            <div style={{ display: "flex", gap: 6 }}>
              {["all", "pending", "active", "done"].map(f => (
                <button key={f} onClick={() => setQFilter(f)} style={{ padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800, border: `1px solid ${qFilter === f ? "rgba(201,168,76,.5)" : T.border}`, background: qFilter === f ? "rgba(201,168,76,.1)" : "transparent", color: qFilter === f ? T.goldText : T.muted, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
              ))}
            </div>
          </div>

          {filteredQ.map((item, i) => (
            <div key={item.id} className="kd-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, border: `1px solid ${item.urgent && item.status !== "done" ? "rgba(232,85,85,.3)" : "rgba(201,168,76,.09)"}`, background: item.urgent && item.status !== "done" ? "rgba(232,85,85,.05)" : "rgba(255,255,255,.01)", marginBottom: 8, transition: "all .18s", animation: `kdf .4s ease ${i * 0.04}s both` }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: item.status === "done" ? T.green : item.status === "active" ? T.gold : "rgba(255,255,255,.2)", animation: item.status === "active" ? "kdp 1.8s infinite" : "none" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: T.text, marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
                  {item.dish}
                  {item.urgent && item.status !== "done" && <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, background: "rgba(232,85,85,.12)", color: T.red, border: "1px solid rgba(232,85,85,.2)", fontWeight: 900 }}>URGENT</span>}
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>{item.event} · {item.station} · {item.chef}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: T.goldText }}>{item.eta}</div>
                <div style={{ fontSize: 10, color: T.dim }}>ready by</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {item.status === "pending" && <button className="kd-bg" onClick={() => setQueue(q => q.map(p => p.id === item.id ? { ...p, status: "active" } : p))} style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid rgba(201,168,76,.25)`, background: "rgba(201,168,76,.07)", color: T.goldText, fontSize: 12, fontWeight: 900, cursor: "pointer", transition: "background .18s" }}>Start</button>}
                {item.status === "active" && <button className="kd-bg" onClick={() => setQueue(q => q.map(p => p.id === item.id ? { ...p, status: "done" } : p))} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid rgba(95,191,138,.3)", background: "rgba(95,191,138,.1)", color: "#5FBF8A", fontSize: 12, fontWeight: 900, cursor: "pointer", transition: "background .18s" }}>Done ✓</button>}
                {item.status === "done" && <span style={{ fontSize: 18, color: T.green }}>✓</span>}
              </div>
            </div>
          ))}
        </Card>

        {/* Live events */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, animation: "kdp 1.8s infinite" }} />
            <SecTitle>Live events</SecTitle>
          </div>
          {TODAY_EVENTS.map(ev => {
            const pct = Math.round((ev.arrived / ev.pax) * 100);
            return (
              <div key={ev.id} onClick={() => navigate?.(`/kitchen/manifest?event=${ev.id}`)} style={{ marginBottom: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 2 }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{ev.hall} · {ev.time}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: ev.color }}>{ev.arrived}</div>
                    <div style={{ fontSize: 10, color: T.dim }}>of {ev.pax}</div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,.05)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: ev.color, borderRadius: 99, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Stock levels */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <SecTitle>Current stock levels</SecTitle>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ val: "all", label: "All" }, { val: "ok", label: "Full" }, { val: "warn", label: "Low" }, { val: "bad", label: "Critical" }].map(f => (
              <button key={f.val} onClick={() => setSFilter(f.val)} style={{ padding: "6px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800, border: `1px solid ${sFilter === f.val ? "rgba(201,168,76,.5)" : T.border}`, background: sFilter === f.val ? "rgba(201,168,76,.1)" : "transparent", color: sFilter === f.val ? T.goldText : T.muted, cursor: "pointer" }}>{f.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {filteredS.map((item, i) => {
            const sl = stockLevel(item);
            const pct = Math.min(Math.round((item.current / item.required) * 100), 100);
            return (
              <div key={item.id} className="kd-row" style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${sl.status === "bad" ? "rgba(232,85,85,.25)" : sl.status === "warn" ? "rgba(192,122,42,.22)" : "rgba(201,168,76,.1)"}`, background: sl.status === "bad" ? "rgba(232,85,85,.05)" : "rgba(255,255,255,.01)", transition: "all .18s", animation: `kdf .4s ease ${i * 0.04}s both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 10.5, color: T.muted }}>{item.category}</div>
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: 99, fontSize: 10, fontWeight: 900, background: `${sl.color}22`, color: sl.color, border: `1px solid ${sl.color}44` }}>{sl.label}</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,.05)", overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: sl.color, borderRadius: 99, transition: "width .8s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: T.muted }}>Have: <strong style={{ color: T.text }}>{item.current}{item.unit}</strong></span>
                  <span style={{ fontSize: 11, color: T.muted }}>Need: <strong style={{ color: sl.status !== "ok" ? sl.color : T.text }}>{item.required}{item.unit}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
