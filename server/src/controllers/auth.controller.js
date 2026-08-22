import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

//------------------------------------------REGISTER USER---------------------------------------------

export const registerUser = async (req, res) => {
  try {
    const { name, company, email, password, phone, role } = req.body;

    if (!name || !company || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, company, email and password are required",
      });
    }

    const normalizedRole = role || "buyer";

    if (!["buyer", "seller"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "You can only register as a buyer or seller",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      company: company.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || "",
      role: normalizedRole,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        company: user.company,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kycStatus: user.kycStatus,
        verifiedBadge: user.verifiedBadge,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering",
    });
  }
};

//-------------------------------------------LOGIN USER -----------------------------------------

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and login role are required",
      });
    }

    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Please use the appropriate customer portal",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `These credentials belong to a ${user.role} account. Please use the ${user.role} portal.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        company: user.company,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kycStatus: user.kycStatus,
        verifiedBadge: user.verifiedBadge,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
};