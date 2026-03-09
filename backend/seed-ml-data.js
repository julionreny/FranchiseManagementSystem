const db = require("./config/db");

async function seedMLData() {
  try {
    console.log("Starting ML Data Seed...");

    // 1. Get a franchise
    const franchiseRes = await db.query("SELECT franchise_id FROM franchises LIMIT 1");
    if (franchiseRes.rows.length === 0) {
      console.error("No franchises found. Please run the initial setup first.");
      process.exit(1);
    }
    const franchiseId = franchiseRes.rows[0].franchise_id;

    // 2. Get branches for this franchise
    const branchesRes = await db.query("SELECT branch_id FROM branches WHERE franchise_id = $1", [franchiseId]);
    if (branchesRes.rows.length === 0) {
      console.error("No branches found for this franchise.");
      process.exit(1);
    }
    const branchIds = branchesRes.rows.map(r => r.branch_id);

    console.log(`Seeding data for Franchise ID: ${franchiseId} and Branches: ${branchIds.join(", ")}`);

    // 3. Clear existing sales (optional, but good for clean training)
    // await db.query("DELETE FROM sales WHERE branch_id = ANY($1)", [branchIds]);

    // 4. Generate 90 days of sales data with a trend
    // Trend: Increasing by roughly 100 per day, starting at 5000
    // Variation: +/- 20% noise
    const today = new Date();
    let totalInserted = 0;

    for (let i = 90; i >= 0; i--) {
      const saleDate = new Date();
      saleDate.setDate(today.getDate() - i);
      const dateString = saleDate.toISOString().split('T')[0];

      // Base amount for the day across all branches
      const baseAmount = 5000 + (90 - i) * 150; 

      for (const branchId of branchIds) {
        // Randomize count and individual amounts
        const numSales = 5 + Math.floor(Math.random() * 10);
        for (let s = 0; s < numSales; s++) {
          const amount = (baseAmount / numSales) * (0.8 + Math.random() * 0.4);
          
          await db.query(
            `INSERT INTO sales (branch_id, receipt_no, product_name, customer_name, amount, payment_method, sale_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              branchId,
              `SEED-${branchId}-${i}-${s}`,
              "Automated Product",
              "Sample Customer",
              amount.toFixed(2),
              Math.random() > 0.5 ? "UPI" : "Card",
              dateString
            ]
          );
          totalInserted++;
        }
      }
    }

    console.log(`Successfully seeded ${totalInserted} sales records over 90 days.`);
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seedMLData();
