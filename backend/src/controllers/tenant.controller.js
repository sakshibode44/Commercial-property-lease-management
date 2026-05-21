const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createTenant = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const tenantData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company_name: req.body.companyName,
      aadhar_number: req.body.aadharNumber,
      pan_number: req.body.panNumber,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zipCode,
      country: req.body.country,
      lease_status: req.body.leaseStatus || "active",
    };

    const { data: tenant, error } = await supabase
      .from("tenants")
      .insert(tenantData)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(201).json(new ApiResponse(201, tenant, "Tenant created successfully"));
  } catch (error) {
    next(error);
  }
};

const getTenants = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: tenants, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json(new ApiResponse(200, tenants, "Tenants retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getTenant = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", req.params.tenantId)
      .single();

    if (error || !tenant) {
      throw new ApiError(404, "Tenant not found");
    }

    res.status(200).json(new ApiResponse(200, tenant, "Tenant retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company_name: req.body.companyName,
      aadhar_number: req.body.aadharNumber,
      pan_number: req.body.panNumber,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zipCode,
      country: req.body.country,
      lease_status: req.body.leaseStatus,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: tenant, error } = await supabase
      .from("tenants")
      .update(updateData)
      .eq("id", req.params.tenantId)
      .select()
      .single();

    if (error || !tenant) {
      throw new ApiError(404, "Tenant not found");
    }

    res.status(200).json(new ApiResponse(200, tenant, "Tenant updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteTenant = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: existing, error: selectError } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", req.params.tenantId)
      .single();

    if (selectError || !existing) {
      throw new ApiError(404, "Tenant not found");
    }

    const { error: deleteError } = await supabase
      .from("tenants")
      .delete()
      .eq("id", req.params.tenantId);

    if (deleteError) {
      throw new ApiError(500, deleteError.message);
    }

    res.status(200).json(new ApiResponse(200, null, "Tenant deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
