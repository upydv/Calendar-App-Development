// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

//dotenv.config();
dotenv.config({ path: '../.env' })
const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
app.use(cors());
app.use(express.json());
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});