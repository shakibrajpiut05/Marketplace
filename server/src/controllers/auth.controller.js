import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

//------------------------------------------REGISTER USER---------------------------------------------

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      password,
      phone,
      role,
    } = req.body;

    // Validate required fields
    if (!name || !company || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, company, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // Create user
    const user = await User.create({
      name,
      company,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "buyer",
    });

    // Don't return password
    const userResponse = {
      id: user._id,
      name: user.name,
      company: user.company,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      verifiedBadge: user.verifiedBadge,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering",
    });
  }
};

//-------------------------------------------LOGIN USER -----------------------------------------

export const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user._id.toString());

    // User response
    const userResponse = {
      id: user._id,
      name: user.name,
      company: user.company,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      verifiedBadge: user.verifiedBadge,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};