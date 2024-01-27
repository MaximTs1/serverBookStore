const express = require("express");
const router = express.Router();
const Book = require("./models/Book");
const Counter = require("./models/Counter");
const Target = require("./models/Target");
const Manager = require("./models/Manager");

// GET all books
router.get("/get-books", async (req, res) => {
  try {
    const books = await Book.find({}); // Find all books
    res.status(200).send(books); // Send the array of books as response
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).send("Error retrieving books");
  }
});

// ADD a single book
router.post("/add-book", async (req, res) => {
  try {
    const countDocument = await Counter.findByIdAndUpdate(
      { _id: "bookId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const book = new Book({
      customId: countDocument.seq,
      name: req.body.name,
      author: req.body.author,
      category: req.body.category,
      price: req.body.price,
      image: req.body.image,
      condition: req.body.condition,
      book_parts: req.body.book_parts,
      stock: req.body.stock,
      hand: req.body.hand,
      publishing_year: req.body.publishing_year,
      translation: req.body.translation,
      publisher: req.body.publisher,
      description: req.body.description,
    });

    await book.save();
    res
      .status(201)
      .send({ message: "Book added successfully", bookId: book.customId });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).send("Error registering book");
  }
});

router.get("/book-by-custom-id/:customId", async (req, res) => {
  try {
    const customId = req.params.customId;
    const book = await Book.findOne({ customId: customId });
    if (book) {
      res.json(book);
    } else {
      res.status(404).send("Book with the specified customId not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/update-book/:customId", async (req, res) => {
  try {
    const { customId } = req.params;
    const updatedData = req.body;

    const updatedBook = await Book.findOneAndUpdate({ customId }, updatedData, {
      new: true, // Return the updated document
    });

    if (!updatedBook) {
      return res.status(404).send("Book not found");
    }

    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating book");
  }
});

router.delete("/delete-book/:customId", async (req, res) => {
  try {
    const { customId } = req.params;
    const deletedBook = await Book.findOneAndDelete({ customId });

    if (!deletedBook) {
      return res.status(404).send("Book not found");
    }

    res.status(200).send({ message: "Book successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting book");
  }
});

router.post("/login-manager", async (req, res) => {
  const { email, password } = req.body;
  const manager = await Manager.findOne({ email: email });

  if (manager && manager.password === password) {
    // Login successful
    res.send("Login successful");
  } else {
    // Invalid credentials
    res.status(401).send("Invalid login credentials");
  }
});

router.post("/update-stock", async (req, res) => {
  try {
    const purchasedItems = req.body;

    // Update stock for each purchased item
    await Promise.all(
      purchasedItems.map((item) => {
        return Book.findOneAndUpdate(
          { customId: item.customId },
          { $inc: { stock: -item.amount } },
          { new: true }
        );
      })
    );

    res.status(200).send("Stock updated successfully");
  } catch (error) {
    console.error("Error updating stock: ", error);
    res.status(500).send("Error updating stock");
  }
});

module.exports = router;
