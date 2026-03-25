import React, { useEffect, useMemo, useRef, useState } from "react";
import "./PrepTimeline.css";

import { KITCHEN_COURSES, msToHMS } from "./kitchenMock";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="k-tl-modalOverlay" role="dialog" aria-modal="true">
      <div className="k-tl-modal">
        <div className="k-tl-modal__head">
          <div className="k-tl-modal__title">{title}</div>
          <button className="k-tl-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="k-tl-modal__body">{children}</div>
      </div>
    </div>
  );
}

function StatusStrip({ status }) {
  return (
    <div className={`k-tl-statusStrip k-tl-statusStrip--${status.replace(/\s+/g, "-").toLowerCase()}`}>
      <span className="k-tl-statusStrip__label">Status</span>
      <span className="k-tl-statusStrip__value">{status}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "Done"
      ? "k-taskPill k-taskPill--done"
      : status === "Overdue"
      ? "k-taskPill k-taskPill--overdue"
      : status === "In Progress"
      ? "k-taskPill k-taskPill--active"
      : "k-taskPill k-taskPill--todo";
  return <span className={cls}>{status}</span>;
}

export default function PrepTimeline({
  state,
  selectedEventId,
  tasks,
  dishes,
  onMarkTaskDone,
  onSetTaskAssignee,
  onSetLeftoverPrelog,
  setState,
  onGoToWaste,
}) {
  const events = state.events ?? [];
  const event = events.find((e) => e.id === selectedEventId) ?? events[0];

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const eventStart = event?.startTime ?? new Date();
  const eventEnd = event?.endTime ?? new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
  const startMs = eventStart.getTime();
  const endMs = eventEnd.getTime();

  const remainingMs = Math.max(0, startMs - now);
  const isBeforeStart = now < startMs;

  const statusStrip = useMemo(() => {
    const preStartWindow = 45 * 60 * 1000; // 45 min
    const serviceImminentWindow = 20 * 60 * 1000; // 20 min

    if (now < startMs - preStartWindow) return "Pre-Prep";
    if (now < startMs) return "Active Prep";
    if (now < startMs + serviceImminentWindow) return "Service Imminent";
    if (now <= endMs) return "Service Live";
    return "Wrap-Up";
  }, [now, startMs, endMs]);

  const upcomingCourse = useMemo(() => {
    // Choose the next course based on the earliest not-done critical-ish tasks.
    const pending = tasks
      .filter((t) => !t.done)
      .slice()
      .sort((a, b) => a.startAt - b.startAt);
    const next = pending[0];
    const course = KITCHEN_COURSES.find((c) => c.id === next?.courseId);
    if (!course) return { label: "No pending course", dueAt: null, minutes: 0 };

    const dueAt = next ? next.startAt : null;
    const diff = dueAt ? dueAt.getTime() - now : 0;
    return { label: course.label, dueAt, minutes: Math.max(0, Math.round(diff / 60000)) };
  }, [now, tasks]);

  const nextReadyLine = useMemo(() => {
    if (!upcomingCourse.dueAt) return "Course prep in progress";
    const dueAtStr = upcomingCourse.dueAt instanceof Date ? `${upcomingCourse.dueAt.toTimeString().slice(0, 5)}` : "";
    return `${upcomingCourse.label} must be ready by ${dueAtStr} — ${msToHMS(upcomingCourse.minutes * 60 * 1000)} remaining`;
  }, [upcomingCourse]);

  const windowEnd = endMs;
  const windowStart = now;
  const windowMs = Math.max(1, windowEnd - windowStart);

  const tasksWithStatus = useMemo(() => {
    return (tasks ?? []).map((t) => {
      const startAt = new Date(t.startAt).getTime();
      const endAt = startAt + t.durationMin * 60 * 1000;
      const overdue = !t.done && now > endAt;
      const inProgress = !t.done && now >= startAt && now <= endAt;
      const status = t.done ? "Done" : overdue ? "Overdue" : inProgress ? "In Progress" : "Not started";
      return { ...t, _startMs: startAt, _endMs: endAt, _status: status, _overdue: overdue };
    });
  }, [tasks, now]);

  const groupedStations = useMemo(() => {
    const map = {};
    for (const t of tasksWithStatus) {
      if (!map[t.station]) map[t.station] = [];
      map[t.station].push(t);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a._startMs - b._startMs);
    }
    return map;
  }, [tasksWithStatus]);

  const [mode, setMode] = useState("gantt"); // gantt | list

  const [earlyDoneBanner, setEarlyDoneBanner] = useState(null);
  const earlyDoneTimer = useRef(null);

  const [assignmentConfirm, setAssignmentConfirm] = useState(null); // {taskId, nextAssignee}

  const [courseChecklist, setCourseChecklist] = useState(null); // courseId
  const [checkState, setCheckState] = useState({
    dietaryReady: false,
    utensilsPlaced: false,
  });

  const [leftoverEstimateKg, setLeftoverEstimateKg] = useState("");

  const computeDishCourseReady = (courseId) => {
    const courseDishes = dishes.filter((d) => d.course === courseId);
    if (courseDishes.length === 0) return { allServed: false, dietaryReady: false };
    const allServed = courseDishes.every((d) => d.servedPortions >= d.adjustedPortions - 1e-6 && d.servedPortions > 0);

    // Dietary ready: if any dish of a dietary category is present, ensure it has served portions.
    const dietaryCats = ["veg", "nonVeg", "jain", "halal", "gf"];
    let dietaryReady = true;
    for (const cat of dietaryCats) {
      const any = courseDishes.some((d) => !!d.dietary?.[cat]);
      if (!any) continue;
      const ok = courseDishes.filter((d) => d.dietary?.[cat]).every((d) => d.servedPortions > 0);
      if (!ok) dietaryReady = false;
    }
    return { allServed, dietaryReady };
  };

  const criticalAlert = useMemo(() => {
    const critical = tasksWithStatus.filter((t) => t.critical && !t.done);
    if (critical.length === 0) return null;
    // Find most behind by schedule start.
    const behind = critical
      .filter((t) => now > t._startMs)
      .sort((a, b) => b._startMs - a._startMs)[0];
    if (!behind) return null;
    const behindMins = Math.max(0, Math.round((now - behind._startMs) / 60000));
    return {
      text: `${behind.dishName} (${behind.chefStationTag}) is ${behindMins} min behind — Main Course delay risk`,
      criticalTask: behind,
    };
  }, [tasksWithStatus, now]);

  const toggleMode = (m) => setMode(m);

  const handleTaskDone = (task) => {
    const doneAt = new Date();
    onMarkTaskDone(selectedEventId, task.id, doneAt);

    // Suggest pulling next task forward if marked done early.
    if (doneAt.getTime() < task._startMs) {
      const stationTasks = tasksWithStatus
        .filter((t) => t.station === task.station)
        .slice()
        .sort((a, b) => a._startMs - b._startMs);
      const idx = stationTasks.findIndex((t) => t.id === task.id);
      const next = stationTasks[idx + 1];
      if (next) {
        setEarlyDoneBanner({
          text: `Done early. Suggest pulling next task forward: ${next.dishName} (${next.station}).`,
          nextTaskId: next.id,
        });
        if (earlyDoneTimer.current) clearTimeout(earlyDoneTimer.current);
        earlyDoneTimer.current = setTimeout(() => setEarlyDoneBanner(null), 7000);
      }
    }
  };

  const autoPullNextTask = (nextTaskId) => {
    // Prototype: pull startAt to “now” and keep duration constant.
    setState((s) => {
      const tasks = s.tasksByEvent[selectedEventId] ?? [];
      const nextTasks = tasks.map((t) => {
        if (t.id !== nextTaskId) return t;
        return { ...t, startAt: new Date().toISOString() };
      });
      return { ...s, tasksByEvent: { ...s.tasksByEvent, [selectedEventId]: nextTasks } };
    });
    setEarlyDoneBanner(null);
  };

  const openChecklistForCourse = (courseId) => {
    const ready = computeDishCourseReady(courseId);
    setCheckState({ dietaryReady: ready.dietaryReady, utensilsPlaced: false });
    setLeftoverEstimateKg("");
    setCourseChecklist(courseId);
  };

  const coursesInEvent = useMemo(() => {
    const courseIds = [...new Set(tasks.map((t) => t.courseId))];
    return KITCHEN_COURSES.filter((c) => courseIds.includes(c.id));
  }, [tasks]);

  const clearForService = (courseId) => {
    window.alert(`${KITCHEN_COURSES.find((c) => c.id === courseId)?.label ?? courseId} are ready — signalling GRE dashboard`);
    window.dispatchEvent(new CustomEvent("gre-clear-for-service", { detail: { eventId: selectedEventId, courseId } }));
    setCourseChecklist(null);
  };

  return (
    <div className="k-tlRoot">
      {/* Countdown header */}
      <div className="k-tlHeader">
        <div className="k-tlHeader__left">
          <div className="k-tlHeader__title">Prep Timeline</div>
          <div className="k-tlHeader__timer">
            <div className="k-tlHeader__timerVal">{isBeforeStart ? msToHMS(remainingMs) : "00:00:00"}</div>
            <div className="k-tlHeader__timerLabel">to event start</div>
          </div>
          <div className="k-tlHeader__subline">{nextReadyLine}</div>
        </div>
        <div className="k-tlHeader__right">
          <StatusStrip status={statusStrip} />
          <div className="k-tlMode">
            <button type="button" className={`k-tlMode__btn ${mode === "gantt" ? "k-tlMode__btn--active" : ""}`} onClick={() => toggleMode("gantt")}>
              Gantt
            </button>
            <button type="button" className={`k-tlMode__btn ${mode === "list" ? "k-tlMode__btn--active" : ""}`} onClick={() => toggleMode("list")}>
              Cards
            </button>
          </div>
          <button type="button" className="k-tlGoWaste" onClick={onGoToWaste}>
            Go to Waste Logger →
          </button>
        </div>
      </div>

      {earlyDoneBanner && (
        <div className="k-tlBanner k-tlBanner--gold">
          {earlyDoneBanner.text}
          <button className="k-tlBanner__btn" onClick={() => autoPullNextTask(earlyDoneBanner.nextTaskId)} type="button">
            Pull next task
          </button>
        </div>
      )}

      {criticalAlert && (
        <div className="k-tlBanner k-tlBanner--danger">
          {criticalAlert.text}
        </div>
      )}

      {/* Course checklist section */}
      <div className="k-tlCourseChecks">
        <div className="k-tlCourseChecks__head">Course go/no-go</div>
        <div className="k-tlCourseChecks__grid">
          {coursesInEvent.map((c) => {
            const ready = computeDishCourseReady(c.id);
            const label = ready.allServed ? "Ready to clear" : "Needs dishes";
            return (
              <div key={c.id} className="k-tlCourseCard glass">
                <div className="k-tlCourseCard__top">
                  <div className="k-tlCourseCard__name">{c.label}</div>
                  <span className={`k-tlCourseCard__badge ${ready.allServed ? "k-tlCourseCard__badge--ok" : ""}`}>
                    {ready.allServed ? "✓" : "—"}
                  </span>
                </div>
                <div className="k-tlCourseCard__sub">{label}</div>
                <button type="button" className="k-tlCourseCard__btn" onClick={() => openChecklistForCourse(c.id)}>
                  Open checklist
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      {mode === "gantt" && (
        <div className="k-gantt">
          <div className="k-gantt__axis">
            {Array.from({ length: 6 }).map((_, i) => {
              const t = windowStart + (windowMs * i) / 5;
              const d = new Date(t);
              return (
                <div key={i} className="k-gantt__tick" style={{ left: `${(i / 5) * 100}%` }}>
                  <span className="k-gantt__tickLabel">{d.toTimeString().slice(0, 5)}</span>
                </div>
              );
            })}
          </div>

          <div className="k-gantt__rows">
            {Object.entries(groupedStations).map(([station, stTasks]) => (
              <div key={station} className="k-gantt__row">
                <div className="k-gantt__rowLabel">{station}</div>
                <div className="k-gantt__rowTrack">
                  {stTasks.map((t) => {
                    const leftPct = ((t._startMs - windowStart) / windowMs) * 100;
                    const widthPct = (t.durationMin * 60 * 1000) / windowMs * 100;
                    const clampedLeft = Math.max(-2, Math.min(98, leftPct));
                    const clampedWidth = Math.max(2, Math.min(40, widthPct));

                    const cls =
                      t._status === "Done"
                        ? "k-taskBlock k-taskBlock--done"
                        : t._status === "Overdue"
                        ? "k-taskBlock k-taskBlock--overdue"
                        : t._status === "In Progress"
                        ? "k-taskBlock k-taskBlock--active"
                        : "k-taskBlock k-taskBlock--todo";

                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={cls}
                        style={{ left: `${clampedLeft}%`, width: `${clampedWidth}%` }}
                        title={`${t.dishName} · ${t.assignedChef} · ${new Date(t._startMs).toTimeString().slice(0, 5)}`}
                        onClick={() => handleTaskDone(t)}
                        disabled={t.done}
                      >
                        <div className="k-taskBlock__top">{t.dishName}</div>
                        <div className="k-taskBlock__mid">
                          {t.durationMin}m · {t.assignedChef}
                        </div>
                        {t._status === "Overdue" && <div className="k-taskBlock__pulse">Overdue</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card list */}
      {mode === "list" && (
        <div className="k-taskList">
          {tasksWithStatus
            .slice()
            .sort((a, b) => a._startMs - b._startMs)
            .map((t) => {
              const status =
                t.done ? "Done" : t._status === "Overdue" ? "Overdue" : t._status === "In Progress" ? "In Progress" : "Not started";

              return (
                <div key={t.id} className="k-taskCard glass">
                  <div className="k-taskCard__top">
                    <div>
                      <div className="k-taskCard__name">{t.dishName}</div>
                      <div className="k-taskCard__meta">
                        {t.station} · {KITCHEN_COURSES.find((c) => c.id === t.courseId)?.label ?? t.courseId}
                      </div>
                    </div>
                    <StatusPill status={status} />
                  </div>

                  <div className="k-taskCard__grid">
                    <div className="k-taskCard__field">
                      <div className="k-taskCard__k">Start</div>
                      <div className="k-taskCard__v">{new Date(t._startMs).toTimeString().slice(0, 5)}</div>
                    </div>
                    <div className="k-taskCard__field">
                      <div className="k-taskCard__k">Duration</div>
                      <div className="k-taskCard__v">{t.durationMin} min</div>
                    </div>
                    <div className="k-taskCard__field">
                      <div className="k-taskCard__k">Chef</div>
                      <div className="k-taskCard__v">
                        <select
                          className="k-tlAssign"
                          value={t.assignedChef}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next === t.assignedChef) return;
                            setAssignmentConfirm({ taskId: t.id, nextAssignee: next, prevAssignee: t.assignedChef });
                          }}
                        >
                          {["Sous Chef", "Chef de Partie", "Commis"].map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="k-taskCard__actions">
                    <button type="button" className="k-taskCard__doneBtn" disabled={t.done} onClick={() => handleTaskDone(t)}>
                      {t.done ? "Done ✓" : "Mark Done"}
                    </button>
                    <div className="k-taskCard__hint">
                      {t.doneAt ? `Completed at ${new Date(t.doneAt).toTimeString().slice(0, 5)}` : "Tap Mark Done to timestamp completion."}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Assignment confirm modal */}
      <Modal
        open={!!assignmentConfirm}
        title="Confirm reassignment"
        onClose={() => setAssignmentConfirm(null)}
      >
        {assignmentConfirm && (
          <div className="k-tlConfirm">
            <div className="k-tlConfirm__text">
              Reassign this task from <strong>{assignmentConfirm.prevAssignee}</strong> to <strong>{assignmentConfirm.nextAssignee}</strong>?
            </div>
            <div className="k-tlConfirm__actions">
              <button className="k-tlConfirm__btn k-tlConfirm__btn--outline" onClick={() => setAssignmentConfirm(null)} type="button">
                Cancel
              </button>
              <button
                className="k-tlConfirm__btn k-tlConfirm__btn--gold"
                onClick={() => {
                  onSetTaskAssignee(selectedEventId, assignmentConfirm.taskId, assignmentConfirm.nextAssignee);
                  setAssignmentConfirm(null);
                }}
                type="button"
              >
                Reassign
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Course checklist modal */}
      <Modal
        open={!!courseChecklist}
        title={courseChecklist ? `Clear for service — ${KITCHEN_COURSES.find((c) => c.id === courseChecklist)?.label ?? courseChecklist}` : "Clear for service"}
        onClose={() => setCourseChecklist(null)}
      >
        {courseChecklist && (
          <div className="k-tlChecklist">
            <div className="k-tlChecklist__row">
              <label className="k-checkLine">
                <input type="checkbox" checked={computeDishCourseReady(courseChecklist).allServed} readOnly />
                <span>Dishes for this course marked served</span>
              </label>
            </div>
            <div className="k-tlChecklist__row">
              <label className="k-checkLine">
                <input type="checkbox" checked={checkState.dietaryReady} onChange={(e) => setCheckState((s) => ({ ...s, dietaryReady: e.target.checked }))} />
                <span>Dietary variants ready</span>
              </label>
            </div>
            <div className="k-tlChecklist__row">
              <label className="k-checkLine">
                <input type="checkbox" checked={checkState.utensilsPlaced} onChange={(e) => setCheckState((s) => ({ ...s, utensilsPlaced: e.target.checked }))} />
                <span>Serving utensils placed</span>
              </label>
            </div>

            <div className="k-tlChecklist__divider" />

            <div className="k-tlChecklist__leftover">
              <div className="k-tlChecklist__leftoverTitle">Wastage pre-log</div>
              <div className="k-tlChecklist__leftoverSub">
                Enter leftover estimate before the next course starts. Waste Logger will be pre-filled.
              </div>
              <div className="k-leftoverInput">
                <input
                  className="k-leftoverField"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Leftover kg (e.g., 12.5)"
                  value={leftoverEstimateKg}
                  onChange={(e) => setLeftoverEstimateKg(e.target.value)}
                />
                <button
                  type="button"
                  className="k-leftoverBtn"
                  onClick={() => {
                    const v = Number(leftoverEstimateKg);
                    if (!Number.isFinite(v)) return;
                    onSetLeftoverPrelog(selectedEventId, courseChecklist, v);
                    onGoToWaste();
                  }}
                >
                  Save & pre-fill Waste Logger
                </button>
              </div>
            </div>

            <div className="k-tlChecklist__actions">
              <button className="k-tlChecklist__clearBtn" onClick={() => clearForService(courseChecklist)} type="button">
                Clear for service
              </button>
              <button className="k-tlChecklist__outlineBtn" onClick={() => setCourseChecklist(null)} type="button">
                Keep working
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

