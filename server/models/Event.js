// server/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: String,
  attachments: [{ type: String }], // URLs to attached files
});

module.exports = mongoose.model('Event', EventSchema);