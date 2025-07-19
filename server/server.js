// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Order = require('./models/order');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// POST /order – קבלת הזמנה
app.post('/order', async (req, res) => {
  const { name, email, phone, quantity, deliveryType, address, totalPrice } = req.body;

  // בדיקת שדות חובה
  if (!name || !phone || !quantity || !deliveryType || typeof totalPrice !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (deliveryType === 'delivery' && !address) {
    return res.status(400).json({ error: 'Address is required for delivery' });
  }

  try {
    const newOrder = new Order({
      name,
      email,
      phone,
      quantity,
      deliveryType,
      address,
      totalPrice
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// GET /orders – קבלת כל ההזמנות
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
