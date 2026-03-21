const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");

const router = express.Router();


/* ⭐ PREDICT DEMAND */

router.post("/predict-demand", async (req, res) => {
  try {

    const {
      total_sales,
      month,
      day_of_week,
      lag_1,
      lag_3,
      lag_7,
      product,
      branch_id
    } = req.body;

    const mlInput = {
      total_sales,
      month,
      day_of_week,
      lag_1,
      lag_3,
      lag_7
    };

    mlInput[`product_name_${product.toLowerCase()}`] = 1;
    mlInput[`branch_id_${branch_id}`] = 1;

    const response = await axios.post(
      "http://127.0.0.1:5001/predict-demand",
      mlInput
    );

    res.json(response.data);

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "ML prediction failed" });
  }
});


/* ⭐ RETRAIN MODEL */

router.post("/retrain-model", (req, res) => {

  exec("python ../ml/train_from_db.py", (error, stdout, stderr) => {

    if (error) {
      console.log(error);
      return res.status(500).json({
        error: "Model retraining failed"
      });
    }

    res.json({
      message: "Model retrained successfully",
      output: stdout
    });

  });

});


module.exports = router;