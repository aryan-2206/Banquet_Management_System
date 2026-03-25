import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useKitchenStore from "../../store/kitchenSlice";
import "./MenuManifest.css";

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

// Helper to generate dynamic courses based on Tier and Pax
function generateCourses(eventId, tier, pax) {
  const isPremium = tier === 'Premium' || tier === 'Elite';
  
  return [
    {
      name: "Starters",
      items: [
        { id: `${eventId}-s1`, name: "Paneer Tikka", cuisine: "North Indian", diet: ["VEG"], station: "Station 3 — Tandoor", plannedQty: `${Math.round(pax * 0.15)} kg`, status: "pending" },
        ...(isPremium ? [{ id: `${eventId}-s2`, name: "Chicken Seekh Kebab", cuisine: "North Indian", diet: ["NON-VEG", "HALAL"], station: "Station 3 — Tandoor", plannedQty: `${Math.round(pax * 0.1)} kg`, status: "pending" }] : []),
      ]
    },
    {
      name: "Main Course",
      items: [
        { id: `${eventId}-m1`, name: "Dal Makhani", cuisine: "North Indian", diet: ["VEG"], station: "Station 2 — Hot", plannedQty: `${Math.round(pax * 0.12)} kg`, status: "pending" },
        { id: `${eventId}-m2`, name: "Dum Biryani", cuisine: "Hyderabadi", diet: ["VEG", "GF"], station: "Station 4 — Dum", plannedQty: `${Math.round(pax * 0.1)} kg`, status: "pending" },
      ]
    },
    {
      name: "Desserts",
      items: [
        { id: `${eventId}-d1`, name: "Gulab Jamun", cuisine: "Indian", diet: ["VEG"], station: "Station 5 — Pastry", plannedQty: `${Math.round(pax * 2)} pcs`, status: "pending" },
      ]
    }
  ];
}

