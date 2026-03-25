import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGREStore from './useGREStore';
import './GRE.css';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/* ── Live Headcount Panel ── */
function HeadcountPanel() {
  const checkedIn = useGREStore(s => s.checkedIn);
  const currentEvent = useGREStore(s => s.currentEvent);
  const lastPushedCount = useGREStore(s => s.lastPushedCount);
  const kitchenPushLog = useGREStore(s => s.kitchenPushLog);

  const arrived = checkedIn.size;
  const delta = arrived - lastPushedCount;
  const lastPush = kitchenPushLog.find(p => !p.isAuto);

  return (
    <div className="gre-card">
      <div className="gre-card-title">Live Headcount</div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(3.5rem, 14vw, 6rem)', fontWeight: 700,
          color: 'var(--gre-text)', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {arrived}
        </div>
        <div style={{ fontSize: 18, color: 'var(--gre-text-dim)' }}>/ {currentEvent.expectedCount}</div>
      </div>
      {lastPush && (
        <div style={{ fontSize: 13, color: 'var(--gre-text-dim)', textAlign: 'center' }}>
          Last pushed: {lastPush.count} guests at {new Date(lastPush.timestamp).toLocaleTimeString()}
        </div>
      )}
      {delta > 0 && (
        <div style={{ textAlign: 'center', margin: '14px 0 6px' }}>
          <span className="gre-pill amber" style={{ fontSize: 12 }}>+{delta} since last update</span>
        </div>
      )}
    </div>
  );
}

