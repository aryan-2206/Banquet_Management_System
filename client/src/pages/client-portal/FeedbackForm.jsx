import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ d, size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={d} />
  </svg>
);
const ICONS = {
  star:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  heart:  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  send:   'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  alert:  'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  brain:  'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.73A3 3 0 0 1 4.46 9.1a3 3 0 0 1 .49-5.1A2.5 2.5 0 0 1 9.5 2M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.73A3 3 0 0 0 19.54 9.1a3 3 0 0 0-.49-5.1A2.5 2.5 0 0 0 14.5 2z',
};

const MENU_ITEMS = [
  { id:1, name:'Paneer Tikka Masala', category:'Main Course', emoji:'🍛' },
  { id:2, name:'Dal Makhani',         category:'Dal',         emoji:'🥘' },
  { id:3, name:'Jeera Rice',          category:'Rice',        emoji:'🍚' },
  { id:4, name:'Garlic Naan',         category:'Bread',       emoji:'🫓' },
  { id:5, name:'Raita',               category:'Condiment',   emoji:'🥗' },
  { id:6, name:'Gulab Jamun',         category:'Dessert',     emoji:'🍮' },
  { id:7, name:'Welcome Mocktail',    category:'Beverages',   emoji:'🥤' },
];

/* Circular SVG rating dial */
function RatingDial({ value, onChange }) {
  const r = 64, stroke = 8, size = 160, circ = 2 * Math.PI * r;
  const dashOffset = circ - (value / 10) * circ;
  const color = value <= 4 ? '#E85555' : value <= 6 ? '#E8C455' : value <= 8 ? '#5FBF8A' : '#C9A84C';
  const label = value <= 4 ? '😞 Poor' : value <= 6 ? '😐 Average' : value <= 8 ? '😊 Great' : '🌟 Exceptional!';
  const cx = size / 2, cy = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition:'stroke-dashoffset 0.5s ease,stroke 0.3s ease', filter:`drop-shadow(0 0 6px ${color}80)` }} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color}
          style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:700 }}>{value}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(157,152,128,0.8)"
          style={{ fontSize:10, letterSpacing:'0.1em' }}>/10</text>
      </svg>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full mt-3 cursor-pointer"
        style={{ maxWidth:200, appearance:'none', height:4, borderRadius:99, outline:'none', background:`linear-gradient(90deg,${color} ${value*10}%,rgba(255,255,255,0.08) ${value*10}%)` }} />
      <div className="mt-2 text-xs font-medium" style={{ color }}>{label}</div>
    </div>
  );
}

