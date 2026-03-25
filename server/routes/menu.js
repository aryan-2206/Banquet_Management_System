const express = require('express');
const router = express.Router();

// Menu items by tier (matches the client's MENUS constant)
const MENUS = {
  Standard: {
    price: 850,
    items: [
      { cat: 'Welcome Drinks', dishes: ['Fresh Lime Soda', 'Masala Chaas', 'Seasonal Juice'] },
      { cat: 'Starters', dishes: ['Veg Seekh Kebab', 'Paneer Tikka', 'Crispy Corn'] },
      { cat: 'Main Course', dishes: ['Dal Makhani', 'Paneer Butter Masala', 'Veg Pulao', 'Roti Basket'] },
      { cat: 'Desserts', dishes: ['Gulab Jamun', 'Ice Cream (2 scoops)'] },
    ],
  },
  Premium: {
    price: 1400,
    items: [
      { cat: 'Welcome Drinks', dishes: ['Mocktail Station', 'Fresh Juices (4 types)', 'Welcome Shot'] },
      { cat: 'Starters (Veg)', dishes: ['Hara Bhara Kebab', 'Stuffed Mushroom', 'Dahi Ke Sholay'] },
      { cat: 'Starters (Non-Veg)', dishes: ['Chicken Tikka', 'Seekh Kebab', 'Fish Amritsari'] },
      { cat: 'Main Course', dishes: ['Dal Tadka', 'Paneer Lababdar', 'Chicken Curry', 'Biryani', 'Breads'] },
      { cat: 'Live Counters', dishes: ['Chaat Counter', 'Dosa Counter'] },
      { cat: 'Desserts', dishes: ['Gulab Jamun', 'Rabri', 'Ice Cream Sundae', 'Seasonal Sweets'] },
    ],
  },
  Elite: {
    price: 2200,
    items: [
      { cat: 'Welcome Drinks', dishes: ['Signature Mocktail Bar', 'Fresh Juices (8 types)', 'Champagne Toast (non-alc)', 'Cold Press'] },
      { cat: 'Starters (Veg)', dishes: ['Truffle Mushroom Bruschetta', 'Galouti Kebab', 'Paneer Achari Tikka', 'Dahi ke Kebab'] },
      { cat: 'Starters (Non-Veg)', dishes: ['Chicken Malai Tikka', 'Mutton Seekh', 'Prawn Lollipop', 'Tandoori Raan'] },
      { cat: 'Main Course', dishes: ['Dal Bukhara', 'Paneer Shahi', 'Butter Chicken', 'Mutton Rogan Josh', 'Hyderabadi Biryani', 'Peshwari Naan'] },
      { cat: 'Live Counters', dishes: ['Pasta Counter', 'Carving Station', 'Chaat & Pani Puri', 'Sushi Counter'] },
      { cat: 'Desserts', dishes: ['Gelato Bar', 'Phirni', 'Gulab Jamun', 'Tiramisu', 'Seasonal Mithai', 'Chocolate Fountain'] },
    ],
  },
};

const ADDONS = [
  { id: 'welcome_drink_upgrade', label: 'Welcome Drink Upgrade', price: 120, icon: '🥂' },
  { id: 'live_pasta', label: 'Live Pasta Counter', price: 200, icon: '🍝' },
  { id: 'premium_dessert', label: 'Premium Dessert Station', price: 280, icon: '🎂' },
  { id: 'midnight_snack', label: 'Midnight Snack Package', price: 150, icon: '🌙' },
  { id: 'mocktail_bar', label: 'Extended Mocktail Bar', price: 180, icon: '🍹' },
  { id: 'kids_menu', label: "Children's Menu", price: 400, icon: '👶' },
];

router.get('/tiers', (req, res) => {
  res.json({ success: true, menus: MENUS, addons: ADDONS });
});

module.exports = router;
