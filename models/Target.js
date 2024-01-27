const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  goal: Number,
  isCompleted: Boolean,
});

const Target = mongoose.model("Target", targetSchema);

module.exports = Target;
