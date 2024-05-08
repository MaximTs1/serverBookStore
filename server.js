const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bookRoutes = require("./bookRoutes");
const userRoutes = require("./userRoutes");
const rateLimit = require("express-rate-limit");
const logger = require("./logger/loggerService");

mongoose
  .connect(
    "mongodb+srv://maxim526:gpbKgEcB3Bhuc9xR@book-store-ariela.vy7rgqw.mongodb.net/"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const port = process.env.PORT || 3001;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(logger);

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors({
    origin: true,
    credentials: true,
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization'
}));

app.use("/book", apiLimiter, bookRoutes);
app.use("/user", apiLimiter, userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
