const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getSupabase } = require("../config/supabase");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const generateToken = (userId) => {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
};

const register = async (req, res, next) => {
  try {
    const { email, password, name, role, phone } = req.body;
    const supabase = getSupabase();

    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw new ApiError(500, "Database error");
    }

    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: role || "tenant",
        phone,
      })
      .select()
      .single();

    if (insertError) {
      throw new ApiError(500, "Failed to create user");
    }

    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone };

    res.status(201).json(new ApiResponse(201, { user: userResponse, token }, "User registered successfully"));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase();

    // Find user
    const { data: user, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (selectError || !user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone };

    res.status(200).json(new ApiResponse(200, { user: userResponse, token }, "Login successful"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