/* ── Push to Kitchen ── */
function PushSection() {
  const checkedIn = useGREStore(s => s.checkedIn);
  const lastPushedCount = useGREStore(s => s.lastPushedCount);
  const pushToKitchen = useGREStore(s => s.pushToKitchen);
  const session = useGREStore(s => s.session);
  const headcountFrozen = useGREStore(s => s.headcountFrozen);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sentFlash, setSentFlash] = useState(false);
  const delta = checkedIn.size - lastPushedCount;

  const handlePush = () => {
    pushToKitchen(session?.staffId, session?.staffName);
    setConfirmOpen(false);
    setSentFlash(true);
    setTimeout(() => setSentFlash(false), 3000);
  };

  return (
    <div className="gre-card">
      <div className="gre-card-title">Push to Kitchen</div>
      <button
        className={`gre-btn ${sentFlash ? 'primary' : 'amber'}`}
        style={{
          width: '100%', animation: sentFlash ? 'none' : undefined,
          background: sentFlash ? 'var(--gre-success)' : undefined,
          color: sentFlash ? 'white' : undefined,
        }}
        disabled={delta === 0 || headcountFrozen}
        onClick={() => setConfirmOpen(true)}
      >
        {sentFlash ? '✓ Sent to Kitchen!' : `Push Headcount Update (${checkedIn.size} guests)`}
      </button>
      {confirmOpen && (
        <div className="gre-inline-confirm">
          <p style={{ fontSize: 14, color: 'var(--gre-text-muted)', marginBottom: 14 }}>
            Sending <strong style={{ color: 'var(--gre-text)' }}>{checkedIn.size} guests</strong> as the current count to Kitchen. Proceed?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="gre-btn primary" style={{ flex: 1, minHeight: 52, animation: 'none' }}
              onClick={handlePush}>
              Confirm Push
            </button>
            <button className="gre-btn ghost" style={{ flex: 1, minHeight: 52 }}
              onClick={() => setConfirmOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Push Log ── */
function PushLog() {
  const kitchenPushLog = useGREStore(s => s.kitchenPushLog);
  const pushToKitchen = useGREStore(s => s.pushToKitchen);
  const session = useGREStore(s => s.session);

  return (
    <div className="gre-card">
      <div className="gre-card-title">Push History</div>
      {kitchenPushLog.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--gre-text-dim)', textAlign: 'center', padding: 20 }}>
          No pushes yet
        </p>
      ) : (
        kitchenPushLog.map(p => {
          const age = Date.now() - new Date(p.timestamp).getTime();
          const unack = !p.acknowledged && age > 480000; // 8 min
          return (
            <div key={p.id} className="gre-push-log-entry">
              <span>{new Date(p.timestamp).toLocaleTimeString()}</span>
              <span>·</span>
              <strong style={{ color: 'var(--gre-text)' }}>{p.count} guests</strong>
              <span>·</span>
              <span>{p.isAuto ? p.triggerReason : `by ${p.staffName}`}</span>
              <span style={{ marginLeft: 'auto' }}>
                {p.acknowledged ? (
                  <span className="gre-pill green" style={{ fontSize: 10 }}>
                    ✓ Kitchen acknowledged
                  </span>
                ) : unack ? (
                  <span className="gre-pill red" style={{ fontSize: 10, cursor: 'pointer' }}
                    onClick={() => pushToKitchen(session?.staffId, session?.staffName)}>
                    ⚠ Unacknowledged — Resend
                  </span>
                ) : (
                  <span className="gre-pill gold" style={{ fontSize: 10 }}>
                    ⏳ Pending
                  </span>
                )}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ── Freeze Headcount ── */
function FreezeSection() {
  const checkedIn = useGREStore(s => s.checkedIn);
  const headcountFrozen = useGREStore(s => s.headcountFrozen);
  const frozenAt = useGREStore(s => s.frozenAt);
  const frozenCount = useGREStore(s => s.frozenCount);
  const freezeHeadcount = useGREStore(s => s.freezeHeadcount);
  const session = useGREStore(s => s.session);

  const [confirmInput, setConfirmInput] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (headcountFrozen) {
    return (
      <div className="gre-card">
        <div className="gre-frozen-banner">
          🔒 Final count: {frozenCount} guests — locked at {frozenAt ? new Date(frozenAt).toLocaleTimeString() : '—'}
        </div>
      </div>
    );
  }

  return (
    <div className="gre-card">
      <div className="gre-card-title">Freeze Final Count</div>
      {!showConfirm ? (
        <button className="gre-freeze-btn" onClick={() => setShowConfirm(true)}>
          🔒 Freeze Final Count
        </button>
      ) : (
        <div className="gre-inline-confirm">
          <p style={{ fontSize: 14, color: 'var(--gre-text-muted)', marginBottom: 12 }}>
            Type the final guest count to lock it: <strong style={{ color: 'var(--gre-text)' }}>{checkedIn.size}</strong>
          </p>
          <input
            type="number" value={confirmInput}
            onChange={e => setConfirmInput(e.target.value)}
            placeholder="Enter count to confirm"
            className="gre-form-input" style={{ marginBottom: 14 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="gre-freeze-btn" style={{ flex: 1, minHeight: 52 }}
              disabled={parseInt(confirmInput) !== checkedIn.size}
              onClick={() => {
                freezeHeadcount(session?.staffId, session?.staffName);
                setShowConfirm(false);
              }}>
              Confirm Freeze
            </button>
            <button className="gre-btn ghost" style={{ flex: 1, minHeight: 52 }}
              onClick={() => { setShowConfirm(false); setConfirmInput(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── WhatsApp Panel ── */
function WhatsAppPanel() {
  const poStatus = useGREStore(s => s.poStatus);
  const fpStatus = useGREStore(s => s.fpStatus);
  const sendPO = useGREStore(s => s.sendPO);
  const resendFP = useGREStore(s => s.resendFP);
  const session = useGREStore(s => s.session);

  const departments = fpStatus.departments ? Array.from(fpStatus.departments.entries()) : [];
  const ackedCount = departments.filter(([_, s]) => s.acknowledged).length;

  return (
    <div className="gre-card">
      <div className="gre-card-title">WhatsApp Automation</div>

      {/* PO Row */}
      <div className="gre-wa-row">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gre-text)', marginBottom: 6 }}>
            Purchase Order to Client
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`gre-pill ${poStatus.status === 'Acknowledged' ? 'green' : poStatus.status === 'Sent' ? 'gold' : 'amber'}`}
              style={{ fontSize: 11 }}>
              {poStatus.status}
            </span>
            <span style={{ fontSize: 12, color: 'var(--gre-text-dim)' }}>PO-v{poStatus.version}</span>
            {poStatus.acknowledgedAt && (
              <span style={{ fontSize: 12, color: 'var(--gre-success)' }}>
                ✓ Confirmed at {new Date(poStatus.acknowledgedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button className="gre-pill green" style={{ cursor: 'pointer', border: '1px solid rgba(22,163,74,.3)', flexShrink: 0 }}
          onClick={() => sendPO(session?.staffId, session?.staffName)}>
          {poStatus.status === 'Draft' ? 'Send PO' : 'Resend'}
        </button>
      </div>

      {/* FP Row */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gre-text)', marginBottom: 10 }}>
          Function Prospectus — Internal
        </div>
        <div style={{ fontSize: 13, color: 'var(--gre-text-muted)', marginBottom: 12 }}>
          {ackedCount} of {departments.length} departments confirmed
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.06)', marginBottom: 12 }}>
          <div style={{
            height: '100%', borderRadius: 2, transition: 'width .5s',
            width: `${departments.length > 0 ? (ackedCount / departments.length) * 100 : 0}%`,
            background: ackedCount === departments.length ? 'var(--gre-success)' : 'var(--gre-gold)',
          }} />
        </div>
        {departments.map(([dept, status]) => (
          <div key={dept} className="gre-wa-dept">
            <div className={`gre-wa-check ${status.acknowledged ? 'done' : ''}`}>
              {status.acknowledged && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--gre-text)', fontSize: 14 }}>{dept}</span>
              {status.acknowledged && (
                <span style={{ fontSize: 12, color: 'var(--gre-text-dim)', marginLeft: 8 }}>
                  by {status.acknowledgedBy} · {Math.floor((Date.now() - new Date(status.acknowledgedAt).getTime()) / 60000)} min ago
                </span>
              )}
              {!status.acknowledged && (
                <span style={{ fontSize: 12, color: 'var(--gre-warning)', marginLeft: 8 }}>not acknowledged</span>
              )}
            </div>
          </div>
        ))}
        <button className="gre-btn amber" style={{ width: '100%', marginTop: 16, minHeight: 52 }}
          onClick={() => resendFP(session?.staffId, session?.staffName)}>
          Resend to Unconfirmed
        </button>
      </div>
    </div>
  );
}

/* ── MAIN LIVE CHECKIN ── */
export default function LiveCheckin() {
  const navigate = useNavigate();

  return (
    <div className="gre-root">
      <div className="gre-topbar" style={{ justifyContent: 'flex-start', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--gre-gold)', cursor: 'pointer' }}
          onClick={() => navigate('/gre')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Kitchen Bridge</span>
      </div>

      <div className="gre-live-page">
        <HeadcountPanel />
        <PushSection />
        <PushLog />
        <FreezeSection />
        <WhatsAppPanel />
      </div>

      {/* Bottom nav */}
      <div className="gre-bottom-nav">
        <button className="gre-nav-tab" onClick={() => navigate('/gre')}>
          <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" size={20} />Overview
        </button>
        <button className="gre-nav-tab" onClick={() => navigate('/gre/scanner')}>
          <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" size={20} />Scanner
        </button>
        <button className="gre-nav-tab" onClick={() => navigate('/gre/guests')}>
          <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={20} />Guest List
        </button>
        <button className="gre-nav-tab active">
          <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" size={20} />Activity
        </button>
      </div>
    </div>
  );
}
