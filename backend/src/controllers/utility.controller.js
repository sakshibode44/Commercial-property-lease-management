const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const populateUtility = async (utility) => {
  const supabase = getSupabase();

  let lease = null;
  let tenant = null;
  let property = null;

  if (utility.lease_id) {
    const { data: l } = await supabase
      .from("leases")
      .select("*")
      .eq("id", utility.lease_id)
      .single();
    lease = l;
  }

  if (utility.tenant_id) {
    const { data: t } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", utility.tenant_id)
      .single();
    tenant = t;
  }

  if (utility.property_id) {
    const { data: prop } = await supabase
      .from("properties")
      .select("*")
      .eq("id", utility.property_id)
      .single();
    property = prop;
  }

  return {
    ...utility,
    leaseDetails: lease,
    tenantDetails: tenant,
    propertyDetails: property,
  };
};

const createUtility = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const utilityData = {
      property_id: req.body.propertyId || req.user.propertyId,
      lease_id: req.body.leaseId,
      tenant_id: req.body.tenantId,
      utility_type: req.body.utilityType,
      reading_date: req.body.readingDate,
      previous_reading: req.body.previousReading ? parseFloat(req.body.previousReading) : null,
      current_reading: req.body.currentReading ? parseFloat(req.body.currentReading) : null,
      consumption: req.body.consumption ? parseFloat(req.body.consumption) : null,
      rate_per_unit: req.body.ratePerUnit ? parseFloat(req.body.ratePerUnit) : null,
      amount: req.body.amount ? parseFloat(req.body.amount) : null,
      status: req.body.status || "pending",
    };

    const { data: utility, error } = await supabase
      .from("utilities")
      .insert(utilityData)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(201).json(new ApiResponse(201, utility, "Utility bill created successfully"));
  } catch (error) {
    next(error);
  }
};

const getUtilities = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    let query = supabase.from("utilities").select("*");

    if (req.query.leaseId) {
      query = query.eq("lease_id", req.query.leaseId);
    }
    if (req.query.status) {
      query = query.eq("status", req.query.status);
    }
    if (req.query.utilityType) {
      query = query.eq("utility_type", req.query.utilityType);
    }

    const { data: utilities, error } = await query.order("reading_date", { ascending: false });

    if (error) {
      throw new ApiError(500, error.message);
    }

    const payload = await Promise.all(utilities.map(populateUtility));
    res.status(200).json(new ApiResponse(200, payload, "Utilities retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getUtility = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: utility, error } = await supabase
      .from("utilities")
      .select("*")
      .eq("id", req.params.utilityId)
      .single();

    if (error || !utility) {
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
    const supabase = getSupabase();

    const updateData = {
      reading_date: req.body.readingDate,
      previous_reading: req.body.previousReading ? parseFloat(req.body.previousReading) : undefined,
      current_reading: req.body.currentReading ? parseFloat(req.body.currentReading) : undefined,
      consumption: req.body.consumption ? parseFloat(req.body.consumption) : undefined,
      rate_per_unit: req.body.ratePerUnit ? parseFloat(req.body.ratePerUnit) : undefined,
      amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
      status: req.body.status,
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: utility, error } = await supabase
      .from("utilities")
      .update(updateData)
      .eq("id", req.params.utilityId)
      .select()
      .single();

    if (error || !utility) {
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
    const supabase = getSupabase();

    const { data: existing, error: selectError } = await supabase
      .from("utilities")
      .select("id")
      .eq("id", req.params.utilityId)
      .single();

    if (selectError || !existing) {
      throw new ApiError(404, "Utility bill not found");
    }

    const { error: deleteError } = await supabase
      .from("utilities")
      .delete()
      .eq("id", req.params.utilityId);

    if (deleteError) {
      throw new ApiError(500, deleteError.message);
    }

    res.status(200).json(new ApiResponse(200, {}, "Utility bill deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const markAsPaid = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { paidDate } = req.body;

    const { data: utility, error } = await supabase
      .from("utilities")
      .update({
        status: "paid",
        paid_date: paidDate || new Date().toISOString().split('T')[0],
      })
      .eq("id", req.params.utilityId)
      .select()
      .single();

    if (error || !utility) {
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