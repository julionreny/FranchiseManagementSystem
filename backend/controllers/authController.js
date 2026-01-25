const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../utils/emailService");
const generateOtp = require("../utils/otp");

exports.sendOwnerOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60000); // 5 min

    await pool.query(
      "INSERT INTO otp_verification (email, otp_code, expiry_time) VALUES ($1,$2,$3)",
      [email, otp, expiry]
    );

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: "OTP sending failed" });
  }
};


/*2*/
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const result = await pool.query(
    "SELECT * FROM otp_verification WHERE email=$1 AND otp_code=$2 AND expiry_time > NOW()",
    [email, otp]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ error: "Invalid or expired OTP" });

  await pool.query(
    "UPDATE otp_verification SET is_verified=TRUE WHERE email=$1",
    [email]
  );

  res.json({ message: "OTP verified" });
};


/*3*/
exports.registerOwner = async (req, res) => {
  console.log("REGISTER OWNER HIT");
  console.log("BODY:", req.body);

  const {
    name,
    email,
    password,
    franchise_name,
    location,
    contact_email,
    description
  } = req.body;

  try {
    console.log("STEP 1: CHECK OTP");

    const otpCheck = await pool.query(
      "SELECT * FROM otp_verification WHERE email=$1 AND is_verified=TRUE",
      [email]
    );

    console.log("OTP RESULT:", otpCheck.rows);

    if (otpCheck.rows.length === 0) {
      return res.status(403).json({ error: "OTP not verified" });
    }

    console.log("STEP 2: HASH PASSWORD");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("STEP 3: INSERT USER");
    const userRes = await pool.query(
      `INSERT INTO users (name, email, password, role_id, status, created_at)
       VALUES ($1, $2, $3, 1, 'ACTIVE', NOW())
       RETURNING user_id`,
      [name, email, hashedPassword]
    );

    console.log("USER INSERTED:", userRes.rows);

    console.log("STEP 4: INSERT FRANCHISE");
    await pool.query(
  `INSERT INTO franchises 
   (franchise_name, owner_id, location, contact_email, description, registration_date, status)
   VALUES ($1, $2, $3, $4, $5, NOW(), 'ACTIVE')`,
  [
    franchise_name,
    userRes.rows[0].user_id,
    location,
    contact_email,
    description
  ]
);


    console.log("FRANCHISE CREATED");

    res.status(201).json({ message: "Franchise Owner Registered" });

  } catch (err) {
    console.error("REGISTER OWNER FAILED ❌");
    console.error(err); // THIS IS CRITICAL
    res.status(500).json({ error: err.message });
  }
};

/*4*/

exports.registerManager = async (req, res) => {
  const { name, email, password, invite_code } = req.body;

  const branch = await pool.query(
    "SELECT * FROM branches WHERE manager_invite_code=$1 AND is_code_used=FALSE",
    [invite_code]
  );

  if (branch.rows.length === 0)
    return res.status(400).json({ error: "Invalid invite code" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const userRes = await pool.query(
    "INSERT INTO users (name,email,password,role_id,branch_id) VALUES ($1,$2,$3,2,$4) RETURNING user_id",
    [name, email, hashedPassword, branch.rows[0].branch_id]
  );

  await pool.query(
    "UPDATE branches SET manager_id=$1, is_code_used=TRUE WHERE branch_id=$2",
    [userRes.rows[0].user_id, branch.rows[0].branch_id]
  );

  res.status(201).json({ message: "Branch Manager Registered" });
};




exports.loginUser = async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const { password } = req.body;

  try {
    const userRes = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        branch_id: user.branch_id
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};
