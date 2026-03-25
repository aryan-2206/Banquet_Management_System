import React, { useState } from 'react';

export default function NotificationsFeed({ notifications, onNavigate }) {
  const [seen, setSeen] = useState(new Set());
  const unread = notifications.filter(n => !n.read && !seen.has(n.id)).length;

  return (
    <div className="portal-card">
      <div className="flex items-center justify-between mb-4">
        <div className="portal-section-label mb-0">Activity Feed</div>
        {unread > 0 && (
          <span className="bg-red-500 text-white rounded-full text-[9px] font-bold px-2 py-0.5 min-w-[20px] text-center">{unread}</span>
        )}
      </div>

      <div className="space-y-0.5">
        {notifications.map((n, i) => {
          const isUnread = !n.read && !seen.has(n.id);
          return (
            <button key={n.id}
              onClick={() => { setSeen(s => new Set([...s, n.id])); onNavigate?.(n.tab); }}
              className={`w-full flex items-start gap-3 py-3 px-2 md:px-3 rounded-xl text-left cursor-pointer transition-all duration-200 hover:brightness-110 min-h-[44px] border-b last:border-0 ${
                isUnread
                  ? 'bg-[rgba(201,168,76,0.05)] border-[rgba(201,168,76,0.1)]'
                  : 'bg-transparent border-[rgba(255,255,255,0.04)]'
              }`}
              style={{ borderBottomWidth: i < notifications.length-1 ? '1px' : '0' }}>
              <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm leading-snug ${isUnread ? 'text-[#F5F0E8]' : 'text-[#9D9880]'}`}>{n.text}</div>
                {/* Time: hidden on mobile (save space), shown inline on tablet */}
                <div className="text-xs text-[#4A4840] mt-0.5 md:inline md:ml-2 block">{n.time}</div>
              </div>
              {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-2" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
