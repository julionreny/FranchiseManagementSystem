import axios from "axios";

const API = "http://localhost:5000/api/owner-inventory";

export const getOwnerInventory = async (franchiseId) => {
  console.log("📤 Fetching owner inventory for franchiseId:", franchiseId);
  try {
    const res = await axios.get(`${API}/${franchiseId}`);
    console.log("📥 API Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }
};
