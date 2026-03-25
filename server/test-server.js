require('dotenv').config();
const express = require('express');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test server is running' });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
