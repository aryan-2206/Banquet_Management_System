import React, { useMemo, useState } from "react";
import "./MenuManifest.css";

import { KITCHEN_COURSES, computeDishStatus, deriveTotalsForEvent } from "./kitchenMock";

function DotBadge({ label, color }) {
  return (
    <span className="k-db">
      <span className="k-db__dot" style={{ background: color }} />
      {label}
    </span>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "Prep Pending"
      ? "k-status k-status--pending"
      : status === "In Progress"
      ? "k-status k-status--active"
      : status === "Served"
      ? "k-status k-status--served"
      : "k-status k-status--closed";
  return <span className={cls}>{status}</span>;
}

function StockDot({ ratio, onClick, title }) {
  const cls = ratio >= 1 ? "k-stockDot k-stockDot--ok" : ratio >= 0.5 ? "k-stockDot k-stockDot--warn" : "k-stockDot k-stockDot--bad";
  return (
    <button type="button" className={cls} onClick={onClick} title={title} aria-label={title} />
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="k-modalOverlay" role="dialog" aria-modal="true">
      <div className="k-modal">
        <div className="k-modal__head">
          <div className="k-modal__title">{title}</div>
          <button className="k-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="k-modal__body">{children}</div>
      </div>
    </div>
  );
}

function CourseAccordion({ course, dishes, onUpdateDishServed, onCloseDish, onOpenStock, stockInfoByDishId, onSetSynergyDecision }) {
  const done = dishes.every((d) => d.servedPortions >= d.adjustedPortions - 1e-6 && d.servedPortions > 0);
  const [open, setOpen] = useState(course.id === "welcome");

  return (
    <div className="k-course">
      <button type="button" className="k-course__head" onClick={() => setOpen((x) => !x)}>
        <div className="k-course__headLeft">
          <span className="k-course__name">{course.label}</span>
          <span className="k-course__count">{dishes.length} items</span>
        </div>
        <div className="k-course__headRight">
          {done && <span className="k-course__check">✓</span>}
          <span className="k-course__chev">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div className="k-course__body">
          <div className="k-course__gridHead">
            <div>Dish</div>
            <div>Planned / Adjusted</div>
            <div>Portions out</div>
            <div>Status</div>
            <div>Stock</div>
          </div>
          {dishes.map((dish) => {
            const status = computeDishStatus(dish);
            const ratio = dish.requiredKg > 0 ? dish.stockKg / dish.requiredKg : 1;
            const stockInfo = stockInfoByDishId[dish.id];

            const otherSynergy = (dish.synergy ?? []).find((s) => s.eventId);
            const showSynergy =
              (dish.synergy ?? []).length > 0 &&
              (!dish.synergyDecision || dish.synergyDecision === null);

            return (
              <div key={dish.id} className="k-dishRow">
                <div className="k-dishRow__col k-dishRow__dish">
                  <div className="k-dishRow__titleLine">
                    <div className="k-dishRow__dishName">{dish.name}</div>
                    <span className="k-cuisineTag">{dish.cuisineTag}</span>
                  </div>

                  {showSynergy && otherSynergy && (
                    <div className="k-synergyBanner">
                      <div className="k-synergyBanner__text">
                        Also needed for <strong>{otherSynergy.label.replace("Batch prep for ", "")}</strong> — combine prep?
                      </div>
                      <div className="k-synergyBanner__actions">
                        <button
                          className="k-synergyBtn k-synergyBtn--ok"
                          onClick={() => onSetSynergyDecision(dish.id, "accepted")}
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          className="k-synergyBtn k-synergyBtn--bad"
                          onClick={() => onSetSynergyDecision(dish.id, "dismissed")}
                          type="button"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="k-dietBadges">
                    {dish.dietary?.veg && <DotBadge label="VEG" color="#3A7A6E" />}
                    {dish.dietary?.nonVeg && <DotBadge label="NON-VEG" color="#E85555" />}
                    {dish.dietary?.jain && <DotBadge label="JAIN" color="#C07A2A" />}
                    {dish.dietary?.halal && <DotBadge label="HALAL" color="#9B6DE8" />}
                    {dish.dietary?.gf && <DotBadge label="GF" color="#5B8FE8" />}
                  </div>

                  <div className="k-stationTag">{dish.chefStation}</div>
                </div>

                <div className="k-dishRow__col">
                  <div className="k-qtyLines">
                    <div className="k-qtyLine">
                      <span className="k-qtyLabel">Planned</span>
                      <span className="k-qtyVal">
                        {Math.round(dish.plannedPortions)} portions · {dish.plannedKg.toFixed(1)} kg
                      </span>
                    </div>
                    <div className="k-qtyLine">
                      <span className="k-qtyLabel">Adjusted</span>
                      <span className="k-qtyVal">
                        {Math.round(dish.adjustedPortions)} portions · {dish.requiredKg.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="k-dishRow__col">
                  <div className="k-stepper">
                    <button
                      type="button"
                      className="k-stepper__btn"
                      onClick={() => onUpdateDishServed(dish.id, -1)}
                      disabled={dish.servedPortions <= 0}
                    >
                      −
                    </button>
                    <div className="k-stepper__mid">
                      <div className="k-stepper__label">Portions</div>
                      <div className="k-stepper__value">{Math.round(dish.servedPortions)}</div>
                    </div>
                    <button
                      type="button"
                      className="k-stepper__btn"
                      onClick={() => onUpdateDishServed(dish.id, +1)}
                      disabled={dish.servedPortions >= dish.adjustedPortions}
                    >
                      +
                    </button>
                  </div>

                  <div className="k-stepperHint">
                    {dish.servedPortions >= dish.adjustedPortions - 1e-6 ? (
                      <button className="k-smallBtn" type="button" onClick={() => onCloseDish(dish.id)} disabled={status === "Closed"}>
                        Close dish
                      </button>
                    ) : (
                      <div className="k-muted">Tap +/− to log portions served.</div>
                    )}
                  </div>
                </div>

                <div className="k-dishRow__col">
                  <div className="k-statusStack">
                    <StatusPill status={status} />
                  </div>
                </div>

                <div className="k-dishRow__col">
                  <StockDot
                    ratio={ratio}
                    onClick={() => onOpenStock(dish.id)}
                    title={
                      ratio >= 1
                        ? `Stock OK (${dish.stockKg.toFixed(1)} kg / ${dish.requiredKg.toFixed(1)} kg required)`
                        : `Stock shortfall (${dish.stockKg.toFixed(1)} kg / ${dish.requiredKg.toFixed(1)} kg required)`
                    }
                  />
                  {ratio < 1 && <div className="k-stockShort">{Math.round((dish.requiredKg - dish.stockKg) * 10) / 10} kg short</div>}
                  {ratio >= 1 && <div className="k-stockOk">Full stock</div>}
                  {stockInfo && stockInfo.showQuickHint && (
                    <div className="k-stockHint">{stockInfo.showQuickHint}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MenuManifest({
  state,
  selectedEventId,
  dishes,
  onSyncHeadcount,
  onAdjustAllPortions,
  onUpdateDishServed,
  onCloseDish,
  onSetSynergyDecision,
  onSelectEventId,
  setState,
}) {
  const events = state.events ?? [];
  const event = events.find((e) => e.id === selectedEventId) ?? events[0];

  const [stockModalDishId, setStockModalDishId] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const plannedPax = event?.plannedPax ?? 0;
  const arrivedPax = event?.liveArrivalPax ?? 0;
  const delta = arrivedPax - plannedPax;
  const deltaPct = plannedPax > 0 ? (delta / plannedPax) * 100 : 0;

  const warning = Math.abs(deltaPct) > 15;
  const lastSyncedAtByEvent = state.lastSyncedAtByEvent ?? {};
  const lastSyncedAt = lastSyncedAtByEvent[event?.id] ?? null;
  const lastSyncedLabel = lastSyncedAt ? `${Math.max(0, Math.round((nowMs - lastSyncedAt) / 60000))} min ago` : "Never";

  const dishesByCourse = useMemo(() => {
    const map = {};
    for (const c of KITCHEN_COURSES) map[c.id] = [];
    for (const d of dishes) {
      map[d.course]?.push(d);
    }
    return map;
  }, [dishes]);

  const totals = useMemo(() => deriveTotalsForEvent(dishes), [dishes]);

  const stockInfoByDishId = useMemo(() => {
    const map = {};
    for (const d of dishes) {
      const shortfall = Math.max(0, d.requiredKg - d.stockKg);
      const ratio = d.requiredKg > 0 ? d.stockKg / d.requiredKg : 1;
      map[d.id] = {
        ratio,
        shortfall,
        showQuickHint: ratio >= 1 ? null : `${Math.round(shortfall)} kg short`,
      };
    }
    return map;
  }, [dishes]);

  const printManifest = () => {
    document.title = `Kitchen Manifest — ${event?.name ?? ""}`.trim();
    // Let CSS media print hide/show.
    setState((s) => ({ ...s, ui: { ...s.ui, printMode: "manifest" } }));
    setTimeout(() => window.print(), 50);
    setTimeout(() => setState((s) => ({ ...s, ui: { ...s.ui, printMode: null } })), 300);
  };

  const modalDish = stockModalDishId ? dishes.find((d) => d.id === stockModalDishId) : null;

  return (
    <div className="k-manifest">
      {/* Print-only container */}
      <div className="k-manifest__printWrap">
        <div className="k-manifest__printArea">
          <div className="k-printHeader">
            <div className="k-printHeader__title">Banquet IntelliManager — Kitchen Manifest</div>
            <div className="k-printHeader__meta">
              Event: <strong>{event?.name}</strong> · Tier: <strong>{event?.tier}</strong>
            </div>
            <div className="k-printHeader__meta">
              Planned pax: <strong>{plannedPax}</strong> · Arrived pax: <strong>{arrivedPax}</strong> · Last synced:{" "}
              <strong>{lastSyncedLabel}</strong>
            </div>
          </div>
          <div className="k-printSection">
            {KITCHEN_COURSES.map((c) => (
              <div key={c.id} className="k-printCourse">
                <div className="k-printCourse__title">{c.label}</div>
                <table className="k-printTable">
                  <thead>
                    <tr>
                      <th>Dish</th>
                      <th>Planned</th>
                      <th>Adjusted</th>
                      <th>Served</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dishesByCourse[c.id] ?? []).map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td>
                        <td>
                          {Math.round(d.plannedPortions)} portions · {d.plannedKg.toFixed(1)} kg
                        </td>
                        <td>
                          {Math.round(d.adjustedPortions)} portions · {d.requiredKg.toFixed(1)} kg
                        </td>
                        <td>{Math.round(d.servedPortions)} portions</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top tabs */}
      <div className="k-manifest__top">
        <div className="k-tabs">
          {events.map((ev) => (
            <button
              key={ev.id}
              type="button"
              className={`k-tab ${ev.id === selectedEventId ? "k-tab--active" : ""}`}
              onClick={() => onSelectEventId(ev.id)}
            >
              {ev.name} · {ev.liveArrivalPax} pax
            </button>
          ))}
        </div>

        <div className="k-manifest__controls">
          <button className="k-btn k-btn--outline" onClick={onSyncHeadcount} type="button">
            Sync headcount
          </button>
          <div className="k-lastSynced">
            Last synced <strong>{lastSyncedLabel}</strong>
          </div>
          <button className="k-btn k-btn--gold" onClick={printManifest} type="button">
            Print / export PDF
          </button>
        </div>
      </div>

      {/* Headcount adjustment banner */}
      <div className={`k-headcountBanner ${warning ? "k-headcountBanner--warn" : ""}`}>
        <div className="k-headcountBanner__left">
          <div className="k-headcountBanner__title">Headcount adjustment</div>
          <div className="k-headcountBanner__sub">
            Planned pax: <strong>{plannedPax}</strong> · Arrived pax: <strong>{arrivedPax}</strong>
          </div>
        </div>
        <div className="k-headcountBanner__right">
          <span className={`k-deltaBadge ${delta >= 0 ? "k-deltaBadge--pos" : "k-deltaBadge--neg"}`}>
            {delta >= 0 ? `+${delta}` : `${delta}`} ({deltaPct >= 0 ? "+" : ""}
            {Math.round(deltaPct)}%)
          </span>
          <button className="k-smallBtn k-smallBtn--gold" onClick={onAdjustAllPortions} type="button">
            Adjust all portions
          </button>
        </div>
        {warning && (
          <div className="k-headcountBanner__warnText">
            Portions may need adjustment — review counters below
          </div>
        )}
      </div>

      {/* Main grid with sticky dietary summary */}
      <div className="k-manifest__grid">
        <div className="k-manifest__courses">
          {KITCHEN_COURSES.map((c) => (
            <CourseAccordion
              key={c.id}
              course={c}
              dishes={dishesByCourse[c.id] ?? []}
              onUpdateDishServed={(dishId, delta) => onUpdateDishServed(selectedEventId, dishId, delta)}
              onCloseDish={(dishId) => onCloseDish(selectedEventId, dishId)}
              onOpenStock={(dishId) => setStockModalDishId(dishId)}
              stockInfoByDishId={stockInfoByDishId}
              onSetSynergyDecision={(dishId, decision) => onSetSynergyDecision(selectedEventId, dishId, decision)}
            />
          ))}
        </div>

        <div className="k-manifest__summary">
          <div className="k-summaryCard glass">
            <div className="k-summaryCard__title">Dietary summary</div>
            <div className="k-summaryGrid">
              <div className="k-summaryRow">
                <div className="k-summaryKey">
                  <span className="k-dot k-dot--veg" /> Total Veg
                </div>
                <div className="k-summaryVal">{Math.round(totals.veg)}</div>
              </div>
              <div className="k-summaryRow">
                <div className="k-summaryKey">
                  <span className="k-dot k-dot--nonveg" /> Total Non-Veg
                </div>
                <div className="k-summaryVal">{Math.round(totals.nonVeg)}</div>
              </div>
              <div className="k-summaryRow">
                <div className="k-summaryKey">
                  <span className="k-dot k-dot--jain" /> Jain plates
                </div>
                <div className="k-summaryVal">{Math.round(totals.jain)}</div>
              </div>
              <div className="k-summaryRow">
                <div className="k-summaryKey">
                  <span className="k-dot k-dot--halal" /> Halal plates
                </div>
                <div className="k-summaryVal">{Math.round(totals.halal)}</div>
              </div>
              <div className="k-summaryRow">
                <div className="k-summaryKey">
                  <span className="k-dot k-dot--gf" /> GF plates
                </div>
                <div className="k-summaryVal">{Math.round(totals.gf)}</div>
              </div>
            </div>

            <div className="k-miniBars">
              <div className="k-miniBars__label">Split</div>
              <div className="k-barWrap">
                {(() => {
                  const total = Math.max(1, totals.veg + totals.nonVeg);
                  const vegPct = (totals.veg / total) * 100;
                  const nonVegPct = 100 - vegPct;
                  return (
                    <>
                      <div className="k-bar k-bar--veg" style={{ width: `${vegPct}%` }} />
                      <div className="k-bar k-bar--nonveg" style={{ width: `${nonVegPct}%` }} />
                    </>
                  );
                })()}
              </div>
              <div className="k-barLegend">
                <span className="k-leg">
                  <span className="k-legDot k-legDot--veg" /> Veg
                </span>
                <span className="k-leg">
                  <span className="k-legDot k-legDot--nonveg" /> Non-Veg
                </span>
              </div>
            </div>
          </div>
          <div className="k-printHint">
            Tip: use “Print / export PDF” for a clean, print-ready manifest page.
          </div>
        </div>
      </div>

      <Modal
        open={!!modalDish}
        title={modalDish ? `Stock status — ${modalDish.name}` : "Stock status"}
        onClose={() => setStockModalDishId(null)}
      >
        {modalDish && (
          <div className="k-stockModal">
            <div className="k-stockModal__row">
              <span className="k-stockModal__k">Current stock</span>
              <span className="k-stockModal__v">{modalDish.stockKg.toFixed(1)} kg</span>
            </div>
            <div className="k-stockModal__row">
              <span className="k-stockModal__k">Required</span>
              <span className="k-stockModal__v">{modalDish.requiredKg.toFixed(1)} kg</span>
            </div>
            <div className="k-stockModal__row">
              <span className="k-stockModal__k">Shortfall</span>
              <span className="k-stockModal__v k-stockModal__v--bad">
                {Math.max(0, modalDish.requiredKg - modalDish.stockKg).toFixed(1)} kg
              </span>
            </div>
            <div className="k-stockModal__note">
              Adjust portions in Menu Manifest to match live headcount and avoid waste.
            </div>
            <div className="k-stockModal__tagRow">
              <span className="k-stockModal__tag">Station owner: {modalDish.chefStation}</span>
              <span className="k-stockModal__tag">Dietary: {modalDish.dietary?.jain ? "Jain" : "Standard"}</span>
            </div>
            <div className="k-stockModal__actions">
              <button className="k-btn k-btn--outline" onClick={() => setStockModalDishId(null)} type="button">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

