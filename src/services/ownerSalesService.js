import axios from "axios";

const API = "http://localhost:5000/api/owner-sales";

export const getOwnerSales = async (franchiseId, month = "") => {
  console.log("📤 Fetching owner sales for franchiseId:", franchiseId);
  try {
    const params = month ? { month } : {};
    const res = await axios.get(`${API}/${franchiseId}`, { params });
    console.log("📥 API Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }
};