/* Swipe rating card */
function SwipeCard({ item, onRate }) {
  const [drag, setDrag] = useState({ x:0, active:false });
  const [exiting, setExiting] = useState(null);
  const startX = useRef(null);
  const threshold = 80;
  const direction = drag.x > threshold ? 'right' : drag.x < -threshold ? 'left' : null;
  const onStart = x => { startX.current = x; setDrag({ x:0, active:true }); };
  const onMove  = x => { if (!drag.active) return; setDrag(d => ({ ...d, x: x - startX.current })); };
  const onEnd   = () => {
    if (direction) { setExiting(direction); setTimeout(() => onRate(item.id, direction==='right'?'excellent':'poor'), 350); }
    else setDrag({ x:0, active:false });
  };
  const tx = exiting==='right' ? 400 : exiting==='left' ? -400 : drag.x;
  const ty = exiting ? -20 : 0;

  return (
    <div style={{ position:'absolute', inset:0, touchAction:'none', userSelect:'none', cursor:drag.active?'grabbing':'grab',
        transform:`translateX(${tx}px) translateY(${ty}px) rotate(${drag.x*0.06}deg)`,
        opacity:exiting?0:1, transition:drag.active?'none':'transform 0.35s cubic-bezier(0.22,1,0.36,1),opacity 0.35s ease' }}
      onMouseDown={e=>onStart(e.clientX)} onMouseMove={e=>onMove(e.clientX)} onMouseUp={onEnd}
      onTouchStart={e=>onStart(e.touches[0].clientX)} onTouchMove={e=>onMove(e.touches[0].clientX)} onTouchEnd={onEnd}>
      <div style={{ height:'100%', borderRadius:24, padding:32,
          background:'linear-gradient(160deg,rgba(201,168,76,0.08) 0%,rgba(18,18,31,0.95) 100%)',
          border:`1px solid ${direction==='right'?'rgba(95,191,138,0.6)':direction==='left'?'rgba(232,85,85,0.6)':'rgba(201,168,76,0.2)'}`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, position:'relative', overflow:'hidden' }}>
        {direction==='right'&&<div style={{ position:'absolute',top:20,left:20,transform:'rotate(-15deg)',background:'rgba(95,191,138,0.2)',border:'2px solid #5FBF8A',borderRadius:8,padding:'4px 12px',color:'#5FBF8A',fontSize:16,fontWeight:700 }}>LOVED IT ✓</div>}
        {direction==='left'&&<div style={{ position:'absolute',top:20,right:20,transform:'rotate(15deg)',background:'rgba(232,85,85,0.2)',border:'2px solid #E85555',borderRadius:8,padding:'4px 12px',color:'#E85555',fontSize:16,fontWeight:700 }}>NOPE ✗</div>}
        <div className="text-5xl md:text-6xl">{item.emoji}</div>
        <div className="text-center">
          <div className="font-serif text-xl md:text-2xl text-[#F5F0E8] font-semibold mb-1">{item.name}</div>
          <div className="text-xs text-[#6B6858] tracking-[0.15em] uppercase">{item.category}</div>
        </div>
        <div className="text-xs text-[#4A4840]">← Swipe left to rate poor · Swipe right for excellent →</div>
      </div>
    </div>
  );
}

/* Photo gallery */
function PhotoGallery({ photos, onUpload }) {
  const fileRef = useRef(null);
  const handleFile = e => {
    Array.from(e.target.files || []).forEach(file => {
      onUpload({ id:Date.now()+Math.random(), url:URL.createObjectURL(file), name:file.name, moderated:false });
    });
  };
  return (
    <div>
      {/* Responsive: 3-col mobile → 4-col tablet → 5-col desktop */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-3">
        {photos.map(p => (
          <div key={p.id} className="aspect-square rounded-xl overflow-hidden">
            {p.moderated
              ? <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ background:'rgba(232,85,85,0.1)', border:'1px solid rgba(232,85,85,0.3)' }}>
                  <Icon d={ICONS.alert} size={14} style={{ color:'#E85555' }} />
                  <span className="text-[8px] text-[#E85555]">Pending Review</span>
                </div>
              : <img src={p.url} alt={p.name} className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
            }
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()}
          className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer"
          style={{ background:'rgba(255,255,255,0.03)', border:'1.5px dashed rgba(201,168,76,0.3)', color:'#C9A84C' }}>
          <Icon d={ICONS.upload} size={16} />
          <span className="text-[8px] tracking-[0.1em]">ADD</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleFile} />
    </div>
  );
}

