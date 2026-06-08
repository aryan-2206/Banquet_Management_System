const axios = require('axios');

const FEATHERLESS_BASE = 'https://api.featherless.ai/v1';
const MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

/**
 * Core completion function — calls Featherless OpenAI-compatible chat API
 */
async function complete(prompt, maxTokens = 512) {
  const key = process.env.FEATHERLESS_API_KEY;
  if (!key) {
    console.warn('[Featherless] FEATHERLESS_API_KEY not set – returning stub response');
    return { text: null, stub: true };
  }

  try {
    const res = await axios.post(
      `${FEATHERLESS_BASE}/chat/completions`,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    const text = res.data?.choices?.[0]?.message?.content?.trim() || '';
    return { text, stub: false };
  } catch (err) {
    console.error('[Featherless] API error:', err.response?.data || err.message);
    return { text: null, stub: false, error: err.message };
  }
}

/**
 * generateMenuSuggestions
 * Looks at past events of the same type and returns AI-curated menu recommendations.
 *
 * @param {Object} options
 * @param {String}  options.eventType  e.g. 'wedding', 'corporate', 'birthday'
 * @param {Number}  options.pax        Expected guest count
 * @param {Array}   options.pastOrders Array of { dishName, count } from recent similar events
 * @param {String}  options.tier       'Standard' | 'Premium' | 'Elite'
 * @returns {Object} { suggestions: [...], raw: string }
 */
async function generateMenuSuggestions({ eventType = 'wedding', pax = 100, pastOrders = [], tier = 'Premium' }) {
  const topDishes = pastOrders
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(d => `${d.dishName} (ordered ${d.count}x)`)
    .join(', ');

  const prompt = `You are a professional banquet menu consultant for Indian events.

Event Details:
- Type: ${eventType}
- Guest Count: ${pax}
- Menu Tier: ${tier}
- Popular dishes from similar past events: ${topDishes || 'No historical data yet'}

Based on this context, suggest a balanced menu with:
1. 3 Starters (Veg + Non-Veg)
2. 2 Main Course items (Veg)
3. 2 Main Course items (Non-Veg)
4. 1 Rice/Biryani dish
5. 2 Breads
6. 2 Desserts
7. 1 Special Recommendation based on event type

Format each item as: CATEGORY | DISH NAME | BRIEF NOTE
Keep it concise. Focus on Indian cuisine appropriate for the event type.`;

  const { text, stub, error } = await complete(prompt, 600);

  if (stub) {
    // Return sensible fallback when no API key
    return {
      suggestions: getDefaultSuggestions(eventType, tier),
      source: 'default',
    };
  }
  if (!text) {
    return { suggestions: getDefaultSuggestions(eventType, tier), source: 'default', error };
  }

  // Parse the AI response into structured suggestions
  const lines = text.split('\n').filter(l => l.includes('|'));
  const suggestions = lines.map(line => {
    const [category, dish, note] = line.split('|').map(s => s.trim());
    return { category: category || 'General', dish: dish || line.trim(), note: note || '' };
  }).filter(s => s.dish);

  return {
    suggestions: suggestions.length > 0 ? suggestions : getDefaultSuggestions(eventType, tier),
    source: 'ai',
    raw: text,
  };
}

/**
 * generatePostEventSummary
 * Creates an executive post-event audit report for admin review.
 */
async function generatePostEventSummary({ booking, wasteLog, checkedInCount }) {
  const eventType = booking?.eventDetails?.eventType || 'event';
  const pax = booking?.eventDetails?.guests || 0;
  const venue = booking?.eventDetails?.venue?.replace(/-/g, ' ') || 'venue';
  const totalWaste = wasteLog?.reduce((s, w) => s + (w.wastedKg || 0), 0) || 0;

  const prompt = `You are a banquet operations analyst. Write a brief executive post-event summary.

Event: ${eventType} at ${venue}
Expected Guests: ${pax} | Actual Checked-in: ${checkedInCount}
Food Waste: ${totalWaste.toFixed(1)} kg total
Key waste items: ${wasteLog?.map(w => `${w.dishName}: ${w.wastedKg}kg`).join(', ') || 'No data'}

Write a 3-paragraph executive summary covering:
1. Attendance performance and insights
2. Food waste analysis and cost impact  
3. 2-3 specific recommendations for future events of this type

Be concise, professional, and data-driven.`;

  const { text, stub, error } = await complete(prompt, 400);

  if (stub || !text) {
    return {
      summary: `Post-event analysis for ${eventType}: ${checkedInCount} of ${pax} guests attended (${Math.round((checkedInCount / Math.max(pax, 1)) * 100)}% turnout). Food waste recorded at ${totalWaste.toFixed(1)} kg.`,
      source: stub ? 'default' : 'default',
    };
  }

  return { summary: text, source: 'ai' };
}

/**
 * Fallback menu suggestions when AI is unavailable
 */
function getDefaultSuggestions(eventType, tier) {
  const base = [
    { category: 'Starter (Veg)', dish: 'Paneer Tikka', note: 'Classic crowd-pleaser for Indian events' },
    { category: 'Starter (Veg)', dish: 'Hara Bhara Kabab', note: 'Healthy green starter' },
    { category: 'Starter (Non-Veg)', dish: 'Chicken Seekh Kebab', note: 'Tandoor-grilled, high demand' },
    { category: 'Main Course (Veg)', dish: 'Dal Makhani', note: 'Always popular across all tiers' },
    { category: 'Main Course (Veg)', dish: 'Paneer Butter Masala', note: 'Recommended for weddings' },
    { category: 'Main Course (Non-Veg)', dish: 'Butter Chicken', note: 'Top-ordered dish across events' },
    { category: 'Main Course (Non-Veg)', dish: 'Mutton Rogan Josh', note: 'Premium tier recommendation' },
    { category: 'Rice', dish: 'Dum Biryani (Veg)', note: 'Adjust portions for actual pax' },
    { category: 'Bread', dish: 'Butter Naan + Tandoori Roti', note: 'Standard 2-piece combo' },
    { category: 'Dessert', dish: 'Gulab Jamun', note: 'Most popular Indian dessert' },
    { category: 'Dessert', dish: 'Rasmalai', note: 'Premium choice for weddings' },
  ];
  if (tier === 'Elite') {
    base.push({ category: 'Special', dish: 'Lobster Thermidor', note: 'Elite tier signature' });
  }
  return base;
}

module.exports = { generateMenuSuggestions, generatePostEventSummary };
