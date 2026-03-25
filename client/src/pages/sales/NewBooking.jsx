import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewBooking.css';
import api from '../../utils/api';

/* ─── Constants ───────────────────────────────────────────────────── */
const STEPS = ['Client Details', 'Event Setup', 'Menu Selection', 'Review & Submit'];

const VENUES = ['Grand Ballroom', 'Terrace Garden', 'Crystal Hall', 'Banquet Suite A', 'Rooftop Lounge', 'Garden Pavilion'];
const EVENT_TYPES = ['Wedding Reception', 'Birthday Party', 'Anniversary Party', 'Corporate Event', 'Conference', 'Other'];
const MANAGERS = ['Aryan Doshi', 'Priya Sharma', 'Rohan Kumar', 'Meera Joshi'];

const MENUS = {
  Standard: { price: 850 },
  Premium: { price: 1400 },
  Elite: { price: 2200 },
};

const ADDONS = [
  { id: 'welcome_drink_upgrade', label: 'Welcome Drink Upgrade', price: 120 },
  { id: 'live_pasta', label: 'Live Pasta Counter', price: 200 },
  { id: 'premium_dessert', label: 'Premium Dessert Station', price: 280 },
];

const GST_RATE = 0.18;

/* ─── Helpers ─────────────────────────────────────────────────────── */
function calcTotal(tier, pax, addons) {
  if (!tier || !pax) return { subtotal: 0, gst: 0, total: 0 };
  const menuPrice = MENUS[tier]?.price || 0;
  const addOnTotal = addons.reduce(
    (s, id) => s + (ADDONS.find(a => a.id === id)?.price || 0),
    0
  );
  const subtotal = (menuPrice + addOnTotal) * pax;
  const gst = subtotal * GST_RATE;
  return { subtotal, gst, total: Math.round(subtotal + gst) };
}

/* ─── Component ────────────────────────────────────────────────────── */
export default function NewBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [overlap, setOverlap] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const debounceRef = useRef(null);

  const [form, setForm] = useState({
    partyName: '', clientName: '', clientPhone: '', clientEmail: '',
    eventType: '', date: '', venue: '', pax: '',
    startTime: '', endTime: '', eventManager: '',
    tier: '', addons: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAddon = (id) => {
    setForm(f => ({
      ...f,
      addons: f.addons.includes(id)
        ? f.addons.filter(a => a !== id)
        : [...f.addons, id],
    }));
  };

  /* Availability check */
  useEffect(() => {
    if (!form.date || !form.venue) return;

    clearTimeout(debounceRef.current);
    setCheckingAvail(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkAvailability(form.date, form.venue);
        setOverlap(res.available ? null : 'Venue already booked');
      } catch {
        setOverlap(null);
      } finally {
        setCheckingAvail(false);
      }
    }, 500);
  }, [form.date, form.venue]);

  const { subtotal, gst, total } = calcTotal(
    form.tier,
    Number(form.pax),
    form.addons
  );

  const handleSubmit = async () => {
    try {
      await api.createBooking({ ...form, subtotal, gst, total });
      alert('Booking created!');
      navigate('/sales');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="nb">
      <h1>New Booking</h1>

      {step === 0 && (
        <>
          <input placeholder="Party Name" onChange={e => set('partyName', e.target.value)} />
          <input placeholder="Client Name" onChange={e => set('clientName', e.target.value)} />
          <input placeholder="Phone" onChange={e => set('clientPhone', e.target.value)} />
          <input placeholder="Email" onChange={e => set('clientEmail', e.target.value)} />
          <button onClick={() => setStep(1)}>Next</button>
        </>
      )}

      {step === 1 && (
        <>
          <input type="date" onChange={e => set('date', e.target.value)} />
          <select onChange={e => set('venue', e.target.value)}>
            <option>Select Venue</option>
            {VENUES.map(v => <option key={v}>{v}</option>)}
          </select>
          <input type="number" placeholder="Guests" onChange={e => set('pax', e.target.value)} />
          {overlap && <p style={{ color: 'red' }}>{overlap}</p>}
          <button onClick={() => setStep(2)}>Next</button>
        </>
      )}

      {step === 2 && (
        <>
          {Object.keys(MENUS).map(t => (
            <button key={t} onClick={() => set('tier', t)}>{t}</button>
          ))}

          {ADDONS.map(a => (
            <button key={a.id} onClick={() => toggleAddon(a.id)}>
              {a.label}
            </button>
          ))}

          <p>Total: ₹{total}</p>

          <button onClick={() => setStep(3)}>Next</button>
        </>
      )}

      {step === 3 && (
        <>
          <h3>Review</h3>
          <p>{form.partyName}</p>
          <p>{form.clientName}</p>
          <p>{form.venue}</p>
          <p>Total: ₹{total}</p>

          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </div>
  );
}