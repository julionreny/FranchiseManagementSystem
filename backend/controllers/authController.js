const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpEmail, sendResetTokenEmail } = require("../utils/emailService");
const generateOtp = require("../utils/otp");

/* =========================
   OWNER OTP
========================= */
exports.sendOwnerOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60000);

    await pool.query(
      "INSERT INTO otp_verification (email, otp_code, expiry_time) VALUES ($1,$2,$3)",
      [email, otp, expiry]
    );

    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr) {
      console.warn("⚠️ Mailer failed, but proceeding for test/dev:", mailErr.message);
    }
    
    res.json({ message: "OTP sent to owner email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP sending failed" });
  }
};

/* =========================
   COMMON OTP VERIFY
========================= */
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
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

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

/* =========================
   OWNER REGISTRATION
========================= */
exports.registerOwner = async (req, res) => {
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
    // Check OTP
    const otpCheck = await pool.query(
      "SELECT * FROM otp_verification WHERE email=$1 AND is_verified=TRUE",
      [email]
    );

    if (otpCheck.rows.length === 0)
      return res.status(403).json({ error: "OTP not verified" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (Owner role_id = 1)
    const userRes = await pool.query(
      `INSERT INTO users (name,email,password,role_id,status,created_at)
       VALUES ($1,$2,$3,1,'ACTIVE',NOW())
       RETURNING user_id`,
      [name, email, hashedPassword]
    );

    // Create franchise
    await pool.query(
      `INSERT INTO franchises
       (franchise_name, owner_id, location, contact_email, description, registration_date, status)
       VALUES ($1,$2,$3,$4,$5,NOW(),'ACTIVE')`,
      [
        franchise_name,
        userRes.rows[0].user_id,
        location,
        contact_email,
        description
      ]
    );

    res.status(201).json({ message: "Franchise Owner Registered Successfully" });
  } catch (err) {
    console.error("OWNER REGISTER ERROR:", err);
    res.status(500).json({ error: "Owner registration failed" });
  }
};

/* =========================
   MANAGER OTP
========================= */
exports.sendManagerOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60000);

    await pool.query(
      "INSERT INTO otp_verification (email, otp_code, expiry_time) VALUES ($1,$2,$3)",
      [email, otp, expiry]
    );

    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr) {
      console.warn("⚠️ Mailer failed, but proceeding for test/dev:", mailErr.message);
    }

    res.json({ message: "OTP sent to manager email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

/* =========================
   MANAGER REGISTRATION
========================= */
exports.registerManager = async (req, res) => {
  const { name, email, password, invite_code } = req.body;

  try {
    // Verify OTP
    const otpCheck = await pool.query(
      "SELECT * FROM otp_verification WHERE email=$1 AND is_verified=TRUE",
      [email]
    );

    if (otpCheck.rows.length === 0)
      return res.status(403).json({ error: "OTP not verified" });

    // Validate invite code
    const branchRes = await pool.query(
      "SELECT * FROM branches WHERE manager_invite_code=$1 AND is_code_used=FALSE",
      [invite_code]
    );

    if (branchRes.rows.length === 0)
      return res.status(400).json({ error: "Invalid invite code" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create manager user (role_id = 2)
    const userRes = await pool.query(
      `INSERT INTO users (name,email,password,role_id,branch_id,status,created_at)
       VALUES ($1,$2,$3,2,$4,'ACTIVE',NOW())
       RETURNING user_id`,
      [name, email, hashedPassword, branchRes.rows[0].branch_id]
    );

    // Update branch
    await pool.query(
      "UPDATE branches SET manager_id=$1, is_code_used=TRUE WHERE branch_id=$2",
      [userRes.rows[0].user_id, branchRes.rows[0].branch_id]
    );
    // 🔔 Notify Franchise Owner that Manager Registered
    await pool.query(
`
INSERT INTO notifications
(branch_id, role_id, message, type)
VALUES ($1, $2, $3, $4)
`,
[
 branchRes.rows[0].branch_id,
 1,   // ✅ Franchise Owner
 `📢 New Branch Manager "${name}" has registered for branch "${branchRes.rows[0].branch_name}"`,
 "MANAGER_REGISTERED"
]
);

    // Notify owner (role_id = 1) about new manager
    await pool.query(
      `INSERT INTO notifications (branch_id, role_id, message, type)
       VALUES ($1, 1, $2, 'SUCCESS')`,
      [branchRes.rows[0].branch_id, `Manager ${name} has registered for branch "${branchRes.rows[0].branch_name}".`]
    );

    res.json({ message: "Branch Manager Registered Successfully" });
  } catch (err) {
    console.error("MANAGER REGISTER ERROR:", err);
    res.status(500).json({ error: "Manager registration failed" });
  }
};

/* =========================
   LOGIN
========================= */
exports.loginUser = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;
    const userRes = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userRes.rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // For owners, fetch their franchise_id
    let franchise_id = null;
    if (user.role_id === 1) {
      const franchiseRes = await pool.query(
        "SELECT franchise_id FROM franchises WHERE owner_id=$1",
        [user.user_id]
      );

      if (franchiseRes.rows.length > 0) {
        franchise_id = franchiseRes.rows[0].franchise_id;
      }
    }

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        role_id: user.role_id,
        branch_id: user.branch_id,
        franchise_id: franchise_id
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateOtp(); // Reusing the 6-digit generator
    const expiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [token, expiry, email]
    );

    try {
      await sendResetTokenEmail(email, token);
    } catch (mailErr) {
      console.warn("⚠️ Mailer failed, but proceeding for test/dev:", mailErr.message);
    }

    res.json({ message: "Reset token sent to your email" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to process forgot password" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    const userRes = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expiry > NOW()",
      [email, token]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};
