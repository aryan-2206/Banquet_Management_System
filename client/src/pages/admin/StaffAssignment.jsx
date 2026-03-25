import React, { useState } from "react";
import "./StaffAssignment.css";
import { createInitialAdminState } from "./adminMock";

const STAFF_POOL = [
  { id: "s1", name: "Riya Verma", role: "Event Manager", phone: "9876543210", status: "Available", rating: 4.8 },
  { id: "s2", name: "Chef Rajan", role: "Head Chef", phone: "9876543211", status: "Assigned", rating: 4.9 },
  { id: "s3", name: "Ananya Patel", role: "GRE", phone: "9876543212", status: "Available", rating: 4.5 },
  { id: "s4", name: "Vikram Singh", role: "GRE", phone: "9876543213", status: "Assigned", rating: 4.7 },
  { id: "s5", name: "Kunal DJ", role: "DJ / AV Technician", phone: "9876543214", status: "Available", rating: 4.6 },
  { id: "s6", name: "Chef Amit", role: "Sous Chef", phone: "9876543215", status: "On leave", rating: 4.2 },
  { id: "s7", name: "Surya", role: "Security", phone: "9876543216", status: "Available", rating: 4.4 },
];

const MOCK_ASSIGNMENTS = {
  "ev-01": [
    { roleId: "r1", roleName: "Event Manager", required: 1, assigned: [{ staffId: "s1" }] },
    { roleId: "r2", roleName: "Head Chef", required: 1, assigned: [{ staffId: "s2" }] },
    { roleId: "r3", roleName: "GRE", required: 2, assigned: [{ staffId: "s4" }] },
    { roleId: "r4", roleName: "DJ / AV Technician", required: 1, assigned: [] },
    { roleId: "r5", roleName: "Security", required: 3, assigned: [] },
  ],
  "ev-02": [
    { roleId: "r1", roleName: "Event Manager", required: 1, assigned: [] },
    { roleId: "r2", roleName: "Head Chef", required: 1, assigned: [] },
    { roleId: "r3", roleName: "GRE", required: 1, assigned: [{ staffId: "s3" }] },
  ]
};

