const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const router = express.Router();

router.post("/signup", async (req, res, next) => {
  const { email, password, name } = req.body;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const authToken = jwt.sign({ email }, secretKey, {
      algorithm: "HS256",
      issuer: "Ulysse&Yassine",
      expiresIn: "7d",
    });

    res.json({ authToken });
  } catch (error) {
    next(error);
  }
});

router.get("/verify", (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    res.status(200).json({ message: "Token is valid", user: decoded });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
