import axios from "axios";

const API =
"http://localhost:5000/api/dashboard";


export const getSummary =
(branchId) =>
axios.get(`${API}/summary/${branchId}`);


export const getSalesChart =
(branchId) =>
axios.get(`${API}/sales-chart/${branchId}`);


export const getExpenseChart =
(branchId) =>
axios.get(`${API}/expense-chart/${branchId}`);
