import { MENUS } from "../data/menus";

export function detectTierMix(items) {
  const tiers = new Set();

  items.forEach(item => {
    Object.entries(MENUS).forEach(([tier, dishes]) => {
      if (dishes.find(d => d.name === item.name)) {
        tiers.add(tier);
      }
    });
  });

  return Array.from(tiers);
}