/* Staff kudos */
function StaffKudos() {
  const [kudos, setKudos] = useState('');
  const [sent, setSent] = useState(false);
  const staff = [
    { name:'Raj Pandey',   role:'Head Chef',   initials:'RP', color:'#E85555' },
    { name:'Sunita Desai', role:'GRE Manager', initials:'SD', color:'#9B6DE8' },
  ];
  return (
    <div>
      {/* Staff cards — 2 col always */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {staff.map(s => (
          <div key={s.name} className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl"
            style={{ background:`${s.color}08`, border:`1px solid ${s.color}20` }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background:`${s.color}20`, border:`2px solid ${s.color}40`, color:s.color }}>{s.initials}</div>
            <div className="text-center">
              <div className="text-xs md:text-sm text-[#F5F0E8]">{s.name}</div>
              <div className="text-[9px] text-[#6B6858]">{s.role}</div>
            </div>
          </div>
        ))}
      </div>
      {!sent ? (
        <>
          <textarea value={kudos} onChange={e=>setKudos(e.target.value)} rows={3}
            placeholder="Share your appreciation for the team…"
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.2)] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm resize-none outline-none mb-3" />
          <button onClick={() => kudos.trim() && setSent(true)}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium cursor-pointer min-h-[44px]"
            style={{ background:kudos.trim()?'rgba(201,168,76,0.15)':'rgba(255,255,255,0.04)', color:kudos.trim()?'#C9A84C':'#4A4840', border:`1px solid ${kudos.trim()?'rgba(201,168,76,0.3)':'rgba(255,255,255,0.06)'}` }}>
            <Icon d={ICONS.heart} size={14} /> Send Kudos
          </button>
        </>
      ) : (
        <div className="text-center py-4 rounded-xl text-[#5FBF8A] text-sm" style={{ background:'rgba(95,191,138,0.1)', border:'1px solid rgba(95,191,138,0.3)' }}>
          ✓ Kudos sent to the team! We'll pass them along.
        </div>
      )}
    </div>
  );
}

