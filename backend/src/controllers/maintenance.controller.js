const Maintenance = require("../models/Maintenance");
const Property = require("../models/Property");
const Tenant = require("../models/Tenant");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const populateRequest = async (request) => {
  const property = request.propertyId ? await Property.findById(request.propertyId) : null;
  const tenant = request.tenantId ? await Tenant.findById(request.tenantId) : null;
  return {
    ...request.toJSON(),
    propertyDetails: property ? property.toJSON() : null,
    tenantDetails: tenant ? tenant.toJSON() : null,
  };
};

const createRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.create(req.body);
    res.status(201).json(new ApiResponse(201, request, "Maintenance request created successfully"));
  } catch (error) {
    next(error);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.propertyId) filter.propertyId = req.query.propertyId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const requests = await Maintenance.find(filter);
    const payload = await Promise.all(requests.map(populateRequest));
    res.status(200).json(new ApiResponse(200, payload, "Maintenance requests retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findById(req.params.requestId);
    if (!request) {
      throw new ApiError(404, "Maintenance request not found");
    }
    const payload = await populateRequest(request);
    res.status(200).json(new ApiResponse(200, payload, "Maintenance request retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findByIdAndUpdate(req.params.requestId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) {
      throw new ApiError(404, "Maintenance request not found");
    }
    const payload = await populateRequest(request);
    res.status(200).json(new ApiResponse(200, payload, "Maintenance request updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const request = await Maintenance.findByIdAndDelete(req.params.requestId);
    if (!request) {
      throw new ApiError(404, "Maintenance request not found");
    }
    res.status(200).json(new ApiResponse(200, null, "Maintenance request deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
};
