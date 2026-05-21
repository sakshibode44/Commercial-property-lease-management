const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const populatePayment = async (payment) => {
  const supabase = getSupabase();

  let lease = null;
  let tenant = null;
  let property = null;

  if (payment.lease_id) {
    const { data: l } = await supabase
      .from("leases")
      .select("*")
      .eq("id", payment.lease_id)
      .single();
    lease = l;

    if (lease && lease.property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("*")
        .eq("id", lease.property_id)
        .single();
      property = prop;
    }
  }

  if (payment.tenant_id) {
    const { data: t } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", payment.tenant_id)
      .single();
    tenant = t;
  }

  return {
    ...payment,
    leaseDetails: lease,
    tenantDetails: tenant,
    propertyDetails: property,
  };
};

const getPayments = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    let query = supabase.from("payments").select("*");

    if (req.query.tenantId) {
      query = query.eq("tenant_id", req.query.tenantId);
    }
    if (req.query.leaseId) {
      query = query.eq("lease_id", req.query.leaseId);
    }
    if (req.query.status) {
      query = query.eq("status", req.query.status);
    }

    const { data: payments, error } = await query.order("due_date", { ascending: true });

    if (error) {
      throw new ApiError(500, error.message);
    }

    const payload = await Promise.all(payments.map(populatePayment));
    res.status(200).json(new ApiResponse(200, payload, "Payments retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getPayment = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", req.params.paymentId)
      .single();

    if (error || !payment) {
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
    const supabase = getSupabase();

    const { data: payment, error: selectError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", req.params.paymentId)
      .single();

    if (selectError || !payment) {
      throw new ApiError(404, "Payment not found");
    }

    const { amount, method, paymentDate } = req.body;

    const { data: updated, error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        amount: amount !== undefined ? amount : payment.amount,
        payment_method: method || payment.payment_method,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
      })
      .eq("id", req.params.paymentId)
      .select()
      .single();

    if (updateError) {
      throw new ApiError(500, updateError.message);
    }

    const payload = await populatePayment(updated);
    res.status(200).json(new ApiResponse(200, payload, "Payment recorded successfully"));
  } catch (error) {
    next(error);
  }
};

const generateReceipt = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", req.params.paymentId)
      .single();

    if (error || !payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.status !== "completed") {
      throw new ApiError(400, "Receipt can only be generated for completed payments");
    }

    const payload = await populatePayment(payment);

    const receipt = {
      receipt_id: `RCP-${payment.id.substring(0, 8)}-${Date.now()}`,
      payment_id: payment.id,
      tenant: payload.tenantDetails,
      property: payload.propertyDetails,
      lease: payload.leaseDetails,
      amount: payment.amount,
      payment_date: payment.payment_date,
      due_date: payment.due_date,
      payment_method: payment.payment_method,
      generated_at: new Date().toISOString(),
    };

    res.status(200).json(new ApiResponse(200, receipt, "Receipt generated successfully"));
  } catch (error) {
    next(error);
  }
};

const checkOverduePayments = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    const { data: payments, error: selectError } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "pending")
      .lt("due_date", today);

    if (selectError) {
      throw new ApiError(500, selectError.message);
    }

    // Update overdue payments
    const { error: updateError } = await supabase
      .from("payments")
      .update({ status: "overdue" })
      .eq("status", "pending")
      .lt("due_date", today);

    if (updateError) {
      throw new ApiError(500, updateError.message);
    }

    res.status(200).json(new ApiResponse(200, { updated: payments.length }, "Overdue payments updated"));
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
