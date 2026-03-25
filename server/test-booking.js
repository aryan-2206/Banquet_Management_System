const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());

// Simple booking route for testing
app.post('/api/bookings', (req, res) => {
  console.log('Received booking request:', req.body);
  res.json({ 
    success: true, 
    message: 'Booking created successfully',
    data: { 
      id: 'test-123',
      ...req.body 
    }
  });
});

app.get('/api/bookings', (req, res) => {
  res.json({ 
    success: true, 
    data: [],
    message: 'Bookings retrieved successfully'
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test booking server running on port ${PORT}`);
});
