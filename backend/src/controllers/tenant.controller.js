const Tenant = require("../models/Tenant");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createTenant = async (req, res, next) => {
  try {
    const tenantData = {
      ...req.body,
      userId: req.user.id,
    };
    const tenant = await Tenant.create(tenantData);
    res.status(201).json(new ApiResponse(201, tenant, "Tenant created successfully"));
  } catch (error) {
    next(error);
  }
};

const getTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json(new ApiResponse(200, tenants, "Tenants retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.tenantId);
    if (!tenant) {
      throw new ApiError(404, "Tenant not found");
    }
    res.status(200).json(new ApiResponse(200, tenant, "Tenant retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.tenantId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tenant) {
      throw new ApiError(404, "Tenant not found");
    }
    res.status(200).json(new ApiResponse(200, tenant, "Tenant updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.tenantId);
    if (!tenant) {
      throw new ApiError(404, "Tenant not found");
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
