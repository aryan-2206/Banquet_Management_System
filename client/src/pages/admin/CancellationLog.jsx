import React, { useState } from "react";
import "./CancellationLog.css";

const MOCK_CANCELLATIONS = [
  { id: "c1", client: "Aditi S.", type: "Wedding", date: "2026-04-12", hall: "Grand Ballroom", tier: "Elite", pax: 400, value: 1200000, logDate: "2026-03-20", manager: "Riya", stage: "Menu selection", reason: "Price too high", refund: "No refund (None paid)", recovery: "Counter-offer rejected", sentiment: "Neutral" },
  { id: "c2", client: "Verma Corp", type: "Corporate", date: "2026-03-28", hall: "Sapphire Lounge", tier: "Premium", pax: 150, value: 450000, logDate: "2026-03-15", manager: "Karan", stage: "Confirmed", reason: "Event cancelled entirely", refund: "Partial (₹50k retained)", recovery: "N/A", sentiment: "Disappointed" },
  { id: "c3", client: "Nair Birthday", type: "Birthday", date: "2026-05-02", hall: "Ruby Hall", tier: "Standard", pax: 80, value: 120000, logDate: "2026-03-22", manager: "Riya", stage: "Enquiry", reason: "Competing venue chosen", refund: "N/A", recovery: "Pending", sentiment: "Might return", competitor: "Taj Lands End" },
];

const REASONS = [
  "Price too high",
  "Date not available",
  "Competing venue chosen",
  "Client budget reduced",
  "Event cancelled entirely",
  "No response (ghost)"
];

const FUNNEL_DATA = [
  { stage: "Enquiry → Menu selection", dropoff: 45, reason: "Pricing issue" },
  { stage: "Menu selection → Finance", dropoff: 30, reason: "Process friction" },
  { stage: "Finance → Confirmation", dropoff: 20, reason: "Payment hesitation" },
  { stage: "Post-confirmation", dropoff: 5, reason: "Serious issue" },
];

