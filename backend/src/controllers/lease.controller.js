const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const Property = require("../models/Property");
const Tenant = require("../models/Tenant");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createLease = async (req, res, next) => {
  try {
    const leaseData = {
      ...req.body,
      monthlyRent: parseFloat(req.body.monthlyRent),
      securityDeposit: parseFloat(req.body.securityDeposit),
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    };

    const lease = await Lease.create(leaseData);

    const { monthlyRent, startDate, endDate, tenantId } = lease;
    const payments = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      payments.push({
        leaseId: lease.id,
        tenantId,
        amount: monthlyRent,
        dueDate: current.toISOString(),
        status: "pending",
        receiptNumber,
      });
      current = new Date(current.setMonth(current.getMonth() + 1));
    }

    if (payments.length > 0) {
      await Payment.insertMany(payments);
    }

    res.status(201).json(new ApiResponse(201, lease, "Lease created successfully"));
  } catch (error) {
    next(error);
  }
};

const buildLeasePayload = async (lease) => {
  const property = lease.propertyId ? await Property.findById(lease.propertyId) : null;
  const tenant = lease.tenantId ? await Tenant.findById(lease.tenantId) : null;
  return {
    ...lease.toJSON(),
    propertyDetails: property ? property.toJSON() : null,
    tenantDetails: tenant ? tenant.toJSON() : null,
  };
};

const getLeases = async (req, res, next) => {
  try {
    const leases = await Lease.find();
    const payload = await Promise.all(leases.map(buildLeasePayload));
    res.status(200).json(new ApiResponse(200, payload, "Leases retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.leaseId);
    if (!lease) {
      throw new ApiError(404, "Lease not found");
    }
    const payload = await buildLeasePayload(lease);
    res.status(200).json(new ApiResponse(200, payload, "Lease retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateLease = async (req, res, next) => {
  try {
    const lease = await Lease.findByIdAndUpdate(req.params.leaseId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lease) {
      throw new ApiError(404, "Lease not found");
    }
    const payload = await buildLeasePayload(lease);
    res.status(200).json(new ApiResponse(200, payload, "Lease updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteLease = async (req, res, next) => {
  try {
    const lease = await Lease.findByIdAndDelete(req.params.leaseId);
    if (!lease) {
      throw new ApiError(404, "Lease not found");
    }
    await Payment.deleteMany({ leaseId: req.params.leaseId });
    res.status(200).json(new ApiResponse(200, null, "Lease deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const getExpiringLeases = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);

    const leases = await Lease.find();
    const filtered = leases.filter(lease => {
      const endDate = new Date(lease.endDate);
      return lease.status === "active" && endDate >= today && endDate <= future;
    });

    const payload = await Promise.all(filtered.map(buildLeasePayload));
    res.status(200).json(new ApiResponse(200, payload, `Leases expiring in ${days} days`));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLease,
  getLeases,
  getLease,
  updateLease,
  deleteLease,
  getExpiringLeases,
};
