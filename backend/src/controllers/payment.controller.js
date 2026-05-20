const Payment = require("../models/Payment");
const Lease = require("../models/Lease");
const Tenant = require("../models/Tenant");
const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { generateReceiptNumber } = require("../utils/receiptGenerator");

const populatePayment = async (payment) => {
  const lease = payment.leaseId ? await Lease.findById(payment.leaseId) : null;
  const tenant = payment.tenantId ? await Tenant.findById(payment.tenantId) : null;
  const property = lease && lease.propertyId ? await Property.findById(lease.propertyId) : null;
  return {
    ...payment.toJSON(),
    leaseDetails: lease ? lease.toJSON() : null,
    tenantDetails: tenant ? tenant.toJSON() : null,
    propertyDetails: property ? property.toJSON() : null,
  };
};

const getPayments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    if (req.query.leaseId) filter.leaseId = req.query.leaseId;
    if (req.query.status) filter.status = req.query.status;

    const payments = await Payment.find(filter);
    const payload = await Promise.all(payments.map(populatePayment));
    res.status(200).json(new ApiResponse(200, payload, "Payments retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }
    const payload = await populatePayment(payment);
    res.status(200).json(new ApiResponse(200, payload, "Payment retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    const { amount, method, paidDate } = req.body;
    payment.status = "paid";
    payment.amount = amount !== undefined ? amount : payment.amount;
    payment.method = method || payment.method;
    payment.paidDate = paidDate || new Date();

    if (!payment.receiptNumber) {
      payment.receiptNumber = generateReceiptNumber();
    }

    await payment.save();
    const payload = await populatePayment(payment);
    res.status(200).json(new ApiResponse(200, payload, "Payment recorded successfully"));
  } catch (error) {
    next(error);
  }
};

const generateReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.status !== "paid") {
      throw new ApiError(400, "Receipt can only be generated for paid payments");
    }

    const lease = payment.leaseId ? await Lease.findById(payment.leaseId) : null;
    const tenant = payment.tenantId ? await Tenant.findById(payment.tenantId) : null;
    const property = lease && lease.propertyId ? await Property.findById(lease.propertyId) : null;

    const receipt = {
      receiptNumber: payment.receiptNumber,
      paymentId: payment.id,
      tenant: tenant ? tenant.toJSON() : null,
      property: property ? property.toJSON() : null,
      lease: lease ? lease.toJSON() : null,
      amount: payment.amount,
      paidDate: payment.paidDate,
      dueDate: payment.dueDate,
      method: payment.method,
      generatedAt: new Date(),
    };

    res.status(200).json(new ApiResponse(200, receipt, "Receipt generated successfully"));
  } catch (error) {
    next(error);
  }
};

const checkOverduePayments = async (req, res, next) => {
  try {
    const today = new Date();
    const payments = await Payment.find({ status: "pending" });
    let updated = 0;

    for (const payment of payments) {
      if (payment.dueDate && new Date(payment.dueDate) < today) {
        payment.status = "overdue";
        await payment.save();
        updated += 1;
      }
    }

    res.status(200).json(new ApiResponse(200, { updated }, "Overdue payments updated"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPayment,
  recordPayment,
  generateReceipt,
  checkOverduePayments,
};
