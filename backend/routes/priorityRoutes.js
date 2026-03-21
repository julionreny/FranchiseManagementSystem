const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/predict-priority", async (req, res) => {
  try {

    const { text } = req.body;

    const response = await axios.post(
      "http://127.0.0.1:5002/predict-priority",
      { text }
    );

    res.json(response.data);

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Priority prediction failed" });
  }
});

module.exports = router;