export default function CancellationLog() {
  const [view, setView] = useState("dashboard"); // dashboard, log, pipeline
  const [postMortemOpen, setPostMortemOpen] = useState(false);

  // Stats
  const totalLost = MOCK_CANCELLATIONS.reduce((acc, c) => acc + c.value, 0);
  const retained = 50000;
  const netLoss = totalLost - retained;

  return (
    <div className="c-root noise">
      <header className="c-header animate-fade-in">
        <div>
          <h1 className="c-title">Cancellation Intelligence</h1>
          <div className="c-sub">Turn lost leads into strategic analytics</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="c-btn c-btn--outline" onClick={() => setPostMortemOpen(true)}>+ Log Cancellation</button>
          <button className="c-btn c-btn--primary">Export CSV ⬇</button>
        </div>
      </header>

      {/* Navigation */}
      <div className="c-toggles animate-fade-up delay-100">
        <button className={`c-toggleBtn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>Analytics Dashboard</button>
        <button className={`c-toggleBtn ${view === 'log' ? 'active' : ''}`} onClick={() => setView('log')}>Cancellation Log</button>
        <button className={`c-toggleBtn ${view === 'pipeline' ? 'active' : ''}`} onClick={() => setView('pipeline')}>Recovery Pipeline</button>
      </div>

      {view === 'dashboard' && (
        <div className="c-dashboard grid-layout animate-fade-up delay-200">
          
          {/* Revenue Impact Panel */}
          <div className="c-panel glass">
            <h2 className="c-panel__title">Revenue Impact (This Month)</h2>
            <div className="c-statGrid">
              <div className="c-statCard">
                <div className="c-statLabel">Enquiry Value Lost</div>
                <div className="c-statVal" style={{ color: "#E85555" }}>₹{(totalLost / 100000).toFixed(2)}L</div>
              </div>
              <div className="c-statCard">
                <div className="c-statLabel">Deposits Retained</div>
                <div className="c-statVal" style={{ color: "#5FBF8A" }}>₹{(retained / 1000).toFixed(0)}k</div>
              </div>
              <div className="c-statCard">
                <div className="c-statLabel">Net Revenue Loss</div>
                <div className="c-statVal">₹{(netLoss / 100000).toFixed(2)}L</div>
              </div>
            </div>
            <div className="c-tierLoss">
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Loss by Tier</div>
              <div className="c-tierBarWrapper">
                <div className="c-tierBar" style={{ width: "67%", background: "var(--gold)" }} title="Elite: 67%"></div>
                <div className="c-tierBar" style={{ width: "25%", background: "#5B8FE8" }} title="Premium: 25%"></div>
                <div className="c-tierBar" style={{ width: "8%", background: "#E85555" }} title="Standard: 8%"></div>
              </div>
              <div className="c-tierLabels">
                <span><span className="c-dot" style={{background:"var(--gold)"}}></span> Elite</span>
                <span><span className="c-dot" style={{background:"#5B8FE8"}}></span> Premium</span>
                <span><span className="c-dot" style={{background:"#E85555"}}></span> Standard</span>
              </div>
            </div>
          </div>

          {/* Reason Breakdown */}
          <div className="c-panel glass">
            <h2 className="c-panel__title">Loss Mechanics & Competitors</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div className="c-priceSens">
                <div style={{ fontSize: "1.8rem", color: "var(--gold-light)", fontFamily: "serif" }}>42%</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Price Sensitivity Index</div>
              </div>
              <div className="c-priceSens" style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.8rem", color: "#E85555", fontFamily: "serif" }}>Taj Lands End</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Top Competitor (4 losses)</div>
              </div>
            </div>
            
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Reasons Breakdown</div>
            <div className="c-mockChart">
              <div className="c-mockChartRow"><div className="c-mockChartLabel">Price too high</div><div className="c-mockChartBar"><div style={{width:"42%", background:"#E85555"}}></div></div><div className="c-mockChartVal">42%</div></div>
              <div className="c-mockChartRow"><div className="c-mockChartLabel">Competitor chosen</div><div className="c-mockChartBar"><div style={{width:"28%", background:"#C9A84C"}}></div></div><div className="c-mockChartVal">28%</div></div>
              <div className="c-mockChartRow"><div className="c-mockChartLabel">Date unavailable</div><div className="c-mockChartBar"><div style={{width:"15%", background:"#5B8FE8"}}></div></div><div className="c-mockChartVal">15%</div></div>
              <div className="c-mockChartRow"><div className="c-mockChartLabel">Ghosted</div><div className="c-mockChartBar"><div style={{width:"10%", background:"rgba(255,255,255,0.2)"}}></div></div><div className="c-mockChartVal">10%</div></div>
            </div>
          </div>

          {/* Funnel Drop-off */}
          <div className="c-panel glass" style={{ gridColumn: "1 / -1" }}>
            <h2 className="c-panel__title">Funnel Drop-off Analysis</h2>
            <div className="c-funnel">
              {FUNNEL_DATA.map((f, i) => (
                <div key={i} className="c-funnelRow">
                  <div className="c-funnelStage">{f.stage}</div>
                  <div className="c-funnelVisual">
                    <div className="c-funnelBar" style={{ width: `${100 - (i * 15)}%`, opacity: 1 - (i*0.15) }}></div>
                  </div>
                  <div className="c-funnelDrop">
                    <span style={{color:"#E85555"}}>{f.dropoff}% loss</span> • {f.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Strip */}
          <div className="c-panel" style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(201, 168, 76, 0.1), rgba(201, 168, 76, 0.02))", border: "1px solid rgba(201,168,76,0.2)" }}>
            <h2 className="c-panel__title" style={{ color: "var(--gold)" }}>✨ AI Strategic Insights (Featherless)</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.5 }}>
              "You've lost 4 Elite tier bookings this quarter to Taj Lands End — their pricing is typically 12% lower. Consider deploying a loyalty incentive or complimentary add-on (like free mocktail bar) for repeat corporate clients to reduce churn at this tier while preserving base price margins."
            </p>
          </div>

        </div>
      )}

      {view === 'log' && (
        <div className="c-log animate-fade-up delay-200">
          <div className="c-filters glass">
             <input type="date" className="c-input" />
             <select className="c-input"><option>All Reasons</option>{REASONS.map(r => <option key={r}>{r}</option>)}</select>
             <select className="c-input"><option>All Tiers</option><option>Elite</option><option>Premium</option><option>Standard</option></select>
             <input type="text" className="c-input" placeholder="Search client name..." style={{flex: 1}} />
          </div>

          <div className="c-tableCard glass">
            <table className="c-table">
              <thead>
                <tr>
                  <th>Client & Event</th>
                  <th>Tier & Value</th>
                  <th>Lost At Stage</th>
                  <th>Reason</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CANCELLATIONS.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{fontWeight:600}}>{c.client}</div>
                      <div style={{fontSize:"0.8rem", color:"rgba(255,255,255,0.5)"}}>{c.type} • {c.date}</div>
                    </td>
                    <td>
                      <div style={{color:"var(--gold)"}}>{c.tier}</div>
                      <div style={{fontSize:"0.85rem"}}>₹{(c.value / 100000).toFixed(2)}L</div>
                    </td>
                    <td>{c.stage}</td>
                    <td>{c.reason} <br/> <span style={{fontSize:"0.75rem", color:"rgba(255,255,255,0.4)"}}>To: {c.competitor || "Unknown"}</span></td>
                    <td>
                      <span className={`c-sentiment c-sentiment--${c.sentiment.replace(" ","").toLowerCase()}`}>{c.sentiment}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'pipeline' && (
        <div className="c-pipeline animate-fade-up delay-200">
          <div className="c-panel glass">
            <h2 className="c-panel__title">Re-engagement Pipeline</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "20px" }}>Clients marked as "Might Return". Follow up to recover lost revenue.</p>
            
            <div className="c-recoveryCard">
              <div className="c-recoveryCard__left">
                <div style={{fontSize:"1.1rem", fontWeight:600}}>Nair Birthday</div>
                <div style={{fontSize:"0.85rem", color:"rgba(255,255,255,0.6)", marginTop: "4px"}}>Standard Tier • ₹1.2L • Lost to Taj Lands End</div>
              </div>
              <div className="c-recoveryCard__right">
                <span className="c-sentiment c-sentiment--mightreturn">Follow up today</span>
                <button className="c-btn c-btn--outline" style={{borderColor: "#5FBF8A", color:"#5FBF8A"}}>Send Offer via WA</button>
              </div>
            </div>
            
            <div className="c-recoveryCard" style={{opacity:0.5}}>
              <div className="c-recoveryCard__left">
                <div style={{fontSize:"1.1rem", fontWeight:600}}>Kapoor Reception</div>
                <div style={{fontSize:"0.85rem", color:"rgba(255,255,255,0.6)", marginTop: "4px"}}>Premium Tier • ₹5.0L • Client postponed</div>
              </div>
              <div className="c-recoveryCard__right">
                <span className="c-sentiment">Follow up in Oct</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Post-mortem modal */}
      {postMortemOpen && (
        <div className="c-modalOverlay">
          <div className="c-modal glass">
            <h2 className="c-panel__title" style={{marginBottom: "20px"}}>Log Cancellation Post-mortem</h2>
            
            <div style={{display:"grid", gap:"16px"}}>
              <div>
                <label className="c-label">Primary Reason</label>
                <select className="c-input" style={{width:"100%"}}>
                  {REASONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="c-label">Competitor Chosen (Optional)</label>
                <input type="text" className="c-input" style={{width:"100%"}} placeholder="e.g. Taj Lands End" />
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
                <div>
                  <label className="c-label">Stated Budget (₹ per pax)</label>
                  <input type="number" className="c-input" style={{width:"100%"}} placeholder="1500" />
                </div>
                <div>
                  <label className="c-label">Client Sentiment</label>
                  <select className="c-input" style={{width:"100%"}}>
                    <option>Neutral</option>
                    <option>Disappointed</option>
                    <option>Hostile</option>
                    <option>Might return</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="c-label">Counter-offer details</label>
                <textarea className="c-input" style={{width:"100%", height:"60px", resize:"vertical"}} placeholder="Did you offer a discount?"></textarea>
              </div>
              <div>
                <label className="c-label">Follow-up Reminder Date</label>
                <input type="date" className="c-input" style={{width:"100%"}} />
              </div>
            </div>

            <div style={{display:"flex", justifyContent:"flex-end", gap:"12px", marginTop:"24px"}}>
              <button className="c-btn c-btn--outline" onClick={() => setPostMortemOpen(false)}>Cancel</button>
              <button className="c-btn c-btn--primary" onClick={() => setPostMortemOpen(false)}>Save & Analyze</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
