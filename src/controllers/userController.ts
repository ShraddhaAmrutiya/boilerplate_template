import express, { Request, Response } from "express";
import pool from "../config/db"; // Database connection pool
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer"; 
import crypto from "crypto"


// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});




// Create a new user
export const createUser = async (req: Request, res: Response) => {
  const { username, user_email, password, age } = req.body;
  
  try {
    // Check if the username already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if the email already exists
    const emailExists = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [user_email]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database and return the created row
    const result = await pool.query(
      "INSERT INTO users (username, user_email, password, age) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, user_email, hashedPassword, age]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    console.log(err);
    
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, user_email, password, age } = req.body;
  try {
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const result = await pool.query(
      "UPDATE users SET username = $1, user_email = $2, password = $3, age = $4 WHERE id = $5 RETURNING *",
      [username, user_email, hashedPassword, age, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;


  try {
    // Find the user by username
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    const error = err as Error;
    console.error("Error:", err);
    res.status(500).json({ error: error.message });
  }
};

// reset Password (Old Password Required)

export const resetPassword =async (req:Request, res:Response)=>{
  const { user_email, oldPassword, newPassword } = req.body;

  try {
    const result =await pool.query('SELECT * FROM users WHERE user_email =$1', [user_email]);
    
    if (result.rows.length===0) {
      return res.status(404).json({error:'User not found'})
    }
    const user = result.rows[0];

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
     //update new password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
    return res.status(200).json({ message: "Password changed successfully" });

  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message ,message:"Error occurred during password change"});
  }
}


//forgot password

export const forgetpassword = async (req: Request, res: Response) => {
  const { user_email } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_email = $1", [user_email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set expiration time in milliseconds (1 hour from now)
    const resetTokenExpires = Date.now() + 3600000; // 1 hour in milliseconds

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
      [hashedToken, resetTokenExpires, user.id]
    );

    // Create a reset link with the token and user email
    const resetLink = `token=${resetToken}`;
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user_email,
      subject: "Password Reset Request",
      html: `<p>Hi ${user.username},</p>
             <p>You requested a password reset.</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.status(200).json({ message: "Reset link sent to email" });
    
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message, message: "Error occurred during password change" });
  }
};

//reset password with forgot password token
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  const { token, user_email, newPassword } = req.body;

  console.log("Received token: ", token);  // Log received token for debugging

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_email = $1", [user_email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    console.log("User found: ", user); // Log user details for debugging
    console.log("Stored reset_token: ", user.reset_token); // Log stored reset_token for debugging

    // Check if token exists in the user data and compare it
    if (!user.reset_token) {
      return res.status(400).json({ error: "Reset token not found for this user" });
    }

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const isTokenValid = await bcrypt.compare(token, user.reset_token);
    console.log("Is token valid: ", isTokenValid); // Log result of comparison

    if (!isTokenValid) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if token is expired by comparing it to NOW()
    const currentTime = new Date();
    const resetTokenExpiry = user.reset_token_expires;

    console.log("Current Time: ", currentTime); // Log current time
    console.log("Reset Token Expiry: ", resetTokenExpiry); // Log reset token expiry for debugging

    if (currentTime > resetTokenExpiry) {
      return res.status(400).json({ error: "Token has expired" });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2", [hashedPassword, user.id]);

    res.status(200).json({ message: "Password reset successfully" });

  } catch (err) {
    const error = err as Error;
    console.log("Error: ", error.message); // Log the error
    res.status(500).json({ error: error.message });
  }
};