export default function FeedbackForm() {
  const [overallRating, setOverallRating] = useState(8);
  const [dishRatings, setDishRatings]     = useState({});
  const [swipeComplete, setSwipeComplete] = useState(false);
  const [photos, setPhotos]               = useState([]);
  const [testimonial, setTestimonial]     = useState('');
  const [submitted, setSubmitted]         = useState(false);
  const [aiInsight, setAiInsight]         = useState(null);

  const remainingItems = MENU_ITEMS.filter(m => !dishRatings[m.id]);
  const currentItem    = remainingItems[0];
  const excellentCount = Object.values(dishRatings).filter(v=>v==='excellent').length;
  const poorCount      = Object.values(dishRatings).filter(v=>v==='poor').length;

  const handleDishRate = useCallback((id, rating) => {
    setDishRatings(prev => {
      const next = { ...prev, [id]:rating };
      if (Object.keys(next).length >= MENU_ITEMS.length) setSwipeComplete(true);
      return next;
    });
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setAiInsight(`Event scored ${overallRating}/10. Guests ${excellentCount > 3 ? 'loved' : 'felt mixed about'} the menu.${overallRating >= 9 ? ' A marketing feature request has been sent to your event team.' : ''}`), 1200);
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#080810] font-sans flex flex-col items-center justify-center px-6 py-10 relative">
      <div className="fixed inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 40% at 50% 50%,rgba(201,168,76,0.1) 0%,transparent 70%)' }} />
      <div className="relative z-10 text-center max-w-sm md:max-w-md mx-auto">
        <div className="text-5xl md:text-6xl mb-4">🌟</div>
        <h2 className="font-serif text-3xl md:text-4xl text-[#F5F0E8] mb-3">Thank You!</h2>
        <p className="text-sm md:text-base text-[#9D9880] leading-relaxed mb-6">Your feedback helps us create even better celebrations. A gallery of memories will be shared on WhatsApp within 24 hours.</p>
        {aiInsight && (
          <div className="rounded-2xl p-5 text-left mb-6" style={{ background:'rgba(155,109,232,0.06)', border:'1px solid rgba(155,109,232,0.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon d={ICONS.brain} size={13} style={{ color:'#9B6DE8' }} />
              <span className="text-[9px] text-[#9B6DE8] tracking-[0.2em] uppercase">AI Insight</span>
            </div>
            <p className="text-sm text-[#9D9880] leading-relaxed">{aiInsight}</p>
          </div>
        )}
        <div className="text-xs text-[#4A4840]">Powered by Banquet IntelliManager · Featherless.ai</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080810] font-sans text-[#F5F0E8]">
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(232,94,154,0.06) 0%,transparent 60%)' }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        .portal-card { background:rgba(255,255,255,0.03); border:1px solid rgba(201,168,76,0.12); border-radius:1.25rem; padding:1.25rem; margin-bottom:1rem; }
        .portal-section-label { font-size:10px; color:#C9A84C; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.875rem; display:block; }
        input[type=range]::-webkit-slider-thumb { appearance:none; width:16px; height:16px; border-radius:50%; background:#C9A84C; cursor:pointer; }
        textarea:focus { border-color:rgba(201,168,76,0.5)!important; outline:none; }
      `}</style>

      <div className="relative z-10">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3"
          style={{ background:'rgba(8,8,16,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-[#F5F0E8]"
              style={{ background:'linear-gradient(135deg,#E85E9A,#9B3DAA)' }}>B</div>
            <div>
              <div className="font-serif text-base font-bold text-[#F5F0E8]">Post-Event Feedback</div>
              <div className="text-[8px] text-[#6B5520] tracking-[0.2em] uppercase -mt-0.5">Client Portal</div>
            </div>
          </div>
          <Link to="/portal" className="text-xs text-[#9D9880] no-underline">← Dashboard</Link>
        </div>

        {/* Content — wider on desktop */}
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-28">

          {/* ── Responsive 2-col layout on lg ── */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

            {/* LEFT column */}
            <div>
              {/* Overall rating dial */}
              <div className="portal-card text-center">
                <span className="portal-section-label">Overall Experience</span>
                <RatingDial value={overallRating} onChange={setOverallRating} />
                {overallRating < 5 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-xs text-[#E85555] text-left"
                    style={{ background:'rgba(232,85,85,0.08)', border:'1px solid rgba(232,85,85,0.25)' }}>
                    <Icon d={ICONS.alert} size={13} />
                    We're sorry you had a poor experience. Our team will be notified to follow up.
                  </div>
                )}
              </div>

              {/* Written testimonial */}
              <div className="portal-card">
                <span className="portal-section-label">Your Experience</span>
                <textarea value={testimonial} onChange={e=>setTestimonial(e.target.value)} rows={4}
                  placeholder="Tell us what made your event special, or what we can do better…"
                  className="w-full text-sm leading-relaxed resize-none"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:12, padding:'12px 14px', color:'#F5F0E8', outline:'none' }} />
                <div className="text-xs text-[#4A4840] text-right mt-1">{testimonial.length} chars</div>
              </div>

              {/* AI indicator — desktop */}
              <div className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background:'rgba(155,109,232,0.06)', border:'1px solid rgba(155,109,232,0.2)' }}>
                <Icon d={ICONS.brain} size={14} style={{ color:'#9B6DE8', flexShrink:0 }} />
                <span className="text-xs text-[#9D9880] leading-relaxed">
                  Your feedback is processed by <span style={{ color:'#9B6DE8' }}>Featherless.ai</span> to generate sentiment insights for the Banquet GM.
                </span>
              </div>
            </div>

            {/* RIGHT column */}
            <div>
              {/* Dish swipe rating */}
              <div className="portal-card">
                <span className="portal-section-label">Rate Each Dish</span>
                <div className="text-xs text-[#6B6858] mb-4">Swipe right for excellent ✓ · Swipe left for poor ✗</div>
                {!swipeComplete && currentItem ? (
                  <>
                    {/* Progress */}
                    <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background:'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width:`${(Object.keys(dishRatings).length/MENU_ITEMS.length)*100}%`, background:'linear-gradient(90deg,#C9A84C,#5FBF8A)', transition:'width 0.5s ease' }} />
                    </div>
                    {/* Card stack — taller on desktop */}
                    <div className="relative mb-4" style={{ height:250 }}>
                      {remainingItems.slice(1,3).reverse().map((item,i) => (
                        <div key={item.id} style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:24, transform:`scale(${0.94+i*0.03}) translateY(${(1-i)*8}px)`, zIndex:i }} />
                      ))}
                      <div style={{ position:'absolute', inset:0, zIndex:10 }}>
                        <SwipeCard key={currentItem.id} item={currentItem} onRate={handleDishRate} />
                      </div>
                    </div>
                    {/* Manual buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={()=>handleDishRate(currentItem.id,'poor')} className="py-3 rounded-xl text-sm cursor-pointer min-h-[44px]"
                        style={{ background:'rgba(232,85,85,0.1)', border:'1px solid rgba(232,85,85,0.3)', color:'#E85555' }}>✗ Not Great</button>
                      <button onClick={()=>handleDishRate(currentItem.id,'excellent')} className="py-3 rounded-xl text-sm cursor-pointer min-h-[44px]"
                        style={{ background:'rgba(95,191,138,0.1)', border:'1px solid rgba(95,191,138,0.3)', color:'#5FBF8A' }}>✓ Loved It</button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="text-center py-4 text-sm text-[#5FBF8A] mb-3">✓ All dishes rated!</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center py-3 rounded-xl" style={{ background:'rgba(95,191,138,0.1)', border:'1px solid rgba(95,191,138,0.2)' }}>
                        <div className="font-serif text-2xl font-bold text-[#5FBF8A]">{excellentCount}</div>
                        <div className="text-xs text-[#6B6858]">Excellent</div>
                      </div>
                      <div className="text-center py-3 rounded-xl" style={{ background:'rgba(232,85,85,0.1)', border:'1px solid rgba(232,85,85,0.2)' }}>
                        <div className="font-serif text-2xl font-bold text-[#E85555]">{poorCount}</div>
                        <div className="text-xs text-[#6B6858]">Needs Work</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo gallery */}
              <div className="portal-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="portal-section-label mb-0">Event Memories</span>
                  <span className="text-xs text-[#4A4840]">{photos.length} photo{photos.length!==1?'s':''}</span>
                </div>
                <PhotoGallery photos={photos} onUpload={p => setPhotos(prev=>[...prev, { ...p, moderated:false }])} />
                <p className="text-xs text-[#4A4840] mt-2 leading-relaxed">Photos are AI-moderated. All guests receive a gallery link within 24 hours.</p>
              </div>

              {/* Staff kudos */}
              <div className="portal-card">
                <span className="portal-section-label">Appreciate the Team</span>
                <StaffKudos />
              </div>
            </div>
          </div>

          {/* AI indicator — mobile */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background:'rgba(155,109,232,0.06)', border:'1px solid rgba(155,109,232,0.2)' }}>
            <Icon d={ICONS.brain} size={14} style={{ color:'#9B6DE8', flexShrink:0 }} />
            <span className="text-xs text-[#9D9880] leading-relaxed">
              Processed by <span style={{ color:'#9B6DE8' }}>Featherless.ai</span> — generates sentiment summary for the Banquet GM.
            </span>
          </div>
        </div>
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-0 left-0 right-0 z-50"
        style={{ padding:`12px 16px max(20px,env(safe-area-inset-bottom))`, background:'linear-gradient(180deg,transparent,rgba(8,8,16,0.98))' }}>
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <button onClick={handleSubmit}
            className="w-full py-4 rounded-2xl font-bold text-sm border-none cursor-pointer flex items-center justify-center gap-2 min-h-[52px] transition-all hover:brightness-110 active:scale-[0.99]"
            style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)', color:'#080810' }}>
            <Icon d={ICONS.send} size={15} style={{ color:'#080810' }} /> Submit Feedback
          </button>
          <div className="text-center mt-2 text-xs text-[#4A4840]">Your review is private and used only to improve our service.</div>
        </div>
      </div>
    </div>
  );
}
