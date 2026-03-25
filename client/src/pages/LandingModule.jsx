import { useState, useEffect, useRef, useCallback } from "react";

/* ── icons ── */
const I = ({ d, s = 20, c = "" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={c}>
    <path d={d} />
  </svg>
);
const ico = {
  cal:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  fin:    "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  qr:     "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 17h3v3h-3z",
  kit:    "M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6zM6 17h12",
  brain:  "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.73A3 3 0 0 1 4.46 9.1a3 3 0 0 1 .49-5.1A2.5 2.5 0 0 1 9.5 2M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.73A3 3 0 0 0 19.54 9.1a3 3 0 0 0-.49-5.1A2.5 2.5 0 0 0 14.5 2z",
  wa:     "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.38 8.38 0 0 1 11.5 3h.5a8.48 8.48 0 0 1 8 8v.5z",
  dj:     "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap:    "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  arr:    "M5 12h14M12 5l7 7-7 7",
  chk:    "M20 6 9 17l-5-5",
  clk:    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  usr:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  gal:    "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  ref:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  menu:   "M3 12h18M3 6h18M3 18h18",
  x:      "M18 6 6 18M6 6l12 12",
};

/* ── counter hook ── */
function useCounter(target, dur = 2000, go = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    let t0 = null, raf;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(e * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur, go]);
  return n;
}

/* ── typewriter hook ── */
function useTypewriter(phrases) {
  const [txt, setTxt] = useState('');
  const [pi, setPi] = useState(0);
  useEffect(() => {
    let i = 0, del = false, tid;
    const tick = () => {
      const ph = phrases[pi];
      if (!del && i <= ph.length) { setTxt(ph.slice(0, i++)); tid = setTimeout(tick, 85); }
      else if (!del && i > ph.length) { del = true; tid = setTimeout(tick, 1500); }
      else if (del && i >= 0) { setTxt(ph.slice(0, i--)); tid = setTimeout(tick, 45); }
      else { del = false; setPi(p => (p + 1) % phrases.length); }
    };
    tid = setTimeout(tick, 200);
    return () => clearTimeout(tid);
  }, [pi]);
  return txt;
}

/* ── scroll reveal ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('rv-in'); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── particles ── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          bottom: '-4px',
          width: Math.random() > 0.8 ? '3px' : '2px',
          height: Math.random() > 0.8 ? '3px' : '2px',
          borderRadius: '50%',
          background: '#C9A84C',
          animation: `pDrift ${8 + Math.random() * 14}s ${Math.random() * 12}s linear infinite`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────
   SECTIONS
────────────────────────────────────────── */

