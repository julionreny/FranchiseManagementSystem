exports.getExpensesByBranch = async (req, res) => {
  const { branchId } = req.params;
  const { month } = req.query; // YYYY-MM

  try {
    let query = `
      SELECT * FROM expenses
      WHERE branch_id = $1
    `;
    let values = [branchId];

    if (month) {
      const [year, mon] = month.split("-");
      query += `
        AND EXTRACT(YEAR FROM expense_date) = $2
        AND EXTRACT(MONTH FROM expense_date) = $3
      `;
      values.push(year, mon);
    }

    query += " ORDER BY expense_date DESC";

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Expense fetch error:", error);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};
