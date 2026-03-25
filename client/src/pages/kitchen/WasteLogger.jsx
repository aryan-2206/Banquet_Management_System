import { useState, useMemo } from "react";

const T = {
  bg:"#080810", surface:"rgba(255,255,255,.025)", border:"rgba(201,168,76,.14)",
  gold:"#C9A84C", goldText:"#E8D08A", text:"#F5F0E8",
  muted:"rgba(245,240,232,.6)", dim:"rgba(245,240,232,.35)",
  green:"#3A7A6E", red:"#E85555", amber:"#C07A2A", radius:18,
};

/* Pre-filled from MenuManifest — in real app: from Redux bookingSlice */
const EVENT_DISHES = {
  1: [
    { id:"w1",  course:"Welcome Drinks",  name:"Virgin Mojito",          prepared:160, unit:"glasses" },
    { id:"w2",  course:"Welcome Drinks",  name:"Masala Chaas",            prepared:80,  unit:"glasses" },
    { id:"w3",  course:"Starters",        name:"Paneer Tikka",            prepared:48,  unit:"kg"      },
    { id:"w4",  course:"Starters",        name:"Chicken Seekh Kebab",     prepared:32,  unit:"kg"      },
    { id:"w5",  course:"Starters",        name:"Veg Spring Rolls",        prepared:200, unit:"pcs"     },
    { id:"w6",  course:"Soup",            name:"Tomato Basil Shorba",     prepared:80,  unit:"L"       },
    { id:"w7",  course:"Soup",            name:"Sweet Corn Chicken",      prepared:40,  unit:"L"       },
    { id:"w8",  course:"Main Course",     name:"Dal Makhani",             prepared:40,  unit:"kg"      },
    { id:"w9",  course:"Main Course",     name:"Paneer Butter Masala",    prepared:30,  unit:"kg"      },
    { id:"w10", course:"Main Course",     name:"Mutton Rogan Josh",       prepared:25,  unit:"kg"      },
    { id:"w11", course:"Main Course",     name:"Veg Kolhapuri",           prepared:20,  unit:"kg"      },
    { id:"w12", course:"Rice & Breads",   name:"Dum Biryani (Veg)",       prepared:35,  unit:"kg"      },
    { id:"w13", course:"Rice & Breads",   name:"Chicken Biryani",         prepared:30,  unit:"kg"      },
    { id:"w14", course:"Rice & Breads",   name:"Naan & Roti",             prepared:640, unit:"pcs"     },
    { id:"w15", course:"Dessert",         name:"Gulab Jamun",             prepared:640, unit:"pcs"     },
    { id:"w16", course:"Dessert",         name:"Phirni",                  prepared:320, unit:"cups"    },
    { id:"w17", course:"Dessert",         name:"Chocolate Mousse",        prepared:320, unit:"cups"    },
  ],
  2: [
    { id:"w18", course:"Starters",    name:"Bruschetta",       prepared:85,  unit:"pcs"  },
    { id:"w19", course:"Starters",    name:"Chicken Satay",    prepared:170, unit:"pcs"  },
    { id:"w20", course:"Main Course", name:"Dal Makhani",      prepared:14,  unit:"kg"   },
    { id:"w21", course:"Main Course", name:"Grilled Fish",     prepared:17,  unit:"kg"   },
    { id:"w22", course:"Dessert",     name:"Tiramisu",         prepared:85,  unit:"cups" },
  ],
};

const EVENTS = [
  { id:1, name:"Mehta Wedding",    hall:"Grand Ballroom", pax:{planned:320,arrived:287}, tier:"Elite",   time:"19:00" },
  { id:2, name:"Sharma Corporate", hall:"Crystal Hall",   pax:{planned:85, arrived:71},  tier:"Premium", time:"20:30" },
];

const REASONS = [
  "Over-prepped","Low demand","Late arrivals","Dietary mismatch","Quality issue","Event ran short","Other",
];

