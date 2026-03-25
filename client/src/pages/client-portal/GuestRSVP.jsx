import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  plus:    'M12 5v14M5 12h14',
  trash:   'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  qr:      'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM17 17h3v3h-3z',
  warning: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  x:       'M18 6 6 18M6 6l12 12',
  send:    'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  arrow:   'M19 12H5M12 5l7 7-7 7',
  upload:  'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  file:    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  check:   'M20 6 9 17l-5-5',
  download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
};
const DIETARY_TAGS = [
  { id:'veg',    label:'Vegetarian', color:'#5FBF8A' },
  { id:'jain',   label:'Jain',       color:'#C9A84C' },
  { id:'vegan',  label:'Vegan',      color:'#5B8FE8' },
  { id:'gluten', label:'Gluten-Free',color:'#E8C455' },
  { id:'nut',    label:'Nut Allergy',color:'#E85555' },
];
const DIETARY_ALIASES = {
  veg: ['veg','vegetarian','v'],
  jain: ['jain','j'],
  vegan: ['vegan'],
  gluten: ['gluten','gluten-free','gf','gluten free'],
  nut: ['nut','nut allergy','nuts','nut-allergy'],
};
const RSVP_STATUS = {
  confirmed: { label:'Confirmed', color:'#5FBF8A', bg:'rgba(95,191,138,0.12)' },
  pending:   { label:'Pending',   color:'#E8C455', bg:'rgba(232,197,85,0.12)' },
  declined:  { label:'Declined',  color:'#E85555', bg:'rgba(232,85,85,0.12)'  },
};
const CONTRACTED_PAX = 350;

// ── Parse dietary string from CSV cell ──
function parseDietary(raw = '') {
  const lower = raw.toLowerCase();
  const matched = [];
  for (const [id, aliases] of Object.entries(DIETARY_ALIASES)) {
    if (aliases.some(a => lower.includes(a))) matched.push(id);
  }
  return matched;
}

