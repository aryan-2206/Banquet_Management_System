import React from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_PHOTOS = [
  { id:1, url:'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', caption:'Reception Hall' },
  { id:2, url:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', caption:'Dinner Setup'   },
  { id:3, url:'https://images.unsplash.com/photo-1563865436914-44ee14a35e7b?w=400', caption:'Cake Ceremony'  },
  { id:4, url:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', caption:'Décor'          },
  { id:5, url:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', caption:'Guests'         },
  { id:6, url:'https://images.unsplash.com/photo-1578534735884-a8e5d5de1f4a?w=400', caption:'Performance'    },
  { id:7, url:'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=400', caption:'Stage'          },
  { id:8, url:'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400', caption:'Flowers'        },
];

export default function PostEventSection({ feedbackSubmitted }) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Feedback prompt */}
      {!feedbackSubmitted && (
        <div className="portal-card text-center mb-4"
          style={{ background:'linear-gradient(135deg,rgba(232,94,154,0.08),rgba(155,109,232,0.08))', border:'1px solid rgba(232,94,154,0.2)' }}>
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="font-serif text-xl md:text-2xl text-[#F5F0E8] mb-2">How was your event?</h3>
          <p className="text-sm text-[#9D9880] mb-4 max-w-sm mx-auto">A quick review helps us serve you better on your next celebration.</p>
          <div className="flex justify-center">
            <button onClick={() => navigate('/portal/feedback')}
              className="py-3 px-8 rounded-xl font-semibold text-sm text-white cursor-pointer border-none transition-all duration-200 hover:brightness-110 min-h-[44px]"
              style={{ background:'linear-gradient(135deg,#E85E9A,#9B3DAA)' }}>
              Leave Feedback →
            </button>
          </div>
        </div>
      )}

      {/* Photo gallery ── responsive masonry-style grid */}
      <div className="portal-card">
        <div className="portal-section-label">Event Gallery</div>

        {/* Mobile: 2-col | Tablet: 3-col | Desktop: 4-col */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mb-4">
          {MOCK_PHOTOS.map(p => (
            <div key={p.id} className="aspect-square rounded-xl overflow-hidden"
              style={{ background:'rgba(255,255,255,0.04)' }}>
              <img src={p.url} alt={p.caption} loading="lazy"
                srcSet={`${p.url.replace('w=400','w=400')} 400w, ${p.url.replace('w=400','w=800')} 800w`}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className="w-full h-full object-cover transition-all duration-300 lg:hover:scale-105"
                onError={e => { e.currentTarget.style.display='none' }} />
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button className="flex-1 py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 min-h-[44px]"
            style={{ border:'1px solid rgba(201,168,76,0.25)', background:'rgba(201,168,76,0.06)', color:'#C9A84C' }}>
            📲 Share Gallery via WhatsApp
          </button>
        </div>
      </div>

      {/* Sustainability badge */}
      <div className="portal-card mb-4" style={{ border:'1px solid rgba(95,191,138,0.2)', background:'rgba(95,191,138,0.04)' }}>
        <div className="flex items-center gap-4">
          <div className="text-3xl md:text-4xl flex-shrink-0">🌿</div>
          <div>
            <div className="text-sm font-medium text-[#5FBF8A] mb-1">Sustainability Report</div>
            <div className="text-xs md:text-sm text-[#9D9880] leading-relaxed">
              Your event generated <strong className="text-[#F5F0E8]">8.2 kg food waste</strong> — <strong className="text-[#5FBF8A]">34% below</strong> our monthly average.
            </div>
          </div>
        </div>
      </div>

      {/* Book next event */}
      <button className="w-full py-4 rounded-2xl font-bold text-base cursor-pointer border-none transition-all duration-200 hover:brightness-110 active:scale-[0.99] min-h-[52px] mb-4"
        style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)', color:'#080810' }}>
        🎊 Book Your Next Event →
      </button>
    </div>
  );
}
