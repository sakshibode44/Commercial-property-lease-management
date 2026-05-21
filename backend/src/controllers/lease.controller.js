const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createLease = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const leaseData = {
      property_id: req.body.propertyId,
      tenant_id: req.body.tenantId,
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      rent_amount: parseFloat(req.body.rentAmount),
      security_deposit: parseFloat(req.body.securityDeposit) || 0,
      escalation_percent: parseFloat(req.body.escalationPercent) || 0,
      escalation_frequency: req.body.escalationFrequency,
      notice_period_days: parseInt(req.body.noticePeriodDays) || 60,
      lease_status: req.body.leaseStatus || "active",
      terms_conditions: req.body.termsConditions,
    };

    const { data: lease, error: leaseError } = await supabase
      .from("leases")
      .insert(leaseData)
      .select()
      .single();

    if (leaseError) {
      throw new ApiError(500, leaseError.message);
    }

    // Generate monthly payments
    const payments = [];
    let current = new Date(req.body.startDate);
    const end = new Date(req.body.endDate);

    while (current <= end) {
      const dueDate = new Date(current);
      payments.push({
        lease_id: lease.id,
        tenant_id: req.body.tenantId,
        amount: parseFloat(req.body.rentAmount),
        due_date: dueDate.toISOString().split('T')[0],
        payment_date: null,
        status: "pending",
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    if (payments.length > 0) {
      await supabase.from("payments").insert(payments);
    }

    res.status(201).json(new ApiResponse(201, lease, "Lease created successfully"));
  } catch (error) {
    next(error);
  }
};

const buildLeasePayload = async (lease) => {
  const supabase = getSupabase();

  let property = null;
  let tenant = null;

  if (lease.property_id) {
    const { data: prop } = await supabase
      .from("properties")
      .select("*")
      .eq("id", lease.property_id)
      .single();
    property = prop;
  }

  if (lease.tenant_id) {
    const { data: ten } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", lease.tenant_id)
      .single();
    tenant = ten;
  }

  return {
    ...lease,
    propertyDetails: property,
    tenantDetails: tenant,
  };
};

const getLeases = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: leases, error } = await supabase
      .from("leases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, error.message);
    }

    const payload = await Promise.all(leases.map(buildLeasePayload));
    res.status(200).json(new ApiResponse(200, payload, "Leases retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getLease = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: lease, error } = await supabase
      .from("leases")
      .select("*")
      .eq("id", req.params.leaseId)
      .single();

    if (error || !lease) {
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
    const supabase = getSupabase();

    const updateData = {
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      rent_amount: req.body.rentAmount ? parseFloat(req.body.rentAmount) : undefined,
      security_deposit: req.body.securityDeposit ? parseFloat(req.body.securityDeposit) : undefined,
      escalation_percent: req.body.escalationPercent ? parseFloat(req.body.escalationPercent) : undefined,
      escalation_frequency: req.body.escalationFrequency,
      notice_period_days: req.body.noticePeriodDays ? parseInt(req.body.noticePeriodDays) : undefined,
      lease_status: req.body.leaseStatus,
      terms_conditions: req.body.termsConditions,
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: lease, error } = await supabase
      .from("leases")
      .update(updateData)
      .eq("id", req.params.leaseId)
      .select()
      .single();

    if (error || !lease) {
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
    const supabase = getSupabase();

    const { data: existing, error: selectError } = await supabase
      .from("leases")
      .select("id")
      .eq("id", req.params.leaseId)
      .single();

    if (selectError || !existing) {
      throw new ApiError(404, "Lease not found");
    }

    // Delete related payments
    await supabase.from("payments").delete().eq("lease_id", req.params.leaseId);

    // Delete lease
    const { error: deleteError } = await supabase
      .from("leases")
      .delete()
      .eq("id", req.params.leaseId);

    if (deleteError) {
      throw new ApiError(500, deleteError.message);
    }

    res.status(200).json(new ApiResponse(200, null, "Lease deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const getExpiringLeases = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const days = parseInt(req.query.days) || 30;
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];

    const { data: leases, error } = await supabase
      .from("leases")
      .select("*")
      .eq("lease_status", "active")
      .gte("end_date", todayStr)
      .lte("end_date", futureStr)
      .order("end_date", { ascending: true });

    if (error) {
      throw new ApiError(500, error.message);
    }

    const payload = await Promise.all(leases.map(buildLeasePayload));
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
