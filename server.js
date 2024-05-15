const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bookRoutes = require("./bookRoutes");
const userRoutes = require("./userRoutes");
const logger = require("./logger/loggerService");

mongoose.connect(
    "mongodb+srv://maxim526:gpbKgEcB3Bhuc9xR@book-store-ariela.vy7rgqw.mongodb.net/BookStore",
    { useNewUrlParser: true, useUnifiedTopology: true }
)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 3001;


app.use(logger);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization'
}));

app.use("/book", bookRoutes);
app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
