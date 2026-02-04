const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const branchRoutes = require("./routes/branchRoutes");
const franchiseRoutes = require("./routes/franchiseRoutes");

const app = express();

/* ✅ CORS MUST COME FIRST */
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);



app.use("/api/franchises", franchiseRoutes);


/* ✅ Body parser */
app.use(express.json());

/* ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);

/* ✅ Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