export default function MenuManifest() {
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get("event");
  
  const { events, fetchEvents, loading } = useKitchenStore();
  
  const [activeEvent, setActiveEvent] = useState(null);
  
  // Local state for the UI toggles
  const [openCourses, setOpenCourses] = useState({});
  const [statuses, setStatuses] = useState({});
  const [synergyDismissed, setSynergyDismissed] = useState({});
  const [portions, setPortions] = useState({});
  const [stockModal, setStockModal] = useState(null);

  // Hydrate events
  useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, [events.length, fetchEvents]);

  // Set active event and generate initial states
  useEffect(() => {
    if (events.length > 0) {
      const targetId = eventIdParam && events.some(e => e.id === eventIdParam) ? eventIdParam : events[0].id;
      setActiveEvent(targetId);
      
      const newOpenCourses = {};
      const newStatuses = {};
      const newPortions = {};
      
      events.forEach(ev => {
        const courses = generateCourses(ev.id, ev.tier, ev.pax);
        courses.forEach(c => {
          newOpenCourses[`${ev.id}-${c.name}`] = true;
          c.items.forEach(i => {
            newStatuses[i.id] = i.status;
            newPortions[i.id] = 0;
          });
        });
      });
      
      setOpenCourses(newOpenCourses);
      setStatuses(newStatuses);
      setPortions(newPortions);
    }
  }, [events, eventIdParam]);

  if (loading || !activeEvent) {
    return <div style={{ padding: '60px', color: '#9D9880', background: '#080810', minHeight: '100vh', textAlign: 'center' }}>Loading Menu Manifest...</div>;
  }

  if (events.length === 0) {
    return <div style={{ padding: '60px', color: '#9D9880', background: '#080810', minHeight: '100vh', textAlign: 'center' }}>No live events for today.</div>;
  }

  const eventData = events.find(e => e.id === activeEvent) || events[0];
  const courses = generateCourses(eventData.id, eventData.tier, eventData.pax);
  
  const pct = eventData.pax > 0 ? Math.round((eventData.arrived / eventData.pax) * 100) : 0;
  const delta = eventData.arrived - eventData.pax;

  const allItems = courses.flatMap(c => c.items);
  const vegCount = allItems.filter(i => i.diet.includes("VEG") && !i.diet.includes("NON-VEG")).length;
  const nonVegCount = allItems.filter(i => i.diet.includes("NON-VEG")).length;
  const jainCount = allItems.filter(i => i.diet.includes("JAIN")).length;
  const halalCount = allItems.filter(i => i.diet.includes("HALAL")).length;
  const gfCount = allItems.filter(i => i.diet.includes("GF")).length;

  function toggleCourse(key) {
    setOpenCourses(p => ({ ...p, [key]: !p[key] }));
  }

  function advanceStatus(id) {
    setStatuses(p => {
      const next = STATUS_NEXT[p[id] || "pending"];
      return next ? { ...p, [id]: next } : p;
    });
  }

  function isCourseComplete(course) {
    return course.items.every(i => statuses[i.id] === "served" || statuses[i.id] === "closed");
  }

  function handlePrint() { window.print(); }

  const stockMap = {};
  function stockStatus(id) { return "ok"; }

  return (
    <div className="k-manifest" style={{ padding: "28px 32px 80px", background: "#080810", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#F5F0E8" }}>

      {/* ── Top ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(201,168,76,.7)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, marginBottom: 6 }}>Kitchen · Menu Manifest</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: "#F5F0E8", lineHeight: 1 }}>Tonight's Preparation</div>
        <div style={{ fontSize: 13, color: "rgba(245,240,232,.55)", marginTop: 5 }}>Dishes assigned from live database bookings</div>
      </div>

      <div className="k-manifest__top">
        {/* Event tabs */}
        <div className="k-tabs" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {events.map(ev => (
            <button
              key={ev.id}
              className={`k-tab${activeEvent === ev.id ? " k-tab--active" : ""}`}
              onClick={() => setActiveEvent(ev.id)}
            >
              {ev.name} · {ev.pax} pax
              <span style={{ marginLeft: 6, padding: "2px 7px", borderRadius: 99, fontSize: 10, background: ev.tier === "Elite" ? "rgba(201,168,76,.2)" : "rgba(91,143,232,.15)", color: ev.tier === "Elite" ? "#E8D08A" : "#5B8FE8", fontWeight: 900 }}>
                {ev.tier}
              </span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="k-manifest__controls">
          <span className="k-lastSynced">⟳ Live DB Sync</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="k-btn k-btn--outline" onClick={handlePrint}>⎙ Print Manifest</button>
          </div>
        </div>
      </div>

      {/* ── Headcount banner ── */}
      <div className={`k-headcountBanner${Math.abs(delta) > 30 ? " k-headcountBanner--warn" : ""}`}>
        <div>
          <div className="k-headcountBanner__title">
            Headcount — {eventData.hall} · {eventData.time}
          </div>
          <div className="k-headcountBanner__sub">
            Planned: {eventData.pax} · Arrived: {eventData.arrived} · Check-in: {pct}%
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="k-manifest__grid">

        {/* ── Course accordions ── */}
        <div>
          {courses.map(course => {
            const key      = `${eventData.id}-${course.name}`;
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
                      const st  = statuses[item.id] || 'pending';
                      const sst = stockStatus(item.id);

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
                          </div>

                          {/* Col 2: Quantity */}
                          <div className="k-qtyLines">
                            <div className="k-qtyLine">
                              <span className="k-qtyLabel">Planned</span>
                              <span className="k-qtyVal">{item.plannedQty}</span>
                            </div>
                          </div>

                          {/* Col 3: Portions stepper */}
                          <div>
                            <div className="k-stepper">
                              <button
                                className="k-stepper__btn"
                                disabled={!portions[item.id] || st === "closed"}
                                onClick={() => setPortions(p => ({ ...p, [item.id]: Math.max(0, p[item.id] - 1) }))}
                              >−</button>
                              <div className="k-stepper__mid">
                                <div className="k-stepper__label">Portions out</div>
                                <div className="k-stepper__value">{portions[item.id] || 0}</div>
                              </div>
                              <button
                                className="k-stepper__btn"
                                disabled={st === "closed"}
                                onClick={() => setPortions(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}
                              >+</button>
                            </div>
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
                            <div className={`k-stockDot k-stockDot--ok`} title="Click for stock detail" />
                            <div className="k-stockOk">OK</div>
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
            <div style={{ marginTop: 18, borderTop: "1px solid rgba(201,168,76,.1)", paddingTop: 16 }}>
              <div className="k-summaryCard__title" style={{ marginBottom: 10 }}>Prep progress</div>
              {["pending","active","served","closed"].map(s => {
                const count = allItems.filter(i => statuses[i.id] === s).length;
                const pct   = Math.round((count / Math.max(allItems.length, 1)) * 100);
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
          </div>
        </div>

      </div>
    </div>
  );
}
