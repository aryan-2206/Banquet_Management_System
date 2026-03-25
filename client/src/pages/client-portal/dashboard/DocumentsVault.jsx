import React from 'react';
import { fmtDate } from './mockData';

const TYPE_COLOR = { PO:'#5B8FE8', FP:'#C9A84C', Receipt:'#5FBF8A', GST:'#9B6DE8' };

export default function DocumentsVault({ documents }) {
  if (documents.length === 0) return (
    <div className="portal-card text-center py-10">
      <div className="text-4xl mb-3">📄</div>
      <p className="text-sm text-[#4A4840]">No documents attached yet.</p>
    </div>
  );

  return (
    <div className="portal-card">
      <div className="portal-section-label">Documents</div>

      {/* ── Responsive grid: 1-col mobile, 2-col tablet, 3-col desktop ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents.map(doc => {
          const color = TYPE_COLOR[doc.type] || '#C9A84C';
          return (
            <div key={doc.id}
              className="flex md:flex-col items-center md:items-start gap-3 p-3 md:p-4 rounded-xl transition-all duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lg"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>

              {/* Type badge */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
                <span className="text-[10px] font-bold" style={{ color }}>{doc.type}</span>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 md:w-full">
                <div className="text-sm font-medium text-[#F5F0E8] truncate">{doc.name}</div>
                <div className="text-xs text-[#4A4840] mt-0.5">
                  {fmtDate(doc.date)} · {doc.size}
                  {doc.version > 1 && <span className="ml-1 px-1.5 py-0.5 rounded text-[9px]"
                    style={{ background:'rgba(201,168,76,0.12)', color:'#C9A84C' }}>v{doc.version}</span>}
                </div>
              </div>

              {/* Action buttons — icon only on mobile, icons always */}
              <div className="flex gap-2 flex-shrink-0 md:self-end md:mt-2">
                <button title="Download"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:brightness-125 min-h-[36px] min-w-[36px]"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#9D9880' }}>
                  ⬇
                </button>
                <button title="Share via WhatsApp"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:brightness-125 min-h-[36px] min-w-[36px]"
                  style={{ background:'rgba(37,211,102,0.07)', border:'1px solid rgba(37,211,102,0.25)', color:'#25D366' }}>
                  📲
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
