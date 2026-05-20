const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const generateToken = (userId) => {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
};

const register = async (req, res, next) => {
  try {
    const { email, password, name, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, "Email already exists");
    }

    const user = await User.create({ email, password, name, role, phone });
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json(new ApiResponse(201, { user: userResponse, token }, "User registered successfully"));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user.id);

    const userResponse = user.toJSON();

    res.status(200).json(new ApiResponse(200, { user: userResponse, token }, "Login successful"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
