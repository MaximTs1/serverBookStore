const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authGuard = require("../auth/auth-guard");
const { JWT_SECRET, JWT_FORGOT_PASSWORD, getUserId } = require("../config");
const Counter = require("../models/Counter");
// const transporter = require("./utils/Email Services/emailService");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("../scratch");
const { loginSchema } = require("../utils/Joi/JoiValidation");

router.get("/login", authGuard, async (req, res) => {
  const _id = getUserId(req, res);

  try {
    const LoggedUser = await User.findOne({ _id });

    if (!LoggedUser) {
      return res.status(403).send("username or password is incorrect");
    }

    delete LoggedUser.password;
    delete LoggedUser.email;

    res.send(LoggedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/signup", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(409)
        .send("Email already taken, please try another email");
    }

    const countDocument = await Counter.findByIdAndUpdate(
      { _id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const user = new User({
      customId: countDocument.seq,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      city: req.body.city,
      street: req.body.street,
      houseNumber: req.body.houseNumber,
      zip: req.body.zip,
      likedBooks: [],
      orderHistory: [],
    });

    await user.save();
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(403).send("username or password is incorrect");
  }

  const schema = loginSchema.validate(req.body, { allowUnknown: true });

  if (schema.error) {
    return res.status(409).send(schema.error.details[0].message);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(403).send("username or password is incorrect");
  }

  const userResult = user.toObject();

  delete userResult.password;
  // delete userResult.email;

  userResult.token = jwt.sign({ id: userResult._id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.send(userResult);
});

router.get("/logout", authGuard, async (req, res) => {});

router.put("/get-user-info/:customId", authGuard, async (req, res) => {
  try {
    const { customId } = req.params;
    const {
      firstName,
      lastName,
      phone,
      email,
      city,
      street,
      houseNumber,
      zip,
    } = req.body;

    const user = await User.findOne({ customId });

    if (!user) {
      return res.status(404).send("User not found!");
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.email = email;
    user.city = city;
    user.street = street;
    user.houseNumber = houseNumber;
    user.zip = zip;

    const resultUser = await user.save();
    delete resultUser.password;
    res.send(resultUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-likedBooks/:customId", authGuard, async (req, res) => {
  try {
    const { customId } = req.params;
    const { likedBooks } = req.body;

    const user = await User.findOne({ customId });
    if (!user) {
      return res.status(404).send("User not found!");
    }

    user.likedBooks = likedBooks;
    await user.save();

    const updatedUserInfo = { likedBooks: user.likedBooks };
    res.json(updatedUserInfo);
  } catch (error) {
    console.error("Error in update-likedBooks route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-favorite-books/:customId", authGuard, async (req, res) => {
  try {
    const customId = req.params.customId;
    const user = await User.findOne({ customId: customId });
    if (user) {
      res.json(user.likedBooks);
    } else {
      res.status(404).send("User with the specified customId not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.put("/update-order-history/:customId", authGuard, async (req, res) => {
  const countDocument = await Counter.findByIdAndUpdate(
    { _id: "orderId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  try {
    const { customId } = req.params;
    const { cart, date, orderStatus, info } = req.body;

    const user = await User.findOne({ customId });
    if (!user) {
      return res.status(404).send("User not found!");
    }

    user.orderHistory.push({
      orderId: countDocument.seq,
      cart,
      date,
      orderStatus,
      info,
    });

    await user.save();

    const updatedUserInfo = { orderHistory: user.orderHistory };
    res.json(updatedUserInfo);
  } catch (error) {
    console.error("Error in update-order-history route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/order-history/:customId", authGuard, async (req, res) => {
  try {
    const { customId } = req.params;
    const user = await User.findOne({ customId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json(user.orderHistory);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.put("/update-password", async (req, res) => {
  const { email, password, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).send("Email not found");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(403).send("Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;

    // Save the updated user in the database
    await user.save();

    res.send("Password updated successfully");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Internal server error");
  }
});

// router.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   // 1. Check if user exists
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.send(
//       "If your email is registered, you will receive a password reset link."
//     );
//   }

//   // 2. Create a reset token (pseudo code)
//   const token = jwt.sign({ id: user._id }, JWT_FORGOT_PASSWORD, {
//     expiresIn: "1h",
//   });

//   // Store the token in localStorage
//   localStorage.setItem("authToken", token);

//   // Use the transporter to send an email
//   const resetUrl = `http://localhost:3001/changepasswordlandingpage?token=${token}`;

//   const mailOptions = {
//     from: "ariellabooks123@hotmail.com",
//     to: user.email,
//     subject: "Password Reset",
//     html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.send("Password reset link has been sent to your email.");
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).send("Error in sending password reset link");
//   }
// });

router.post("/reset-password", async (req, res) => {
  const { token, resetPassword } = req.body;

  if (!token || !resetPassword) {
    return res.status(400).send("Token and new password are required.");
  }

  try {
    const decoded = jwt.verify(token, JWT_FORGOT_PASSWORD);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const storedToken = localStorage.getItem("authToken");

    if (storedToken !== token) {
      return res.status(400).send("Token is invalid.");
    }

    if (user.tokenExpiration < Date.now()) {
      return res.status(400).send("Token has expired.");
    }

    user.password = await bcrypt.hash(resetPassword, 10);
    user.token = undefined;
    user.tokenExpiration = undefined;
    await user.save();

    return res.send("Password has been successfully reset.");
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).send("Error resetting password.");
  }
});

module.exports = router;
