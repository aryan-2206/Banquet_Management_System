import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewBooking.css';

/* ─── Constants ───────────────────────────────────────────────────── */
const STEPS = ['Client Details', 'Event Setup', 'Menu Selection', 'Review & Submit'];

const VENUES = ['Grand Ballroom', 'Terrace Garden', 'Crystal Hall', 'Banquet Suite A', 'Rooftop Lounge', 'Garden Pavilion'];

const MANAGERS = ['Aryan Doshi', 'Priya Sharma', 'Rohan Kumar', 'Meera Joshi'];

const MENUS = {
  Standard: {
    price: 850,
    color: '#6B7C6E',
    badge: 'Value',
    items: [
      { cat: 'Welcome Drinks', dishes: ['Fresh Lime Soda', 'Masala Chaas', 'Seasonal Juice'] },
      { cat: 'Starters',       dishes: ['Veg Seekh Kebab', 'Paneer Tikka', 'Crispy Corn'] },
      { cat: 'Main Course',    dishes: ['Dal Makhani', 'Paneer Butter Masala', 'Veg Pulao', 'Roti Basket'] },
      { cat: 'Desserts',       dishes: ['Gulab Jamun', 'Ice Cream (2 scoops)'] },
    ],
  },
  Premium: {
    price: 1400,
    color: '#C9A96E',
    badge: 'Popular',
    items: [
      { cat: 'Welcome Drinks', dishes: ['Mocktail Station', 'Fresh Juices (4 types)', 'Welcome Shot'] },
      { cat: 'Starters (Veg)', dishes: ['Hara Bhara Kebab', 'Stuffed Mushroom', 'Dahi Ke Sholay'] },
      { cat: 'Starters (Non-Veg)', dishes: ['Chicken Tikka', 'Seekh Kebab', 'Fish Amritsari'] },
      { cat: 'Main Course',    dishes: ['Dal Tadka', 'Paneer Lababdar', 'Chicken Curry', 'Biryani', 'Breads'] },
      { cat: 'Live Counters',  dishes: ['Chaat Counter', 'Dosa Counter'] },
      { cat: 'Desserts',       dishes: ['Gulab Jamun', 'Rabri', 'Ice Cream Sundae', 'Seasonal Sweets'] },
    ],
  },
  Elite: {
    price: 2200,
    color: '#A07840',
    badge: 'Signature',
    items: [
      { cat: 'Welcome Drinks', dishes: ['Signature Mocktail Bar', 'Fresh Juices (8 types)', 'Champagne Toast (non-alc)', 'Cold Press'] },
      { cat: 'Starters (Veg)', dishes: ['Truffle Mushroom Bruschetta', 'Galouti Kebab', 'Paneer Achari Tikka', 'Dahi ke Kebab'] },
      { cat: 'Starters (Non-Veg)', dishes: ['Chicken Malai Tikka', 'Mutton Seekh', 'Prawn Lollipop', 'Tandoori Raan'] },
      { cat: 'Main Course',    dishes: ['Dal Bukhara', 'Paneer Shahi', 'Butter Chicken', 'Mutton Rogan Josh', 'Hyderabadi Biryani', 'Peshwari Naan'] },
      { cat: 'Live Counters',  dishes: ['Pasta Counter', 'Carving Station', 'Chaat & Pani Puri', 'Sushi Counter'] },
      { cat: 'Desserts',       dishes: ['Gelato Bar', 'Phirni', 'Gulab Jamun', 'Tiramisu', 'Seasonal Mithai', 'Chocolate Fountain'] },
    ],
  },
};

const ADDONS = [
  { id: 'welcome_drink_upgrade', label: 'Welcome Drink Upgrade', price: 120, icon: '🥂' },
  { id: 'live_pasta',            label: 'Live Pasta Counter',    price: 200, icon: '🍝' },
  { id: 'premium_dessert',       label: 'Premium Dessert Station', price: 280, icon: '🎂' },
  { id: 'midnight_snack',        label: 'Midnight Snack Package', price: 150, icon: '🌙' },
  { id: 'mocktail_bar',          label: 'Extended Mocktail Bar',  price: 180, icon: '🍹' },
  { id: 'kids_menu',             label: "Children's Menu",        price: 400, icon: '👶' },
];

const GST_RATE = 0.18;

