import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { CLIENT, EVENTS as MOCK_EVENTS, NOTIFICATIONS, DOCUMENTS, GUESTS_SUMMARY, daysUntil } from './dashboard/mockData';
import '../client-portal/ClientPortal.css';
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
// Static fallback logic removed; moved into component state

const TABS = [
  { id:'home',      label:'Home',      emoji:'🏠' },
  { id:'events',    label:'Events',    emoji:'📅' },
  { id:'payments',  label:'Payments',  emoji:'💰' },
  { id:'documents', label:'Docs',      emoji:'📄' },
  { id:'feedback',  label:'Feedback',  emoji:'⭐' },
];

function HomeTab({ setTab, client, nextEvent, isPostEvent, events, globalGuestSummary }) {
  function handleQuickAction(action) {
    const tabMap = { payments: 'payments', guests: 'guests', menu: 'events', support: 'home' };
    setTab(tabMap[action] || 'home');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <HeroGreeting client={client} nextEvent={nextEvent} onNavigate={setTab} onQuickAction={handleQuickAction} />
      <div className="portal-grid-home">
        <UpcomingEventCard event={nextEvent} onNavigate={setTab} />
        <PaymentSummaryWidget events={events} compact={true} />
        {globalGuestSummary ? (
          <GuestManagementQuickView summary={globalGuestSummary} onNavigate={setTab} compact={true} eventId={nextEvent?.id} />
        ) : (
          <div className="portal-card text-center text-xs text-[#6B6858] p-4 flex items-center justify-center">Loading guests...</div>
        )}
        <MenuSnapshotCard menu={nextEvent?.menu || []} />
        <ContactSupportCard manager={client.manager} />
      </div>
      {isPostEvent && <PostEventSection feedbackSubmitted={false} />}
    </div>
  );
}

