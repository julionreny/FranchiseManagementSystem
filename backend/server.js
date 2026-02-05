const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const branchRoutes = require("./routes/branchRoutes");
const franchiseRoutes = require("./routes/franchiseRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

/* ✅ CORS MUST COME FIRST */
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

/* ✅ Body parser - MUST come before routes */
app.use(express.json());

/* ✅ Routes */
app.use("/api/franchises", franchiseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);

/* ✅ Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


