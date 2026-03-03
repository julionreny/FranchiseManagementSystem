import axios from "axios";

const API = "http://localhost:5000/api/employees";

export const getEmployees = (branchId) =>
  axios.get(`${API}/${branchId}`);

export const getEmployeesByFranchise = async (franchiseId) => {
  console.log("📤 Fetching employees for franchiseId:", franchiseId);
  try {
    const res = await axios.get(`${API}/franchise/${franchiseId}`);
    console.log("📥 Employees API Response:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }
};

export const addEmployee = (data) =>
  axios.post(`${API}/add`, data);

export const deleteEmployee = (id) =>
  axios.delete(`${API}/${id}`);

export const removeEmployee = (id) =>
  axios.delete(`${API}/${id}`);

