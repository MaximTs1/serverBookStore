const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();


const Manager = require("../models/Manager");
const authGuard = require("../auth/auth-guard");
const { JWT_SECRET } = require("../config");
const Counter = require("../models/Counter");
const User = require("../models/User");


// router.post("/login-manager", async (req, res) => {
//   const { email, password } = req.body;
//   const manager = await Manager.findOne({ email: email });

//   if (manager && manager.password === password) {
//     // Login successful
//     res.send("Login successful");
//   } else {
//     // Invalid credentials
//     res.status(401).send("Invalid login credentials");
//   }
// });

router.post("/login-manager", async (req, res) => {
  const { email, password } = req.body;

  const manager = await Manager.findOne({ email: email });

  if (!manager) {
    return res.status(403).send("username or password is incorrect");
  }


  const passwordMatch = await bcrypt.compare(password, manager.password);
  if (!passwordMatch) {
    return res.status(403).send("username or password is incorrect");
  }

  const managerResult = manager.toObject();

  delete managerResult.password;

  managerResult.token = jwt.sign({ id: managerResult._id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.send(managerResult);
});

router.post("/create-manager", async (req, res) => {
  try {
    console.log("Request received:", req.body);
    const existingManager = await Manager.findOne({ email: req.body.email });
    if (existingManager) {
      console.log("Manager already exists with email:", req.body.email);
      return res
        .status(409)
        .send("Email already taken, please try another email");
    }

    console.log("Creating or updating Counter...");
    const countDocument = await Counter.findByIdAndUpdate(
      { _id: "managerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    console.log("Counter updated:", countDocument);

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("Password hashed successfully");

    const manager = new Manager({
      customId: countDocument.seq,
      email: req.body.email,
      password: hashedPassword,
    });

    console.log("Saving manager...");
    await manager.save();
    res.status(201).json({ message: "Manager created successfully!" });
  } catch (error) {
    console.error("Error in create-manager route:", error);
    res.status(500).send("Error registering manager");
  }
});

router.put("/updateOrderStatus/:orderId", authGuard,  async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const user = await User.findOne({ "orderHistory.orderId": orderId });
    if (user) {
      const order = user.orderHistory.find(
        (o) => o.orderId && o.orderId.toString() === orderId
      );

      if (order) {
        order.orderStatus = status;
        await user.save();
        return res
          .status(200)
          .send({ message: "Order status updated successfully" });
      } else {
        return res.status(404).send({ message: "Order not found" });
      }
    } else {
      return res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/all-users",  async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(200).send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching users");
  }
});


router.get("/orders", authGuard, async (req, res) => {
  try {
    const users = await User.find({});
    const ordersData = users.reduce((acc, user) => {
      if (user.orderHistory && user.orderHistory.length > 0) {
        const userOrders = user.orderHistory.map((order) => ({
          orderId: order.orderId,
          date: order.date,
          status: order.orderStatus,
          cart: order.cart,
          customer: {
            initial: user.firstName[0],
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
        }));
        acc.push(...userOrders);
      }
      return acc;
    }, []);

    res.json(ordersData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


module.exports = router;
