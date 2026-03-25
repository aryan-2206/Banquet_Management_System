import React, { useEffect, useMemo, useState } from "react";
import "./WasteLogger.css";

import { downloadText } from "./kitchenMock";

const WASTE_REASONS = [
  "Over-prepped",
  "Low demand",
  "Late arrival",
  "Dietary mismatch",
  "Quality issue",
  "Event ran short",
];

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="k-wl-modalOverlay" role="dialog" aria-modal="true">
      <div className="k-wl-modal">
        <div className="k-wl-modal__head">
          <div className="k-wl-modal__title">{title}</div>
          <button className="k-wl-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="k-wl-modal__body">{children}</div>
      </div>
    </div>
  );
}

function wasteLabelFromPercent(p) {
  if (p < 0.1) return "Excellent";
  if (p < 0.2) return "Good";
  if (p < 0.3) return "Needs Improvement";
  return "Poor";
}

function carbonEstimateKgCO2e(wasteKg, factorKgCO2ePerKg = 3.0) {
  return wasteKg * factorKgCO2ePerKg;
}

export default function WasteLogger({ state, selectedEventId, dishes, onSetState, onNavigateToTimeline }) {
  const events = state.events ?? [];
  const event = events.find((e) => e.id === selectedEventId) ?? events[0];
  const eventType = event?.tier ?? "Premium";

  const wasteSubmittedState = state.wasteSubmitted?.[selectedEventId] ?? { submitted: false, submittedAt: null };

  const [historyView, setHistoryView] = useState("this"); // this | last30
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const ensureWasteEntries = () => {
    onSetState((s) => {
      const existing = s.wasteByEvent?.[selectedEventId] ?? {};
      if (Object.keys(existing).length > 0) return s;

      const leftoverPrelog = s.leftoverPrelogByEvent?.[selectedEventId] ?? {};

      // Distribute course leftover estimate into dish leftovers proportionally to adjusted required kg.
      const courseTotal = {};
      for (const d of dishes) {
        courseTotal[d.course] = (courseTotal[d.course] ?? 0) + (d.requiredKg ?? 0);
      }

      const nextEntries = {};
      for (const d of dishes) {
        const prelogKg = leftoverPrelog[d.course] ?? null;
        let leftoverKg = 0;
        if (prelogKg !== null && courseTotal[d.course] > 0) {
          leftoverKg = (prelogKg * (d.requiredKg / courseTotal[d.course]));
        }
        nextEntries[d.id] = {
          unit: "kg",
          leftoverRaw: Number(leftoverKg.toFixed(2)),
          wasteReason: "Over-prepped",
          leftoverKg: Number(leftoverKg.toFixed(2)),
          updatedAt: null,
          fullyConsumed: leftoverKg <= 0,
        };
      }

      return {
        ...s,
        wasteByEvent: {
          ...s.wasteByEvent,
          [selectedEventId]: nextEntries,
        },
      };
    });
  };

  useEffect(() => {
    ensureWasteEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const wasteEntries = useMemo(() => state.wasteByEvent?.[selectedEventId] ?? {}, [state.wasteByEvent, selectedEventId]);

  const computed = useMemo(() => {
    let preparedKg = 0;
    let servedKg = 0;
    let wasteKg = 0;
    let wasteCost = 0;
    for (const d of dishes) {
      const entry = wasteEntries[d.id];
      const dishPreparedKg = d.requiredKg ?? 0;
      const dishServedKg = (d.servedPortions ?? 0) * (d.portionSizeKg ?? 0);
      const dishWasteKg = entry ? entry.leftoverKg : 0;
      preparedKg += dishPreparedKg;
      servedKg += dishServedKg;
      wasteKg += dishWasteKg;
      wasteCost += (dishWasteKg ?? 0) * (d.unitCostPerKg ?? 50);
    }
    const wastePct = preparedKg > 0 ? wasteKg / preparedKg : 0;
    const score = Math.max(0, Math.min(100, Math.round(100 - wastePct * 400)));
    const carbonKg = carbonEstimateKgCO2e(wasteKg, 3.0);
    return { preparedKg, servedKg, wasteKg, wastePct, wasteCost, score, carbonKg };
  }, [dishes, wasteEntries]);

  const scoreLabel = wasteLabelFromPercent(computed.wastePct);

  const dishesWithInsightEligibility = useMemo(() => {
    const list = [];
    for (const d of dishes) {
      const entry = wasteEntries[d.id];
      const dishPreparedKg = d.requiredKg ?? 0;
      const dishWasteKg = entry ? entry.leftoverKg : 0;
      const pct = dishPreparedKg > 0 ? dishWasteKg / dishPreparedKg : 0;
      if (pct > 0.1) {
        list.push({ dish: d, entry, wastePct: pct });
      }
    }
    list.sort((a, b) => b.wastePct - a.wastePct);
    return list;
  }, [dishes, wasteEntries]);

  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [aiError, setAiError] = useState(null);

  const simulateFeatherlessInsight = (dishName, wasteKg, reason, pax) => {
    // Simple deterministic-ish text for a prototype.
    const reasonSnippet = reason === "Over-prepped" ? "You’re over-prepping relative to demand" : reason;
    return `For ${dishName}, waste is elevated (${Math.round((wasteKg / Math.max(1, pax)) * 100)}% relative signal). ${reasonSnippet}. Consider tightening portion sizing or switching to a live-counter style to reduce over-production in similar pax bands.`;
  };

  const submitWasteReport = async () => {
    // Lock entries and submit summary.
    setAiError(null);
    setAiSubmitting(true);
    const submittedAt = Date.now();

    onSetState((s) => ({
      ...s,
      wasteSubmitted: {
        ...s.wasteSubmitted,
        [selectedEventId]: { submitted: true, submittedAt },
      },
    }));

    const wastePercent = computed.wastePct;
    if (wastePercent > 0.2) {
      onSetState((s) => ({
        ...s,
        adminSynergyAlerts: [
          ...(s.adminSynergyAlerts ?? []),
          {
            text: `High waste event — review at next ops meeting (${event?.name ?? "event"}). Waste ${(wastePercent * 100).toFixed(1)}%`,
            at: submittedAt,
          },
        ],
      }));
    }

    // Trigger AI insights for dishes > 10% waste.
    const eligible = dishesWithInsightEligibility;
    if (eligible.length === 0) {
      setAiSubmitting(false);
      return;
    }

    // Mock “Featherless API” call (real integration can be dropped in here).
    // Payload requested by spec.
    const endpoint = import.meta?.env?.VITE_FEATHERLESS_ENDPOINT || null;

    for (const { dish, entry } of eligible) {
      const dishId = dish.id;
      const payload = {
        dishName: dish.name,
        wasteQty: entry?.leftoverKg ?? 0,
        wasteReason: entry?.wasteReason ?? "Over-prepped",
        eventType,
        paxSize: event?.liveArrivalPax ?? event?.plannedPax ?? 0,
      };

      onSetState((s) => ({
        ...s,
        featherless: {
          ...s.featherless,
          loadingByDishId: { ...(s.featherless?.loadingByDishId ?? {}), [dishId]: true },
        },
      }));

      try {
        let insightText = "";
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Featherless API error ${res.status}`);
          const data = await res.json();
          insightText = data?.insight ?? data?.text ?? "";
        } else {
          await new Promise((r) => setTimeout(r, 650));
          insightText = simulateFeatherlessInsight(dish.name, entry?.leftoverKg ?? 0, entry?.wasteReason ?? "Over-prepped", payload.paxSize);
        }

        onSetState((s) => ({
          ...s,
          featherless: {
            ...s.featherless,
            loadingByDishId: { ...(s.featherless?.loadingByDishId ?? {}), [dishId]: false },
            insightsByDishId: { ...(s.featherless?.insightsByDishId ?? {}), [dishId]: insightText },
          },
        }));
      } catch (err) {
        setAiError(err?.message ?? "Failed to fetch AI insights");
        onSetState((s) => ({
          ...s,
          featherless: {
            ...s.featherless,
            loadingByDishId: { ...(s.featherless?.loadingByDishId ?? {}), [dishId]: false },
          },
        }));
      }
    }

    setAiSubmitting(false);
  };

  const downloadCSV = () => {
    const header = ["eventId", "dishId", "dishName", "preparedKg", "servedKg", "leftoverKg", "wasteReason", "submittedAt"];
    const rows = dishes.map((d) => {
      const entry = wasteEntries[d.id] ?? {};
      const preparedKg = d.requiredKg ?? 0;
      const servedKg = (d.servedPortions ?? 0) * (d.portionSizeKg ?? 0);
      const leftoverKg = entry.leftoverKg ?? 0;
      const wasteReason = entry.wasteReason ?? "";
      const submittedAt = wasteSubmittedState.submittedAt ? new Date(wasteSubmittedState.submittedAt).toISOString() : "";
      return [selectedEventId, d.id, d.name, preparedKg, servedKg, leftoverKg, wasteReason, submittedAt];
    });

    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))].join("\n");
    downloadText(`waste-${event?.name ?? "event"}-${selectedEventId}.csv`, csv, "text/csv;charset=utf-8");
  };

  const toggleUnit = (dishId, nextUnit) => {
    onSetState((s) => {
      const entries = s.wasteByEvent?.[selectedEventId] ?? {};
      const dish = dishes.find((x) => x.id === dishId);
      if (!dish) return s;
      const entry = entries[dishId];
      if (!entry) return s;

      // Convert raw to new unit while keeping leftoverKg as source of truth.
      let nextRaw = entry.leftoverKg;
      if (nextUnit === "portions") nextRaw = dish.portionSizeKg > 0 ? entry.leftoverKg / dish.portionSizeKg : entry.leftoverKg;
      if (nextUnit === "litres") nextRaw = entry.leftoverKg; // 1:1 for prototype

      return {
        ...s,
        wasteByEvent: {
          ...s.wasteByEvent,
          [selectedEventId]: {
            ...entries,
            [dishId]: { ...entry, unit: nextUnit, leftoverRaw: Number(nextRaw.toFixed(2)) },
          },
        },
      };
    });
  };

  const setLeftover = (dishId, rawValue) => {
    onSetState((s) => {
      const entries = s.wasteByEvent?.[selectedEventId] ?? {};
      const dish = dishes.find((x) => x.id === dishId);
      if (!dish) return s;

      const entry = entries[dishId];
      if (!entry) return s;

      const val = Number(rawValue);
      const safeVal = Number.isFinite(val) ? Math.max(0, val) : 0;

      let leftoverKg = safeVal;
      if (entry.unit === "portions") leftoverKg = safeVal * dish.portionSizeKg;
      if (entry.unit === "litres") leftoverKg = safeVal; // 1:1

      return {
        ...s,
        wasteByEvent: {
          ...s.wasteByEvent,
          [selectedEventId]: {
            ...entries,
            [dishId]: {
              ...entry,
              leftoverRaw: Number(safeVal.toFixed(2)),
              leftoverKg: Number(leftoverKg.toFixed(2)),
              fullyConsumed: leftoverKg <= 0.0001,
              updatedAt: Date.now(),
            },
          },
        },
      };
    });
  };

  const setReason = (dishId, reason) => {
    onSetState((s) => {
      const entries = s.wasteByEvent?.[selectedEventId] ?? {};
      const entry = entries[dishId];
      if (!entry) return s;
      return {
        ...s,
        wasteByEvent: {
          ...s.wasteByEvent,
          [selectedEventId]: {
            ...entries,
            [dishId]: { ...entry, wasteReason: reason, updatedAt: Date.now() },
          },
        },
      };
    });
  };

  const setFullyConsumed = (dishId) => {
    const dish = dishes.find((x) => x.id === dishId);
    if (!dish) return;
    onSetState((s) => {
      const entries = s.wasteByEvent?.[selectedEventId] ?? {};
      const entry = entries[dishId];
      if (!entry) return s;
      return {
        ...s,
        wasteByEvent: {
          ...s.wasteByEvent,
          [selectedEventId]: {
            ...entries,
            [dishId]: {
              ...entry,
              leftoverRaw: 0,
              leftoverKg: 0,
              fullyConsumed: true,
              updatedAt: Date.now(),
            },
          },
        },
      };
    });
  };

  const onSubmitClicked = () => {
    setSubmitModalOpen(true);
  };

  const lockEntries = wasteSubmittedState.submitted;

  const last30Mock = useMemo(() => {
    // Mock 30-day dataset based on dish IDs so it looks consistent.
    const out = {};
    for (const d of dishes) {
      const seed = d.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const base = (seed % 21) / 100 + 0.06;
      out[d.id] = {
        avgWastePct: Math.min(0.35, base + Math.random() * 0.03),
        avgWasteKg: (d.requiredKg ?? 0) * base,
        avgServedPortions: d.adjustedPortions ?? 0,
      };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const topWaste30 = useMemo(() => {
    const arr = Object.entries(last30Mock).map(([dishId, v]) => ({ dishId, ...v }));
    arr.sort((a, b) => b.avgWastePct - a.avgWastePct);
    return arr.slice(0, 3);
  }, [last30Mock]);

  const topConsumed30 = useMemo(() => {
    const arr = Object.entries(last30Mock).map(([dishId, v]) => ({ dishId, ...v }));
    arr.sort((a, b) => (b.avgServedPortions ?? 0) - (a.avgServedPortions ?? 0));
    return arr.slice(0, 3);
  }, [last30Mock]);

  const printShare = () => {
    document.title = `Waste Score — ${event?.name ?? ""}`.trim();
    window.print();
  };

  const preparedDishesCount = dishes.length;
  const eventDurationMin = Math.max(0, Math.round(((event?.endTime ?? new Date()).getTime() - (event?.startTime ?? new Date()).getTime()) / 60000));

  return (
    <div className="k-wlRoot">
      {/* Print-only share block */}
      <div className="k-wl__printShare">
        <div className="k-wl__printArea">
          <div className="k-wl__printTitle">Kitchen Waste Sustainability Score</div>
          <div className="k-wl__printMeta">
            Event: <strong>{event?.name}</strong> · Tier: <strong>{eventType}</strong>
          </div>
          <div className="k-wl__printMeta">
            Prepared pax: <strong>{event?.plannedPax}</strong> · Arrived pax: <strong>{event?.liveArrivalPax}</strong>
          </div>
          <div className="k-wl__printScore">
            Score: <strong>{computed.score}/100</strong> · {scoreLabel}
          </div>
          <div className="k-wl__printBreakdown">
            <div>Prepared: {computed.preparedKg.toFixed(1)} kg</div>
            <div>Served: {computed.servedKg.toFixed(1)} kg</div>
            <div>Waste: {computed.wasteKg.toFixed(1)} kg ({(computed.wastePct * 100).toFixed(1)}%)</div>
            <div>Waste cost est.: ₹{computed.wasteCost.toFixed(0)}</div>
            <div>Carbon footprint: {computed.carbonKg.toFixed(1)} kg CO₂e</div>
          </div>
        </div>
      </div>

      {/* Header strip */}
      <div className="k-wlHeader">
        <div className="k-wlHeader__left">
          <div className="k-wlHeader__title">Waste Logger</div>
          <div className="k-wlHeader__sub">
            Event: <strong>{event?.name}</strong> · {eventDurationMin} min duration
          </div>
        </div>
        <div className="k-wlHeader__right">
          <button className="k-wlBtn k-wlBtn--outline" onClick={onNavigateToTimeline} type="button" disabled={lockEntries}>
            ← Back to Prep Timeline
          </button>
          <button className="k-wlBtn k-wlBtn--gold" onClick={printShare} type="button">
            Share score (PDF)
          </button>
        </div>
      </div>

      <div className="k-wlSummaryRow">
        <div className="k-wlSummaryCard glass">
          <div className="k-wlSummaryCard__title">Event summary</div>
          <div className="k-wlSummaryCard__meta">
            Planned pax: <strong>{event?.plannedPax}</strong> · Arrived pax: <strong>{event?.liveArrivalPax}</strong> · Tier:{" "}
            <strong>{eventType}</strong>
          </div>
          <div className="k-wlSummaryCard__meta">
            Total dishes: <strong>{preparedDishesCount}</strong>
          </div>
          {lockEntries && (
            <div className="k-wlSummaryCard__meta">
              Submitted at: <strong>{wasteSubmittedState.submittedAt ? new Date(wasteSubmittedState.submittedAt).toLocaleString() : "—"}</strong>
            </div>
          )}
        </div>

        <div className="k-wlScoreCard glass">
          <div className="k-wlScoreCard__title">Sustainability score</div>
          <div className="k-wlScoreCard__score">
            <span className="k-wlScoreCard__scoreNum">{computed.score}</span>
            <span className="k-wlScoreCard__scoreDen">/100</span>
          </div>
          <div className="k-wlScoreCard__label">{scoreLabel}</div>
          <div className="k-wlScoreCard__mtd">Month-to-date avg: 78</div>
        </div>
      </div>

      <div className="k-wlGrid">
        <div className="k-wlForm">
          <div className="k-wlForm__head">
            <div className="k-wlForm__title">Dish-by-dish waste entry</div>
            <div className="k-wlForm__hint">No re-entry: pulled from Menu Manifest quantities and served portions.</div>
          </div>

          <div className="k-wlTable">
            <div className="k-wlTable__head k-wlTable__row">
              <div>Dish</div>
              <div>Prepared</div>
              <div>Served</div>
              <div>Leftover</div>
              <div>Reason</div>
              <div>Quick</div>
            </div>

            {dishes.map((d) => {
              const entry = wasteEntries[d.id] ?? null;
              const preparedKg = d.requiredKg ?? 0;
              const servedKg = (d.servedPortions ?? 0) * (d.portionSizeKg ?? 0);
              const leftoverKg = entry?.leftoverKg ?? 0;
              const wastePct = preparedKg > 0 ? leftoverKg / preparedKg : 0;
              return (
                <div key={d.id} className="k-wlTable__row">
                  <div className="k-wlDishCell">
                    <div className="k-wlDishName">{d.name}</div>
                    <div className="k-wlDishMeta">{d.courseLabel ?? d.course}</div>
                  </div>
                  <div className="k-wlCell">{preparedKg.toFixed(1)} kg</div>
                  <div className="k-wlCell">{servedKg.toFixed(1)} kg</div>
                  <div className="k-wlCell">
                    <div className="k-wlLeftover">
                      <select
                        className="k-wlUnit"
                        value={entry?.unit ?? "kg"}
                        disabled={lockEntries}
                        onChange={(e) => {
                          // unit conversion is handled by toggling with conversion and internal kg.
                          const nextUnit = e.target.value;
                          toggleUnit(d.id, nextUnit);
                        }}
                      >
                        <option value="kg">kg</option>
                        <option value="portions">portions</option>
                        <option value="litres">litres</option>
                      </select>
                      <input
                        className="k-wlInput"
                        type="number"
                        min="0"
                        step="0.1"
                        disabled={lockEntries}
                        value={entry?.leftoverRaw ?? 0}
                        onChange={(e) => setLeftover(d.id, e.target.value)}
                      />
                    </div>
                    <div className={`k-wlWastePct ${wastePct < 0.1 ? "k-ok" : wastePct < 0.2 ? "k-warn" : "k-bad"}`}>
                      Waste {(wastePct * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="k-wlCell">
                    <select
                      className="k-wlReason"
                      value={entry?.wasteReason ?? "Over-prepped"}
                      disabled={lockEntries}
                      onChange={(e) => setReason(d.id, e.target.value)}
                    >
                      {WASTE_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="k-wlCell">
                    <button
                      className="k-wlQuick"
                      type="button"
                      disabled={lockEntries}
                      onClick={() => setFullyConsumed(d.id)}
                    >
                      Fully consumed ✓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="k-wlForm__actions">
            <button className="k-wlBtn k-wlBtn--outline" onClick={downloadCSV} type="button" disabled={!lockEntries}>
              Download CSV
            </button>
            <button className="k-wlBtn k-wlBtn--gold" onClick={onSubmitClicked} type="button" disabled={lockEntries}>
              Submit waste report
            </button>
          </div>
        </div>

        <div className="k-wlRight">
          <div className="k-wlStats glass">
            <div className="k-wlStats__title">Live waste summary</div>
            <div className="k-wlStats__rows">
              <div className="k-wlStatRow">
                <span>Prepared food</span>
                <strong>{computed.preparedKg.toFixed(1)} kg</strong>
              </div>
              <div className="k-wlStatRow">
                <span>Food served</span>
                <strong>{computed.servedKg.toFixed(1)} kg</strong>
              </div>
              <div className="k-wlStatRow">
                <span>Waste</span>
                <strong className={computed.wastePct < 0.1 ? "k-ok" : computed.wastePct < 0.2 ? "k-warn" : "k-bad"}>
                  {computed.wasteKg.toFixed(1)} kg ({(computed.wastePct * 100).toFixed(1)}%)
                </strong>
              </div>
              <div className="k-wlStatRow">
                <span>Waste cost (est.)</span>
                <strong>₹{computed.wasteCost.toFixed(0)}</strong>
              </div>
              <div className="k-wlStatRow">
                <span>Carbon footprint</span>
                <strong>{computed.carbonKg.toFixed(1)} kg CO₂e</strong>
              </div>
            </div>
          </div>

          <div className="k-wlAi">
            <div className="k-wlAi__title">Featherless.ai recommendations</div>
            {!wasteSubmittedState.submitted ? (
              <div className="k-wlAi__placeholder">Submit waste report to unlock AI insights.</div>
            ) : (
              <>
                {aiError && <div className="k-wlAi__error">{aiError}</div>}
                {aiSubmitting && <div className="k-wlAi__loading">Loading insights…</div>}
                {!aiSubmitting && dishesWithInsightEligibility.length === 0 && (
                  <div className="k-wlAi__placeholder">No dish exceeds 10% waste threshold for AI insights.</div>
                )}

                <div className="k-wlInsightStack">
                  {dishesWithInsightEligibility.map(({ dish }) => {
                    const insight = state.featherless?.insightsByDishId?.[dish.id];
                    const loading = state.featherless?.loadingByDishId?.[dish.id];
                    return (
                      <div key={dish.id} className="k-wlInsightCard glass">
                        <div className="k-wlInsightCard__top">
                          <div className="k-wlInsightCard__name">{dish.name}</div>
                          <div className="k-wlInsightCard__tag">Waste flagged</div>
                        </div>
                        {loading ? (
                          <div className="k-wlSkeleton">
                            <div className="k-wlSkLine" />
                            <div className="k-wlSkLine" />
                            <div className="k-wlSkLine" />
                          </div>
                        ) : (
                          <div className="k-wlInsightCard__text">{insight ?? "—"}</div>
                        )}
                        <button
                          type="button"
                          className="k-wlInsightCard__recBtn"
                          disabled={!wasteSubmittedState.submitted}
                          onClick={() => {
                            onSetState((s) => ({
                              ...s,
                              menuRecommendations: { ...(s.menuRecommendations ?? {}), [dish.id]: true },
                            }));
                          }}
                        >
                          Add to Menu Recommendations
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="k-wlHistory">
            <div className="k-wlHistory__head">
              <div className="k-wlHistory__title">Historical comparison</div>
              <div className="k-wlHistory__toggle">
                <button type="button" className={`k-wlHistBtn ${historyView === "this" ? "k-wlHistBtn--active" : ""}`} onClick={() => setHistoryView("this")}>
                  This event
                </button>
                <button type="button" className={`k-wlHistBtn ${historyView === "last30" ? "k-wlHistBtn--active" : ""}`} onClick={() => setHistoryView("last30")}>
                  Last 30 days
                </button>
              </div>
            </div>

            {historyView === "this" ? (
              <div className="k-wlHistory__panel">
                <div className="k-wlHistory__note">This event waste breakdown by dish is shown above during entry.</div>
              </div>
            ) : (
              <div className="k-wlHistory__panel">
                <div className="k-wlBarChart">
                  {dishes.map((d) => {
                    const v = last30Mock[d.id]?.avgWastePct ?? 0;
                    return (
                      <div key={d.id} className="k-wlBarChart__item">
                        <div className="k-wlBarChart__barWrap">
                          <div className="k-wlBarChart__bar" style={{ height: `${Math.min(100, v * 300)}%` }} />
                        </div>
                        <div className="k-wlBarChart__label">{d.name.split(" ")[0]}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="k-wlTags">
                  <div className="k-wlTagGroup">
                    <div className="k-wlTagGroup__title">Top 3 most wasted</div>
                    {topWaste30.map((x) => {
                      const dish = dishes.find((d) => d.id === x.dishId);
                      return (
                        <div key={x.dishId} className="k-wlTagRow k-wlTagRow--bad">
                          <span className="k-wlTagRow__name">{dish?.name ?? x.dishId}</span>
                          <span className="k-wlTagRow__tag">Review portion size</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="k-wlTagGroup">
                    <div className="k-wlTagGroup__title">Top 3 most consumed</div>
                    {topConsumed30.map((x) => {
                      const dish = dishes.find((d) => d.id === x.dishId);
                      return (
                        <div key={x.dishId} className="k-wlTagRow k-wlTagRow--ok">
                          <span className="k-wlTagRow__name">{dish?.name ?? x.dishId}</span>
                          <span className="k-wlTagRow__tag">Consider adding to Recommended</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={submitModalOpen}
        title="Submit waste report?"
        onClose={() => setSubmitModalOpen(false)}
      >
        <div className="k-wlSubmit">
          <div className="k-wlSubmit__text">
            This will lock the entries for <strong>{event?.name}</strong> and submit the waste audit to the Admin dashboard.
          </div>
          <div className="k-wlSubmit__summary">
            Waste total: <strong>{computed.wasteKg.toFixed(1)} kg</strong> · Waste%:{" "}
            <strong>{(computed.wastePct * 100).toFixed(1)}%</strong>
          </div>
          <div className="k-wlSubmit__actions">
            <button className="k-wlBtn k-wlBtn--outline" type="button" onClick={() => setSubmitModalOpen(false)}>
              Cancel
            </button>
            <button
              className="k-wlBtn k-wlBtn--gold"
              type="button"
              onClick={() => {
                setSubmitModalOpen(false);
                submitWasteReport();
              }}
              disabled={aiSubmitting}
            >
              {aiSubmitting ? "Submitting…" : "Submit waste report"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

