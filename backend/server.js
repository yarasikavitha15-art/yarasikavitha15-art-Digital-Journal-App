const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// =====================
// Models
// =====================

const UserSchema = new mongoose.Schema({
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

const User = mongoose.model("User", UserSchema);

const JournalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  content: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Journal = mongoose.model("Journal", JournalSchema);

// =====================
// Authentication Middleware
// =====================

function auth(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      message: "Access Denied",
    });
  }

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    req.user = verified;

    next();
  } catch (err) {
    res.status(400).json({
      message: "Invalid Token",
    });
  }
}

// =====================
// Register
// =====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });

    if (exist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration Successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================
// Login
// =====================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================
// Create Journal
// =====================

app.post("/api/journal", auth, async (req, res) => {
  try {
    const journal = new Journal({
      userId: req.user.id,
      title: req.body.title,
      content: req.body.content,
    });

    await journal.save();

    res.status(201).json(journal);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================
// Get Journals
// =====================

app.get("/api/journal", auth, async (req, res) => {
  try {
    const journals = await Journal.find({
      userId: req.user.id,
    }).sort({
      date: -1,
    });

    res.json(journals);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================
// Start Server
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});