function Navbar({ page, setPage, onStaffLogin }) {
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setSc(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  const links = ['Features', 'Workflow', 'Modules', 'Stats'];
  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      padding: sc ? '12px 32px' : '20px 32px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      backdropFilter: sc ? 'blur(20px)' : 'none',
      background: sc ? 'rgba(8,8,16,.85)' : 'transparent',
      borderBottom: sc ? '1px solid rgba(201,168,76,.1)' : '1px solid transparent',
      transition: 'all .4s ease',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:'linear-gradient(135deg,#C9A84C,#6B5520)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#080810', fontWeight:700, fontSize:14,
        }}>B</div>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:'#F5F0E8', letterSpacing:1 }}>
            Banquet <span style={{ background:'linear-gradient(90deg,#C9A84C,#E8D08A,#C9A84C)', backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>IM</span>
          </div>
          <div style={{ fontSize:9, color:'#6B5520', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:-2 }}>IntelliManager 2026</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:28 }}>
        {links.map(l => (
          <button key={l} onClick={() => document.getElementById(l.toLowerCase())?.scrollIntoView({behavior:'smooth'})}
            style={{ background:'none', border:'none', color:'rgba(245,240,232,.5)', fontSize:13, fontWeight:500, letterSpacing:'0.04em', cursor:'pointer', transition:'color .2s' }}
            onMouseEnter={e => e.target.style.color='#C9A84C'} onMouseLeave={e => e.target.style.color='rgba(245,240,232,.5)'}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        {onStaffLogin && (
          <button onClick={onStaffLogin}
            style={{ padding:'6px 14px', background:'transparent', border:'1px solid rgba(201,168,76,.2)', color:'rgba(201,168,76,.7)', borderRadius:6, fontSize:11, cursor:'pointer', transition:'all .3s', letterSpacing:'.04em' }}
            onMouseEnter={e=>{ e.target.style.background='rgba(201,168,76,.08)'; e.target.style.borderColor='rgba(201,168,76,.5)'; e.target.style.color='#C9A84C'; }}
            onMouseLeave={e=>{ e.target.style.background='transparent'; e.target.style.borderColor='rgba(201,168,76,.2)'; e.target.style.color='rgba(201,168,76,.7)'; }}>
            Staff Login
          </button>
        )}
        <button style={{ padding:'8px 18px', background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', borderRadius:8, fontSize:13, cursor:'pointer', transition:'all .3s' }}
          onMouseEnter={e=>{ e.target.style.background='rgba(201,168,76,.08)'; e.target.style.borderColor='#C9A84C'; }}
          onMouseLeave={e=>{ e.target.style.background='transparent'; e.target.style.borderColor='rgba(201,168,76,.35)'; }}>
          Sign In
        </button>
        <button onClick={() => setPage('dashboard')}
          style={{ padding:'8px 20px', background:'linear-gradient(135deg,#C9A84C,#8A6520)', color:'#080810', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s' }}
          onMouseEnter={e=>e.target.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.target.style.transform='translateY(0)'}>
          Launch App →
        </button>
      </div>
    </nav>
  );
}

function Hero({ setPage }) {
  const txt = useTypewriter(['Inquiry', 'Menu Selection', 'Payment', 'Check-In', 'Post-Event Audit']);
  return (
    <section style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      position:'relative', overflow:'hidden', padding:'0 24px',
      background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.08) 0%, transparent 60%), #080810',
    }}>
      <Particles />
      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }} />
      {/* Orbs */}
      <div style={{ position:'absolute', top:'20%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,#C9A84C,transparent 70%)', filter:'blur(60px)', opacity:.08, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'20%', right:'-10%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,#5B8FE8,transparent 70%)', filter:'blur(60px)', opacity:.07, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:900, textAlign:'center' }}>
        {/* Badge */}
        <div className="rv" style={{
          display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', marginBottom:28,
          borderRadius:99, background:'rgba(255,255,255,.03)', border:'1px solid rgba(201,168,76,.2)',
          color:'#C9A84C', fontSize:11, fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#5FBF8A', animation:'pulse 2s infinite' }} />
          Live Event Intelligence Platform · 2026
        </div>

        {/* Headline */}
        <h1 className="rv" style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:'clamp(3rem,7vw,6.5rem)', fontWeight:700,
          color:'#F5F0E8', lineHeight:1.05, marginBottom:16,
          transitionDelay:'.1s',
        }}>
          Every Banquet.<br/>
          <span style={{ background:'linear-gradient(90deg,#C9A84C 0%,#E8D08A 40%,#C9A84C 60%,#8A6520 100%)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'shimmer 3s linear infinite' }}>
            Perfectly Orchestrated.
          </span>
        </h1>

        {/* Typewriter */}
        <p className="rv" style={{ color:'#9D9880', fontSize:18, marginBottom:8, fontWeight:300, transitionDelay:'.2s' }}>
          From first{' '}
          <span style={{ color:'#E8D08A', fontWeight:500, borderRight:'2px solid #C9A84C', paddingRight:2 }}>{txt}</span>
          {' '}to last applause
        </p>
        <p className="rv" style={{ color:'#4A4840', fontSize:14, marginBottom:44, maxWidth:520, margin:'0 auto 44px', lineHeight:1.7, transitionDelay:'.3s' }}>
          A unified command center for Sales, Finance, Kitchen, GRE & Clients —
          powered by real-time intelligence and WhatsApp-native workflows.
        </p>

        {/* CTAs */}
        <div className="rv" style={{ display:'flex', gap:14, justifyContent:'center', marginBottom:52, transitionDelay:'.4s' }}>
          <button onClick={() => setPage('dashboard')}
            style={{ padding:'14px 32px', background:'linear-gradient(135deg,#C9A84C,#8A6520)', color:'#080810', border:'none', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(201,168,76,.35)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
            Start Free Trial <I d={ico.arr} s={17} />
          </button>
          <button style={{ padding:'14px 32px', background:'transparent', border:'1px solid rgba(201,168,76,.35)', color:'#C9A84C', borderRadius:10, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', gap:8, transition:'all .3s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(201,168,76,.08)'; e.currentTarget.style.borderColor='#C9A84C'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(201,168,76,.35)'; }}>
            <I d={ico.cal} s={17} /> Book a Demo
          </button>
        </div>

        {/* Heartbeat strip */}
        <div className="rv" style={{
          maxWidth:700, margin:'0 auto 36px',
          background:'rgba(255,255,255,.03)', border:'1px solid rgba(201,168,76,.15)',
          borderRadius:20, height:80, position:'relative', overflow:'hidden', padding:'0 24px',
          display:'flex', alignItems:'center', transitionDelay:'.6s',
        }}>
          <svg width="100%" height="52" viewBox="0 0 800 60" fill="none" style={{ position:'absolute', inset:0 }}>
            <path d="M0,30 L60,30 L80,10 L100,50 L120,20 L140,40 L160,30 L220,30 L240,5 L260,55 L280,15 L300,45 L320,30 L380,30 L400,8 L420,52 L440,18 L460,42 L480,30 L540,30 L560,12 L580,48 L600,22 L620,38 L640,30 L800,30"
              stroke="#C9A84C" strokeWidth="1.5" opacity=".7"
              strokeDasharray="1000" strokeDashoffset="0"
              style={{ animation: 'drawLine 3s ease forwards' }} />
          </svg>
          <div style={{ position:'absolute', bottom:6, left:0, right:0, display:'flex', justifyContent:'space-around' }}>
            {['Inquiry','Blocked','Finance','Confirmed','Live','Audit'].map(s => (
              <span key={s} style={{ fontSize:9, color:'#4A4840', letterSpacing:'0.15em', textTransform:'uppercase' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="rv" style={{ display:'flex', flexWrap:'wrap', gap:24, justifyContent:'center', transitionDelay:'.8s' }}>
          {[['GST Compliant', ico.shield], ['WhatsApp Native', ico.wa], ['AI-Powered', ico.brain], ['QR Check-In', ico.qr]].map(([l, ic]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:7, color:'#9D9880', fontSize:12 }}>
              <I d={ic} s={13} c="" style={{ color:'#C9A84C' }} />
              <I d={ic} s={13} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', animation:'float 3s ease-in-out infinite' }}>
        <div style={{ width:20, height:32, border:'1px solid rgba(201,168,76,.3)', borderRadius:10, display:'flex', justifyContent:'center', paddingTop:6 }}>
          <div style={{ width:4, height:8, background:'#C9A84C', borderRadius:2, animation:'bounce 1.2s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ['✦ Real-Time Guest Check-In','✦ WhatsApp PO Delivery','✦ AI Menu Optimization','✦ Installment Reminders','✦ QR Entry System','✦ Conflict Detection','✦ Custom Caterer Support','✦ Cancellation Post-Mortem','✦ DJ Live View','✦ Refund Policy Engine','✦ Redis Queue Management'];
  return (
    <div style={{ borderTop:'1px solid rgba(201,168,76,.1)', borderBottom:'1px solid rgba(201,168,76,.1)', padding:'14px 0', background:'#0E0E1A', overflow:'hidden' }}>
      <div style={{ display:'flex', width:'max-content', animation:'marquee 30s linear infinite' }}>
        {[...items,...items].map((t,i) => (
          <span key={i} style={{ padding:'0 28px', color:'#9D9880', fontSize:12, fontWeight:500, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const [hov, setHov] = useState(null);
  const feats = [
    { ico: ico.cal,    col:'#5B8FE8', t:'Smart Event Locking',     d:'Redis-powered queue — first to pay, first to book. Auto-release after 48h if payment not made.' },
    { ico: ico.fin,    col:'#5FBF8A', t:'Finance Gatekeeper',      d:'GST-compliant ledger, installment plans, automated WhatsApp reminders at T-30, T-7, T-1.' },
    { ico: ico.qr,     col:'#C9A84C', t:'QR Guest Check-In',       d:'Mobile-first GRE dashboard with live pax counter. Kitchen gets real-time headcount via socket.' },
    { ico: ico.kit,    col:'#E85555', t:'Kitchen Live Feed',        d:'Prep timeline, portion adjustments per live headcount, and waste logging for audit trail.' },
    { ico: ico.brain,  col:'#9B6DE8', t:'AI Audit Intelligence',   d:'Featherless.ai analyzes menus, cancellations, adjacent-event synergies to cut waste & grow revenue.' },
    { ico: ico.wa,     col:'#25D366', t:'WhatsApp-First Comms',    d:'Automated PO delivery, Function Prospectus, RSVP link, and music requests — all native WhatsApp.' },
    { ico: ico.dj,     col:'#E8C455', t:'DJ Live View',            d:'Guest song requests stream live to DJ tablet. Queue management, vote-up, now-playing display.' },
    { ico: ico.ref,    col:'#FF8C42', t:'Refund Policy Engine',    d:'10-day window tracked automatically. Status machine handles cancellations with prorated refunds.' },
    { ico: ico.gal,    col:'#E85E9A', t:'Collaborative Gallery',  d:'Guests upload real-time photos. Admins moderate via AI auto-flagging. Shared event memory.' },
  ];
  return (
    <section id="features" style={{ padding:'100px 32px', background:'#080810' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="rv" style={{ textAlign:'center', marginBottom:72 }}>
          <p style={{ color:'#C9A84C', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:14 }}>Platform Capabilities</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2.5rem,4vw,4rem)', fontWeight:700, color:'#F5F0E8', lineHeight:1.1, marginBottom:14 }}>
            Every feature you need.<br/>
            <span style={{ background:'linear-gradient(90deg,#C9A84C,#E8D08A,#C9A84C)', backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', animation:'shimmer 3s linear infinite' }}>Nothing you don't.</span>
          </h2>
          <p style={{ color:'#9D9880', maxWidth:480, margin:'0 auto', fontSize:14, lineHeight:1.7 }}>Built for the specific chaos of banquet operations — multi-role, multi-session, multi-venue.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:18 }}>
          {feats.map((f, i) => (
            <div key={f.t} className="rv"
              style={{
                background: hov===i ? `rgba(${f.col==='#C9A84C'?'201,168,76':f.col==='#5B8FE8'?'91,143,232':f.col==='#5FBF8A'?'95,191,138':f.col==='#E85555'?'232,85,85':f.col==='#9B6DE8'?'155,109,232':f.col==='#25D366'?'37,211,102':f.col==='#E8C455'?'232,196,85':f.col==='#FF8C42'?'255,140,66':'232,94,154'},.06)` : 'rgba(255,255,255,.025)',
                border: `1px solid ${hov===i ? f.col+'50' : 'rgba(201,168,76,.1)'}`,
                borderRadius:20, padding:24, cursor:'default',
                transform: hov===i ? 'translateY(-4px)' : 'translateY(0)',
                transition:'all .3s ease',
                transitionDelay:`${i*.06}s`,
                position:'relative', overflow:'hidden',
              }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
              {/* bottom accent */}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${f.col}70,transparent)`, transform:`scaleX(${hov===i?1:0})`, transformOrigin:'left', transition:'transform .4s' }} />
              <div style={{ width:44, height:44, borderRadius:12, background:`${f.col}15`, border:`1px solid ${f.col}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, color:f.col }}>
                <I d={f.ico} s={19} />
              </div>
              <div style={{ color: hov===i ? '#E8D08A' : '#F5F0E8', fontWeight:600, fontSize:15, marginBottom:8, transition:'color .3s' }}>{f.t}</div>
              <div style={{ color:'#9D9880', fontSize:13, lineHeight:1.65 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const [act, setAct] = useState(0);
  const steps = [
    { ph:'A', lbl:'Inquiry & Lock-In',        col:'#5B8FE8', who:'Sales Team',      ico:ico.cal,
      pts:['Party name, client, GST, date/time/venue captured','Tiered menu engine — Standard / Premium / Elite','Redis queue: simultaneous bookings → first payment wins','Conflict detection flags overlapping events instantly'], sta:'Temporary Enquiry', scol:'#5B8FE8' },
    { ph:'B', lbl:'Finance Gatekeeper',        col:'#5FBF8A', who:'Finance Manager', ico:ico.fin,
      pts:['Deposit vs. final settlement tracker','Installment builder with cron WhatsApp reminders','GST invoice auto-generation (PDF via pdfkit)','"Payment Received" toggle flips status → Confirmed'], sta:'Confirmed', scol:'#5FBF8A' },
    { ph:'C', lbl:'Event Day Operations',      col:'#C9A84C', who:'GRE + Kitchen',   ico:ico.qr,
      pts:['QR scanner for guest entry — no paper lists','Live pax counter pushes to kitchen via WebSocket','Walk-in accommodation with dietary flag','DJ queue & collaborative photo gallery go live'], sta:'Live Event', scol:'#E8C455' },
    { ph:'D', lbl:'Post-Event Intelligence',   col:'#9B6DE8', who:'Admin + AI',      ico:ico.brain,
      pts:['Menu popularity → AI recommends optimal future combos','Cancellation post-mortem: price / date / competitor','Adjacent-event synergy to cut waste & labor','Featherless.ai generates executive summary'], sta:'Audit Complete', scol:'#9B6DE8' },
  ];
  const s = steps[act];
  return (
    <section id="workflow" style={{ padding:'100px 32px', background:'linear-gradient(180deg,#080810,#0E0E1A,#080810)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="rv" style={{ textAlign:'center', marginBottom:64 }}>
          <p style={{ color:'#C9A84C', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:14 }}>Customer Journey</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2.5rem,4vw,4rem)', fontWeight:700, color:'#F5F0E8' }}>Four phases. One source of truth.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          {/* Steps */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {steps.map((st, i) => (
              <button key={i} onClick={() => setAct(i)}
                style={{
                  background: act===i ? `rgba(${st.col==='#5B8FE8'?'91,143,232':st.col==='#5FBF8A'?'95,191,138':st.col==='#C9A84C'?'201,168,76':'155,109,232'},.07)` : 'transparent',
                  border: `1px solid ${act===i ? st.col+'40' : 'rgba(201,168,76,.1)'}`,
                  borderRadius:16, padding:'16px 20px', textAlign:'left', cursor:'pointer',
                  transition:'all .3s', display:'flex', alignItems:'center', gap:16,
                }}>
                <div style={{ width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, flexShrink:0, background: act===i ? `${st.col}20` : 'rgba(255,255,255,.03)', color: act===i ? st.col : '#4A4840', border:`1px solid ${act===i ? st.col+'40' : 'rgba(255,255,255,.05)'}`, transition:'all .3s' }}>
                  {st.ph}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#F5F0E8', fontWeight:500, fontSize:14 }}>{st.lbl}</div>
                  <div style={{ color:'#4A4840', fontSize:12, marginTop:2 }}>{st.who}</div>
                </div>
                {act===i && <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, background:`${st.scol}20`, color:st.scol, border:`1px solid ${st.scol}30`, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{st.sta}</span>}
              </button>
            ))}
          </div>
          {/* Detail */}
          <div key={act} style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(201,168,76,.15)', borderRadius:28, padding:36, position:'relative', overflow:'hidden', animation:'scaleIn .4s ease' }}>
            <div style={{ position:'absolute', top:0, right:0, width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle,${s.col},transparent 70%)`, filter:'blur(40px)', opacity:.12, transform:'translate(30%,-30%)', pointerEvents:'none' }} />
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${s.col}18`, border:`1px solid ${s.col}35`, display:'flex', alignItems:'center', justifyContent:'center', color:s.col }}>
                <I d={s.ico} s={22} />
              </div>
              <div>
                <div style={{ color:'#9D9880', fontSize:11, textTransform:'uppercase', letterSpacing:'0.15em' }}>Phase {s.ph}</div>
                <div style={{ color:'#F5F0E8', fontWeight:600, fontSize:17 }}>{s.lbl}</div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {s.pts.map((pt, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, color:'#9D9880', fontSize:13, lineHeight:1.55 }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:`${s.col}20`, color:s.col, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <I d={ico.chk} s={11} />
                  </div>
                  {pt}
                </div>
              ))}
            </div>
            <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(201,168,76,.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'#4A4840', fontSize:12 }}>Role: <span style={{ color:'#9D9880' }}>{s.who}</span></span>
              <span style={{ fontSize:10, padding:'4px 12px', borderRadius:99, background:`${s.scol}20`, color:s.scol, border:`1px solid ${s.scol}30`, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{s.sta}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Modules({ setPage }) {
  const [hov, setHov] = useState(null);
  const mods = [
    { id:'sales',   rol:'Sales Manager',   ico:ico.cal,   col:'#5B8FE8', bdg:'M1', d:'Booking pipeline, venue calendar, overlap detection, quotations.',       sc:['Dashboard','New Booking','Venue Calendar','Booking Detail'] },
    { id:'finance', rol:'Finance Manager', ico:ico.fin,   col:'#5FBF8A', bdg:'M1', d:'Payment ledger, installment builder, GST report, approval gate.',        sc:['Payment Ledger','Installment Builder','GST Report','Approval Gate'] },
    { id:'kitchen', rol:'Kitchen / Ops',   ico:ico.kit,   col:'#E85555', bdg:'M2', d:'Menu manifest, prep timeline, live pax feed, waste logger.',             sc:['Kitchen Dash','Menu Manifest','Prep Timeline','Waste Logger'] },
    { id:'gre',     rol:'Guest Relations', ico:ico.qr,    col:'#C9A84C', bdg:'M3', d:'QR scanner, live check-in counter, walk-in management.',                 sc:['GRE Dashboard','QR Scanner','Guest List','Live Check-In'] },
    { id:'dj',      rol:'DJ Interface',    ico:ico.dj,    col:'#E8C455', bdg:'M3', d:'Real-time music request queue from guests via WhatsApp/portal.',         sc:['DJ Live View','Request Queue','Now Playing','Vote System'] },
    { id:'client',  rol:'Client Portal',   ico:ico.usr,   col:'#9B6DE8', bdg:'M3', d:'Event summary, RSVP, feedback form, shared photo gallery.',              sc:['Event Summary','Guest RSVP','Photo Gallery','Feedback Form'] },
    { id:'admin',   rol:'Admin / AI',      ico:ico.brain, col:'#E85E9A', bdg:'M4', d:'AI insights, staff assignment, cancellation analysis, featherless.ai.',  sc:['Admin Dash','Staff Assignment','Cancel Log','AI Insights'] },
  ];
  return (
    <section id="modules" style={{ padding:'100px 32px', background:'#080810' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="rv" style={{ textAlign:'center', marginBottom:64 }}>
          <p style={{ color:'#C9A84C', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:14 }}>Role-Based Modules</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2.5rem,4vw,4rem)', fontWeight:700, color:'#F5F0E8', lineHeight:1.1 }}>Every role. Its own lens.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {mods.map((m, i) => (
            <div key={m.id} className="rv"
              style={{ background:'rgba(255,255,255,.025)', border:`1px solid ${hov===i ? m.col+'45' : 'rgba(201,168,76,.1)'}`, borderRadius:20, padding:24, cursor:'pointer', transform: hov===i ? 'translateY(-4px)' : 'none', transition:'all .3s ease', transitionDelay:`${i*.05}s`, position:'relative', overflow:'hidden' }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              onClick={() => setPage(m.id)}>
              <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 20% 20%,${m.col}08,transparent 60%)`, opacity: hov===i?1:0, transition:'opacity .5s', pointerEvents:'none', borderRadius:20 }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${m.col}14`, border:`1px solid ${m.col}28`, display:'flex', alignItems:'center', justifyContent:'center', color:m.col }}>
                  <I d={m.ico} s={20} />
                </div>
                <span style={{ fontSize:10, color:'#4A4840', fontFamily:'monospace', border:'1px solid rgba(201,168,76,.15)', padding:'2px 8px', borderRadius:4 }}>{m.bdg}</span>
              </div>
              <div style={{ color: hov===i ? '#E8D08A' : '#F5F0E8', fontWeight:600, fontSize:14, marginBottom:6, transition:'color .3s' }}>{m.rol}</div>
              <div style={{ color:'#6B6858', fontSize:12, lineHeight:1.6, marginBottom: hov===i ? 12 : 0, transition:'all .3s' }}>{m.d}</div>
              {hov===i && (
                <div>
                  {m.sc.map(s => (
                    <div key={s} style={{ display:'flex', alignItems:'center', gap:6, color:'#9D9880', fontSize:11, padding:'2px 0' }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:m.col }} />{s}
                    </div>
                  ))}
                  <div style={{ marginTop:12, padding:'8px 0', textAlign:'center', background:`${m.col}10`, border:`1px solid ${m.col}25`, borderRadius:8, color:m.col, fontSize:12, fontWeight:500 }}>
                    Open Module →
                  </div>
                </div>
              )}
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${m.col}60,transparent)`, transform:`scaleX(${hov===i?1:0})`, transformOrigin:'left', transition:'transform .4s' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ val, suf='', lbl, sub, col, go }) {
  const n = useCounter(val, 2200, go);
  return (
    <div className="rv" style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(201,168,76,.1)', borderRadius:20, padding:'36px 24px', textAlign:'center', transition:'all .3s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='rgba(201,168,76,.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='rgba(201,168,76,.1)'; }}>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2.5rem,4vw,3.5rem)', fontWeight:700, color:col, lineHeight:1, marginBottom:6 }}>{n.toLocaleString()}{suf}</div>
      <div style={{ color:'#F5F0E8', fontWeight:500, fontSize:14, marginBottom:4 }}>{lbl}</div>
      <div style={{ color:'#4A4840', fontSize:12 }}>{sub}</div>
    </div>
  );
}

function Stats() {
  const [go, setGo] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true); }, { threshold:.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="stats" ref={ref} style={{ padding:'100px 32px', background:'radial-gradient(ellipse 80% 40% at 50% 50%,rgba(201,168,76,.05),transparent 70%), #080810' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div className="rv" style={{ textAlign:'center', marginBottom:64 }}>
          <p style={{ color:'#C9A84C', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:14 }}>Platform Impact</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(2rem,4vw,3.5rem)', fontWeight:700, color:'#F5F0E8' }}>Numbers that speak for themselves.</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
          <StatCard val={2500} suf="+" lbl="Events Managed"   sub="Across all venues"     col="#C9A84C" go={go} />
          <StatCard val={98}   suf="%" lbl="On-Time Delivery" sub="Function Prospectus"   col="#5FBF8A" go={go} />
          <StatCard val={40}   suf="%" lbl="Less Food Waste"  sub="Via AI menu synergy"   col="#5B8FE8" go={go} />
          <StatCard val={12}   suf="x" lbl="Faster Check-In"  sub="QR vs paper list"      col="#9B6DE8" go={go} />
        </div>
      </div>
    </section>
  );
}

function USPStrip() {
  const usps = [
    { ico:ico.zap,    t:'Redis Queue',      d:'Simultaneous bookings resolved fairly — first payment wins, not first click.' },
    { ico:ico.shield, t:'10-Day Refund',    d:'Automated policy engine tracks refund windows and prorated calculations.' },
    { ico:ico.clk,    t:'48h Auto-Release', d:'Unpaid reservations auto-release back to open inventory after 48 hours.' },
    { ico:ico.star,   t:'Custom Caterer',   d:'Bring your own chef. Build a custom menu with dynamic real-time pricing.' },
  ];
  return (
    <section style={{ padding:'64px 32px', borderTop:'1px solid rgba(201,168,76,.08)', borderBottom:'1px solid rgba(201,168,76,.08)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
        {usps.map((u, i) => (
          <div key={u.t} className="rv" style={{ display:'flex', gap:16, transitionDelay:`${i*.1}s` }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#C9A84C', flexShrink:0, marginTop:4 }}><I d={u.ico} s={19} /></div>
            <div>
              <div style={{ color:'#F5F0E8', fontWeight:600, fontSize:14, marginBottom:6 }}>{u.t}</div>
              <div style={{ color:'#6B6858', fontSize:12, lineHeight:1.65 }}>{u.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding:'40px 32px', borderTop:'1px solid rgba(201,168,76,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#C9A84C,#6B5520)', display:'flex', alignItems:'center', justifyContent:'center', color:'#080810', fontWeight:700, fontSize:13 }}>B</div>
        <span style={{ fontFamily:"'Cormorant Garamond',serif", color:'#F5F0E8', fontWeight:700, fontSize:18 }}>Banquet IntelliManager</span>
      </div>
      <p style={{ color:'#4A4840', fontSize:11, letterSpacing:'0.05em' }}>Built for HackNiche 4.0 · MERN + Redis + Tailwind · WhatsApp Business API</p>
      <div style={{ display:'flex', gap:20 }}>
        {['Privacy','Terms','API Docs','Support'].map(l => (
          <a key={l} href="#" style={{ color:'#4A4840', fontSize:12, textDecoration:'none', transition:'color .2s' }}
            onMouseEnter={e=>e.target.style.color='#C9A84C'} onMouseLeave={e=>e.target.style.color='#4A4840'}>{l}</a>
        ))}
      </div>
    </footer>
  );
}

/* ── MINI DASHBOARD (placeholder, full module next) ── */
function Dashboard({ setPage }) {
  const stats = [
    { lbl:'Active Bookings', val:24, col:'#5FBF8A', delta:'+3 today' },
    { lbl:'Pending Payments', val:7, col:'#E8C455', delta:'₹2.4L outstanding' },
    { lbl:'Today\'s Guests', val:342, col:'#5B8FE8', delta:'Live event ongoing' },
    { lbl:'Revenue MTD', val:'₹18.6L', col:'#C9A84C', delta:'+12% vs last month' },
  ];
  const recent = [
    { name:'Sharma Wedding Reception', date:'Mar 27', guests:280, status:'Confirmed', col:'#5FBF8A' },
    { name:'TechCorp Annual Banquet',  date:'Mar 28', guests:150, status:'Pending',   col:'#E8C455' },
    { name:'Mehta Anniversary',        date:'Apr 1',  guests:80,  status:'Enquiry',   col:'#5B8FE8' },
    { name:'ICICI Leadership Summit',  date:'Apr 3',  guests:200, status:'Confirmed', col:'#5FBF8A' },
    { name:'Kapoor Wedding',           date:'Apr 5',  guests:450, status:'Pending',   col:'#E8C455' },
  ];
  return (
    <div style={{ minHeight:'100vh', background:'#080810', padding:'96px 32px 48px' }}>
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:36 }}>
          <div>
            <p style={{ color:'#4A4840', fontSize:12, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:6 }}>Overview</p>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2.8rem', fontWeight:700, color:'#F5F0E8' }}>Command Center</h1>
          </div>
          <button onClick={() => setPage('landing')} style={{ padding:'10px 20px', background:'transparent', border:'1px solid rgba(201,168,76,.3)', color:'#C9A84C', borderRadius:10, cursor:'pointer', fontSize:13 }}>← Back to Landing</button>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(201,168,76,.1)', borderRadius:20, padding:24, transition:'all .3s' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=s.col+'50'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(201,168,76,.1)'; e.currentTarget.style.transform='none'; }}>
              <div style={{ color:'#6B6858', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>{s.lbl}</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'2.2rem', fontWeight:700, color:s.col, lineHeight:1 }}>{s.val}</div>
              <div style={{ color:'#4A4840', fontSize:11, marginTop:8 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
          {/* Recent events */}
          <div style={{ background:'rgba(255,255,255,.025)', border:'1px solid rgba(201,168,76,.1)', borderRadius:20, padding:28 }}>
            <h3 style={{ color:'#F5F0E8', fontWeight:600, fontSize:16, marginBottom:20 }}>Recent Events</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {recent.map((r,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom: i<recent.length-1?'1px solid rgba(201,168,76,.06)':'none' }}>
                  <div>
                    <div style={{ color:'#F5F0E8', fontSize:14, fontWeight:500 }}>{r.name}</div>
                    <div style={{ color:'#4A4840', fontSize:12, marginTop:3 }}>{r.date} · {r.guests} guests</div>
                  </div>
                  <span style={{ fontSize:11, padding:'4px 12px', borderRadius:99, background:`${r.col}18`, color:r.col, border:`1px solid ${r.col}30`, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { lbl:'New Booking',     ico:ico.cal,   col:'#5B8FE8', mod:'sales' },
              { lbl:'Finance Review',  ico:ico.fin,   col:'#5FBF8A', mod:'finance' },
              { lbl:'GRE Check-In',    ico:ico.qr,    col:'#C9A84C', mod:'gre' },
              { lbl:'Kitchen View',    ico:ico.kit,   col:'#E85555', mod:'kitchen' },
              { lbl:'AI Insights',     ico:ico.brain, col:'#9B6DE8', mod:'admin' },
            ].map((a,i) => (
              <button key={i} onClick={() => setPage(a.mod)}
                style={{ background:'rgba(255,255,255,.025)', border:`1px solid rgba(201,168,76,.1)`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', textAlign:'left', transition:'all .3s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=a.col+'45'; e.currentTarget.style.background=`${a.col}08`; e.currentTarget.style.transform='translateX(4px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(201,168,76,.1)'; e.currentTarget.style.background='rgba(255,255,255,.025)'; e.currentTarget.style.transform='none'; }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${a.col}15`, border:`1px solid ${a.col}28`, display:'flex', alignItems:'center', justifyContent:'center', color:a.col, flexShrink:0 }}>
                  <I d={a.ico} s={17} />
                </div>
                <span style={{ color:'#F5F0E8', fontSize:13, fontWeight:500 }}>{a.lbl}</span>
                <I d={ico.arr} s={15} c="" style={{ marginLeft:'auto', color:'#4A4840' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ROOT — accepts optional onModuleClick prop
   so App.jsx can intercept module card clicks
   and show an auth modal before routing.
────────────────────────────────────────── */
export default function LandingApp({ onModuleClick, onStaffLogin } = {}) {
  const [page, setPage] = useState('landing');
  useReveal();

  function handleSetPage(p) {
    if (onModuleClick && ['sales','finance','gre','kitchen','dj','client','admin'].includes(p)) {
      onModuleClick(p);
    } else {
      setPage(p);
    }
  }

  return (
    <div style={{ background:'#080810', minHeight:'100vh', fontFamily:"'Outfit',sans-serif", color:'#F5F0E8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#0E0E1A; }
        ::-webkit-scrollbar-thumb { background:#6B5520; border-radius:2px; }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse   { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes pDrift  { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:.8} 90%{opacity:.6} 100%{transform:translateY(-90vh) translateX(30px);opacity:0} }
        @keyframes drawLine{ from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
        .rv { opacity:0; transform:translateY(30px); transition:opacity .7s ease, transform .7s ease; }
        .rv-in { opacity:1; transform:translateY(0); }
      `}</style>

      {page === 'landing' && (
        <>
          <Navbar page={page} setPage={handleSetPage} onStaffLogin={onStaffLogin} />
          <Hero setPage={handleSetPage} />
          <Marquee />
          <Features />
          <Workflow />
          <USPStrip />
          <Modules setPage={handleSetPage} />
          <Stats />
          <Footer />
        </>
      )}

      {page === 'dashboard' && (
        <>
          <Navbar page={page} setPage={handleSetPage} />
          <Dashboard setPage={handleSetPage} />
        </>
      )}

      {['sales','finance','gre','kitchen','dj','client','admin'].includes(page) && (
        <>
          <Navbar page={page} setPage={handleSetPage} />
          <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:24 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'3rem', fontWeight:700, color:'#C9A84C' }}>
              {page.charAt(0).toUpperCase() + page.slice(1)} Module
            </div>
            <div style={{ color:'#6B6858', fontSize:15 }}>Coming up next — full module UI</div>
            <button onClick={() => handleSetPage('dashboard')} style={{ padding:'12px 28px', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)', color:'#C9A84C', borderRadius:10, cursor:'pointer', fontSize:13 }}>← Back to Dashboard</button>
          </div>
        </>
      )}
    </div>
  );
}