const mongoose = require("mongoose");

// Define the Counter schema
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Create a model based on the schema
const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
