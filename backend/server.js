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
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

/* ✅ CORS */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ✅ BODY PARSER */
app.use(express.json());

/* ✅ ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/franchises", franchiseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes); // ⭐ IMPORTANT
app.use("/api/sales", salesRoutes);
app.use("/api/notifications", notificationRoutes);

/* ✅ SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
