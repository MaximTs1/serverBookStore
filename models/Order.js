const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderInfo: {
    timePlaced: Date,
    orderNumber: String,
    total: Number,
    status: String, // e.g., 'Completed', 'Canceled', 'Refunded', 'In Process'
  },
  deliveryInfo: {
    status: String, // e.g., 'In Process', 'shipped', 'Delivered'
    trackingDetails: {
      shippingService: String,
      trackingNumber: String,
    },
  },
  itemInfo: {
    title: String,
    price: Number,
    imageUrl: String,
  },
  shippingAddress: {
    fullName: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    zip: String,
    other: String,
  },
  paymentInfo: {
    method: String,
    email: String,
    amountCharged: Number,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
