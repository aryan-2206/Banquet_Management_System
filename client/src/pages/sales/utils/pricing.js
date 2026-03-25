export function calcDynamicTotal(selectedItems, pax, addons) {
  if (!pax) return { perPlate: 0, subtotal: 0, gst: 0, total: 0 };

  const menuCost = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const addonCost = addons.reduce((sum, a) => sum + a.price, 0);

  const perPlate = menuCost + addonCost;
  const subtotal = perPlate * pax;
  const gst = subtotal * 0.18;

  return {
    perPlate,
    subtotal,
    gst,
    total: subtotal + gst
  };
}