import { useState } from "react";
import "./MenuManifest.css";

/* ── Mock data: what the client selected in the booking form ── */
const EVENTS = [
  {
    id: 1,
    name: "Mehta Wedding",
    hall: "Grand Ballroom",
    time: "19:00",
    tier: "Elite",
    pax: { planned: 320, arrived: 287 },
    courses: [
      {
        name: "Welcome Drinks",
        items: [
          { id: "d1", name: "Virgin Mojito", cuisine: "Beverages", diet: ["VEG"], station: "Bar Counter", plannedQty: "160 glasses", status: "served" },
          { id: "d2", name: "Masala Chaas", cuisine: "Indian", diet: ["VEG", "JAIN"], station: "Bar Counter", plannedQty: "80 glasses", status: "served" },
        ],
      },
      {
        name: "Starters",
        items: [
          { id: "d3", name: "Paneer Tikka", cuisine: "North Indian", diet: ["VEG"], station: "Station 3 — Tandoor", plannedQty: "48 kg", status: "active" },
          { id: "d4", name: "Chicken Seekh Kebab", cuisine: "North Indian", diet: ["NON-VEG", "HALAL"], station: "Station 3 — Tandoor", plannedQty: "32 kg", status: "active" },
          { id: "d5", name: "Veg Spring Rolls", cuisine: "Continental", diet: ["VEG", "JAIN"], station: "Station 1 — Cold", plannedQty: "200 pcs", status: "pending" },
        ],
      },
      {
        name: "Soup",
        items: [
          { id: "d6", name: "Tomato Basil Shorba", cuisine: "Continental", diet: ["VEG", "GF"], station: "Station 2 — Hot", plannedQty: "80 L", status: "pending" },
          { id: "d7", name: "Sweet Corn Chicken", cuisine: "Chinese", diet: ["NON-VEG"], station: "Station 2 — Hot", plannedQty: "40 L", status: "pending" },
        ],
      },
      {
        name: "Main Course",
        items: [
          { id: "d8", name: "Dal Makhani", cuisine: "North Indian", diet: ["VEG"], station: "Station 2 — Hot", plannedQty: "40 kg", status: "pending", synergy: "Also for Sharma Dinner" },
          { id: "d9", name: "Paneer Butter Masala", cuisine: "North Indian", diet: ["VEG", "JAIN"], station: "Station 2 — Hot", plannedQty: "30 kg", status: "pending" },
          { id: "d10", name: "Mutton Rogan Josh", cuisine: "Kashmiri", diet: ["NON-VEG", "HALAL"], station: "Station 4 — Dum", plannedQty: "25 kg", status: "pending" },
          { id: "d11", name: "Veg Kolhapuri", cuisine: "Maharashtrian", diet: ["VEG", "GF"], station: "Station 2 — Hot", plannedQty: "20 kg", status: "pending" },
        ],
      },
      {
        name: "Rice & Breads",
        items: [
          { id: "d12", name: "Dum Biryani (Veg)", cuisine: "Hyderabadi", diet: ["VEG", "GF"], station: "Station 4 — Dum", plannedQty: "35 kg", status: "pending" },
          { id: "d13", name: "Chicken Biryani", cuisine: "Hyderabadi", diet: ["NON-VEG", "HALAL"], station: "Station 4 — Dum", plannedQty: "30 kg", status: "pending" },
          { id: "d14", name: "Naan & Roti", cuisine: "Indian", diet: ["VEG"], station: "Station 3 — Tandoor", plannedQty: "640 pcs", status: "pending" },
        ],
      },
      {
        name: "Dessert",
        items: [
          { id: "d15", name: "Gulab Jamun", cuisine: "Indian", diet: ["VEG"], station: "Station 5 — Pastry", plannedQty: "640 pcs", status: "pending" },
          { id: "d16", name: "Phirni", cuisine: "Indian", diet: ["VEG", "GF"], station: "Station 5 — Pastry", plannedQty: "320 cups", status: "pending" },
          { id: "d17", name: "Chocolate Mousse", cuisine: "Continental", diet: ["VEG"], station: "Station 1 — Cold", plannedQty: "320 cups", status: "pending" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Sharma Corporate",
    hall: "Crystal Hall",
    time: "20:30",
    tier: "Premium",
    pax: { planned: 85, arrived: 71 },
    courses: [
      {
        name: "Starters",
        items: [
          { id: "e1", name: "Bruschetta", cuisine: "Continental", diet: ["VEG"], station: "Station 1 — Cold", plannedQty: "85 pcs", status: "pending" },
          { id: "e2", name: "Chicken Satay", cuisine: "Asian", diet: ["NON-VEG"], station: "Station 3 — Tandoor", plannedQty: "170 pcs", status: "pending" },
        ],
      },
      {
        name: "Main Course",
        items: [
          { id: "e3", name: "Dal Makhani", cuisine: "North Indian", diet: ["VEG"], station: "Station 2 — Hot", plannedQty: "14 kg", status: "pending", synergy: "Batch with Mehta Wedding" },
          { id: "e4", name: "Grilled Fish", cuisine: "Continental", diet: ["NON-VEG", "GF"], station: "Station 4 — Dum", plannedQty: "17 kg", status: "pending" },
        ],
      },
      {
        name: "Dessert",
        items: [
          { id: "e5", name: "Tiramisu", cuisine: "Italian", diet: ["VEG"], station: "Station 1 — Cold", plannedQty: "85 cups", status: "pending" },
        ],
      },
    ],
  },
];

const DIET_CONFIG = {
  VEG:    { color: "#3A7A6E", label: "Veg" },
  "NON-VEG": { color: "#E85555", label: "Non-Veg" },
  JAIN:   { color: "#C07A2A", label: "Jain" },
  HALAL:  { color: "#9B6DE8", label: "Halal" },
  GF:     { color: "#5B8FE8", label: "GF" },
};

const STATUS_ORDER = ["pending", "active", "served", "closed"];
const STATUS_NEXT  = { pending: "active", active: "served", served: "closed" };
const STATUS_LABEL = { pending: "Prep Pending", active: "In Progress", served: "Served", closed: "Closed" };

export default function MenuManifest() {
  const [activeEvent, setActiveEvent] = useState(EVENTS[0].id);
  const [openCourses, setOpenCourses]   = useState(() => {
    const o = {};
    EVENTS.forEach(ev => ev.courses.forEach(c => { o[`${ev.id}-${c.name}`] = true; }));
    return o;
  });
  const [statuses, setStatuses]   = useState(() => {
    const s = {};
    EVENTS.forEach(ev => ev.courses.forEach(c => c.items.forEach(i => { s[i.id] = i.status; })));
    return s;
  });
  const [synergyDismissed, setSynergyDismissed] = useState({});
  const [stockModal, setStockModal] = useState(null); // { name, status }
  const [portions, setPortions]     = useState(() => {
    const p = {};
    EVENTS.forEach(ev => ev.courses.forEach(c => c.items.forEach(i => { p[i.id] = 0; })));
    return p;
  });
  const [lastSynced] = useState("2 min ago");

  const event = EVENTS.find(e => e.id === activeEvent);
  const pct   = Math.round((event.pax.arrived / event.pax.planned) * 100);
  const delta  = event.pax.arrived - event.pax.planned;

  /* summary counts */
  const allItems = event.courses.flatMap(c => c.items);
  const vegCount    = allItems.filter(i => i.diet.includes("VEG") && !i.diet.includes("NON-VEG")).length;
  const nonVegCount = allItems.filter(i => i.diet.includes("NON-VEG")).length;
  const jainCount   = allItems.filter(i => i.diet.includes("JAIN")).length;
  const halalCount  = allItems.filter(i => i.diet.includes("HALAL")).length;
  const gfCount     = allItems.filter(i => i.diet.includes("GF")).length;

  function toggleCourse(key) {
    setOpenCourses(p => ({ ...p, [key]: !p[key] }));
  }

  function advanceStatus(id) {
    setStatuses(p => {
      const next = STATUS_NEXT[p[id]];
      return next ? { ...p, [id]: next } : p;
    });
  }

  function isCourseComplete(course) {
    return course.items.every(i => statuses[i.id] === "served" || statuses[i.id] === "closed");
  }

  function handlePrint() { window.print(); }

  /* Stock mock — in real app pull from inventory slice */
  const stockMap = {
    d8: { current: 52, required: 40, unit: "kg" },
    d3: { current: 55, required: 48, unit: "kg" },
    d10: { current: 18, required: 25, unit: "kg", shortfall: 7 },
    d13: { current: 26, required: 30, unit: "kg", shortfall: 4 },
  };

  function stockStatus(id) {
    const s = stockMap[id];
    if (!s) return "ok";
    if (!s.shortfall) return "ok";
    const ratio = (s.current / s.required);
    return ratio < 0.6 ? "bad" : "warn";
  }

  return (
    <div className="k-manifest" style={{ padding: "28px 32px 80px", background: "#080810", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#F5F0E8" }}>

      {/* ── Print area (hidden on screen, shown on print) ── */}
      <div className="k-manifest__printWrap">
        <div className="k-manifest__printArea">
          <div className="k-printHeader__title">Menu Manifest — {event.name}</div>
          <div className="k-printHeader__meta">{event.hall} · {event.time} · {event.tier} · Pax: {event.pax.planned}</div>
          {event.courses.map(c => (
            <div className="k-printCourse" key={c.name}>
              <div className="k-printCourse__title">{c.name}</div>
              <table className="k-printTable">
                <thead><tr><th>Dish</th><th>Diet</th><th>Station</th><th>Qty</th><th>Status</th></tr></thead>
                <tbody>
                  {c.items.map(i => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>{i.diet.join(", ")}</td>
                      <td>{i.station}</td>
                      <td>{i.plannedQty}</td>
                      <td>{STATUS_LABEL[statuses[i.id]]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(201,168,76,.7)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>Kitchen · Menu Manifest</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: "#F5F0E8", lineHeight: 1 }}>Tonight's Preparation</div>
        <div style={{ fontSize: 13, color: "rgba(245,240,232,.55)", marginTop: 5 }}>Dishes assigned from confirmed client bookings</div>
      </div>

      <div className="k-manifest__top">
        {/* Event tabs */}
        <div className="k-tabs">
          {EVENTS.map(ev => (
            <button
              key={ev.id}
              className={`k-tab${activeEvent === ev.id ? " k-tab--active" : ""}`}
              onClick={() => setActiveEvent(ev.id)}
            >
              {ev.name} · {ev.pax.planned} pax
              <span style={{ marginLeft: 6, padding: "2px 7px", borderRadius: 99, fontSize: 10, background: ev.tier === "Elite" ? "rgba(201,168,76,.2)" : "rgba(91,143,232,.15)", color: ev.tier === "Elite" ? "#E8D08A" : "#5B8FE8", fontWeight: 900 }}>
                {ev.tier}
              </span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="k-manifest__controls">
          <span className="k-lastSynced">⟳ GRE synced {lastSynced}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="k-btn k-btn--outline" onClick={handlePrint}>⎙ Print Manifest</button>
          </div>
        </div>
      </div>

      {/* ── Headcount banner ── */}
      <div className={`k-headcountBanner${Math.abs(delta) > 30 ? " k-headcountBanner--warn" : ""}`}>
        <div>
          <div className="k-headcountBanner__title">
            Headcount — {event.hall} · {event.time}
          </div>
          <div className="k-headcountBanner__sub">
            Planned: {event.pax.planned} · Arrived: {event.pax.arrived} · Check-in: {pct}%
          </div>
          {Math.abs(delta) > 30 && (
            <div className="k-headcountBanner__warnText">
              ⚠ Large delta detected — review portion quantities below
            </div>
          )}
        </div>
        <div className="k-headcountBanner__right">
          <div className={`k-deltaBadge${delta > 0 ? " k-deltaBadge--pos" : delta < -20 ? " k-deltaBadge--neg" : ""}`}>
            {delta >= 0 ? `+${delta}` : delta} guests
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="k-manifest__grid">

        {/* ── Course accordions ── */}
        <div>
          {event.courses.map(course => {
            const key      = `${event.id}-${course.name}`;
            const isOpen   = openCourses[key];
            const complete = isCourseComplete(course);
            return (
              <div className="k-course" key={key}>
                <button className="k-course__head" onClick={() => toggleCourse(key)}>
                  <div className="k-course__headLeft">
                    <div className="k-course__name">{course.name}</div>
                    <div className="k-course__count">{course.items.length} dishes</div>
                  </div>
                  <div className="k-course__headRight">
                    {complete && <div className="k-course__check">✓</div>}
                    <div className="k-course__chev">{isOpen ? "▲" : "▼"}</div>
                  </div>
                </button>

                {isOpen && (
                  <div className="k-course__body">
                    <div className="k-course__gridHead">
                      <span>Dish</span>
                      <span>Quantity</span>
                      <span>Portions out</span>
                      <span>Status</span>
                      <span>Stock</span>
                    </div>

                    {course.items.map(item => {
                      const st  = statuses[item.id];
                      const sst = stockStatus(item.id);
                      const sk  = stockMap[item.id];
                      const synDismissed = synergyDismissed[item.id];

                      return (
                        <div className="k-dishRow" key={item.id}>

                          {/* Col 1: Dish info */}
                          <div>
                            <div className="k-dishRow__titleLine">
                              <span className="k-dishRow__dishName">{item.name}</span>
                              <span className="k-cuisineTag">{item.cuisine}</span>
                            </div>
                            <div className="k-dietBadges">
                              {item.diet.map(d => (
                                <span className="k-db" key={d}>
                                  <span className="k-db__dot" style={{ background: DIET_CONFIG[d]?.color }} />
                                  {DIET_CONFIG[d]?.label ?? d}
                                </span>
                              ))}
                            </div>
                            <div className="k-stationTag">📍 {item.station}</div>

                            {/* Synergy banner */}
                            {item.synergy && !synDismissed && (
                              <div className="k-synergyBanner">
                                <div className="k-synergyBanner__text">⚡ {item.synergy}</div>
                                <div className="k-synergyBanner__actions">
                                  <button className="k-synergyBtn k-synergyBtn--ok" onClick={() => setSynergyDismissed(p => ({ ...p, [item.id]: "accepted" }))}>Batch prep</button>
                                  <button className="k-synergyBtn k-synergyBtn--bad" onClick={() => setSynergyDismissed(p => ({ ...p, [item.id]: "dismissed" }))}>Separate</button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Col 2: Quantity */}
                          <div className="k-qtyLines">
                            <div className="k-qtyLine">
                              <span className="k-qtyLabel">Planned</span>
                              <span className="k-qtyVal">{item.plannedQty}</span>
                            </div>
                            <div className="k-qtyLine">
                              <span className="k-qtyLabel">For {event.pax.arrived} arrived</span>
                              <span className="k-qtyVal" style={{ color: "#E8D08A" }}>
                                {/* Scale quantity linearly — works for numeric values */}
                                {item.plannedQty}
                              </span>
                            </div>
                          </div>

                          {/* Col 3: Portions stepper */}
                          <div>
                            <div className="k-stepper">
                              <button
                                className="k-stepper__btn"
                                disabled={portions[item.id] === 0 || st === "closed"}
                                onClick={() => setPortions(p => ({ ...p, [item.id]: Math.max(0, p[item.id] - 1) }))}
                              >−</button>
                              <div className="k-stepper__mid">
                                <div className="k-stepper__label">Portions out</div>
                                <div className="k-stepper__value">{portions[item.id]}</div>
                              </div>
                              <button
                                className="k-stepper__btn"
                                disabled={st === "closed"}
                                onClick={() => setPortions(p => ({ ...p, [item.id]: p[item.id] + 1 }))}
                              >+</button>
                            </div>
                            <div className="k-stepperHint k-muted">tap to log servings</div>
                          </div>

                          {/* Col 4: Status */}
                          <div className="k-statusStack" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                            <span className={`k-status k-status--${st}`}>{STATUS_LABEL[st]}</span>
                            {st !== "closed" && (
                              <button className="k-smallBtn k-smallBtn--gold" onClick={() => advanceStatus(item.id)}>
                                → {STATUS_LABEL[STATUS_NEXT[st]]}
                              </button>
                            )}
                          </div>

                          {/* Col 5: Stock dot */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div
                              className={`k-stockDot k-stockDot--${sst}`}
                              onClick={() => sk && setStockModal({ name: item.name, ...sk, status: sst })}
                              title="Click for stock detail"
                            />
                            {sst === "ok"
                              ? <div className="k-stockOk">OK</div>
                              : <div className="k-stockShort">Low</div>
                            }
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Sticky summary sidebar ── */}
        <div className="k-manifest__summary">
          <div className="k-summaryCard" style={{ background: "rgba(255,255,255,.025)" }}>
            <div className="k-summaryCard__title">Dietary summary</div>
            <div className="k-summaryGrid">
              {[
                { key: "VEG", label: "Veg dishes", val: vegCount, color: "#3A7A6E" },
                { key: "NON-VEG", label: "Non-Veg dishes", val: nonVegCount, color: "#E85555" },
                { key: "JAIN", label: "Jain dishes", val: jainCount, color: "#C07A2A" },
                { key: "HALAL", label: "Halal dishes", val: halalCount, color: "#9B6DE8" },
                { key: "GF", label: "Gluten-Free", val: gfCount, color: "#5B8FE8" },
              ].map(r => (
                <div className="k-summaryRow" key={r.key}>
                  <div className="k-summaryKey">
                    <span className="k-dot" style={{ background: r.color }} />
                    {r.label}
                  </div>
                  <div className="k-summaryVal">{r.val}</div>
                </div>
              ))}
            </div>

            <div className="k-miniBars">
              <div className="k-miniBars__label">Veg vs Non-Veg split</div>
              <div className="k-barWrap">
                <div className="k-bar k-bar--veg" style={{ width: `${Math.round((vegCount / (vegCount + nonVegCount)) * 100)}%` }} />
                <div className="k-bar k-bar--nonveg" style={{ width: `${Math.round((nonVegCount / (vegCount + nonVegCount)) * 100)}%` }} />
              </div>
              <div className="k-barLegend">
                <div className="k-leg"><div className="k-legDot k-legDot--veg" />{vegCount} Veg</div>
                <div className="k-leg"><div className="k-legDot k-legDot--nonveg" />{nonVegCount} Non-Veg</div>
              </div>
            </div>

            <div style={{ marginTop: 18, borderTop: "1px solid rgba(201,168,76,.1)", paddingTop: 16 }}>
              <div className="k-summaryCard__title" style={{ marginBottom: 10 }}>Prep progress</div>
              {["pending","active","served","closed"].map(s => {
                const count = allItems.filter(i => statuses[i.id] === s).length;
                const pct   = Math.round((count / allItems.length) * 100);
                return (
                  <div key={s} style={{ marginBottom: 10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:"rgba(245,240,232,.65)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{STATUS_LABEL[s]}</span>
                      <span style={{ fontSize:11, fontWeight:900, color:"#E8D08A" }}>{count}</span>
                    </div>
                    <div style={{ height:5, borderRadius:99, background:"rgba(255,255,255,.05)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background: s==="served"?"#3A7A6E": s==="active"?"#C9A84C": s==="closed"?"#E85555":"rgba(255,255,255,.1)", borderRadius:99, transition:"width 0.6s" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="k-printHint">Print or save manifest before service begins.</div>
          </div>
        </div>

      </div>

      {/* ── Stock detail modal ── */}
      {stockModal && (
        <div className="k-modalOverlay" onClick={() => setStockModal(null)}>
          <div className="k-modal" onClick={e => e.stopPropagation()}>
            <div className="k-modal__head">
              <div className="k-modal__title">Stock detail — {stockModal.name}</div>
              <button className="k-modal__close" onClick={() => setStockModal(null)}>✕</button>
            </div>
            <div className="k-modal__body">
              <div className="k-stockModal__row"><span className="k-stockModal__k">Current stock</span><span>{stockModal.current} {stockModal.unit}</span></div>
              <div className="k-stockModal__row"><span className="k-stockModal__k">Required</span><span>{stockModal.required} {stockModal.unit}</span></div>
              {stockModal.shortfall && (
                <div className="k-stockModal__row"><span className="k-stockModal__k">Shortfall</span><span className="k-stockModal__v--bad">−{stockModal.shortfall} {stockModal.unit}</span></div>
              )}
              <div className="k-stockModal__note">
                {stockModal.status === "bad"
                  ? "Critical shortfall. Contact store manager immediately or arrange substitution."
                  : "Marginal shortfall. Monitor during prep — may need partial substitution."}
              </div>
              <div className="k-stockModal__tagRow">
                <span className="k-stockModal__tag">📞 Call store manager</span>
                <span className="k-stockModal__tag">🔁 Find substitute</span>
                <span className="k-stockModal__tag">📋 Log shortage</span>
              </div>
              <div className="k-stockModal__actions">
                <button className="k-btn k-btn--gold" onClick={() => setStockModal(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
