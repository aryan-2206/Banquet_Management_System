import React, { useState } from 'react';
import { CLIENT, EVENTS, NOTIFICATIONS, DOCUMENTS, GUESTS_SUMMARY, daysUntil } from './dashboard/mockData';
import HeroGreeting             from './dashboard/HeroGreeting';
import UpcomingEventCard        from './dashboard/UpcomingEventCard';
import AllEventsTimeline        from './dashboard/AllEventsTimeline';
import PaymentSummaryWidget     from './dashboard/PaymentSummaryWidget';
import GuestManagementQuickView from './dashboard/GuestManagementQuickView';
import MenuSnapshotCard         from './dashboard/MenuSnapshotCard';
import NotificationsFeed        from './dashboard/NotificationsFeed';
import DocumentsVault           from './dashboard/DocumentsVault';
import ContactSupportCard       from './dashboard/ContactSupportCard';
import VendorVisibilityPanel    from './dashboard/VendorVisibilityPanel';
import PostEventSection         from './dashboard/PostEventSection';

const GOLD = '#C9A84C';
const nextEvent   = EVENTS.filter(e => daysUntil(e.date) >= 0).sort((a,b) => new Date(a.date)-new Date(b.date))[0];
const isPostEvent = nextEvent ? daysUntil(nextEvent.date) < 0 : true;
const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

const TABS = [
  { id:'home',      label:'Home',      emoji:'🏠' },
  { id:'events',    label:'Events',    emoji:'📅' },
  { id:'guests',    label:'Guests',    emoji:'👥' },
  { id:'payments',  label:'Payments',  emoji:'💰' },
  { id:'documents', label:'Docs',      emoji:'📄' },
  { id:'feedback',  label:'Feedback',  emoji:'⭐' },
];

function HomeTab({ setTab }) {
  return (
    <>
      <HeroGreeting client={CLIENT} nextEvent={nextEvent} onQuickAction={setTab} />
      <UpcomingEventCard event={nextEvent} />
      <MenuSnapshotCard event={nextEvent} />
      <VendorVisibilityPanel vendors={nextEvent?.vendors} />
      <ContactSupportCard client={CLIENT} />
      {isPostEvent && <PostEventSection feedbackSubmitted={false} />}
    </>
  );
}

