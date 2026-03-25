import React, { useState, useEffect, useRef } from 'react';
import ParticleField from '../../components/shared/ParticleField';
import useReveal from '../../hooks/useReveal';
import './DJLiveView.css';

/* ── Icon helper ── */
const I = ({ d, s = 20, className = '' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const ico = {
  music:  'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  heart:  'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  skip:   'M5 4l10 8-10 8V4zM19 5v14',
  play:   'M5 3l14 9-14 9V3z',
  pause:  'M6 4h4v16H6zM14 4h4v16h-4z',
  vol:    'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07',
  users:  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  fire:   'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  star:   'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  trash:  'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2',
  check:  'M20 6 9 17l-5-5',
  wa:     'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.38 8.38 0 0 1 11.5 3h.5a8.48 8.48 0 0 1 8 8v.5z',
  micro:  'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
  eq:     'M9 18V5M4 13v-2M14 13v-6M19 18V9',
  arr:    'M5 12h14M12 5l7 7-7 7',
  back:   'M19 12H5M12 19l-7-7 7-7',
  x:      'M18 6 6 18M6 6l12 12',
  list:   'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
};

/* ── Mock data ── */
const INITIAL_QUEUE = [
  { id: 1,  song: 'Kesariya',           artist: 'Arijit Singh',       requestedBy: 'Table 7',   votes: 24, genre: 'Bollywood',  duration: '4:28', vibe: 'romantic' },
  { id: 2,  song: 'Blinding Lights',    artist: 'The Weeknd',         requestedBy: 'Table 12',  votes: 19, genre: 'Pop',        duration: '3:20', vibe: 'energetic' },
  { id: 3,  song: 'Tum Hi Ho',          artist: 'Arijit Singh',       requestedBy: 'Table 3',   votes: 17, genre: 'Bollywood',  duration: '4:12', vibe: 'romantic' },
  { id: 4,  song: 'Levitating',         artist: 'Dua Lipa',           requestedBy: 'Priya M.',  votes: 14, genre: 'Pop',        duration: '3:23', vibe: 'energetic' },
  { id: 5,  song: 'Ik Vaari Aa',        artist: 'Pritam',             requestedBy: 'Table 5',   votes: 11, genre: 'Bollywood',  duration: '4:45', vibe: 'soulful' },
  { id: 6,  song: 'Shape of You',       artist: 'Ed Sheeran',         requestedBy: 'Table 9',   votes: 9,  genre: 'Pop',        duration: '3:54', vibe: 'fun' },
  { id: 7,  song: 'Channa Mereya',      artist: 'Arijit Singh',       requestedBy: 'Table 1',   votes: 8,  genre: 'Bollywood',  duration: '4:52', vibe: 'soulful' },
  { id: 8,  song: 'As It Was',          artist: 'Harry Styles',       requestedBy: 'Table 15',  votes: 6,  genre: 'Pop',        duration: '2:37', vibe: 'fun' },
];

const NOW_PLAYING = {
  song: 'Tera Ban Jaunga',
  artist: 'Tulsi Kumar & Akhil Sachdeva',
  requestedBy: 'Bride\'s Family',
  duration: 247,
  genre: 'Bollywood',
  vibe: 'romantic',
};

const VIBE_COLORS = {
  romantic:  { bg: '#E85E9A22', border: '#E85E9A40', text: '#E85E9A', dot: '#E85E9A' },
  energetic: { bg: '#5B8FE822', border: '#5B8FE840', text: '#5B8FE8', dot: '#5B8FE8' },
  soulful:   { bg: '#9B6DE822', border: '#9B6DE840', text: '#9B6DE8', dot: '#9B6DE8' },
  fun:       { bg: '#5FBF8A22', border: '#5FBF8A40', text: '#5FBF8A', dot: '#5FBF8A' },
};

const GENRE_COLORS = {
  Bollywood: '#C9A84C',
  Pop:       '#5B8FE8',
  Classical: '#9B6DE8',
  EDM:       '#5FBF8A',
};

/* ── Waveform visualizer ── */
function Waveform({ playing }) {
  const bars = 32;
  return (
    <div className="dj-wave">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`dj-wave-bar ${playing ? 'dj-wave-bar--active' : ''}`}
          style={{
            '--delay': `${(i * 0.05) % 1}s`,
            '--height': `${20 + Math.sin(i * 0.6) * 15 + Math.random() * 25}%`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Vinyl record ── */
function Vinyl({ playing, song }) {
  return (
    <div className={`dj-vinyl ${playing ? 'dj-vinyl--spinning' : ''}`}>
      <div className="dj-vinyl-outer">
        <div className="dj-vinyl-groove dj-vinyl-groove--1" />
        <div className="dj-vinyl-groove dj-vinyl-groove--2" />
        <div className="dj-vinyl-groove dj-vinyl-groove--3" />
        <div className="dj-vinyl-label">
          <span className="dj-vinyl-initial">{song.charAt(0)}</span>
        </div>
      </div>
      <div className="dj-vinyl-needle" />
    </div>
  );
}

/* ── Progress bar ── */
function ProgressBar({ duration }) {
  const [elapsed, setElapsed] = useState(42);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed(e => e < duration ? e + 1 : 0), 1000);
    return () => clearInterval(t);
  }, [playing, duration]);

  const pct = (elapsed / duration) * 100;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return { pct, elapsed, fmt, playing, setPlaying };
}

/* ── Main Component ── */
export default function DJLiveView({ onBack }) {
  useReveal();
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [votedIds, setVotedIds] = useState([]);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(42);
  const [volume, setVolume] = useState(78);
  const [filterVibe, setFilterVibe] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [newReq, setNewReq] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(NOW_PLAYING);
  const [skipped, setSkipped] = useState([]);

  // Tick
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed(e => e < NOW_PLAYING.duration ? e + 1 : 0), 1000);
    return () => clearInterval(t);
  }, [playing]);

  // Simulate incoming requests
  useEffect(() => {
    const incoming = [
      { id: 99, song: 'Raataan Lambiyan', artist: 'Jubin Nautiyal', requestedBy: 'Table 4', votes: 3, genre: 'Bollywood', duration: '3:51', vibe: 'romantic' },
      { id: 98, song: 'Stay',             artist: 'The Kid LAROI',  requestedBy: 'Table 11', votes: 1, genre: 'Pop',       duration: '2:21', vibe: 'fun' },
    ];
    const timers = incoming.map((req, i) =>
      setTimeout(() => {
        setNewReq(req);
        setTimeout(() => {
          setQueue(q => [...q, req].sort((a, b) => b.votes - a.votes));
          setNewReq(null);
        }, 3000);
      }, (i + 1) * 12000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const vote = (id) => {
    if (votedIds.includes(id)) return;
    setVotedIds(v => [...v, id]);
    setQueue(q => q.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r)
               .sort((a, b) => b.votes - a.votes));
  };

  const skipToNext = () => {
    const next = filtered[0];
    if (!next) return;
    setSkipped(s => [...s, nowPlaying.song]);
    setNowPlaying({ ...next, duration: 240 });
    setQueue(q => q.filter(r => r.id !== next.id));
    setElapsed(0);
  };

  const removeFromQueue = (id) => setQueue(q => q.filter(r => r.id !== id));

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const pct = (elapsed / NOW_PLAYING.duration) * 100;

  const vibes   = ['all', 'romantic', 'energetic', 'soulful', 'fun'];
  const genres  = ['all', 'Bollywood', 'Pop'];

  const filtered = queue.filter(r => {
    const vOk = filterVibe  === 'all' || r.vibe  === filterVibe;
    const gOk = filterGenre === 'all' || r.genre === filterGenre;
    return vOk && gOk;
  });

  const vibeColor = VIBE_COLORS[nowPlaying.vibe] || VIBE_COLORS.romantic;

  return (
    <div className="dj">
      {/* ── CSS vars & animations injected once ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes pDrift     { 0%{transform:translateY(0) translateX(0);opacity:0} 10%{opacity:.7} 90%{opacity:.5} 100%{transform:translateY(-90vh) translateX(20px);opacity:0} }
        @keyframes barDance   { 0%,100%{height:var(--height)} 50%{height:calc(var(--height) * 1.8)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 12px rgba(201,168,76,.3)} 50%{box-shadow:0 0 28px rgba(201,168,76,.6)} }
        @keyframes slide-in   { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pop-in     { from{opacity:0;transform:scale(.8) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes revealUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .reveal { opacity:0; transform:translateY(24px); transition:opacity .6s ease, transform .6s ease; }
        .reveal-visible { opacity:1; transform:translateY(0); }
      `}</style>

      <ParticleField count={25} />

      {/* Background grid */}
      <div className="dj__grid-bg" />

      {/* Orbs */}
      <div className="dj__orb dj__orb--gold" />
      <div className="dj__orb dj__orb--blue" />

      {/* ── Header ── */}
      <header className="dj__header reveal">
        <div className="dj__header-left">
          <button 
            className="dj__back-btn"
            onClick={onBack}
            title="Back to Landing"
          >
            <I d={ico.back} s={18} />
          </button>
          <div className="dj__logo">
            <span>B</span>
          </div>
          <div>
            <div className="dj__header-title">DJ Live View</div>
            <div className="dj__header-sub">Banquet IntelliManager · Mehta Wedding · 14 Jul 2026</div>
          </div>
        </div>
        <div className="dj__header-center">
          <div className="dj__live-badge">
            <span className="dj__live-dot" />
            LIVE · {queue.length + 1} in queue · {248} guests
          </div>
        </div>
        <div className="dj__header-right">
          <div className="dj__stat-pill">
            <I d={ico.users} s={13} /> {248} Guests
          </div>
          <div className="dj__stat-pill dj__stat-pill--gold">
            <I d={ico.music} s={13} /> {queue.length} Queued
          </div>
        </div>
      </header>

      <div className="dj__body">

        {/* ── LEFT: Now Playing ── */}
        <div className="dj__left">

          {/* Now Playing card */}
          <div className="dj__now-playing reveal" style={{ '--vibe-color': vibeColor.text, '--vibe-bg': vibeColor.bg, '--vibe-border': vibeColor.border }}>
            <div className="dj__np-glow" style={{ background: `radial-gradient(circle, ${vibeColor.text} 0%, transparent 70%)` }} />

            <div className="dj__np-top">
              <Vinyl playing={playing} song={nowPlaying.song} />
              <div className="dj__np-info">
                <span className="dj__np-label">NOW PLAYING</span>
                <h2 className="dj__np-song">{nowPlaying.song}</h2>
                <p className="dj__np-artist">{nowPlaying.artist}</p>
                <div className="dj__np-meta">
                  <span className="dj__vibe-tag" style={{ background: vibeColor.bg, border: `1px solid ${vibeColor.border}`, color: vibeColor.text }}>
                    ♥ {nowPlaying.vibe}
                  </span>
                  <span className="dj__genre-tag" style={{ color: GENRE_COLORS[nowPlaying.genre] || '#C9A84C' }}>
                    {nowPlaying.genre}
                  </span>
                  <span className="dj__np-requested">req. by {nowPlaying.requestedBy}</span>
                </div>
              </div>
            </div>

            {/* Waveform */}
            <Waveform playing={playing} />

            {/* Progress */}
            <div className="dj__progress">
              <span className="dj__time">{fmt(elapsed)}</span>
              <div className="dj__progress-track" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setElapsed(Math.floor(pct * NOW_PLAYING.duration));
              }}>
                <div className="dj__progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${vibeColor.text}, #C9A84C)` }} />
                <div className="dj__progress-thumb" style={{ left: `${pct}%`, background: vibeColor.text }} />
              </div>
              <span className="dj__time">{fmt(NOW_PLAYING.duration)}</span>
            </div>

            {/* Controls */}
            <div className="dj__controls">
              <button className="dj__ctrl-btn" onClick={skipToNext} title="Next">
                <I d={ico.back} s={18} />
              </button>
              <button className="dj__ctrl-play" onClick={() => setPlaying(p => !p)}>
                <I d={playing ? ico.pause : ico.play} s={22} />
              </button>
              <button className="dj__ctrl-btn" onClick={skipToNext} title="Skip">
                <I d={ico.skip} s={18} />
              </button>
            </div>

            {/* Volume */}
            <div className="dj__volume">
              <I d={ico.vol} s={14} />
              <input
                type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="dj__vol-slider"
                style={{ '--vol-pct': `${volume}%` }}
              />
              <span className="dj__vol-val">{volume}%</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="dj__stats reveal">
            {[
              { label: 'Requests Tonight', value: queue.length + skipped.length + 1, icon: ico.music, color: '#C9A84C' },
              { label: 'Votes Cast',        value: queue.reduce((s, r) => s + r.votes, 0), icon: ico.heart, color: '#E85E9A' },
              { label: 'Songs Played',      value: skipped.length + 1, icon: ico.check, color: '#5FBF8A' },
              { label: 'Via WhatsApp',      value: Math.floor((queue.length + 1) * 0.6), icon: ico.wa, color: '#25D366' },
            ].map((s, i) => (
              <div key={s.label} className="dj__stat-card" style={{ '--s-color': s.color }}>
                <div className="dj__stat-icon"><I d={s.icon} s={16} /></div>
                <div className="dj__stat-val">{s.value}</div>
                <div className="dj__stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Equalizer block */}
          <div className="dj__eq-card reveal">
            <div className="dj__eq-header">
              <span className="dj__eq-title"><I d={ico.eq} s={15} /> Live EQ Monitor</span>
              <span className="dj__eq-sub">Auto-adjusting to crowd energy</span>
            </div>
            <div className="dj__eq-bars">
              {['Bass', 'Low-Mid', 'Mid', 'Hi-Mid', 'Treble'].map((band, i) => {
                const h = [72, 55, 88, 63, 45][i];
                return (
                  <div key={band} className="dj__eq-band">
                    <div className="dj__eq-bar-wrap">
                      <div className="dj__eq-bar" style={{ height: `${h}%`, '--eq-color': ['#C9A84C','#5B8FE8','#E85E9A','#5FBF8A','#9B6DE8'][i] }} />
                    </div>
                    <span className="dj__eq-band-label">{band}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Queue ── */}
        <div className="dj__right">

          {/* New request notification */}
          {newReq && (
            <div className="dj__new-req">
              <div className="dj__new-req-ping" />
              <div className="dj__new-req-body">
                <span className="dj__new-req-label">NEW REQUEST</span>
                <div className="dj__new-req-song">"{newReq.song}"</div>
                <div className="dj__new-req-by">from {newReq.requestedBy}</div>
              </div>
              <I d={ico.music} s={20} style={{ color: '#C9A84C' }} />
            </div>
          )}

          {/* Queue header + filters */}
          <div className="dj__queue-head reveal">
            <div className="dj__queue-title-row">
              <h3 className="dj__queue-title">
                <I d={ico.list} s={17} /> Request Queue
              </h3>
              <span className="dj__queue-count">{filtered.length} songs</span>
            </div>

            {/* Vibe filters */}
            <div className="dj__filters">
              <span className="dj__filter-label">Vibe</span>
              {vibes.map(v => (
                <button
                  key={v}
                  className={`dj__filter-btn ${filterVibe === v ? 'dj__filter-btn--active' : ''}`}
                  style={filterVibe === v && v !== 'all' ? { background: VIBE_COLORS[v]?.bg, borderColor: VIBE_COLORS[v]?.border, color: VIBE_COLORS[v]?.text } : {}}
                  onClick={() => setFilterVibe(v)}
                >
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div className="dj__filters">
              <span className="dj__filter-label">Genre</span>
              {genres.map(g => (
                <button
                  key={g}
                  className={`dj__filter-btn ${filterGenre === g ? 'dj__filter-btn--active' : ''}`}
                  onClick={() => setFilterGenre(g)}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Queue list */}
          <div className="dj__queue-list">
            {filtered.map((req, i) => {
              const vc = VIBE_COLORS[req.vibe] || VIBE_COLORS.romantic;
              const voted = votedIds.includes(req.id);
              return (
                <div
                  key={req.id}
                  className={`dj__queue-item reveal ${i === 0 ? 'dj__queue-item--next' : ''}`}
                  style={{ '--item-color': vc.text, transitionDelay: `${i * 0.04}s` }}
                >
                  {/* Rank */}
                  <div className="dj__rank">
                    {i === 0 ? (
                      <span className="dj__rank-next">NEXT</span>
                    ) : (
                      <span className="dj__rank-num">#{i + 1}</span>
                    )}
                  </div>

                  {/* Song info */}
                  <div className="dj__qi-info">
                    <div className="dj__qi-song">{req.song}</div>
                    <div className="dj__qi-artist">{req.artist}</div>
                    <div className="dj__qi-meta">
                      <span style={{ color: vc.text, fontSize: 10 }}>♥ {req.vibe}</span>
                      <span style={{ color: GENRE_COLORS[req.genre] || '#C9A84C', fontSize: 10 }}>{req.genre}</span>
                      <span className="dj__qi-by">{req.requestedBy}</span>
                      <span className="dj__qi-dur">{req.duration}</span>
                    </div>
                  </div>

                  {/* Vote button */}
                  <button
                    className={`dj__vote-btn ${voted ? 'dj__vote-btn--voted' : ''}`}
                    onClick={() => vote(req.id)}
                    disabled={voted}
                  >
                    <I d={ico.fire} s={14} />
                    <span>{req.votes}</span>
                  </button>

                  {/* Remove */}
                  <button className="dj__remove-btn" onClick={() => removeFromQueue(req.id)}>
                    <I d={ico.x} s={13} />
                  </button>

                  {/* Next indicator */}
                  {i === 0 && <div className="dj__next-bar" />}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="dj__queue-empty">
                <I d={ico.music} s={32} />
                <p>No requests match the current filter.</p>
              </div>
            )}
          </div>

          {/* WhatsApp request CTA */}
          <div className="dj__wa-cta reveal">
            <div className="dj__wa-cta-icon"><I d={ico.wa} s={18} /></div>
            <div className="dj__wa-cta-body">
              <div className="dj__wa-cta-title">Send a Song Request</div>
              <div className="dj__wa-cta-sub">WhatsApp the DJ at +91 98765 43210</div>
            </div>
            <button className="dj__wa-cta-btn">
              Request <I d={ico.arr} s={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}