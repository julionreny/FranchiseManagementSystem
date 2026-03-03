import axios from "axios";

const API = "http://localhost:5000/api/owner-expenses";


export const getOwnerExpenses = async (franchiseId) => {

  console.log("📤 Fetching owner expenses for franchiseId:", franchiseId);

  try {
    const res = await axios.get(`${API}/${franchiseId}`);
    console.log("📥 API Response received:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }

};