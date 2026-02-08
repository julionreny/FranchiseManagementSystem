const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const branchRoutes = require("./routes/branchRoutes");
const franchiseRoutes = require("./routes/franchiseRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const salesRoutes = require("./routes/salesRoutes");

const app = express();






/* ✅ CORS — MUST COME BEFORE ALL ROUTES */
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ✅ Body parser */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ ROUTES (ALL AFTER CORS) */
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

app.use("/api/branches", branchRoutes);
app.use("/api/franchises", franchiseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/employees", employeeRoutes);

/* ✅ SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


app.use("/api/sales", salesRoutes);
