import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import { createInitialAdminState } from "./adminMock";

function StatCard({ label, value, sub, isPos, onClick }) {
  return (
    <div className="a-kpiCard glass glass-hover reveal" onClick={onClick}>
      <div className="a-kpiCard__label">{label}</div>
      <div className="a-kpiCard__val">{value}</div>
      {sub && (
        <div className="a-kpiCard__sub">
          <span className={isPos === true ? "a-kpiCard__pos" : isPos === false ? "a-kpiCard__neg" : ""}>
            {sub}
          </span>
        </div>
      )}
    </div>
  );
}

function LiveEventCard({ event, onClick }) {
  return (
    <div className="a-liveCard glass glass-hover reveal" onClick={onClick}>
      <div className="a-liveCard__top">
        <div>
          <div className="a-liveCard__title">{event.name}</div>
          <div className="a-liveCard__sub">{event.clientName} · {event.pax} pax · {event.startTime}</div>
          <div className="a-liveCard__sub" style={{ marginTop: 4 }}>
            <span className={`badge badge-${event.tier.toLowerCase()}`}>{event.tier}</span> · {event.hall}
          </div>
        </div>
        <div className={`a-healthDot a-health--${event.health}`} title={`Health: ${event.health}`} />
      </div>
      <div className="a-livePills">
        <div className="a-deptPill">
          <div className="a-deptPill__label">Finance</div>
          <div className="a-deptPill__val" style={{ color: event.status.finance === 'Paid in full' ? '#5FBF8A' : event.status.finance === 'Overdue' ? '#E85555' : '#E8C455' }}>
            {event.status.finance}
          </div>
        </div>
        <div className="a-deptPill">
          <div className="a-deptPill__label">Kitchen</div>
          <div className="a-deptPill__val">{event.status.kitchen}</div>
        </div>
        <div className="a-deptPill">
          <div className="a-deptPill__label">GRE</div>
          <div className="a-deptPill__val">{event.status.gre}</div>
        </div>
        <div className="a-deptPill">
          <div className="a-deptPill__label">DJ</div>
          <div className="a-deptPill__val">{event.status.dj}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [state, setState] = useState(() => createInitialAdminState());
  const [now, setNow] = useState(new Date());
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Reveal animation intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [state]);

  const openEventDrawer = (event) => {
    setDrawerContent(
      <div>
        <h2 style={{ color: "var(--gold)", marginBottom: 8, fontSize: "1.5rem" }}>{event.name}</h2>
        <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>Event Details & Inline Controls</div>
        <div style={{ padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 16 }}>
          <strong>Hall:</strong> {event.hall}<br/>
          <strong>Tier:</strong> {event.tier}<br/>
          <strong>Pax:</strong> {event.pax}<br/>
          <strong>Start:</strong> {event.startTime}
        </div>
        <button className="a-btn a-btn--outline" style={{ width: "100%", marginBottom: 12 }}>Open Full Dashboard</button>
        <button className="a-btn a-btn--outline" style={{ width: "100%", color: "#E85555", borderColor: "rgba(232,85,85,0.3)" }}>Flag Issue to Admin</button>
      </div>
    );
    setDrawerOpen(true);
  };

  const removeGalleryPhoto = (id) => {
    setState((s) => ({ ...s, galleryQueue: s.galleryQueue.filter(p => p.id !== id) }));
  };
  const approveGalleryPhoto = (id) => {
    setState((s) => ({ ...s, galleryQueue: s.galleryQueue.filter(p => p.id !== id) }));
  };

  const today = new Date();
  today.setHours(0,0,0,0);
  const todayEvents = state.events.filter(e => e.date.getTime() === today.getTime());

  // Group events for timeline
  const timelineDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const dayEvents = state.events.filter(e => e.date.getTime() === d.getTime());
    timelineDays.push({
      date: d,
      count: dayEvents.length,
      pax: dayEvents.reduce((acc, ev) => acc + ev.pax, 0),
      hasConflict: i === 2 // mocked conflict
    });
  }

  return (
    <div className="a-root noise">
      {/* Drawer */}
      <div className={`a-drawer__overlay ${drawerOpen ? "a-drawer__overlay--open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`a-drawer ${drawerOpen ? "a-drawer--open" : ""}`}>
        <div className="a-drawer__head">
          <span>Quick View</span>
          <button className="a-drawer__close" onClick={() => setDrawerOpen(false)}>×</button>
        </div>
        <div>{drawerContent}</div>
      </div>

      {/* Header */}
      <header className="a-header animate-fade-in">
        <div className="a-header__left">
          <div className="a-header__greeting">Good evening, Riya</div>
          <div className="a-header__meta">
            <span className="a-roleChip">Admin / Event Manager</span>
            <span>{now.toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'short' })} • {now.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="a-header__right">
          <button className="a-bell" title="Notifications">
            🔔
            {state.notifications > 0 && <span className="a-bell__badge">{state.notifications}</span>}
          </button>
          <div className="a-btnGroup">
            <button className="a-btn a-btn--outline">New Booking</button>
            <button className="a-btn a-btn--outline">Generate FP</button>
            <button className="a-btn a-btn--primary">WhatsApp Blast</button>
          </div>
        </div>
      </header>

      {/* KPI Ribbon */}
      <section className="a-kpiRibbon delay-100">
        <StatCard label="Revenue (This Month)" value={state.kpis.revenue} sub={`${state.kpis.revDelta} vs last month`} isPos={true} />
        <StatCard label="Events (Confirmed / Total)" value={`${state.kpis.eventsMonth.confirmed} / ${state.kpis.eventsMonth.total}`} sub={`${state.kpis.eventsMonth.enquiry} Enquiries active`} />
        <StatCard label="Collection Efficiency" value={state.kpis.collectionEff} sub="Fully paid before event" />
        <StatCard label="Outstanding Receivables" value={state.kpis.receivables} sub="Click to open Finance" isPos={false} />
      </section>

      {/* Live Event Status Board */}
      <section>
        <div className="a-sectionHead reveal">
          <div>Today's Live Events</div>
          <div className="a-sectionHead__sub">{todayEvents.length} events scheduled</div>
        </div>
        <div className="a-liveBoard">
          {todayEvents.map(ev => (
            <LiveEventCard key={ev.id} event={ev} onClick={() => openEventDrawer(ev)} />
          ))}
          {todayEvents.length === 0 && <div style={{ color: "rgba(255,255,255,0.4)" }}>No events scheduled for today.</div>}
        </div>
      </section>

      {/* Upcoming Timeline */}
      <section className="reveal">
        <div className="a-sectionHead">
          <div>Upcoming Timeline</div>
          <div className="a-sectionHead__sub">Next 7 days overview</div>
        </div>
        <div className="a-timelineStrip">
          {timelineDays.map((td, idx) => (
            <div key={idx} className={`a-dayCard glass ${td.count > 2 ? "a-dayCard--dense" : ""}`}>
              {td.hasConflict && <div className="a-dayCard__conflict">Conflict</div>}
              <div className="a-dayCard__date">
                {idx === 0 ? "Today" : td.date.toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric' })}
              </div>
              <div className="a-dayCard__count">{td.count} events</div>
              <div className="a-dayCard__pax">{td.pax} expected pax</div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid for Actions, Gallery, WA, Staff */}
      <section className="a-gridCols">
        
        {/* Pending Actions Inbox */}
        <div className="reveal">
          <div className="a-sectionHead">
            <div>Pending Actions</div>
            <div className="a-sectionHead__sub">{state.pendingActions.length} items require attention</div>
          </div>
          <div className="a-inbox">
            {state.pendingActions.map(act => {
              const overdue = act.due.getTime() < today.getTime();
              return (
                <div key={act.id} className={`a-actionItem ${overdue ? "a-actionItem--red" : ""}`}>
                  <div className="a-actionItem__left">
                    <div className="a-actionItem__text">{act.text}</div>
                    <div className="a-actionItem__meta">
                      <span className="a-actionItem__tag">[{act.priority}]</span>
                      <span className="a-actionItem__src">{act.source}</span>
                    </div>
                  </div>
                  <button className="a-actionItem__btn" onClick={() => {
                    setState(s => ({ ...s, pendingActions: s.pendingActions.filter(x => x.id !== act.id) }));
                  }}>Resolve</button>
                </div>
              );
            })}
            {state.pendingActions.length === 0 && <div style={{ color: "#5FBF8A", padding: 16 }}>All caught up!</div>}
          </div>
        </div>

        {/* Gallery Moderation */}
        <div className="reveal">
          <div className="a-sectionHead">
            <div>Gallery Queue</div>
            <div className="a-sectionHead__sub">{state.galleryQueue.length} photos await approval</div>
          </div>
          <div className="a-galleryGrid">
            {state.galleryQueue.map(p => (
              <div key={p.id} className="a-galleryItem">
                <img src={p.src} alt="Gallery submission" />
                {p.flagged && <div className="a-galleryItem__flag">Flagged</div>}
                <div className="a-galleryItem__overlay">
                  <button className="a-galleryItem__btn a-galleryItem__btn--ok" onClick={() => approveGalleryPhoto(p.id)}>Approve</button>
                  <button className="a-galleryItem__btn a-galleryItem__btn--rm" onClick={() => removeGalleryPhoto(p.id)} title={p.reason}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Broadcast */}
        <div className="reveal glass" style={{ padding: 20, borderRadius: 12 }}>
          <div className="a-sectionHead" style={{ marginBottom: 12 }}>
            <div>WhatsApp Broadcast</div>
            <span style={{ fontSize: "1.2rem" }}>💬</span>
          </div>
          <div className="a-waPanel">
            <select className="a-waSelect">
              <option>To: All Confirmed Clients (upcoming week)</option>
              <option>To: All Kitchen Staff</option>
              <option>To: All GREs</option>
            </select>
            <textarea className="a-waTextarea" placeholder="Type message or select a template..." defaultValue="Dear [Client Name], we look forward to hosting your event on [Date]..."></textarea>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="a-btn a-btn--outline" style={{ flex: 1 }}>Load Template</button>
              <button className="a-btn a-btn--primary" style={{ flex: 1 }} onClick={() => alert("Broadcast queued for delivery!")}>Send Broadcast</button>
            </div>
          </div>
        </div>

        {/* Staff Overview */}
        <div className="reveal glass" style={{ padding: 20, borderRadius: 12 }}>
          <div className="a-sectionHead" style={{ marginBottom: 12 }}>
            <div>Staff Overview (Today)</div>
          </div>
          <div className="a-inbox">
            <div className="a-actionItem">
              <div className="a-actionItem__left">
                <div style={{color:"#fff"}}>Events Staffed</div>
                <div style={{color:"var(--gold-light)", fontSize:"1.2rem", fontWeight:600}}>100%</div>
              </div>
              <div className="a-actionItem__left" style={{alignItems:"flex-end"}}>
                <div style={{color:"#fff"}}>Roles Filled</div>
                <div style={{color:"#5FBF8A", fontSize:"1.2rem", fontWeight:600}}>24/24</div>
              </div>
            </div>
            <div className="a-actionItem" style={{ borderLeft: "3px solid #E8C455" }}>
              <div className="a-actionItem__left">
                <div className="a-actionItem__text">Chef Rajan hasn't checked in yet</div>
                <div className="a-actionItem__meta">
                  <span className="a-actionItem__src">Shift starts in 45 mins</span>
                </div>
              </div>
              <button className="a-actionItem__btn">Call</button>
            </div>
            <button className="a-btn a-btn--outline" style={{ width: "100%", justifyContent: "center" }} onClick={() => window.location.href = '/admin/staff'}>
              Open Staff Assignments Grid →
            </button>
          </div>
        </div>
      </section>

      {/* AI Insights Strip */}
      <section className="reveal">
        <div className="a-sectionHead">
          <div>Featherless.ai Operations Insights</div>
          <button className="a-btn a-btn--outline" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>Regenerate ↻</button>
        </div>
        <div className="a-aiStrip">
          {state.aiInsights.map((insight, idx) => (
            <div key={idx} className="a-aiCard">
              <div className="a-aiCard__head">
                <span className="a-aiCard__icon">✨</span> System Insight
              </div>
              <div className="a-aiCard__text">{insight}</div>
              <button className="a-aiCard__btn">Take action →</button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
