const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;