// ── Parse CSV text into guest objects ──
function parseCSV(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return { guests: [], errors: ['CSV must have a header row and at least one data row.'] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
  const nameIdx    = headers.findIndex(h => ['name','fullname','guestname'].includes(h));
  const phoneIdx   = headers.findIndex(h => ['phone','mobile','contact','number','phonenumber'].includes(h));
  const dietaryIdx = headers.findIndex(h => ['dietary','diet','food','preference','dietarypreference'].includes(h));
  const rsvpIdx    = headers.findIndex(h => ['rsvp','status','rsvpstatus'].includes(h));

  if (nameIdx === -1) return { guests: [], errors: ['Could not find a "name" column. Make sure your CSV has a column named Name.'] };

  const guests = [];
  const errors = [];

  lines.slice(1).forEach((line, i) => {
    // Handle quoted fields with commas inside
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || line.split(',').map(c => c.trim());
    const name = nameIdx !== -1 ? cols[nameIdx] : '';
    if (!name) { errors.push(`Row ${i + 2}: skipped — no name found.`); return; }

    const phone   = phoneIdx   !== -1 ? cols[phoneIdx]   || '' : '';
    const dietary = dietaryIdx !== -1 ? parseDietary(cols[dietaryIdx] || '') : [];
    const rsvpRaw = rsvpIdx    !== -1 ? (cols[rsvpIdx] || '').toLowerCase() : '';
    const rsvp    = ['confirmed','pending','declined'].includes(rsvpRaw) ? rsvpRaw : 'confirmed';

    guests.push({ id: Date.now() + i, name, phone, dietary, rsvp, walkIn: false, late: false });
  });

  return { guests, errors };
}

function QRToast({ name, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl text-[#5FBF8A] text-sm font-medium"
      style={{ background:'rgba(95,191,138,0.15)', border:'1px solid rgba(95,191,138,0.4)', backdropFilter:'blur(16px)', maxWidth:'90vw' }}>
      <Icon d={ICONS.qr} size={14} /> QR dispatched to {name} via WhatsApp!
    </div>
  );
}

// ─────────────────────────────────────────────
//  CSV PREVIEW TABLE
// ─────────────────────────────────────────────
function CSVPreview({ guests, errors, onConfirm, onBack }) {
  const [selected, setSelected] = useState(() => new Set(guests.map(g => g.id)));
  const toggleAll = () => setSelected(s => s.size === guests.length ? new Set() : new Set(guests.map(g => g.id)));
  const toggle    = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-xl px-4 py-3 mb-4 text-xs text-[#E8C455]"
          style={{ background:'rgba(232,197,85,0.08)', border:'1px solid rgba(232,197,85,0.25)' }}>
          <div className="font-semibold mb-1 flex items-center gap-1.5"><Icon d={ICONS.warning} size={12} /> {errors.length} row(s) skipped</div>
          {errors.map((e,i) => <div key={i} className="text-[#9D9880]">{e}</div>)}
        </div>
      )}

      {/* Select all */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#9D9880]">{selected.size} of {guests.length} selected</span>
        <button onClick={toggleAll} className="text-xs text-[#C9A84C] cursor-pointer" style={{ background:'none', border:'none' }}>
          {selected.size === guests.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Guest rows */}
      <div className="overflow-y-auto mb-4" style={{ maxHeight:'36vh' }}>
        {guests.map(g => (
          <div key={g.id} onClick={() => toggle(g.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 cursor-pointer"
            style={{ background: selected.has(g.id) ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.02)', border:`1px solid ${selected.has(g.id) ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
            {/* Checkbox */}
            <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
              style={{ border:`1.5px solid ${selected.has(g.id) ? '#C9A84C' : '#4A4840'}`, background: selected.has(g.id) ? 'rgba(201,168,76,0.2)' : 'transparent' }}>
              {selected.has(g.id) && <Icon d={ICONS.check} size={10} className="text-[#C9A84C]" />}
            </span>
            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#F5F0E8] font-medium truncate">{g.name}</div>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {g.phone && <span className="text-[9px] text-[#6B6858]">{g.phone}</span>}
                {g.dietary.map(did => {
                  const tag = DIETARY_TAGS.find(t => t.id === did);
                  return tag ? <span key={did} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background:`${tag.color}15`, color:tag.color }}>{tag.label}</span> : null;
                })}
              </div>
            </div>
            {/* RSVP badge */}
            <span className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ color: RSVP_STATUS[g.rsvp].color, border:`1px solid ${RSVP_STATUS[g.rsvp].color}`, background: RSVP_STATUS[g.rsvp].bg }}>
              {RSVP_STATUS[g.rsvp].label}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm cursor-pointer"
          style={{ border:'1px solid rgba(201,168,76,0.2)', background:'transparent', color:'#9D9880' }}>
          ← Back
        </button>
        <button disabled={selected.size === 0}
          onClick={() => onConfirm(guests.filter(g => selected.has(g.id)))}
          className="flex-[2] py-3 rounded-xl text-sm font-semibold cursor-pointer border-none"
          style={{ background: selected.size > 0 ? 'linear-gradient(135deg,#C9A84C,#8B6520)' : 'rgba(255,255,255,0.06)', color: selected.size > 0 ? '#080810' : '#4A4840' }}>
          Add {selected.size} Guest{selected.size !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ADD GUEST SHEET — Manual + CSV tabs
// ─────────────────────────────────────────────
function AddGuestSheet({ onClose, onAdd, isLate }) {
  const [tab, setTab]           = useState('manual'); // 'manual' | 'csv'
  const [form, setForm]         = useState({ name:'', phone:'', dietary:[] });
  const [csvState, setCsvState] = useState('idle'); // 'idle' | 'preview' | 'done'
  const [csvGuests, setCsvGuests] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const toggleDietary = id => setForm(p => ({ ...p, dietary: p.dietary.includes(id) ? p.dietary.filter(d => d !== id) : [...p.dietary, id] }));
  const inp = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.2)] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm outline-none";

  const handleFile = file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const { guests, errors } = parseCSV(e.target.result);
      setCsvGuests(guests);
      setCsvErrors(errors);
      setCsvState(guests.length > 0 ? 'preview' : 'idle');
      if (guests.length === 0 && errors.length > 0) alert(errors.join('\n'));
    };
    reader.readAsText(file);
  };

  const handleDrop = e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  const downloadSample = () => {
    const csv = `Name,Phone,Dietary,RSVP\nAarav Sharma,9876543210,Jain,confirmed\nMeera Gupta,9876543211,Vegetarian,confirmed\nRohan Verma,9876543212,,pending`;
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'guest_list_sample.csv'; a.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      style={{ background:'rgba(8,8,16,0.85)', backdropFilter:'blur(8px)' }} onClick={onClose}>
      <div className="w-full md:max-w-lg md:mx-4 rounded-t-3xl md:rounded-3xl overflow-y-auto"
        style={{ background:'#12121F', border:'1px solid rgba(201,168,76,0.2)', maxHeight:'90vh' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-6 md:p-8">
          {/* Drag handle */}
          <div className="w-9 h-1 rounded-full mx-auto mb-5 md:hidden" style={{ background:'rgba(201,168,76,0.3)' }} />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-xl text-[#F5F0E8]">Add Guest{tab === 'csv' && 's via CSV'}</h3>
            <button onClick={onClose} className="bg-none border-none text-[#6B6858] cursor-pointer"><Icon d={ICONS.x} size={18} /></button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.1)' }}>
            {[['manual','Single Guest'],['csv','Upload CSV']].map(([id,label]) => (
              <button key={id} onClick={() => { setTab(id); setCsvState('idle'); }}
                className="flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer border-none transition-all"
                style={{ background: tab === id ? 'rgba(201,168,76,0.15)' : 'transparent', color: tab === id ? '#C9A84C' : '#6B6858', border: tab === id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Late warning */}
          {isLate && (
            <div className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-xs text-[#E8C455]"
              style={{ background:'rgba(232,197,85,0.1)', border:'1px solid rgba(232,197,85,0.3)' }}>
              <Icon d={ICONS.warning} size={13} className="flex-shrink-0 mt-0.5" />
              Late addition — guests need Kitchen/GRE approval before QR is dispatched.
            </div>
          )}

          {/* ── MANUAL TAB ── */}
          {tab === 'manual' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-[#9D9880] mb-2">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Sharma" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-[#9D9880] mb-2">Mobile (for QR)</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" type="tel" className={inp} />
                </div>
              </div>
              <label className="block text-xs text-[#9D9880] mb-3">Dietary Requirements</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {DIETARY_TAGS.map(tag => (
                  <button key={tag.id} onClick={() => toggleDietary(tag.id)}
                    className="px-4 py-2 rounded-full text-xs cursor-pointer min-h-[36px]"
                    style={{ border:`1px solid ${form.dietary.includes(tag.id) ? tag.color : `${tag.color}30`}`, background: form.dietary.includes(tag.id) ? `${tag.color}20` : 'transparent', color: form.dietary.includes(tag.id) ? tag.color : '#6B6858' }}>
                    {tag.label}
                  </button>
                ))}
              </div>
              <button disabled={!form.name.trim()}
                onClick={() => { if (form.name.trim()) onAdd([{ ...form, id: Date.now(), rsvp:'confirmed', walkIn:false, late:isLate }]); }}
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-none min-h-[48px]"
                style={{ background: form.name.trim() ? 'linear-gradient(135deg,#C9A84C,#8B6520)' : 'rgba(255,255,255,0.06)', color: form.name.trim() ? '#080810' : '#4A4840', cursor: form.name.trim() ? 'pointer' : 'not-allowed' }}>
                {isLate ? 'Add (Pending Approval)' : 'Add Guest & Send QR →'}
              </button>
            </>
          )}

          {/* ── CSV TAB ── */}
          {tab === 'csv' && csvState === 'idle' && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer mb-4 transition-all"
                style={{ border:`2px dashed ${dragOver ? '#C9A84C' : 'rgba(201,168,76,0.25)'}`, background: dragOver ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)' }}>
                  <Icon d={ICONS.upload} size={22} className="text-[#C9A84C]" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-[#F5F0E8]">Drop your CSV here</div>
                  <div className="text-xs text-[#6B6858] mt-1">or tap to browse files</div>
                </div>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>

              {/* Expected format */}
              <div className="rounded-xl px-4 py-3 mb-4" style={{ background:'rgba(91,143,232,0.06)', border:'1px solid rgba(91,143,232,0.2)' }}>
                <div className="text-xs font-semibold text-[#5B8FE8] mb-2 flex items-center gap-1.5"><Icon d={ICONS.file} size={12} /> Expected CSV format</div>
                <code className="text-[10px] text-[#9D9880] leading-relaxed block">
                  Name, Phone, Dietary, RSVP<br/>
                  Aarav Sharma, 9876543210, Jain, confirmed<br/>
                  Meera Gupta, 9876543211, Vegetarian, confirmed
                </code>
                <div className="text-[10px] text-[#6B6858] mt-2">
                  Dietary accepts: Vegetarian, Jain, Vegan, Gluten-Free, Nut Allergy<br/>
                  RSVP accepts: confirmed, pending, declined (defaults to confirmed)
                </div>
              </div>

              {/* Download sample */}
              <button onClick={downloadSample}
                className="w-full py-3 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2"
                style={{ border:'1px solid rgba(201,168,76,0.2)', background:'transparent', color:'#C9A84C' }}>
                <Icon d={ICONS.download} size={14} /> Download Sample CSV
              </button>
            </>
          )}

          {/* ── CSV PREVIEW ── */}
          {tab === 'csv' && csvState === 'preview' && (
            <CSVPreview
              guests={csvGuests}
              errors={csvErrors}
              onBack={() => setCsvState('idle')}
              onConfirm={selected => { onAdd(selected); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function GuestRow({ guest, onDelete, onDispatchQR }) {
  const [rsvp, setRsvp] = useState(guest.rsvp);
  const avatarColor = ['#C9A84C','#5B8FE8','#5FBF8A','#9B6DE8','#E85E9A'][guest.name.length % 5];
  const status = RSVP_STATUS[rsvp] || RSVP_STATUS.pending;
  const initials = guest.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const isConfirmed = rsvp === 'confirmed';
  return (
    <div className="rounded-2xl mb-2 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3 rounded-2xl"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.1)' }}>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold"
            style={{ background:`${avatarColor}20`, border:`1.5px solid ${avatarColor}50`, color:avatarColor }}>{initials}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-medium text-[#F5F0E8] truncate">{guest.name}</span>
              {guest.walkIn && <span className="text-[8px] px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background:'rgba(91,143,232,0.2)', color:'#5B8FE8' }}>Walk-In</span>}
            </div>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {guest.dietary?.map(did => {
                const tag = DIETARY_TAGS.find(t => t.id === did);
                return tag ? <span key={did} className="text-[9px] px-2 py-0.5 rounded-md flex-shrink-0" style={{ background:`${tag.color}15`, color:tag.color, border:`1px solid ${tag.color}30` }}>{tag.label}</span> : null;
              })}
              {(!guest.dietary || guest.dietary.length === 0) && <span className="text-[9px] text-[#4A4840]">—</span>}
            </div>
          </div>
        </div>
        <button onClick={() => setRsvp(r => r === 'confirmed' ? 'pending' : 'confirmed')}
          className="flex-shrink-0 relative flex items-center cursor-pointer border-none p-0 min-w-[40px] min-h-[44px]"
          style={{ background:'none' }}>
          <span className="text-[10px] flex-shrink-0 mr-1 hidden sm:inline" style={{ color:'#4A4840' }}>RSVP</span>
          <span className="relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200"
            style={{ background: isConfirmed ? 'rgba(95,191,138,0.3)' : 'rgba(232,197,85,0.2)', border:`1px solid ${isConfirmed ? '#5FBF8A' : '#E8C455'}` }}>
            <span className="absolute w-3.5 h-3.5 rounded-full transition-transform duration-200"
              style={{ background: isConfirmed ? '#5FBF8A' : '#E8C455', left: isConfirmed ? '20px' : '2px' }} />
          </span>
        </button>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[9px] md:text-[10px] rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0"
            style={{ color:status.color, border:`1px solid ${status.color}`, background:status.bg }}>
            {status.label}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => onDelete(guest.id)}
              className="flex items-center justify-center text-[#E85555] cursor-pointer flex-shrink-0"
              style={{ background:'none', border:'none', width:44, height:44, minWidth:44 }}>
              <Icon d={ICONS.trash} size={15} />
            </button>
            {isConfirmed && !guest.late && (
              <button onClick={() => onDispatchQR({ ...guest, rsvp:'confirmed' })}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] cursor-pointer flex-shrink-0"
                style={{ border:'1px solid rgba(37,211,102,0.35)', color:'#25D366', background:'rgba(37,211,102,0.06)', minHeight:28 }}>
                <Icon d={ICONS.qr} size={10} /> QR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestRSVP() {
  const [guests, setGuests] = useState([
    { id:1, name:'Aarav Sharma',  rsvp:'confirmed', dietary:['jain'],    walkIn:false, late:false },
    { id:2, name:'Meera Gupta',   rsvp:'confirmed', dietary:['veg'],     walkIn:false, late:false },
    { id:3, name:'Rohan Verma',   rsvp:'pending',   dietary:[],          walkIn:false, late:false },
    { id:4, name:'Priya Nair',    rsvp:'confirmed', dietary:['vegan'],   walkIn:false, late:false },
    { id:5, name:'Karan Mehta',   rsvp:'declined',  dietary:[],          walkIn:false, late:false },
    { id:6, name:'Sunita Joshi',  rsvp:'confirmed', dietary:['gluten'],  walkIn:true,  late:false },
    { id:7, name:'Dev Kapoor',    rsvp:'pending',   dietary:['nut'],     walkIn:false, late:false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [qrToast, setQrToast] = useState(null);
  const [filter, setFilter]   = useState('all');
  const [csvSuccess, setCsvSuccess] = useState(null); // "12 guests added"

  const totalInvited = guests.length;
  const confirmed    = guests.filter(g => g.rsvp === 'confirmed').length;
  const paxPct       = Math.round((totalInvited / CONTRACTED_PAX) * 100);
  const nearCap      = paxPct >= 90;
  const overCap      = totalInvited > CONTRACTED_PAX;
  const isLate       = false;

  const filteredGuests = guests.filter(g => {
    if (filter === 'confirmed') return g.rsvp === 'confirmed';
    if (filter === 'pending')   return g.rsvp === 'pending';
    if (filter === 'declined')  return g.rsvp === 'declined';
    if (filter === 'dietary')   return g.dietary?.length > 0;
    return true;
  });

  const handleAdd = newGuests => {
    setGuests(p => [...p, ...newGuests]);
    setShowAdd(false);
    if (newGuests.length === 1 && !newGuests[0].late) {
      setQrToast(newGuests[0].name);
    } else if (newGuests.length > 1) {
      setCsvSuccess(`${newGuests.length} guests added successfully!`);
      setTimeout(() => setCsvSuccess(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] font-sans text-[#F5F0E8]">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(155,109,232,0.07) 0%,transparent 60%)' }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .portal-card { background:rgba(255,255,255,0.03); border:1px solid rgba(201,168,76,0.12); border-radius:1.25rem; padding:1.25rem; margin-bottom:1rem; }
        .portal-section-label { font-size:10px; color:#C9A84C; letter-spacing:0.2em; text-transform:uppercase; display:block; }
      `}</style>

      {qrToast && <QRToast name={qrToast} onDone={() => setQrToast(null)} />}

      {/* CSV success toast */}
      {csvSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl text-[#5FBF8A] text-sm font-medium"
          style={{ background:'rgba(95,191,138,0.15)', border:'1px solid rgba(95,191,138,0.4)', backdropFilter:'blur(16px)', maxWidth:'90vw' }}>
          <Icon d={ICONS.check} size={14} /> {csvSuccess}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3"
          style={{ background:'rgba(8,8,16,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-[#F5F0E8]" style={{ background:'linear-gradient(135deg,#9B6DE8,#6B3DAA)' }}>B</div>
            <div>
              <div className="font-serif text-base font-bold text-[#F5F0E8]">Guest RSVP</div>
              <div className="text-[8px] text-[#6B5520] tracking-[0.2em] uppercase -mt-0.5">Client Portal</div>
            </div>
          </div>
          <Link to="/portal" className="text-xs text-[#9D9880] no-underline">← Dashboard</Link>
        </div>

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-28">
          <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-6 lg:items-start">
            <div>
              {/* Capacity meter */}
              <div className="portal-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="portal-section-label">Guest Capacity</span>
                  {overCap  && <span className="text-xs px-3 py-1 rounded-full text-[#E85555]" style={{ background:'rgba(232,85,85,0.12)', border:'1px solid rgba(232,85,85,0.3)' }}>Over Limit!</span>}
                  {!overCap && nearCap && <span className="text-xs px-3 py-1 rounded-full text-[#E8C455]" style={{ background:'rgba(232,197,85,0.12)', border:'1px solid rgba(232,197,85,0.3)' }}>Near Limit</span>}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background:'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width:`${Math.min(paxPct,100)}%`, background: overCap ? '#E85555' : nearCap ? '#E8C455' : 'linear-gradient(90deg,#9B6DE8,#C9A84C)' }} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[['Invited',totalInvited,'#F5F0E8'],['Confirmed',confirmed,'#5FBF8A'],['Contracted',CONTRACTED_PAX,'#C9A84C'],['Remaining',Math.max(0,CONTRACTED_PAX-totalInvited),overCap?'#E85555':'#9D9880']].map(([l,v,c]) => (
                    <div key={l} className="text-center">
                      <div className="font-serif text-xl md:text-2xl font-bold" style={{ color:c }}>{v}</div>
                      <div className="text-[9px] md:text-xs text-[#6B6858] mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 mb-3" style={{ WebkitOverflowScrolling:'touch' }}>
                {[['all',`All (${guests.length})`],['confirmed',`✓ ${guests.filter(g=>g.rsvp==='confirmed').length}`],['pending',`Pending ${guests.filter(g=>g.rsvp==='pending').length}`],['declined','Declined'],['dietary','Dietary']].map(([id,label]) => (
                  <button key={id} onClick={() => setFilter(id)} className="flex-shrink-0 px-4 py-2 rounded-full text-xs cursor-pointer min-h-[36px]"
                    style={{ border:`1px solid ${filter===id?'rgba(201,168,76,0.4)':'rgba(201,168,76,0.1)'}`, background:filter===id?'rgba(201,168,76,0.1)':'transparent', color:filter===id?'#C9A84C':'#6B6858' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Guest list */}
              <div>
                {filteredGuests.length === 0
                  ? <div className="text-center py-10 text-sm text-[#4A4840]">No guests match this filter.</div>
                  : filteredGuests.map(g => <GuestRow key={g.id} guest={g} onDelete={id => setGuests(p => p.filter(g => g.id !== id))} onDispatchQR={g => setQrToast(g.name)} />)
                }
              </div>

              {confirmed > 0 && (
                <button onClick={() => setQrToast(`${confirmed} guests`)}
                  className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium cursor-pointer mt-2 min-h-[48px]"
                  style={{ border:'1px solid rgba(37,211,102,0.3)', background:'rgba(37,211,102,0.06)', color:'#25D366' }}>
                  <Icon d={ICONS.send} size={14} /> Dispatch QR to All {confirmed} Confirmed Guests
                </button>
              )}
            </div>

            {/* RIGHT sidebar — desktop only */}
            <div className="hidden lg:block">
              <div className="portal-card sticky top-20">
                <span className="portal-section-label mb-3">Dietary Breakdown</span>
                <div className="space-y-3 mt-2">
                  {DIETARY_TAGS.map(tag => {
                    const count = guests.filter(g => g.dietary?.includes(tag.id)).length;
                    if (!count) return null;
                    return (
                      <div key={tag.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background:tag.color }} />
                          <span className="text-sm text-[#9D9880]">{tag.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#F5F0E8]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile dietary breakdown */}
          <div className="lg:hidden portal-card">
            <span className="portal-section-label mb-3">Dietary Breakdown</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {DIETARY_TAGS.map(tag => {
                const count = guests.filter(g => g.dietary?.includes(tag.id)).length;
                if (!count) return null;
                return (
                  <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background:`${tag.color}12`, border:`1px solid ${tag.color}30` }}>
                    <span className="text-sm font-semibold" style={{ color:tag.color }}>{count}</span>
                    <span className="text-xs" style={{ color:tag.color }}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50"
        style={{ padding:`12px 16px max(20px,env(safe-area-inset-bottom))`, background:'linear-gradient(180deg,transparent,rgba(8,8,16,0.98))' }}>
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          {overCap
            ? <div className="text-center py-3.5 rounded-2xl text-sm text-[#E85555]" style={{ background:'rgba(232,85,85,0.1)', border:'1px solid rgba(232,85,85,0.3)' }}>Guest limit reached. Contact Sales to expand capacity.</div>
            : <button onClick={() => setShowAdd(true)}
                className="w-full py-4 rounded-2xl font-semibold text-[#080810] text-sm cursor-pointer border-none flex items-center justify-center gap-2 min-h-[52px]"
                style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)' }}>
                <Icon d={ICONS.plus} size={16} /> Add Guest{isLate && ' (Late — Pending Approval)'}
              </button>
          }
        </div>
      </div>

      {showAdd && <AddGuestSheet onClose={() => setShowAdd(false)} onAdd={handleAdd} isLate={isLate} />}
    </div>
  );
}