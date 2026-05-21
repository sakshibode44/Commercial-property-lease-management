const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Please authenticate");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.sub)
      .single();

    if (error || !user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Please authenticate"));
  }
};

module.exports = auth;