/* ─── Helpers ─────────────────────────────────────────────────────── */
function calcTotal(tier, pax, addons) {
  if (!tier || !pax) return { subtotal: 0, gst: 0, total: 0 };
  const menuPrice = MENUS[tier]?.price || 0;
  const addOnTotal = addons.reduce((s, id) => s + (ADDONS.find(a => a.id === id)?.price || 0), 0);
  const subtotal = (menuPrice + addOnTotal) * pax;
  const gst = subtotal * GST_RATE;
  return { subtotal, gst, total: subtotal + gst };
}

function fmt(n) {
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

/* ─── Component ────────────────────────────────────────────────────── */
export default function NewBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [overlap, setOverlap] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    partyName: '', clientName: '', clientPhone: '', clientEmail: '',
    gstNumber: '', companyName: '',
    date: '', startTime: '', endTime: '', venue: '', pax: '',
    eventManager: '', notes: '',
    tier: '', addons: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAddon = (id) => {
    setForm(f => ({
      ...f,
      addons: f.addons.includes(id) ? f.addons.filter(a => a !== id) : [...f.addons, id],
    }));
  };

  // Fake overlap check
  useEffect(() => {
    if (form.date && form.venue && form.startTime) {
      const blockedCombos = [
        { date: '2026-07-14', venue: 'Grand Ballroom' },
        { date: '2026-07-22', venue: 'Crystal Hall' },
      ];
      const conflict = blockedCombos.find(b => b.date === form.date && b.venue === form.venue);
      setOverlap(conflict ? `${form.venue} is already booked on ${form.date}.` : null);
    }
  }, [form.date, form.venue, form.startTime]);

  const { subtotal, gst, total } = calcTotal(form.tier, Number(form.pax), form.addons);

  const canNext = () => {
    if (step === 0) return form.partyName && form.clientName && form.clientPhone && form.clientEmail;
    if (step === 1) return form.date && form.startTime && form.endTime && form.venue && form.pax && form.eventManager && !overlap;
    if (step === 2) return !!form.tier;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  /* ── Submitted state ── */
  if (submitted) {
    return (
      <div className="nb">
        <div className="nb__success">
          <div className="nb__success-icon">✓</div>
          <h2 className="nb__success-title">Enquiry Submitted</h2>
          <p className="nb__success-sub">
            Booking <strong>BK-{Math.floor(Math.random() * 1000) + 2600}</strong> has been created as a <em>Temporary Enquiry</em>.<br/>
            Finance team will be notified to confirm payment details.
          </p>
          <div className="nb__success-actions">
            <button onClick={() => navigate('/sales')} className="nb__success-btn nb__success-btn--primary">
              Back to Dashboard
            </button>
            <button onClick={() => { setSubmitted(false); setStep(0); setForm({ partyName:'',clientName:'',clientPhone:'',clientEmail:'',gstNumber:'',companyName:'',date:'',startTime:'',endTime:'',venue:'',pax:'',eventManager:'',notes:'',tier:'',addons:[] }); }} className="nb__success-btn">
              New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nb">
      {/* Header */}
      <header className="nb__header fade-up">
        <button className="nb__back" onClick={() => navigate('/sales')}>← Dashboard</button>
        <div>
          <h1 className="nb__title">New Booking</h1>
          <p className="nb__subtitle">Create a new event enquiry</p>
        </div>
      </header>

      {/* Stepper */}
      <div className="nb__stepper fade-up fade-up-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`nb__step ${i === step ? 'nb__step--active' : ''} ${i < step ? 'nb__step--done' : ''}`}
              onClick={() => i < step && setStep(i)}
            >
              <div className="nb__step-num">{i < step ? '✓' : i + 1}</div>
              <span className="nb__step-label">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`nb__step-line ${i < step ? 'nb__step-line--done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="nb__body">
        {/* ── STEP 0: Client Details ── */}
        {step === 0 && (
          <div className="nb__panel fade-up">
            <h2 className="nb__panel-title">Client & Party Information</h2>
            <div className="nb__grid-2">
              <Field label="Party / Event Name *" required>
                <input className="nb__input" placeholder="e.g. Mehta Wedding Reception"
                  value={form.partyName} onChange={e => set('partyName', e.target.value)} />
              </Field>
              <Field label="Contact Person *">
                <input className="nb__input" placeholder="Full name"
                  value={form.clientName} onChange={e => set('clientName', e.target.value)} />
              </Field>
              <Field label="Mobile Number *">
                <input className="nb__input" type="tel" placeholder="+91 98765 43210"
                  value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
              </Field>
              <Field label="Email Address *">
                <input className="nb__input" type="email" placeholder="client@email.com"
                  value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
              </Field>
              <Field label="Company / Organization">
                <input className="nb__input" placeholder="Optional"
                  value={form.companyName} onChange={e => set('companyName', e.target.value)} />
              </Field>
              <Field label="GST Number">
                <input className="nb__input" placeholder="22AAAAA0000A1Z5"
                  value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 1: Event Setup ── */}
        {step === 1 && (
          <div className="nb__panel fade-up">
            <h2 className="nb__panel-title">Event Setup</h2>
            <div className="nb__grid-2">
              <Field label="Event Date *">
                <input className="nb__input" type="date"
                  value={form.date} onChange={e => set('date', e.target.value)} />
              </Field>
              <Field label="Venue *">
                <select className="nb__input nb__select"
                  value={form.venue} onChange={e => set('venue', e.target.value)}>
                  <option value="">Select venue…</option>
                  {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Start Time *">
                <input className="nb__input" type="time"
                  value={form.startTime} onChange={e => set('startTime', e.target.value)} />
              </Field>
              <Field label="End Time *">
                <input className="nb__input" type="time"
                  value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </Field>
              <Field label="Expected Guests (Pax) *">
                <input className="nb__input" type="number" min="10" max="2000" placeholder="e.g. 300"
                  value={form.pax} onChange={e => set('pax', e.target.value)} />
              </Field>
              <Field label="Event Manager *">
                <select className="nb__input nb__select"
                  value={form.eventManager} onChange={e => set('eventManager', e.target.value)}>
                  <option value="">Assign manager…</option>
                  {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>

            {/* Overlap alert */}
            {overlap && (
              <div className="nb__alert nb__alert--error">
                <span className="nb__alert-icon">⚠</span>
                <div>
                  <strong>Venue Conflict Detected</strong>
                  <p>{overlap} Please choose a different date or venue.</p>
                </div>
              </div>
            )}
            {form.date && form.venue && !overlap && form.startTime && (
              <div className="nb__alert nb__alert--ok">
                <span className="nb__alert-icon">✓</span>
                <div><strong>{form.venue}</strong> is available on {form.date}.</div>
              </div>
            )}

            <Field label="Internal Notes" className="nb__field--full">
              <textarea className="nb__input nb__textarea" rows={3}
                placeholder="Special requirements, notes for operations team…"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── STEP 2: Menu Selection ── */}
        {step === 2 && (
          <div className="nb__panel fade-up">
            <h2 className="nb__panel-title">Menu Selection</h2>
            <p className="nb__panel-sub">Choose a pricing tier. Prices shown are per person (excluding GST).</p>

            {/* Tier cards */}
            <div className="nb__tiers">
              {Object.entries(MENUS).map(([tier, data]) => (
                <div
                  key={tier}
                  className={`nb__tier-card ${form.tier === tier ? 'nb__tier-card--selected' : ''}`}
                  style={{ '--t-color': data.color }}
                  onClick={() => set('tier', tier)}
                >
                  <div className="nb__tier-head">
                    <div>
                      <span className="nb__tier-badge">{data.badge}</span>
                      <h3 className="nb__tier-name">{tier}</h3>
                    </div>
                    <div className="nb__tier-price">
                      <span className="nb__tier-price-val">₹{data.price.toLocaleString('en-IN')}</span>
                      <span className="nb__tier-price-unit">/pax</span>
                    </div>
                  </div>
                  <div className="nb__tier-items">
                    {data.items.map(cat => (
                      <div key={cat.cat} className="nb__tier-cat">
                        <span className="nb__tier-cat-name">{cat.cat}</span>
                        <span className="nb__tier-cat-dishes">{cat.dishes.join(' · ')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="nb__tier-select-indicator">
                    {form.tier === tier ? '✓ Selected' : 'Select'}
                  </div>
                </div>
              ))}
            </div>

            {/* Add-ons */}
            {form.tier && (
              <div className="nb__addons">
                <h3 className="nb__addons-title">Add-On Enhancements</h3>
                <div className="nb__addons-grid">
                  {ADDONS.map(a => (
                    <div
                      key={a.id}
                      className={`nb__addon ${form.addons.includes(a.id) ? 'nb__addon--selected' : ''}`}
                      onClick={() => toggleAddon(a.id)}
                    >
                      <span className="nb__addon-icon">{a.icon}</span>
                      <div className="nb__addon-info">
                        <span className="nb__addon-label">{a.label}</span>
                        <span className="nb__addon-price">+₹{a.price}/pax</span>
                      </div>
                      <div className="nb__addon-check">{form.addons.includes(a.id) ? '✓' : '+'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live cost estimate */}
            {form.tier && form.pax && (
              <div className="nb__estimate">
                <h3 className="nb__estimate-title">Live Estimate</h3>
                <div className="nb__estimate-rows">
                  <div className="nb__estimate-row">
                    <span>{form.tier} Menu × {Number(form.pax).toLocaleString('en-IN')} pax</span>
                    <span>{fmt(MENUS[form.tier].price * Number(form.pax))}</span>
                  </div>
                  {form.addons.map(id => {
                    const a = ADDONS.find(x => x.id === id);
                    return (
                      <div className="nb__estimate-row" key={id}>
                        <span>{a.label} × {form.pax} pax</span>
                        <span>{fmt(a.price * Number(form.pax))}</span>
                      </div>
                    );
                  })}
                  <div className="nb__estimate-row nb__estimate-row--sub">
                    <span>Subtotal</span><span>{fmt(subtotal)}</span>
                  </div>
                  <div className="nb__estimate-row nb__estimate-row--sub">
                    <span>GST @ 18%</span><span>{fmt(gst)}</span>
                  </div>
                  <div className="nb__estimate-row nb__estimate-row--total">
                    <span>Total Estimated</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="nb__panel fade-up">
            <h2 className="nb__panel-title">Review & Submit</h2>
            <p className="nb__panel-sub">This will create a <strong>Temporary Enquiry</strong>. Finance team will confirm upon payment.</p>

            <div className="nb__review-grid">
              <ReviewSection title="Client Details">
                <ReviewRow label="Party Name"  value={form.partyName} />
                <ReviewRow label="Contact"     value={form.clientName} />
                <ReviewRow label="Mobile"      value={form.clientPhone} />
                <ReviewRow label="Email"       value={form.clientEmail} />
                {form.companyName && <ReviewRow label="Company" value={form.companyName} />}
                {form.gstNumber   && <ReviewRow label="GST No." value={form.gstNumber} />}
              </ReviewSection>

              <ReviewSection title="Event Details">
                <ReviewRow label="Date"    value={form.date} />
                <ReviewRow label="Venue"   value={form.venue} />
                <ReviewRow label="Time"    value={`${form.startTime} – ${form.endTime}`} />
                <ReviewRow label="Pax"     value={`${Number(form.pax).toLocaleString('en-IN')} guests`} />
                <ReviewRow label="Manager" value={form.eventManager} />
              </ReviewSection>

              <ReviewSection title="Menu & Financials">
                <ReviewRow label="Tier"     value={form.tier} />
                <ReviewRow label="Add-ons"  value={form.addons.length > 0 ? form.addons.map(id => ADDONS.find(a => a.id === id)?.label).join(', ') : 'None'} />
                <ReviewRow label="Subtotal" value={fmt(subtotal)} />
                <ReviewRow label="GST 18%"  value={fmt(gst)} />
                <ReviewRow label="Total"    value={fmt(total)} highlight />
              </ReviewSection>
            </div>

            <div className="nb__review-notice">
              <span>ℹ</span>
              WhatsApp confirmation will be sent to <strong>{form.clientPhone}</strong> after submission.
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="nb__nav">
          <button
            className="nb__btn nb__btn--secondary"
            onClick={() => step === 0 ? navigate('/sales') : setStep(s => s - 1)}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <div className="nb__nav-right">
            <span className="nb__nav-hint">Step {step + 1} of {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button
                className="nb__btn nb__btn--primary"
                disabled={!canNext()}
                onClick={() => setStep(s => s + 1)}
              >
                Continue →
              </button>
            ) : (
              <button
                className={`nb__btn nb__btn--primary nb__btn--submit ${submitting ? 'nb__btn--loading' : ''}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="nb__spinner" />Processing…</>
                ) : '✓ Submit Enquiry'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────── */
function Field({ label, children, className = '' }) {
  return (
    <div className={`nb__field ${className}`}>
      <label className="nb__label">{label}</label>
      {children}
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="nb__review-section">
      <h4 className="nb__review-section-title">{title}</h4>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className={`nb__review-row ${highlight ? 'nb__review-row--highlight' : ''}`}>
      <span className="nb__review-label">{label}</span>
      <span className="nb__review-value">{value || '—'}</span>
    </div>
  );
}