const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  customId: { type: Number, required: true, unique: true },
  name: String,
  author: String,
  category: String,
  price: Number,
  image: String,
  condition: String,
  book_parts: Number,
  stock: Number,
  hand: Number,
  publishing_year: Number,
  translation: String,
  publisher: String,
  description: String,
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