const PANEL = {
  home:      HomeTab,
  events:    ({ events }) => <AllEventsTimeline events={events} />,
  guests:    ({ globalGuestSummary, nextEvent }) => globalGuestSummary ? <GuestManagementQuickView summary={globalGuestSummary} eventId={nextEvent?.id} /> : <div className="portal-card p-6 text-center text-[#9D9880]">Loading guest data...</div>,
  payments:  ({ events }) => <PaymentSummaryWidget events={events} />,
  documents: () => <DocumentsVault documents={DOCUMENTS} />,
  feedback:  ({ isPostEvent }) => <><NotificationsFeed notifications={NOTIFICATIONS} onNavigate={() => {}} />{isPostEvent && <PostEventSection feedbackSubmitted={false} />}</>,
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [clientProfile, setClientProfile] = useState(CLIENT);
  const [loading, setLoading] = useState(true);
  const [globalGuestSummary, setGlobalGuestSummary] = useState(null);

  useEffect(() => {
    api.getBookings().then(res => {
      if (res.success && res.bookings.length > 0) {
        // Map the first DB booking to the portal's format to give a live real-time feel
        const dbEvents = res.bookings.filter(b => b.status !== 'cancelled').map(b => ({
          id: b._id,
          type: b.eventDetails.eventType,
          name: b.personalDetails.name + ' Event',
          date: new Date(b.eventDetails.date).toISOString().split('T')[0],
          time: b.eventDetails.time || '18:00',
          hall: b.eventDetails.venue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          pax: { contracted: b.eventDetails.guests, confirmed: b.eventDetails.guests },
          menuTier: b.menuSelection.customRequirements?.includes('Elite') ? 'Elite' : 'Premium',
          status: b.status,
          totalValue: b.costEstimate.totalCost || 0,
          paid: 0,
          instalments: [],
          highlights: ['Welcome Drink', 'Main Course', 'Desserts'],
          addOns: [],
          menuLocked: false,
          sessions: [],
          vendors: [],
          menu: []
        }));
        if(dbEvents.length > 0) {
          setEvents(dbEvents);
          setClientProfile({
            ...CLIENT,
            name: res.bookings[0].personalDetails.name,
            venue: { name: dbEvents[0].hall, address: '', mapsUrl: '' }
          });

          // Fetch guests for the primary event to populate the Guests widget
          fetch(`http://localhost:5001/api/guests?bookingId=${res.bookings[0]._id}&eventId=${res.bookings[0]._id}`)
            .then(r => r.json())
            .then(gData => {
              if (gData.success) {
                const list = gData.guests;
                const total = list.length;
                const confirmed = list.filter(g => g.rsvp === 'confirmed').length;
                const pending = list.filter(g => g.rsvp === 'pending').length;
                const withoutQR = list.filter(g => g.rsvp === 'confirmed').length;
                const dietary = { veg:0, nonVeg:0, jain:0, halal:0 };
                list.forEach(g => {
                  if (g.dietary?.includes('veg')) dietary.veg++;
                  if (g.dietary?.includes('nonVeg') || g.dietary?.includes('non-veg')) dietary.nonVeg++;
                  if (g.dietary?.includes('jain')) dietary.jain++;
                  if (g.dietary?.includes('halal')) dietary.halal++;
                });
                setGlobalGuestSummary({ total, confirmed, pending, withoutQR, dietary });
              }
            }).catch(() => {});
        }
      }
      setLoading(false);
    });
  }, []);

  const ActivePanel = PANEL[activeTab];

  const nextEvent   = events.filter(e => daysUntil(e.date) >= 0).sort((a,b) => new Date(a.date)-new Date(b.date))[0] || events[0];
  const isPostEvent = nextEvent ? daysUntil(nextEvent.date) < 0 : true;
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#080810] font-sans text-[#F5F0E8] flex">

      {/* ─── Global styles ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(201,168,76,0.07) 0%,transparent 60%)'}} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{backgroundImage:'linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)',backgroundSize:'60px 60px'}} />

      {/* ════════════════════════════════
          LEFT SIDEBAR — hidden on mobile, visible md+
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
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-[#080810]"
            style={{ background:'linear-gradient(135deg,#C9A84C,#6B5520)' }}>B</div>
          {sidebarOpen && <span className="font-serif text-sm font-bold text-[#F5F0E8]">Banquet <span style={{color:GOLD}}>IM</span></span>}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                ${activeTab === tab.id ? 'bg-[rgba(201,168,76,0.15)] text-[#F5F0E8]' : 'text-[#6B6858] hover:bg-[rgba(201,168,76,0.08)]'}
                ${!sidebarOpen && 'lg:justify-center md:justify-center'}
              `}
              title={!sidebarOpen ? tab.label : ''}
            >
              <span className="text-xl">{tab.emoji}</span>
              {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ════════════════════════════════
          MAIN content wrapper
          Shifts right on md+ to account for sidebar
          ════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-16 lg:ml-[220px] transition-all duration-300">

        {/* ── Top header bar (always visible) ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3"
          style={{ background:'rgba(8,8,16,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          
          {/* Back button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#F5F0E8] hover:bg-[rgba(201,168,76,0.1)] transition-colors"
            style={{ border: '1px solid rgba(201,168,76,0.2)' }}
          >
            ← Back
          </button>

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

          {/* Right side - notifications */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-[#F5F0E8] hover:bg-[rgba(201,168,76,0.1)] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 rounded-lg text-[#F5F0E8] hover:bg-[rgba(201,168,76,0.1)] transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
              {activeTab === 'home' ? `Welcome, ${clientProfile.name.split(' ')[0]}` : TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          {/* Content padding + max-width */}
          <div className="px-4 md:px-6 lg:px-8 pt-2 pb-4 max-w-[1200px] mx-auto">
          {loading ? (
             <div className="flex items-center justify-center p-12 text-[#C9A84C] animate-pulse text-sm font-medium tracking-wider">
               Loading Portal Data...
             </div>
          ) : (
            <ActivePanel 
              events={events} 
              client={clientProfile} 
              nextEvent={nextEvent} 
              isPostEvent={isPostEvent} 
              setTab={setActiveTab}
              globalGuestSummary={globalGuestSummary}
            />
          )}
          </div>
        </main>

        {/* ════════════════════════════════
            BOTTOM TAB BAR — mobile only (md:hidden)
            ════════════════════════════════ */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center"
          style={{ background:'rgba(8,8,16,0.98)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(201,168,76,0.1)', paddingBottom:'env(safe-area-inset-bottom)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200
                ${activeTab === tab.id ? 'text-[#F5F0E8]' : 'text-[#6B6858]'}
              `}
            >
              <span className="text-xl">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
