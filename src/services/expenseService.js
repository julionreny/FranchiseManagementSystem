import axios from "axios";

const API_URL = "http://localhost:5000/api/expenses";

/* ===============================
   ✅ Get expenses by branch
   (optionally month-wise)
   =============================== */
export const getExpensesByBranch = async (branchId, month = "") => {
  const response = await axios.get(`${API_URL}/${branchId}`, {
    params: { month } // YYYY-MM
  });
  return response.data;
};

/* ===============================
   ✅ Add new expense
   =============================== */
export const addExpense = async (expenseData) => {
  const response = await axios.post(API_URL, expenseData);
  return response.data;
};
