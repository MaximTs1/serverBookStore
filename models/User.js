const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  amount: Number,
  price: Number,
});

const dliveryInfo = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  postalCode: Number,
  paymentMethod: String,
});

// Schema for an order in the order history
const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: false},
  cart: [cartItemSchema],
  date: Date,
  orderStatus: String,
  info: dliveryInfo,
});

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    customId: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true },
    zip: { type: Number, required: true },
    likedBooks: [String],
    orderHistory: [orderSchema],
  },
  { collection: "users" }
);

// Create a model based on the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
