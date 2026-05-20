const Utility = require("../models/Utility");
const Lease = require("../models/Lease");
const Tenant = require("../models/Tenant");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const populateUtility = async (utility) => {
  const lease = utility.leaseId ? await Lease.findById(utility.leaseId) : null;
  const tenant = utility.tenantId ? await Tenant.findById(utility.tenantId) : null;
  const property = utility.propertyId ? await Property.findById(utility.propertyId) : null;
  return {
    ...utility.toJSON(),
    leaseDetails: lease ? lease.toJSON() : null,
    tenantDetails: tenant ? tenant.toJSON() : null,
    propertyDetails: property ? property.toJSON() : null,
  };
};

const createUtility = async (req, res, next) => {
  try {
    const utilityData = {
      ...req.body,
      propertyId: req.body.propertyId || req.user.propertyId,
    };
    const utility = await Utility.create(utilityData);
    res.status(201).json(new ApiResponse(201, utility, "Utility bill created successfully"));
  } catch (error) {
    next(error);
  }
};

const getUtilities = async (req, res, next) => {
  try {
    const { leaseId, status, utilityType } = req.query;
    const filter = {};

    if (leaseId) filter.leaseId = leaseId;
    if (status) filter.status = status;
    if (utilityType) filter.utilityType = utilityType;

    const utilities = await Utility.find(filter);
    const payload = await Promise.all(utilities.map(populateUtility));
    res.status(200).json(new ApiResponse(200, payload, "Utilities retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getUtility = async (req, res, next) => {
  try {
    const utility = await Utility.findById(req.params.utilityId);
    if (!utility) {
      throw new ApiError(404, "Utility bill not found");
    }
    const payload = await populateUtility(utility);
    res.status(200).json(new ApiResponse(200, payload, "Utility bill retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateUtility = async (req, res, next) => {
  try {
    const utility = await Utility.findByIdAndUpdate(
      req.params.utilityId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!utility) {
      throw new ApiError(404, "Utility bill not found");
    }

    const payload = await populateUtility(utility);
    res.status(200).json(new ApiResponse(200, payload, "Utility bill updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteUtility = async (req, res, next) => {
  try {
    const utility = await Utility.findByIdAndDelete(req.params.utilityId);

    if (!utility) {
      throw new ApiError(404, "Utility bill not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Utility bill deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const markAsPaid = async (req, res, next) => {
  try {
    const { paidDate } = req.body;
    const utility = await Utility.findByIdAndUpdate(
      req.params.utilityId,
      {
        status: 'paid',
        paidDate: paidDate || new Date()
      },
      { new: true }
    );

    if (!utility) {
      throw new ApiError(404, "Utility bill not found");
    }

    const payload = await populateUtility(utility);
    res.status(200).json(new ApiResponse(200, payload, "Utility bill marked as paid"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUtility,
  getUtilities,
  getUtility,
  updateUtility,
  deleteUtility,
  markAsPaid,
};