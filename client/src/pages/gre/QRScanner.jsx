import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGREStore from './useGREStore';
import useSound from './useSound';
import './GRE.css';

/* ── Icons ── */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/* ── Animated Check SVG ── */
const AnimatedCheck = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"
      strokeDasharray="60" strokeDashoffset="60"
      style={{ animation: 'gre-draw-check .4s ease forwards' }} />
  </svg>
);

/* ── Animated X SVG ── */
const AnimatedX = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" strokeDasharray="40" strokeDashoffset="40"
      style={{ animation: 'gre-draw-x .3s ease forwards' }} />
    <path d="M6 6l12 12" strokeDasharray="40" strokeDashoffset="40"
      style={{ animation: 'gre-draw-x .3s .15s ease forwards' }} />
  </svg>
);

/* ── Warning Triangle ── */
const WarningIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'gre-bounce-in .4s ease' }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── Scan Result Card ── */
function ScanResultCard({ result, onDismiss, onAddWalkIn }) {
  useEffect(() => {
    // Auto-dismiss after 2.5s (3s for unknown to allow action)
    const delay = result.type === 'unknown' ? 3500 : 2500;
    const t = setTimeout(onDismiss, delay);
    return () => clearTimeout(t);
  }, [result, onDismiss]);

  if (result.type === 'success') {
    return (
      <div className="gre-scan-result success">
        <AnimatedCheck />
        <div className="scan-name">{result.guest?.name}</div>
        <div className="scan-detail">{result.guest?.table} · Seat {result.guest?.seat}</div>
        <div className="scan-count">
          Guest {result.arrivedCount} of {result.expectedCount}
        </div>
        {result.guest?.dietaryFlag && (
          <div className="scan-alert-banner">
            ⚠ DIETARY: {result.guest.dietaryFlag} — direct to designated station
          </div>
        )}
      </div>
    );
  }

  if (result.type === 'duplicate') {
    return (
      <div className="gre-scan-result error">
        <AnimatedX />
        <div className="scan-name">Already Checked In</div>
        <div className="scan-detail">
          Checked in at {result.originalTime} by {result.originalStaff}
        </div>
        <div className="do-not-admit">DO NOT ADMIT</div>
      </div>
    );
  }

  if (result.type === 'blocked') {
    return (
      <div className="gre-scan-result error">
        <AnimatedX />
        <div className="scan-name">Blocked</div>
        <div className="scan-detail" style={{ fontSize: 16 }}>{result.reason}</div>
      </div>
    );
  }

  // unknown
  return (
    <div className="gre-scan-result warning">
      <WarningIcon />
      <div className="scan-name">Guest Not Found</div>
      <div className="scan-detail">This QR code is not in the system</div>
      <div style={{ marginTop: 20, display: 'flex', gap: 10, width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
        <button
          className="gre-btn primary"
          style={{ flex: 1, background: 'rgba(255,255,255,.2)', color: 'white', animation: 'none' }}
          onClick={() => { onAddWalkIn?.(); onDismiss(); }}
        >
          Add as Walk-in
        </button>
        <button className="gre-btn ghost" style={{ flex: 1, color: 'rgba(255,255,255,.7)' }}
          onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

/* ── Manual Lookup Sheet ── */
function ManualLookup({ open, onClose }) {
  const [search, setSearch] = useState('');
  const guests = useGREStore(s => s.guests);
  const checkedIn = useGREStore(s => s.checkedIn);
  const checkInGuest = useGREStore(s => s.checkInGuest);
  const session = useGREStore(s => s.session);

  if (!open) return null;

  const filtered = Array.from(guests.values())
    .filter(g => !checkedIn.has(g.id))
    .filter(g => {
      if (!search) return true;
      const q = search.toLowerCase();
      return g.name.toLowerCase().includes(q) || g.bookingRef.toLowerCase().includes(q);
    })
    .slice(0, 20);

  return (
    <>
      <div className="gre-sheet-overlay" onClick={onClose} />
      <div className="gre-sheet" style={{ maxHeight: '70vh' }}>
        <div className="gre-sheet-handle" />
        <h3>Manual Check-in</h3>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or booking ref..."
          className="gre-search" autoFocus
          style={{ marginBottom: 12 }}
        />
        <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
          {filtered.map(g => (
            <div key={g.id} className="gre-guest-row" style={{ cursor: 'default' }}>
              <div className="gre-guest-info">
                <div className="gre-guest-name">{g.name}</div>
                <div className="gre-guest-ref">{g.bookingRef} · {g.table}</div>
              </div>
              <div className="gre-guest-badges">
                {g.dietaryFlag && (
                  <span className={`gre-diet-badge ${g.dietaryFlag.toLowerCase().includes('allergy') ? 'allergy' : 'pref'}`}>
                    {g.dietaryFlag.toLowerCase().includes('allergy') ? '⚠ ALLERGY' : 'DIET'}
                  </span>
                )}
              </div>
              <button className="gre-pill green" style={{ cursor: 'pointer', border: '1px solid rgba(22,163,74,.3)' }}
                onClick={() => {
                  checkInGuest(g.id, session?.staffId, session?.staffName);
                  if (navigator.vibrate) navigator.vibrate(200);
                  onClose();
                }}>
                Check in
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--gre-text-dim)', padding: 20 }}>
              No matching guests found
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ── MAIN QR SCANNER ── */
export default function QRScanner() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastScanRef = useRef('');
  const lastScanTimeRef = useRef(0);

  const [scanResult, setScanResult] = useState(null);
  const [reticleState, setReticleState] = useState('idle'); // idle | success | error
  const [torchOn, setTorchOn] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const session = useGREStore(s => s.session);
  const isOnline = useGREStore(s => s.isOnline);
  const checkedIn = useGREStore(s => s.checkedIn);
  const checkInGuest = useGREStore(s => s.checkInGuest);
  const scanHistory = useGREStore(s => s.scanHistory);
  const currentEvent = useGREStore(s => s.currentEvent);
  const offlineQueue = useGREStore(s => s.offlineQueue);
  const addToOfflineQueue = useGREStore(s => s.addToOfflineQueue);
  const soundEnabled = useGREStore(s => s.soundEnabled);
  const { playSuccess, playError } = useSound(soundEnabled);

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        setCameraError('Camera access denied or unavailable.');
      }
    }
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // QR decode loop (using requestAnimationFrame, NOT setInterval)
  // Note: install `jsqr` via npm to enable live QR decoding.
  // For now, uses the "Demo Scan" button for check-ins.
  useEffect(() => {
    if (!cameraReady || scanResult) return;

    const scan = () => {
      if (!videoRef.current || !canvasRef.current || scanResult) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // If jsQR were installed, decode would happen here:
        // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // const code = jsQR(imageData.data, imageData.width, imageData.height);
        // if (code?.data) handleScan(code.data);
      }
      animFrameRef.current = requestAnimationFrame(scan);
    };
    animFrameRef.current = requestAnimationFrame(scan);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [cameraReady, scanResult]);

  const handleScan = useCallback((data) => {
    // Try to parse QR data as guest ID
    const guestId = data.startsWith('guest_') ? data : `guest_${data.replace(/\D/g, '').padStart(3, '0')}`;
    const result = checkInGuest(guestId, session?.staffId, session?.staffName);
    const arrived = useGREStore.getState().checkedIn.size;

    if (result.status === 'success') {
      setReticleState('success');
      playSuccess();
      if (navigator.vibrate) navigator.vibrate(200);
      setScanResult({
        type: 'success',
        guest: result.guest,
        arrivedCount: arrived,
        expectedCount: currentEvent.expectedCount,
      });
    } else if (result.status === 'duplicate') {
      setReticleState('error');
      playError();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setScanResult({
        type: 'duplicate',
        guest: result.guest,
        originalTime: result.scanEvent?.originalCheckinTime
          ? new Date(result.scanEvent.originalCheckinTime).toLocaleTimeString()
          : 'unknown',
        originalStaff: result.scanEvent?.originalCheckinBy || 'unknown',
      });
    } else if (result.status === 'blocked') {
      setReticleState('error');
      playError();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setScanResult({ type: 'blocked', reason: result.reason });
    } else {
      setReticleState('error');
      playError();
      setScanResult({ type: 'unknown', data });
    }
  }, [session, currentEvent, checkInGuest, playSuccess, playError]);

  // Demo scan button (for testing without camera/jsQR)
  const handleDemoScan = useCallback(() => {
    const allGuests = Array.from(useGREStore.getState().guests.keys());
    const notCheckedIn = allGuests.filter(id => !useGREStore.getState().checkedIn.has(id));
    if (notCheckedIn.length > 0) {
      const randomGuest = notCheckedIn[Math.floor(Math.random() * notCheckedIn.length)];
      handleScan(randomGuest);
    } else {
      // All checked in — trigger duplicate
      const randomGuest = allGuests[Math.floor(Math.random() * allGuests.length)];
      handleScan(randomGuest);
    }
  }, [handleScan]);

  const dismissResult = useCallback(() => {
    setScanResult(null);
    setReticleState('idle');
  }, []);

  // Torch toggle
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(!torchOn);
    } catch { /* torch not supported */ }
  }, [torchOn]);

  const recentScans = scanHistory.slice(0, 8);

  return (
    <div className="gre-root" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Scan result overlay */}
      {scanResult && (
        <ScanResultCard
          result={scanResult}
          onDismiss={dismissResult}
          onAddWalkIn={() => navigate('/gre/walkin')}
        />
      )}

      {/* Camera viewport */}
      <div className="gre-scanner" style={{ display: scanResult ? 'none' : 'block' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Camera error */}
        {cameraError && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#080810',
            color: 'var(--gre-text-muted)', padding: 32, textAlign: 'center', gap: 16,
          }}>
            <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" size={48} />
            <p>{cameraError}</p>
            <button className="gre-btn primary" style={{ width: 'auto', padding: '12px 24px', animation: 'none' }}
              onClick={handleDemoScan}>
              Use Demo Scanner Instead
            </button>
          </div>
        )}

        {/* Scanning reticle */}
        <div className={`gre-reticle ${reticleState} ${!isOnline ? 'offline' : ''}`}>
          <div className="gre-reticle-corner tl" />
          <div className="gre-reticle-corner tr" />
          <div className="gre-reticle-corner bl" />
          <div className="gre-reticle-corner br" />
        </div>

        {/* Torch button */}
        <button className={`gre-torch-btn ${torchOn ? 'on' : ''}`} onClick={toggleTorch}>
          <Icon d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" size={20} />
        </button>

        {/* Back button */}
        <button style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.2)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
        }} onClick={() => navigate('/gre')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={20} />
        </button>

        {/* Demo scan button */}
        <button style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, padding: '8px 16px', borderRadius: 20,
          background: 'rgba(201,168,76,.2)', border: '1px solid rgba(201,168,76,.4)',
          color: '#C9A84C', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }} onClick={handleDemoScan}>
          ⚡ Demo Scan
        </button>

        {/* Bottom controls */}
        <div className="gre-scanner-bottom">
          {/* Offline banner */}
          {!isOnline && (
            <div className="gre-offline-banner">
              <span style={{ fontSize: 16 }}>📡</span>
              Offline — check-ins saved locally
              {offlineQueue.length > 0 && (
                <span className="gre-pill amber" style={{ marginLeft: 'auto' }}>
                  {offlineQueue.length} pending
                </span>
              )}
            </div>
          )}

          {/* Scan history bar */}
          {recentScans.length > 0 && (
            <div className="gre-scan-history">
              {recentScans.map(scan => (
                <div
                  key={scan.id}
                  className={`gre-scan-chip ${scan.type === 'success' ? 'success' : 'error'}`}
                  title={scan.guestName}
                  onClick={() => {
                    if (scan.type === 'success') {
                      setScanResult({
                        type: 'success', guest: useGREStore.getState().guests.get(scan.guestId),
                        arrivedCount: checkedIn.size, expectedCount: currentEvent.expectedCount,
                      });
                    }
                  }}
                >
                  {scan.guestName?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              ))}
            </div>
          )}

          {/* Can't scan? */}
          <button style={{
            width: '100%', padding: 12, background: 'none', border: 'none',
            color: 'rgba(255,255,255,.5)', fontSize: 13, cursor: 'pointer',
            textDecoration: 'underline', textUnderlineOffset: 3,
          }} onClick={() => setManualOpen(true)}>
            Can't scan? Search manually
          </button>
        </div>
      </div>

      {/* Manual lookup sheet */}
      <ManualLookup open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  );
}
