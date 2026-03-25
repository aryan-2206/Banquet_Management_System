import React, { useState } from "react";
import "./KitchenDashboard.css";

import useReveal from "../../hooks/useReveal";
import { createInitialKitchenState } from "./kitchenMock";

import MenuManifest from "./MenuManifest";
import PrepTimeline from "./PrepTimeline";
import WasteLogger from "./WasteLogger";

function StatCard({ label, value, sublabel, color, delay }) {
  return (
    <div
      className="k-statCard reveal"
      style={{
        animationDelay: `${delay ?? 0}s`,
      }}
    >
      <div className="k-statValue" style={{ color }}>
        {value}
      </div>
      <div className="k-statLabel">{label}</div>
      <div className="k-statSub">{sublabel}</div>
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="k-progress">
      <div className="k-progress__inner" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

function KitchenNavTile({ title, subtitle, color, active, onClick }) {
  return (
    <button
      type="button"
      className={`k-navTile glass glass-hover ${active ? "k-navTile--active" : ""}`}
      onClick={onClick}
      style={{ ["--k-tile" ]: color }}
    >
      <div className="k-navTile__bg" style={{ background: `radial-gradient(ellipse at 20% 20%, ${color}22 0%, transparent 60%)` }} />
      <div className="k-navTile__content">
        <div className="k-navTile__title">{title}</div>
        <div className="k-navTile__subtitle">{subtitle}</div>
      </div>
    </button>
  );
}

function CuisineStrip({ items }) {
  return (
    <div className="k-cuisineStrip glass">
      <div className="k-cuisineStrip__label">Cuisine preview</div>
      <div className="k-cuisineStrip__items">
        {items.map((it) => (
          <span key={it} className="k-pill">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function KitchenDashboard() {
  useReveal();
  const [state, setState] = useState(() => createInitialKitchenState());

  const { events, selectedEventId, dishesByEvent, tasksByEvent, adminSynergyAlerts } = state;
  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? events[0];
  const selectedDishes = dishesByEvent[selectedEvent?.id] ?? [];
  const selectedTasks = tasksByEvent[selectedEvent?.id] ?? [];

  const view = state.ui.view;
  const setView = (v) => setState((s) => ({ ...s, ui: { ...s.ui, view: v } }));

  const setSelectedEventId = (id) => setState((s) => ({ ...s, selectedEventId: id }));

  const syncHeadcount = () => {
    if (!selectedEvent) return;
    setState((s) => {
      const ev = s.events.find((x) => x.id === selectedEvent.id);
      const nextArrived = ev?.liveArrivalPax ?? ev?.plannedPax ?? 0;
      const paxRatio = ev.plannedPax > 0 ? nextArrived / ev.plannedPax : 1;

      const prevDishes = s.dishesByEvent[ev.id] ?? [];
      const nextDishes = prevDishes.map((d) => {
        const adjustedPortions = Math.max(0, d.plannedPortions * paxRatio);
        const requiredKg = adjustedPortions * d.portionSizeKg;
        // Keep servedPortions but clamp to the new adjusted.
        const servedPortions = Math.min(d.servedPortions, adjustedPortions);
        return { ...d, adjustedPortions, requiredKg, servedPortions };
      });

      return {
        ...s,
        events: s.events.map((x) =>
          x.id === ev.id
            ? {
                ...x,
                plannedPax: x.plannedPax,
                liveArrivalPax: nextArrived,
              }
            : x,
        ),
        dishesByEvent: { ...s.dishesByEvent, [ev.id]: nextDishes },
        lastSyncedAtByEvent: { ...(s.lastSyncedAtByEvent ?? {}), [ev.id]: Date.now() },
        ui: { ...s.ui, showToast: { text: `Headcount synced (${nextArrived} pax).`, at: Date.now() } },
      };
    });
  };

  const adjustAllPortions = () => {
    // In this prototype, adjustment is proportional to live vs planned.
    syncHeadcount();
  };

  const updateDishServed = (eventId, dishId, delta) => {
    setState((s) => {
      const dishes = s.dishesByEvent[eventId] ?? [];
      const nextDishes = dishes.map((d) => {
        if (d.id !== dishId) return d;
        const nextServed = Math.max(0, Math.min(d.adjustedPortions, d.servedPortions + delta));
        return { ...d, servedPortions: nextServed, lastPortionLogAt: Date.now(), closed: nextServed >= d.adjustedPortions ? d.closed : false };
      });
      return { ...s, dishesByEvent: { ...s.dishesByEvent, [eventId]: nextDishes } };
    });
  };

  const closeDish = (eventId, dishId) => {
    setState((s) => {
      const dishes = s.dishesByEvent[eventId] ?? [];
      const nextDishes = dishes.map((d) => (d.id === dishId ? { ...d, closed: true } : d));
      return { ...s, dishesByEvent: { ...s.dishesByEvent, [eventId]: nextDishes } };
    });
  };

  const setSynergyDecision = (eventId, dishId, decision) => {
    setState((s) => {
      const dishes = s.dishesByEvent[eventId] ?? [];
      const nextDishes = dishes.map((d) => (d.id === dishId ? { ...d, synergyDecision: decision } : d));
      return { ...s, dishesByEvent: { ...s.dishesByEvent, [eventId]: nextDishes } };
    });
  };

  const markTaskDone = (eventId, taskId, doneAt = new Date()) => {
    setState((s) => {
      const tasks = s.tasksByEvent[eventId] ?? [];
      const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, done: true, doneAt: doneAt.toISOString() } : t));
      return { ...s, tasksByEvent: { ...s.tasksByEvent, [eventId]: nextTasks } };
    });
  };

  const setTaskAssignee = (eventId, taskId, nextAssignee) => {
    setState((s) => {
      const tasks = s.tasksByEvent[eventId] ?? [];
      const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, assignedChef: nextAssignee } : t));
      return { ...s, tasksByEvent: { ...s.tasksByEvent, [eventId]: nextTasks } };
    });
  };

  const setLeftoverPrelog = (eventId, courseId, leftoverKg) => {
    setState((s) => {
      return {
        ...s,
        leftoverPrelogByEvent: {
          ...s.leftoverPrelogByEvent,
          [eventId]: { ...(s.leftoverPrelogByEvent[eventId] ?? {}), [courseId]: leftoverKg },
        },
      };
    });
  };

  return (
    <div className="k-root">
      <div className="k-topbar">
        <div className="k-topbar__brand">
          <div className="k-topbar__logo">B</div>
          <div>
            <div className="k-topbar__title">Banquet Kitchen</div>
            <div className="k-topbar__sub">Prep execution · Portions · Waste audit</div>
          </div>
        </div>
        <div className="k-topbar__event">
          <label className="k-topbar__label">Today event</label>
          <select
            className="k-select"
            value={selectedEventId ?? ""}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} · {ev.liveArrivalPax} pax
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="k-layout">
        <aside className="k-leftNav">
          <KitchenNavTile
            title="Kitchen Hub"
            subtitle="Live progress + alerts"
            color="#E85555"
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          />
          <KitchenNavTile
            title="Menu Manifest"
            subtitle="Portions · stock · dietary"
            color="#C9A84C"
            active={view === "manifest"}
            onClick={() => setView("manifest")}
          />
          <KitchenNavTile
            title="Prep Timeline"
            subtitle="Station tasks · countdown"
            color="#5B8FE8"
            active={view === "timeline"}
            onClick={() => setView("timeline")}
          />
          <KitchenNavTile
            title="Waste Logger"
            subtitle="Audit · sustainability · AI"
            color="#9B6DE8"
            active={view === "waste"}
            onClick={() => setView("waste")}
          />
        </aside>

        <main className="k-main">
          {adminSynergyAlerts.length > 0 && (
            <div className="k-alerts k-alerts--admin">
              {adminSynergyAlerts.map((a, idx) => (
                <div key={idx} className="k-alert">
                  <div className="k-alert__icon">!</div>
                  <div className="k-alert__text">{a.text}</div>
                </div>
              ))}
            </div>
          )}

          {view === "dashboard" && (
            <>
              {/* Hero strip / summary */}
              <section className="k-heroStrip glass reveal">
                <div className="k-heroStrip__left">
                  <div className="k-heroStrip__kicker">Kitchen Live Hub</div>
                  <div className="k-heroStrip__headline">
                    {selectedEvent?.name} · {selectedEvent?.liveArrivalPax} pax
                  </div>
                  <div className="k-heroStrip__meta">
                    Planned {selectedEvent?.plannedPax} pax · Tier {selectedEvent?.tier}
                  </div>
                </div>
                <div className="k-heroStrip__right">
                  <button className="btn-gold k-heroStrip__cta" onClick={() => setView("timeline")}>
                    Execute timeline →
                  </button>
                </div>
              </section>

              {/* Animated stat cards (prototype uses static values) */}
              <section className="k-grid4">
                <StatCard
                  label="Dishes prepared"
                  value={`${Math.max(0, selectedDishes.filter((d) => d.servedPortions > 0).length)}/${selectedDishes.length}`}
                  sublabel="Tap Menu Manifest to log portions"
                  color="#C9A84C"
                  delay={0.03}
                />
                <StatCard
                  label="Stations active"
                  value={new Set(selectedTasks.map((t) => t.station)).size}
                  sublabel="Gantt + cards view"
                  color="#5B8FE8"
                  delay={0.08}
                />
                <StatCard
                  label="Critical tasks"
                  value={selectedTasks.filter((t) => t.critical).filter((t) => !t.done).length}
                  sublabel="May impact next course"
                  color="#E8C455"
                  delay={0.13}
                />
                <StatCard
                  label="Stock shortfall"
                  value={selectedDishes.filter((d) => d.stockKg < d.requiredKg).length}
                  sublabel="Click manifest stock dot"
                  color="#E85555"
                  delay={0.18}
                />
              </section>

              {/* Live event cards w/ progress bars */}
              <section className="k-events">
                {events.map((ev) => {
                  const dishes = dishesByEvent[ev.id] ?? [];
                  const total = dishes.length || 1;
                  const done = dishes.filter((d) => d.servedPortions >= d.adjustedPortions - 1e-6).length;
                  const progress = (done / total) * 100;
                  return (
                    <div key={ev.id} className="k-eventCard glass reveal">
                      <div className="k-eventCard__top">
                        <div>
                          <div className="k-eventCard__title">{ev.name}</div>
                          <div className="k-eventCard__sub">
                            {ev.liveArrivalPax} pax · Tier {ev.tier}
                          </div>
                        </div>
                        <div className="k-badge k-badge--gold">
                          {Math.round(progress)}% dishes served
                        </div>
                      </div>
                      <ProgressBar value={progress} color="#C9A84C" />
                      <div className="k-eventCard__bottom">
                        <button className="k-linkBtn" onClick={() => (setSelectedEventId(ev.id), setView("manifest"))}>
                          Open manifest →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Synergy alerts (prototype) */}
              <section className="k-synergy">
                <div className="k-sectionHead">
                  <div className="k-sectionHead__title">Synergy alerts</div>
                  <div className="k-sectionHead__sub">Batch prep opportunities across today’s events</div>
                </div>
                <div className="k-alertGrid">
                  {selectedDishes
                    .filter((d) => (d.synergy ?? []).length > 0)
                    .slice(0, 3)
                    .map((dish) => (
                      <div key={dish.id} className="k-alert k-alert--gold">
                        <div className="k-alert__icon">+</div>
                        <div className="k-alert__text">
                          <div className="k-alert__title">Batch prep</div>
                          <div className="k-alert__desc">
                            {dish.name} is also needed for today’s other event. Check & adjust below.
                          </div>
                        </div>
                        <button className="k-linkBtn" onClick={() => setView("manifest")}>
                          Review dish →
                        </button>
                      </div>
                    ))}
                  {selectedDishes.filter((d) => (d.synergy ?? []).length > 0).length === 0 && (
                    <div className="k-empty">No batch-prep synergies found for this event.</div>
                  )}
                </div>
              </section>

              <CuisineStrip
                items={[
                  ...new Set(selectedDishes.map((d) => d.cuisineTag).filter(Boolean)),
                ].slice(0, 7)}
              />
            </>
          )}

          {view === "manifest" && selectedEvent && (
            <MenuManifest
              state={state}
              selectedEventId={selectedEventId}
              dishes={selectedDishes}
              onSyncHeadcount={syncHeadcount}
              onAdjustAllPortions={adjustAllPortions}
              onUpdateDishServed={updateDishServed}
              onCloseDish={closeDish}
              onSetSynergyDecision={setSynergyDecision}
              onSelectEventId={(id) => setSelectedEventId(id)}
              setState={setState}
            />
          )}

          {view === "timeline" && selectedEvent && (
            <PrepTimeline
              state={state}
              selectedEventId={selectedEventId}
              tasks={selectedTasks}
              dishes={selectedDishes}
              onMarkTaskDone={markTaskDone}
              onSetTaskAssignee={setTaskAssignee}
              onSetLeftoverPrelog={setLeftoverPrelog}
              setState={setState}
              onGoToWaste={() => setView("waste")}
            />
          )}

          {view === "waste" && selectedEvent && (
            <WasteLogger
              state={state}
              selectedEventId={selectedEventId}
              dishes={selectedDishes}
              onSetState={setState}
              onNavigateToTimeline={() => setView("timeline")}
            />
          )}
        </main>
      </div>
    </div>
  );
}