const PANEL = {
  home:      HomeTab,
  events:    () => <AllEventsTimeline events={EVENTS} />,
  guests:    () => <GuestManagementQuickView summary={GUESTS_SUMMARY} />,
  payments:  () => <PaymentSummaryWidget events={EVENTS} />,
  documents: () => <DocumentsVault documents={DOCUMENTS} />,
  feedback:  () => <><NotificationsFeed notifications={NOTIFICATIONS} onNavigate={() => {}} />{isPostEvent && <PostEventSection feedbackSubmitted={false} />}</>,
};

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActivePanel = PANEL[activeTab];

  return (
    <div className="min-h-screen bg-[#080810] font-sans text-[#F5F0E8] flex">

      {/* ─── Global styles ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.2); border-radius:99px }
        .portal-card { background:rgba(255,255,255,0.03); border:1px solid rgba(201,168,76,0.12); border-radius:1.25rem; padding:1.25rem; margin-bottom:1rem; backdrop-filter:blur(16px); }
        .portal-section-label { font-size:10px; color:#C9A84C; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.875rem; font-weight:500; }
      `}</style>

      {/* ─── Ambient background (fixed) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(201,168,76,0.07) 0%,transparent 60%)'}} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{backgroundImage:'linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)',backgroundSize:'60px 60px'}} />

      {/* ════════════════════════════════
          LEFT SIDEBAR — hidden on mobile, visible md+
          md: icons-only 64px | lg: always expanded 220px
          ════════════════════════════════ */}
      <aside
        className={`
          hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40
          transition-all duration-300 ease-in-out
          border-r border-[rgba(201,168,76,0.1)]
          ${sidebarOpen ? 'w-[220px]' : 'lg:w-[220px] md:w-16'}
        `}
        style={{ background:'rgba(8,8,16,0.95)', backdropFilter:'blur(20px)' }}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Brand logo */}
        <div className={`flex items-center gap-3 py-5 border-b border-[rgba(201,168,76,0.1)] ${sidebarOpen ? 'px-5' : 'px-3 lg:px-5'}`}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm text-[#080810]"
            style={{ background:'linear-gradient(135deg,#C9A84C,#6B5520)' }}>B</div>
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'lg:w-auto lg:opacity-100 md:w-0 md:opacity-0'}`}>
            <div className="font-serif text-base font-bold text-[#F5F0E8] whitespace-nowrap">
              Banquet <span style={{color:GOLD}}>IM</span>
            </div>
            <div className="text-[8px] text-[#6B5520] tracking-[0.2em] uppercase -mt-0.5 whitespace-nowrap">Client Portal</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const hasUnread = tab.id === 'feedback' && unreadCount > 0;
            return (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-xl mx-2
                  transition-all duration-200 cursor-pointer border-none text-left
                  ${active
                    ? 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C]'
                    : 'text-[#6B6858] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#9D9880]'
                  }
                `}
                style={{ width:'calc(100% - 16px)' }}
              >
                <span className="text-xl flex-shrink-0 relative">
                  {tab.emoji}
                  {hasUnread && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-[#080810]" />}
                </span>
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'lg:w-auto lg:opacity-100 md:w-0 md:opacity-0'}`}>
                  {tab.label}
                </span>
                {active && <div className="absolute left-0 w-0.5 h-6 rounded-r bg-[#C9A84C]" />}
              </button>
            );
          })}
        </nav>

        {/* Client info at bottom of sidebar */}
        <div className={`p-3 border-t border-[rgba(201,168,76,0.1)] flex items-center gap-3 overflow-hidden`}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#080810]"
            style={{ background:'linear-gradient(135deg,#C9A84C,#9B6DE8)' }}>
            {CLIENT.name.slice(0,1)}
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'w-auto opacity-100' : 'lg:w-auto lg:opacity-100 md:w-0 md:opacity-0'}`}>
            <div className="text-xs font-medium text-[#F5F0E8] whitespace-nowrap">{CLIENT.name}</div>
            <div className="text-[10px] text-[#4A4840] whitespace-nowrap">{CLIENT.accountId}</div>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN content wrapper
          Shifts right on md+ to account for sidebar
          ════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-16 lg:ml-[220px] transition-all duration-300">

        {/* ── Top header bar (always visible) ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3"
          style={{ background:'rgba(8,8,16,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          {/* Mobile brand / Desktop section title */}
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-[#080810]"
                style={{ background:'linear-gradient(135deg,#C9A84C,#6B5520)' }}>B</div>
              <span className="font-serif text-sm font-bold text-[#F5F0E8]">Banquet <span style={{color:GOLD}}>IM</span></span>
            </div>
            <h1 className="hidden md:block text-lg lg:text-xl font-serif font-bold text-[#F5F0E8]">
              {TABS.find(t => t.id === activeTab)?.emoji}{' '}
              {activeTab === 'home' ? `Welcome, ${CLIENT.name.split(' ')[0]}` : TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          {/* Right: bell + client name (desktop) */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-sm text-[#6B6858]">{CLIENT.name}</span>
            <div className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-[#080810]"
              style={{ background:'linear-gradient(135deg,#C9A84C,#9B6DE8)' }}>
              {CLIENT.name.slice(0,1)}
            </div>
            <button onClick={() => setActiveTab('feedback')}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-xl"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[9px] font-bold px-1 min-w-[18px] text-center" style={{ border:'2px solid #080810' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className="flex-1 overflow-y-auto relative z-10 animate-[fadeUp_0.4s_ease_both]"
          style={{ paddingBottom:'calc(72px + env(safe-area-inset-bottom))' }}
        >
          {/* Mobile section heading */}
          <div className="md:hidden px-4 pt-4 pb-1">
            <h1 className="text-xl font-serif font-bold text-[#F5F0E8]">
              {TABS.find(t => t.id === activeTab)?.emoji}{' '}
              {activeTab === 'home' ? `Welcome, ${CLIENT.name.split(' ')[0]}` : TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          {/* Content padding + max-width */}
          <div className="px-4 md:px-6 lg:px-8 pt-2 pb-4 max-w-[1200px] mx-auto">
            <ActivePanel setTab={setActiveTab} />
          </div>
        </main>

        {/* ════════════════════════════════
            BOTTOM TAB BAR — mobile only (md:hidden)
            ════════════════════════════════ */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center"
          style={{
            background:'rgba(8,8,16,0.97)', backdropFilter:'blur(20px)',
            borderTop:'1px solid rgba(201,168,76,0.12)',
            paddingBottom:'max(16px, env(safe-area-inset-bottom))',
            paddingTop:'8px',
          }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const hasUnread = tab.id === 'feedback' && unreadCount > 0;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 relative border-none bg-transparent cursor-pointer"
                style={{ WebkitTapHighlightColor:'transparent' }}>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#C9A84C]" />}
                <span className="text-lg leading-none" style={{ filter: active ? 'none' : 'grayscale(70%)' }}>{tab.emoji}</span>
                <span className={`text-[9px] font-medium tracking-wide ${active ? 'text-[#C9A84C]' : 'text-[#4A4840]'}`}>{tab.label}</span>
                {hasUnread && !active && <span className="absolute top-0 right-1 w-1.5 h-1.5 rounded-full bg-red-500" style={{ border:'1.5px solid #080810' }} />}
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
