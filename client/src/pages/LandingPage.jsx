import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cursor from '../components/shared/Cursor';
import ParticleField from '../components/shared/ParticleField';
import useReveal from '../hooks/useReveal';
import useCounter from '../hooks/useCounter';

/* ─── tiny icons as inline SVG components ─── */
const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  menu:       'M3 12h18M3 6h18M3 18h18',
  x:          'M18 6 6 18M6 6l12 12',
  chevron:    'M6 9l6 6 6-6',
  calendar:   'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  whatsapp:   'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  qr:         'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14h1v1h-1zM14 20h3v1h-3zM20 20h1v1h-1zM17 17h3v3h-3z',
  finance:    'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  kitchen:    'M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6zM6 17h12',
  brain:      'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.73A3 3 0 0 1 4.46 9.1a3 3 0 0 1 .49-5.1A2.5 2.5 0 0 1 9.5 2M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.73A3 3 0 0 0 19.54 9.1a3 3 0 0 0-.49-5.1A2.5 2.5 0 0 0 14.5 2z',
  shield:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  zap:        'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  users:      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  star:       'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  check:      'M20 6 9 17l-5-5',
  clock:      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  dj:         'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  gallery:    'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  refund:     'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
};

/* ─── NAVBAR ─── */
function Navbar({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { id: 'home',     label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'modules',  label: 'Modules' },
    { id: 'stats',    label: 'Stats' },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
      ${scrolled ? 'py-3 backdrop-blur-2xl bg-[#080810]/80 border-b border-[#C9A84C]/10' : 'py-5 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#6B5520]
            flex items-center justify-center text-[#080810] font-bold text-sm animate-glow-pulse">B</div>
          <div>
            <span className="font-['Cormorant_Garamond'] text-xl font-700 text-[#F5F0E8] tracking-wide">
              Banquet<span className="gold-shimmer font-bold"> IM</span>
            </span>
            <div className="text-[10px] text-[#6B5520] tracking-[.2em] uppercase -mt-1">IntelliManager 2026</div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              className={`nav-link ${active === l.id ? 'active' : ''}`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button className="btn-outline-gold px-4 py-2 text-sm">Sign In</button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[#C9A84C]" onClick={() => setOpen(!open)}>
          <Icon d={open ? ICONS.x : ICONS.menu} size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 glass border-t border-[#C9A84C]/10 py-4 px-6">
          {links.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              className="block w-full text-left py-3 nav-link text-base border-b border-[#C9A84C]/08 last:border-0">
              {l.label}
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            <button className="btn-outline-gold px-4 py-2 text-sm flex-1">Sign In</button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── HERO SECTION ─── */
function Hero() {
  const [typed, setTyped] = useState('');
  const phrases = ['Inquiry', 'Booking', 'Payment', 'Check-In', 'Post-Event'];
  const [pi, setPi] = useState(0);

  useEffect(() => {
    let i = 0, deleting = false;
    const phrase = () => phrases[pi];
    const tick = () => {
      if (!deleting && i <= phrase().length) {
        setTyped(phrase().slice(0, i++));
        setTimeout(tick, 80);
      } else if (!deleting && i > phrase().length) {
        deleting = true;
        setTimeout(tick, 1400);
      } else if (deleting && i >= 0) {
        setTyped(phrase().slice(0, i--));
        setTimeout(tick, 45);
      } else {
        deleting = false;
        setPi(p => (p + 1) % phrases.length);
      }
    };
    const t = setTimeout(tick, 300);
    return () => clearTimeout(t);
  }, [pi]);

  return (
    <section id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden noise"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.08) 0%, transparent 60%), #080810' }}>

      {/* Particle field */}
      <ParticleField count={50} />

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full opacity-10 animate-glow-pulse"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full opacity-8 animate-glow-pulse delay-700"
        style={{ background: 'radial-gradient(circle, #5B8FE8 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Hero content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 mb-8
          rounded-full glass border border-[#C9A84C]/20 text-[#C9A84C] text-xs font-medium tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5FBF8A] animate-pulse" />
          Live Event Intelligence Platform · 2026
        </div>

        {/* Main headline */}
        <h1 className="animate-fade-up delay-100 font-['Cormorant_Garamond'] font-700
          text-[clamp(3rem,7vw,7rem)] leading-[1.05] text-[#F5F0E8] mb-4">
          Every Banquet.<br/>
          <span className="gold-shimmer">Perfectly Orchestrated.</span>
        </h1>

        {/* Typewriter sub */}
        <p className="animate-fade-up delay-200 text-[#9D9880] text-xl mb-2 font-light">
          From first{' '}
          <span className="text-[#E8D08A] font-medium border-r-2 border-[#C9A84C] pr-0.5">
            {typed}
          </span>
          {' '}to last applause
        </p>
        <p className="animate-fade-up delay-300 text-[#4A4840] text-base mb-12 max-w-xl mx-auto">
          A unified command center for Sales, Finance, Kitchen, GRE & Clients —
          powered by real-time intelligence and WhatsApp-native workflows.
        </p>

        {/* ── CTA Buttons ── */}
        <div className="animate-fade-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            to="/sales/new"
            className="btn-gold px-8 py-4 text-base rounded-xl shadow-lg"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em' }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Book Your Event</span>
          </Link>
          <button
            onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-outline-gold px-8 py-4 text-base rounded-xl"
            style={{ fontSize: 15 }}
          >
            View Platform →
          </button>
        </div>

        {/* Trust strip */}
        <div className="animate-fade-up delay-800 flex flex-wrap justify-center gap-6 mt-2">
          {[
            { icon: ICONS.shield, label: 'GST Compliant' },
            { icon: ICONS.whatsapp, label: 'WhatsApp Native' },
            { icon: ICONS.zap, label: 'AI-Powered Audit' },
            { icon: ICONS.qr, label: 'QR Check-In' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[#9D9880] text-sm">
              <Icon d={icon} size={14} className="text-[#C9A84C]" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-5 h-8 rounded-full border border-[#C9A84C]/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-[#C9A84C] animate-bounce" />
        </div>
      </div>
    </section>
  );
}

/* ─── MARQUEE STRIP ─── */
function MarqueeStrip() {
  const items = [
    '✦ Real-Time Guest Check-In',
    '✦ WhatsApp PO Delivery',
    '✦ AI Menu Optimization',
    '✦ Installment Reminders',
    '✦ QR Entry System',
    '✦ Conflict Detection',
    '✦ Custom Caterer Support',
    '✦ Cancellation Post-Mortem',
    '✦ DJ Live View',
    '✦ Refund Policy Engine',
    '✦ Redis Queue Management',
  ];
  const repeated = [...items, ...items];

  return (
    <div className="py-5 border-y border-[#C9A84C]/10 overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #080810, #0E0E1A, #080810)' }}>
      <div className="marquee-wrap">
        <div className="marquee-inner animate-marquee">
          {repeated.map((item, i) => (
            <span key={i} className="inline-block px-8 text-[#9D9880] text-sm font-medium tracking-wide whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── FEATURES GRID ─── */
function FeaturesSection() {
  const features = [
    {
      icon: ICONS.calendar, color: '#5B8FE8',
      title: 'Smart Event Locking',
      desc: 'Redis-powered reservation queue — first to pay, first to book. Automatic release after 48h if payment not received.',
    },
    {
      icon: ICONS.finance, color: '#5FBF8A',
      title: 'Finance Gatekeeper',
      desc: 'GST-compliant ledger, installment plans with automated WhatsApp reminders T-30, T-7, T-1 days before due.',
    },
    {
      icon: ICONS.qr, color: '#C9A84C',
      title: 'QR Guest Check-In',
      desc: 'Mobile-first GRE dashboard with live counter. Walked-in vs expected — kitchen gets real-time pax updates via socket.',
    },
    {
      icon: ICONS.kitchen, color: '#E85555',
      title: 'Kitchen Live Feed',
      desc: 'Prep timeline, portion adjustment per live headcount, and waste logging for the post-event audit trail.',
    },
    {
      icon: ICONS.brain, color: '#9B6DE8',
      title: 'AI Audit Intelligence',
      desc: 'Featherless.ai analyzes cancellations, popular menus, adjacent-event synergies to minimize waste & maximize revenue.',
    },
    {
      icon: ICONS.whatsapp, color: '#25D366',
      title: 'WhatsApp-First Comms',
      desc: 'Automated PO to client, Function Prospectus to team, RSVP link, and music requests — all native WhatsApp.',
    },
    {
      icon: ICONS.dj, color: '#E8C455',
      title: 'DJ Live View',
      desc: 'Guest music requests stream live to the DJ tablet UI. Queue management, vote-up, and now-playing display.',
    },
    {
      icon: ICONS.refund, color: '#FF8C42',
      title: 'Refund Policy Engine',
      desc: '10-day refund window tracked automatically. Status machine handles cancellations with prorated refund calculation.',
    },
    {
      icon: ICONS.gallery, color: '#E85E9A',
      title: 'Collaborative Gallery',
      desc: 'Guests upload photos in real-time. Admins moderate via AI auto-flagging. Shared event memory, forever.',
    },
  ];

  return (
    <section id="features" className="py-28 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <p className="reveal text-[#C9A84C] text-xs tracking-[.3em] uppercase font-medium mb-4">Platform Capabilities</p>
          <h2 className="reveal delay-100 font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-700 text-[#F5F0E8] leading-tight">
            Every feature you need.<br/>
            <span className="gold-shimmer">Nothing you don't.</span>
          </h2>
          <p className="reveal delay-200 text-[#9D9880] mt-4 max-w-lg mx-auto">
            Built for the specific chaos of banquet operations — multi-role, multi-session, multi-venue.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title}
              className="reveal glass glass-hover rounded-2xl p-6 group relative overflow-hidden"
              style={{ animationDelay: `${i * 0.07}s` }}>
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 30% 30%, ${f.color}06 0%, transparent 70%)` }} />

              <div className="icon-bg mb-4" style={{ color: f.color, borderColor: `${f.color}30`, background: `${f.color}10` }}>
                <Icon d={f.icon} size={20} />
              </div>
              <h3 className="text-[#F5F0E8] font-semibold text-base mb-2 group-hover:text-[#E8D08A] transition-colors">
                {f.title}
              </h3>
              <p className="text-[#9D9880] text-sm leading-relaxed">{f.desc}</p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] scale-x-0 group-hover:scale-x-100
                transition-transform duration-500 origin-left"
                style={{ background: `linear-gradient(90deg, ${f.color}60, transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── WORKFLOW / JOURNEY ─── */
function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      phase: 'A', label: 'Inquiry & Lock-In', color: '#5B8FE8',
      who: 'Sales Team',
      icon: ICONS.calendar,
      points: [
        'Party name, client details, GST, date/time/venue captured',
        'Tiered menu engine — Standard / Premium / Elite',
        'Redis queue: simultaneous bookings → first payment wins',
        'Conflict detection flags overlapping events instantly',
      ],
      status: 'badge-enquiry',
      statusLabel: 'Temporary Enquiry',
    },
    {
      phase: 'B', label: 'Finance Gatekeeper', color: '#5FBF8A',
      who: 'Finance Manager',
      icon: ICONS.finance,
      points: [
        'Payment tracker: deposit vs. final settlement',
        'Installment builder with cron-based WhatsApp reminders',
        'GST invoice auto-generation (PDF via pdfkit)',
        '"Payment Received" toggle flips status → Confirmed',
      ],
      status: 'badge-confirmed',
      statusLabel: 'Confirmed',
    },
    {
      phase: 'C', label: 'Event Day Operations', color: '#C9A84C',
      who: 'GRE + Kitchen',
      icon: ICONS.qr,
      points: [
        'QR scanner for guest entry — no paper lists',
        'Live pax counter pushes to kitchen via WebSocket',
        'Walk-in accommodation with dietary flag',
        'DJ queue & collaborative photo gallery go live',
      ],
      status: 'badge-pending',
      statusLabel: 'Live Event',
    },
    {
      phase: 'D', label: 'Post-Event Intelligence', color: '#9B6DE8',
      who: 'Admin + AI',
      icon: ICONS.brain,
      points: [
        'Menu popularity → AI recommends optimal future combos',
        'Cancellation post-mortem: price / date / competitor',
        'Adjacent-event synergy report to cut waste & labor',
        'Featherless.ai generates natural-language executive summary',
      ],
      status: 'badge-enquiry',
      statusLabel: 'Audit Complete',
    },
  ];

  const s = steps[activeStep];

  return (
    <section id="workflow" className="py-28 px-6 relative"
      style={{ background: 'linear-gradient(180deg, #080810 0%, #0E0E1A 50%, #080810 100%)' }}>
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="reveal text-[#C9A84C] text-xs tracking-[.3em] uppercase font-medium mb-4">Customer Journey</p>
          <h2 className="reveal delay-100 font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4rem)] font-700 text-[#F5F0E8]">
            Four phases. One source of truth.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Step selector */}
          <div className="reveal-left space-y-3">
            {steps.map((step, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group
                  ${activeStep === i
                    ? 'border-[#C9A84C]/40 bg-[#C9A84C]/06'
                    : 'border-[#C9A84C]/08 bg-transparent hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/03'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-['Cormorant_Garamond'] font-700 text-lg shrink-0 transition-all duration-300"
                    style={{
                      background: activeStep === i ? `${step.color}20` : 'rgba(255,255,255,.03)',
                      color: activeStep === i ? step.color : '#4A4840',
                      border: `1px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,.05)'}`,
                    }}>
                    {step.phase}
                  </div>
                  <div>
                    <div className="text-[#F5F0E8] font-medium text-sm">{step.label}</div>
                    <div className="text-[#4A4840] text-xs mt-0.5">{step.who}</div>
                  </div>
                  {activeStep === i && (
                    <div className="ml-auto">
                      <span className={`badge ${step.status}`}>{step.statusLabel}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="reveal-right">
            <div key={activeStep} className="glass rounded-3xl p-8 border border-[#C9A84C]/15 animate-scale-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10"
                style={{ background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

              <div className="flex items-center gap-4 mb-6">
                <div className="icon-bg" style={{ color: s.color, background: `${s.color}15`, borderColor: `${s.color}30` }}>
                  <Icon d={s.icon} size={22} />
                </div>
                <div>
                  <p className="text-[#9D9880] text-xs uppercase tracking-widest">Phase {s.phase}</p>
                  <h3 className="text-[#F5F0E8] font-semibold text-lg">{s.label}</h3>
                </div>
              </div>

              <ul className="space-y-4">
                {s.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#9D9880] text-sm">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${s.color}20`, color: s.color }}>
                      <Icon d={ICONS.check} size={11} />
                    </div>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-[#C9A84C]/10 flex items-center justify-between">
                <span className="text-[#4A4840] text-xs">Role: <span className="text-[#9D9880]">{s.who}</span></span>
                <span className={`badge ${s.status}`}>{s.statusLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* \u2500\u2500\u2500 MODULE LOGIN MODAL \u2500\u2500\u2500 */
function ModuleLoginModal({ module: m, onClose, onEnter }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo credentials per role
  const DEMO_CREDS = {
    sales:   { user: 'sales@banquet.com',   pass: 'sales123',   label: 'Sales Manager' },
    finance: { user: 'finance@banquet.com', pass: 'finance123', label: 'Finance Manager' },
    kitchen: { user: 'kitchen@banquet.com', pass: 'kitchen123', label: 'Kitchen Head' },
    gre:     { user: 'gre@banquet.com',     pass: 'gre123',     label: 'GRE Officer' },
    dj:      { user: 'dj@banquet.com',      pass: 'dj123',      label: 'DJ / Live Artist' },
    client:  { user: 'client@banquet.com',  pass: 'client123',  label: 'Client' },
    admin:   { user: 'admin@banquet.com',   pass: 'admin123',   label: 'Admin' },
  };

  const cred = DEMO_CREDS[m.id] || { pass: 'demo123', label: m.role };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // simulate auth
    if (password === cred.pass || password === 'demo') {
      onEnter(m.id);
    } else {
      setError(`Incorrect password. Demo: "${cred.pass}"`);
    }
    setLoading(false);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#0E0E1A', border: `1px solid ${m.color}30`, borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: `0 0 80px ${m.color}15` }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d={m.icon} />
            </svg>
          </div>
          <div>
            <div style={{ color: m.color, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>{m.badge} · Role Access</div>
            <div style={{ color: '#F5F0E8', fontWeight: 600, fontSize: 15 }}>{m.role}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4A4840', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        {/* Demo hint */}
        <div style={{ background: `${m.color}08`, border: `1px solid ${m.color}20`, borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#9D9880' }}>
          <span style={{ color: m.color, fontWeight: 600 }}>Demo: </span>
          <code style={{ color: '#C9A84C' }}>{cred.pass}</code>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#9D9880', fontSize: 11, marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Password</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder={`Enter password for ${cred.label}`}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? '#E85555' : 'rgba(201,168,76,0.2)'}`, borderRadius: 10, padding: '12px 14px', color: '#F5F0E8', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = m.color}
              onBlur={e => e.target.style.borderColor = error ? '#E85555' : 'rgba(201,168,76,0.2)'}
            />
            {error && <p style={{ color: '#E85555', fontSize: 12, marginTop: 6 }}>{error}</p>}
          </div>

          <button
            type="submit"
            disabled={!password || loading}
            style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: loading || !password ? 'rgba(201,168,76,0.15)' : `linear-gradient(135deg, ${m.color}, ${m.color}CC)`, color: loading || !password ? '#6B6858' : '#080810', fontWeight: 700, fontSize: 14, cursor: password && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.3s', letterSpacing: '0.05em' }}
          >
            {loading ? 'Authenticating…' : `Enter ${m.role} →`}
          </button>
        </form>
      </div>
    </div>
  );
}

/* \u2500\u2500\u2500 MODULES GRID (role cards) \u2500\u2500\u2500 */
function ModulesSection() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [loginModal, setLoginModal] = useState(null); // holds the module being logged into

  const modules = [
    {
      id: 'sales', role: 'Sales Manager', icon: ICONS.calendar, color: '#5B8FE8',
      badge: 'M1', desc: 'New bookings, calendar heatmap, overlap detection, quotation preview.',
      screens: ['Dashboard', 'New Booking', 'Venue Calendar', 'Booking Detail'],
    },
    {
      id: 'finance', role: 'Finance Manager', icon: ICONS.finance, color: '#5FBF8A',
      badge: 'M1', desc: 'Payment ledger, installment builder, GST report, approval gate.',
      screens: ['Payment Ledger', 'Installment Builder', 'GST Report', 'Approval Gate'],
    },
    {
      id: 'kitchen', role: 'Kitchen / Ops', icon: ICONS.kitchen, color: '#E85555',
      badge: 'M2', desc: 'Menu manifest, prep timeline, live pax feed, waste logger.',
      screens: ['Kitchen Dashboard', 'Menu Manifest', 'Prep Timeline', 'Waste Logger'],
    },
    {
      id: 'gre', role: 'Guest Relations', icon: ICONS.qr, color: '#C9A84C',
      badge: 'M3', desc: 'QR scanner, live check-in counter, walk-in management.',
      screens: ['GRE Dashboard', 'QR Scanner', 'Guest List', 'Live Check-In'],
    },
    {
      id: 'dj', role: 'DJ Interface', icon: ICONS.dj, color: '#E8C455',
      badge: 'M3', desc: 'Real-time music request queue from guests via WhatsApp/portal.',
      screens: ['DJ Live View', 'Request Queue', 'Now Playing', 'Vote System'],
    },
    {
      id: 'client', role: 'Client Portal', icon: ICONS.users, color: '#9B6DE8',
      badge: 'M3', desc: 'Event summary, RSVP, feedback form, photo gallery.',
      screens: ['Event Summary', 'Guest RSVP', 'Photo Gallery', 'Feedback Form'],
    },
    {
      id: 'admin', role: 'Admin / AI', icon: ICONS.brain, color: '#E85E9A',
      badge: 'M4', desc: 'AI insights, staff assignment, cancellation analysis, featherless.ai.',
      screens: ['Admin Dashboard', 'Staff Assignment', 'Cancellation Log', 'AI Insights'],
    },
  ];

  const handleOpen = (m) => setLoginModal(m);
  const handleEnter = (id) => { setLoginModal(null); navigate(`/${id}`); };

  return (
    <>
      {loginModal && (
        <ModuleLoginModal
          module={loginModal}
          onClose={() => setLoginModal(null)}
          onEnter={handleEnter}
        />
      )}

      <section id="modules" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="reveal text-[#C9A84C] text-xs tracking-[.3em] uppercase font-medium mb-4">Role-Based Modules</p>
            <h2 className="reveal delay-100 font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4rem)] font-700 text-[#F5F0E8]">
              Every role. Its own lens.
            </h2>
            <p className="reveal delay-200 text-[#9D9880] mt-4 max-w-lg mx-auto text-sm">
              Seven specialised interfaces — each tailored to what that role actually needs to see and do.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map((m, i) => (
              <div key={m.id}
                className="reveal glass glass-hover rounded-2xl p-6 group relative overflow-hidden cursor-pointer"
                style={{ transitionDelay: `${i * 0.05}s` }}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleOpen(m)}
              >
                {/* Animated bg */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 20% 20%, ${m.color}08 0%, transparent 60%)` }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="icon-bg" style={{ color: m.color, background: `${m.color}12`, borderColor: `${m.color}25` }}>
                    <Icon d={m.icon} size={20} />
                  </div>
                  <span className="text-[10px] tracking-widest text-[#4A4840] font-mono border border-[#C9A84C]/15 px-2 py-0.5 rounded">
                    {m.badge}
                  </span>
                </div>

                <h3 className="text-[#F5F0E8] font-semibold text-sm mb-1 group-hover:text-[#E8D08A] transition-colors">{m.role}</h3>
                <p className="text-[#6B6858] text-xs mb-4 leading-relaxed">{m.desc}</p>

                {/* Screen list (shown on hover) */}
                <div className={`space-y-1 overflow-hidden transition-all duration-500 ${hovered === m.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {m.screens.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[#9D9880] text-xs">
                      <div className="w-1 h-1 rounded-full" style={{ background: m.color }} />
                      {s}
                    </div>
                  ))}
                </div>

                {/* Enter button */}
                <button
                  className="mt-4 w-full py-2 rounded-lg text-xs font-medium transition-all duration-300 border"
                  style={{ color: m.color, borderColor: `${m.color}30`, background: `${m.color}08` }}
                  onClick={(e) => { e.stopPropagation(); handleOpen(m); }}
                >
                  Open Module →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


/* ─── STATS SECTION ─── */
function StatCard({ value, suffix = '', label, sublabel, color, inView }) {
  const count = useCounter(value, 2200, inView);
  return (
    <div className="reveal glass rounded-2xl p-8 text-center group glass-hover">
      <div className="stat-num mb-1" style={{ color }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-[#F5F0E8] font-medium text-sm mb-1">{label}</div>
      <div className="text-[#4A4840] text-xs">{sublabel}</div>
    </div>
  );
}

function StatsSection() {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: .3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { value: 2500, suffix: '+', label: 'Events Managed',   sublabel: 'Across all venues',      color: '#C9A84C' },
    { value: 98,   suffix: '%', label: 'On-Time Delivery', sublabel: 'Function Prospectus',     color: '#5FBF8A' },
    { value: 40,   suffix: '%', label: 'Less Food Waste',  sublabel: 'Via AI menu synergy',     color: '#5B8FE8' },
    { value: 12,   suffix: 'x', label: 'Faster Check-In',  sublabel: 'QR vs paper guest list',  color: '#9B6DE8' },
  ];

  return (
    <section id="stats" ref={ref} className="py-28 px-6 relative"
      style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 50%, rgba(201,168,76,.05) 0%, transparent 70%), #080810' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="reveal text-[#C9A84C] text-xs tracking-[.3em] uppercase font-medium mb-4">Platform Impact</p>
          <h2 className="reveal delay-100 font-['Cormorant_Garamond'] text-[clamp(2rem,4vw,3.5rem)] font-700 text-[#F5F0E8]">
            Numbers that speak for themselves.
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── USP BANNER ─── */
function USPSection() {
  const usps = [
    { icon: ICONS.zap,    title: 'Redis Queue',       desc: 'Simultaneous bookings resolved fairly — first payment wins, not first click.' },
    { icon: ICONS.shield, title: '10-Day Refund',     desc: 'Automated policy engine tracks refund windows and prorated calculations.' },
    { icon: ICONS.clock,  title: '48h Auto-Release',  desc: 'Unpaid reservations auto-release after 48 hours back to open inventory.' },
    { icon: ICONS.star,   title: 'Custom Caterer',    desc: 'Bring your own chef. Build a custom menu with dynamic real-time pricing.' },
  ];
  return (
    <section className="py-20 px-6 border-y border-[#C9A84C]/08">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {usps.map((u, i) => (
            <div key={u.title} className="reveal flex gap-4" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="icon-bg shrink-0 mt-1"><Icon d={u.icon} size={18} className="text-[#C9A84C]" /></div>
              <div>
                <div className="text-[#F5F0E8] font-semibold text-sm mb-1">{u.title}</div>
                <div className="text-[#6B6858] text-xs leading-relaxed">{u.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#C9A84C]/08">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#6B5520] flex items-center justify-center text-[#080810] font-bold text-sm">B</div>
          <span className="font-['Cormorant_Garamond'] text-[#F5F0E8] font-700">Banquet IntelliManager</span>
        </div>
        <p className="text-[#4A4840] text-xs tracking-wide">
          Built for HackNiche 4.0 · MERN + Redis + Tailwind · WhatsApp Business API
        </p>
        <div className="flex gap-4 text-[#4A4840] text-xs">
          {['Privacy', 'Terms', 'API Docs', 'Support'].map(l => (
            <a key={l} href="#" className="hover:text-[#C9A84C] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── ROOT PAGE ─── */
export default function LandingPage() {
  useReveal();
  const [active, setActive] = useState('home');

  useEffect(() => {
    const sections = ['home','features','workflow','modules','stats'];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: .4 });
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--obsidian)' }}>
      <Cursor />
      <Navbar active={active} setActive={setActive} />
      <Hero />
      <MarqueeStrip />
      <FeaturesSection />
      <WorkflowSection />
      <USPSection />
      <ModulesSection />
      <StatsSection />
      <Footer />
    </div>
  );
}