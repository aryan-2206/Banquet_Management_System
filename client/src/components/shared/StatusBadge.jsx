import React from 'react';
import './StatusBadge.css';

const CONFIG = {
  enquiry:   { label: 'Enquiry',   color: 'amber'  },
  temporary: { label: 'Temporary', color: 'amber'  },
  booked:    { label: 'Booked',    color: 'teal'   },
  confirmed: { label: 'Confirmed', color: 'teal'   },
  completed: { label: 'Completed', color: 'sage'   },
  cancelled: { label: 'Cancelled', color: 'rose'   },
  overlap:   { label: 'Conflict',  color: 'rose'   },
};

export default function StatusBadge({ status, dot = false }) {
  const key = status?.toLowerCase() || 'enquiry';
  const { label, color } = CONFIG[key] || { label: status, color: 'amber' };

  return (
    <span className={`status-badge status-badge--${color}`}>
      {dot && <span className="status-badge__dot" />}
      {label}
    </span>
  );
}