export default function StaffAssignment() {
  const [view, setView] = useState("byEvent"); // byEvent, byPerson, directory, vendors
  const [adminState] = useState(() => createInitialAdminState());
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);

  const events = adminState.events.filter(e => e.date.getTime() === new Date().setHours(0,0,0,0));

  const autoFillEvent = (eventId) => {
    alert("AI Auto-assign completed based on tier experience and availability.");
    setAssignments(s => {
      const cloned = { ...s };
      if (!cloned[eventId]) return s;
      cloned[eventId] = cloned[eventId].map(role => {
        if (role.assigned.length < role.required) {
          return { ...role, assigned: [...role.assigned, { staffId: "s5" }] }; // Mock assign DJ/Av
        }
        return role;
      });
      return cloned;
    });
  };

  const getStaffName = (id) => STAFF_POOL.find(s => s.id === id)?.name ?? "Unknown";
  const getStaffRole = (id) => STAFF_POOL.find(s => s.id === id)?.role ?? "";

  return (
    <div className="s-root noise">
      
      {/* Header Controls */}
      <header className="s-header animate-fade-in">
        <div className="s-header__left">
          <h1 className="s-title">Staff Assignment Hub</h1>
          <div className="s-datePicker">
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        <div className="s-header__right">
          <button className="s-btn s-btn--outline">Add Staff +</button>
          <button className="s-btn s-btn--primary">Export PDF ⬇</button>
        </div>
      </header>
      
      {/* View Toggles */}
      <div className="s-toggles animate-fade-up delay-100">
        <button className={`s-toggleBtn ${view === 'byEvent' ? 'active' : ''}`} onClick={() => setView('byEvent')}>By Event</button>
        <button className={`s-toggleBtn ${view === 'byPerson' ? 'active' : ''}`} onClick={() => setView('byPerson')}>By Person</button>
        <button className={`s-toggleBtn ${view === 'directory' ? 'active' : ''}`} onClick={() => setView('directory')}>Directory</button>
        <button className={`s-toggleBtn ${view === 'vendors' ? 'active' : ''}`} onClick={() => setView('vendors')}>Vendors</button>
      </div>

      {/* -- BY EVENT VIEW -- */}
      {view === 'byEvent' && (
        <div className="s-grid animate-fade-up delay-200">
          {events.map(ev => {
            const evAssigns = assignments[ev.id] || [];
            let totalReq = 0;
            let totalFilled = 0;
            evAssigns.forEach(r => {
              totalReq += r.required;
              totalFilled += r.assigned.length;
            });
            const progress = totalReq > 0 ? (totalFilled / totalReq) * 100 : 0;

            return (
              <div key={ev.id} className="s-eventCard glass">
                <div className="s-eventCard__top">
                  <div>
                    <h2 className="s-eventCard__name">{ev.name}</h2>
                    <div className="s-eventCard__meta">{ev.hall} • {ev.pax} pax • Tier: {ev.tier}</div>
                  </div>
                  <button className="s-autoBtn" onClick={() => autoFillEvent(ev.id)}>Auto-Suggest ✨</button>
                </div>

                <div className="s-progressWrap">
                  <div className="s-progressLabel">{totalFilled} of {totalReq} roles filled</div>
                  <div className="s-progressBar"><div className="s-progressFill" style={{ width: `${progress}%`, background: progress === 100 ? '#5FBF8A' : '#C9A84C' }}></div></div>
                </div>

                <div className="s-roleList">
                  {evAssigns.map(r => (
                    <div key={r.roleId} className="s-roleRow">
                      <div className="s-roleRow__info">
                        <strong>{r.roleName}</strong>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}> (Need {r.required})</span>
                      </div>
                      <div className="s-roleRow__slots">
                        {r.assigned.map((a, idx) => (
                          <div key={idx} className="s-slot s-slot--filled">
                            {getStaffName(a.staffId)}
                          </div>
                        ))}
                        {Array.from({ length: r.required - r.assigned.length }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="s-slot s-slot--empty">
                            + Unfilled
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -- BY PERSON VIEW -- */}
      {view === 'byPerson' && (
        <div className="s-personGrid animate-fade-up delay-200">
          {STAFF_POOL.map(staff => {
            // Find assignments for this person
            let assignedEvs = [];
            Object.keys(assignments).forEach(eid => {
              assignments[eid].forEach(role => {
                if (role.assigned.find(a => a.staffId === staff.id)) {
                  const ev = events.find(e => e.id === eid);
                  if (ev) assignedEvs.push(ev);
                }
              });
            });

            const isDoubleBooked = assignedEvs.length > 1;

            return (
              <div key={staff.id} className="s-staffCard glass">
                <div className="s-staffCard__head">
                  <div className="s-staffAvatar">{staff.name.charAt(0)}</div>
                  <div>
                    <div className="s-staffName">{staff.name}</div>
                    <div className="s-staffRole">{staff.role} • ⭐ {staff.rating}</div>
                  </div>
                  {isDoubleBooked && <div className="s-conflictBadge">Conflict</div>}
                </div>
                
                <div className="s-staffAssignments">
                  {staff.status === "On leave" ? (
                    <div className="s-statusMsg" style={{ color: "#E85555" }}>On Leave Today</div>
                  ) : assignedEvs.length > 0 ? (
                    assignedEvs.map(ev => (
                      <div key={ev.id} className="s-assignedRow">
                        <div className="s-dot s-dot--active"></div>
                        <div>
                          <strong>{ev.name}</strong>
                          <br />
                          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>{ev.startTime} • {ev.hall}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="s-statusMsg" style={{ color: "#5FBF8A" }}>Available / Unassigned</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* -- DIRECTORY VIEW -- */}
      {view === 'directory' && (
        <div className="s-directory animate-fade-up delay-200 glass">
          <table className="s-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role(s)</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Performance & Notes</th>
              </tr>
            </thead>
            <tbody>
              {STAFF_POOL.map(staff => (
                <tr key={staff.id}>
                  <td><strong>{staff.name}</strong></td>
                  <td>{staff.role}</td>
                  <td>{staff.phone}</td>
                  <td>
                    <span className={`s-dirStatus s-dirStatus--${staff.status.replace(" ","").toLowerCase()}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td>⭐ {staff.rating} / 5. <span style={{color:"rgba(255,255,255,0.4)"}}>Excellent track record.</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -- VENDORS VIEW -- */}
      {view === 'vendors' && (
        <div className="s-grid animate-fade-up delay-200">
          <div className="s-eventCard glass">
            <h2 className="s-eventCard__name">External Vendors: Mehta Wedding</h2>
            <br />
            <div className="s-roleList">
              <div className="s-roleRow">
                <div className="s-roleRow__info"><strong>Florist</strong></div>
                <div className="s-slot s-slot--filled">Bloom Decor Ltd. (Arriving 14:00)</div>
              </div>
              <div className="s-roleRow">
                <div className="s-roleRow__info"><strong>Photographer</strong></div>
                <div className="s-slot s-slot--filled">Candid Clicks (Arriving 17:30)</div>
              </div>
              <div className="s-roleRow">
                <div className="s-roleRow__info"><strong>Cake Vendor</strong></div>
                <div className="s-slot s-slot--empty">+ Unassigned / Custom</div>
              </div>
            </div>
            <button className="s-btn s-btn--outline" style={{ marginTop: "16px", width: "100%" }}>Share Brief to Vendors via WhatsApp</button>
          </div>
        </div>
      )}

    </div>
  );
}