/* ── CSV export ── */
function toCSV(rows, eventName) {
  const header = ["Dish","Course","Prepared","Leftover","Waste %","Reason","Fully Consumed"];
  const lines  = rows.map(r => [
    r.name, r.course,
    `${r.prepared} ${r.unit}`,
    r.fullyConsumed ? "0" : `${r.leftover||0} ${r.unit}`,
    r.fullyConsumed ? "0%" : `${wastePercent(r)}%`,
    r.reason || "—",
    r.fullyConsumed ? "Yes" : "No",
  ]);
  const csv = [header, ...lines].map(l => l.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `WasteReport_${eventName.replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function wastePercent(row) {
  if (row.fullyConsumed || !row.leftover) return 0;
  return Math.round((row.leftover / row.prepared) * 100);
}

function sustainScore(totalWastePct) {
  if (totalWastePct <= 5)  return { score:95, label:"Excellent",        color:"#3A7A6E" };
  if (totalWastePct <= 10) return { score:80, label:"Good",             color:"#5FBF8A" };
  if (totalWastePct <= 20) return { score:55, label:"Needs Improvement",color:"#C07A2A" };
  return                          { score:25, label:"Poor",             color:"#E85555" };
}

function Chip({ children, color, bg }) {
  return <span style={{ padding:"3px 9px", borderRadius:99, fontSize:11, fontWeight:900, background:bg||"rgba(201,168,76,.1)", color:color||T.goldText, border:`1px solid ${color||T.gold}33` }}>{children}</span>;
}

export default function WasteLogger() {
  const [activeEvent, setActiveEvent] = useState(1);
  const [rows, setRows]               = useState(() => {
    const init = {};
    Object.values(EVENT_DISHES).flat().forEach(d => { init[d.id] = { leftover:0, reason:"", fullyConsumed:false }; });
    return init;
  });
  const [submitted, setSubmitted]  = useState({});
  const [aiLoading, setAiLoading]  = useState(false);
  const [aiInsight, setAiInsight]  = useState(null);

  const event   = EVENTS.find(e => e.id === activeEvent);
  const dishes  = EVENT_DISHES[activeEvent];
  const courses = [...new Set(dishes.map(d => d.course))];

  function updateRow(id, field, val) {
    setRows(p => ({ ...p, [id]: { ...p[id], [field]: val } }));
  }

  /* ── Aggregates ── */
  const stats = useMemo(() => {
    const totalPrepared  = dishes.reduce((s, d) => s + d.prepared, 0);
    const totalLeftover  = dishes.reduce((s, d) => rows[d.id]?.fullyConsumed ? 0 : s + (Number(rows[d.id]?.leftover) || 0), 0);
    const wastePct       = totalPrepared > 0 ? Math.round((totalLeftover / totalPrepared) * 100) : 0;
    const wastedDishes   = dishes.filter(d => !rows[d.id]?.fullyConsumed && (rows[d.id]?.leftover || 0) > 0);
    return { totalPrepared, totalLeftover, wastePct, wastedDishes };
  }, [rows, dishes]);

  const sustain = sustainScore(stats.wastePct);

  /* ── Simulate AI insight ── */
  function fetchAIInsight() {
    setAiLoading(true);
    setTimeout(() => {
      setAiInsight(
        stats.wastedDishes.length === 0
          ? "Outstanding performance — zero measurable waste logged tonight. Recommend using tonight's portion estimates as the baseline template for Elite tier weddings of 280–300 pax."
          : `${stats.wastedDishes.slice(0,2).map(d=>d.name).join(" and ")} accounted for the highest waste tonight. For events under ${event.pax.planned} pax, consider reducing preparation by 12–15% or switching to live counter format to reduce over-prep risk. Reviewing the last 4 similar events shows a consistent pattern — flag for Sales team's menu engine.`
      );
      setAiLoading(false);
    }, 1800);
  }

  function handleSubmit() {
    setSubmitted(p => ({ ...p, [activeEvent]: true }));
    fetchAIInsight();
  }

  function handleDownload() {
    const exportRows = dishes.map(d => ({ ...d, ...rows[d.id] }));
    toCSV(exportRows, event.name);
  }

  const isSubmitted = submitted[activeEvent];

  return (
    <div style={{ background:T.bg, minHeight:"100vh", padding:"28px 32px 80px", fontFamily:"'DM Sans',sans-serif", color:T.text }}>
      <style>{`
        @keyframes wdf { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wdsk{ 0%{opacity:.4;background-position:200% 0} 100%{opacity:.4;background-position:-200% 0} }
        @keyframes wdspin{ to{transform:rotate(360deg)} }
        .wd-row:hover { background:rgba(201,168,76,.04) !important; }
        .wd-btn:hover { background:rgba(201,168,76,.2) !important; }
        .wd-btn-g:hover { filter:brightness(1.1) !important; }
        .wd-tab:hover { border-color:rgba(201,168,76,.4) !important; }
        .wd-check:hover { border-color:#3A7A6E !important; }
        .wd-quick:hover { background:rgba(58,122,110,.15) !important; border-color:rgba(58,122,110,.3) !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:28, animation:"wdf .35s ease both" }}>
        <div style={{ fontSize:11, color:"rgba(201,168,76,.7)", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:800, marginBottom:6 }}>Post-Event Audit</div>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:700, lineHeight:1 }}>Waste Logger</div>
        <div style={{ fontSize:13, color:T.muted, marginTop:5 }}>Log leftover quantities by dish · Download CSV · Get AI recommendations</div>
      </div>

      {/* Event tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {EVENTS.map(ev => (
          <button key={ev.id} className="wd-tab" onClick={()=>setActiveEvent(ev.id)} style={{ padding:"10px 14px", borderRadius:14, border:`1px solid ${activeEvent===ev.id?"rgba(201,168,76,.55)":"rgba(201,168,76,.18)"}`, background:activeEvent===ev.id?"rgba(201,168,76,.08)":"rgba(255,255,255,.02)", color:activeEvent===ev.id?"#F5F0E8":"rgba(245,240,232,.7)", cursor:"pointer", fontSize:12, fontWeight:800, transition:"all .18s" }}>
            {ev.name} · {ev.time}
            {submitted[ev.id] && <span style={{ marginLeft:8, color:T.green }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Event summary strip */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"16px 20px", marginBottom:20, display:"flex", gap:28, flexWrap:"wrap", animation:"wdf .4s ease both" }}>
        {[
          { label:"Hall",         val:event.hall           },
          { label:"Tier",         val:event.tier           },
          { label:"Planned pax",  val:event.pax.planned    },
          { label:"Arrived pax",  val:event.pax.arrived    },
          { label:"Total dishes", val:dishes.length        },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:T.muted, marginBottom:3 }}>{s.label}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:T.goldText }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Two-col: form left, summary right */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:18, alignItems:"start" }}>

        {/* Dish rows by course */}
        <div>
          {courses.map(course => (
            <div key={course} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, marginBottom:14, overflow:"hidden", animation:"wdf .45s ease both" }}>
              {/* Course header */}
              <div style={{ padding:"12px 16px", background:"rgba(255,255,255,.015)", borderBottom:`1px solid rgba(201,168,76,.1)`, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700 }}>{course}</div>
                <div style={{ fontSize:11, color:T.muted, fontWeight:800 }}>{dishes.filter(d=>d.course===course).length} dishes</div>
              </div>

              {/* Column headers */}
              <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr 1fr 1.2fr .8fr", gap:12, padding:"10px 16px", fontSize:11, fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", color:T.muted, borderBottom:`1px solid rgba(201,168,76,.07)` }}>
                <span>Dish</span><span>Prepared</span><span>Leftover</span><span>Reason</span><span>Done</span>
              </div>

              {/* Dish rows */}
              {dishes.filter(d=>d.course===course).map(dish => {
                const r   = rows[dish.id];
                const pct = wastePercent({ ...dish, ...r });
                const bad = pct > 20;
                return (
                  <div key={dish.id} className="wd-row" style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr 1fr 1.2fr .8fr", gap:12, padding:"13px 16px", borderBottom:`1px solid rgba(201,168,76,.06)`, alignItems:"center", background:bad?"rgba(232,85,85,.03)":"transparent", transition:"background .18s" }}>

                    {/* Dish name */}
                    <div>
                      <div style={{ fontSize:13, fontWeight:800, color:T.text, marginBottom:3 }}>{dish.name}</div>
                      {pct > 0 && <Chip color={bad?T.red:T.amber} bg={bad?"rgba(232,85,85,.1)":"rgba(192,122,42,.1)"}>{pct}% waste</Chip>}
                    </div>

                    {/* Prepared */}
                    <div style={{ fontSize:13, color:T.muted, fontWeight:800 }}>{dish.prepared} <span style={{color:T.dim, fontSize:11}}>{dish.unit}</span></div>

                    {/* Leftover input */}
                    <div>
                      <input
                        type="number"
                        min={0}
                        max={dish.prepared}
                        value={r.fullyConsumed ? "" : (r.leftover || "")}
                        disabled={r.fullyConsumed || isSubmitted}
                        placeholder="0"
                        onChange={e => updateRow(dish.id,"leftover",Number(e.target.value))}
                        style={{ width:"100%", padding:"8px 10px", background:"rgba(255,255,255,.04)", border:`1px solid ${bad?"rgba(232,85,85,.3)":"rgba(201,168,76,.18)"}`, borderRadius:10, color:T.text, fontSize:13, fontWeight:800, fontFamily:"'DM Sans',sans-serif", outline:"none", opacity:r.fullyConsumed?0.4:1 }}
                      />
                      <div style={{ fontSize:10, color:T.dim, marginTop:3 }}>{dish.unit}</div>
                    </div>

                    {/* Reason dropdown */}
                    <select
                      value={r.reason}
                      disabled={r.fullyConsumed || isSubmitted}
                      onChange={e => updateRow(dish.id,"reason",e.target.value)}
                      style={{ width:"100%", padding:"8px 10px", background:"rgba(255,255,255,.04)", border:`1px solid rgba(201,168,76,.18)`, borderRadius:10, color:r.reason?T.text:T.dim, fontSize:12, fontWeight:800, fontFamily:"'DM Sans',sans-serif", outline:"none", opacity:r.fullyConsumed?0.4:1 }}
                    >
                      <option value="">Select</option>
                      {REASONS.map(rs => <option key={rs} value={rs} style={{background:"#14141f"}}>{rs}</option>)}
                    </select>

                    {/* Fully consumed toggle */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                      <button
                        className="wd-quick wd-check"
                        disabled={isSubmitted}
                        onClick={() => updateRow(dish.id,"fullyConsumed",!r.fullyConsumed)}
                        style={{ width:32, height:32, borderRadius:10, border:`1.5px solid ${r.fullyConsumed?"#3A7A6E":"rgba(201,168,76,.2)"}`, background:r.fullyConsumed?"rgba(58,122,110,.15)":"rgba(255,255,255,.02)", color:r.fullyConsumed?"#5FBF8A":T.dim, fontSize:14, fontWeight:900, cursor:"pointer", transition:"all .18s" }}
                      >{r.fullyConsumed?"✓":"○"}</button>
                      <span style={{ fontSize:9, color:T.dim, fontWeight:800, textAlign:"center" }}>All gone</span>
                    </div>

                  </div>
                );
              })}
            </div>
          ))}

          {/* Submit / download bar */}
          <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:8 }}>
            {!isSubmitted
              ? <button className="wd-btn-g" onClick={handleSubmit} style={{ padding:"13px 28px", borderRadius:14, background:`linear-gradient(135deg,${T.gold},#8A6520)`, color:"#080810", fontSize:13, fontWeight:900, border:"none", cursor:"pointer", transition:"filter .18s" }}>
                  Submit waste report
                </button>
              : <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 18px", borderRadius:14, background:"rgba(58,122,110,.12)", border:"1px solid rgba(58,122,110,.25)", color:"#5FBF8A", fontSize:13, fontWeight:800 }}>✓ Report submitted</div>
            }
            <button className="wd-btn" onClick={handleDownload} style={{ padding:"13px 24px", borderRadius:14, background:"rgba(201,168,76,.07)", border:`1px solid rgba(201,168,76,.3)`, color:T.goldText, fontSize:13, fontWeight:900, cursor:"pointer", transition:"background .18s" }}>
              ⬇ Download CSV
            </button>
          </div>
        </div>

        {/* Sticky summary */}
        <div style={{ position:"sticky", top:18, display:"flex", flexDirection:"column", gap:14 }}>

          {/* Waste summary card */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"20px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:700, color:T.goldText, marginBottom:14 }}>Waste summary</div>
            {[
              { label:"Total prepared", val:`${stats.totalPrepared} units` },
              { label:"Total leftover",  val:`${stats.totalLeftover} units`, color:stats.wastePct>15?T.red:stats.wastePct>7?T.amber:T.green },
              { label:"Waste %",         val:`${stats.wastePct}%`,           color:stats.wastePct>15?T.red:stats.wastePct>7?T.amber:T.green },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid rgba(201,168,76,.08)` }}>
                <span style={{ fontSize:12, color:T.muted, fontWeight:800 }}>{s.label}</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:700, color:s.color||T.text }}>{s.val}</span>
              </div>
            ))}

            {/* Waste % bar */}
            <div style={{ marginTop:12 }}>
              <div style={{ height:8, borderRadius:99, background:"rgba(255,255,255,.05)", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(stats.wastePct*3,100)}%`, background:sustain.color, borderRadius:99, transition:"width .8s cubic-bezier(0.22,1,0.36,1)" }} />
              </div>
            </div>
          </div>

          {/* Sustainability score */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"20px", textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase", color:T.muted, marginBottom:12 }}>Sustainability score</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, fontWeight:700, color:sustain.color, lineHeight:1, marginBottom:6 }}>{sustain.score}</div>
            <div style={{ fontSize:12, fontWeight:900, color:sustain.color }}>{sustain.label}</div>
            <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,.05)", overflow:"hidden", margin:"14px 0 8px" }}>
              <div style={{ height:"100%", width:`${sustain.score}%`, background:sustain.color, borderRadius:99, transition:"width 1s" }} />
            </div>
            <div style={{ fontSize:11, color:T.dim }}>MTD average: 72 / Good</div>
          </div>

          {/* AI insight card */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"20px" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontWeight:700, color:T.goldText, marginBottom:12 }}>AI recommendation</div>
            {!aiInsight && !aiLoading && (
              <div style={{ fontSize:12, color:T.muted, marginBottom:12, lineHeight:1.6 }}>Submit the report to generate a Featherless.ai insight for this event.</div>
            )}
            {aiLoading && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[80,60,90].map((w,i) => (
                  <div key={i} style={{ height:10, borderRadius:99, background:"rgba(201,168,76,.08)", width:`${w}%`, animation:"wdsk 1.4s linear infinite", backgroundImage:"linear-gradient(90deg,transparent,rgba(201,168,76,.12),transparent)", backgroundSize:"200% 100%" }} />
                ))}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4, color:T.muted, fontSize:12 }}>
                  <div style={{ width:12, height:12, border:`2px solid rgba(201,168,76,.3)`, borderTopColor:T.gold, borderRadius:"50%", animation:"wdspin .8s linear infinite" }} />
                  Analysing with Featherless.ai...
                </div>
              </div>
            )}
            {aiInsight && (
              <div style={{ animation:"wdf .5s ease both" }}>
                <div style={{ fontSize:12.5, color:T.text, lineHeight:1.7, marginBottom:14 }}>{aiInsight}</div>
                <button className="wd-btn" style={{ width:"100%", padding:"10px", borderRadius:12, background:"rgba(201,168,76,.07)", border:`1px solid rgba(201,168,76,.25)`, color:T.goldText, fontSize:12, fontWeight:900, cursor:"pointer", transition:"background .18s" }}>
                  ➝ Flag for menu engine
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
