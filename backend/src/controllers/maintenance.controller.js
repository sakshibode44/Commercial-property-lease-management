const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const populateRequest = async (request) => {
  const supabase = getSupabase();

  let property = null;
  let tenant = null;

  if (request.property_id) {
    const { data: prop } = await supabase
      .from("properties")
      .select("*")
      .eq("id", request.property_id)
      .single();
    property = prop;
  }

  if (request.tenant_id) {
    const { data: ten } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", request.tenant_id)
      .single();
    tenant = ten;
  }

  return {
    ...request,
    propertyDetails: property,
    tenantDetails: tenant,
  };
};

const createRequest = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const maintenanceData = {
      property_id: req.body.propertyId,
      tenant_id: req.body.tenantId,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority || "normal",
      status: req.body.status || "open",
      assigned_to: req.body.assignedTo,
      created_by: req.user.id,
      expected_completion_date: req.body.expectedCompletionDate,
      cost: req.body.cost ? parseFloat(req.body.cost) : null,
    };

    const { data: request, error } = await supabase
      .from("maintenance")
      .insert(maintenanceData)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(201).json(new ApiResponse(201, request, "Maintenance request created successfully"));
  } catch (error) {
    next(error);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    let query = supabase.from("maintenance").select("*");

    if (req.query.propertyId) {
      query = query.eq("property_id", req.query.propertyId);
    }
    if (req.query.status) {
      query = query.eq("status", req.query.status);
    }
    if (req.query.priority) {
      query = query.eq("priority", req.query.priority);
    }

    const { data: requests, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, error.message);
    }

    const payload = await Promise.all(requests.map(populateRequest));
    res.status(200).json(new ApiResponse(200, payload, "Maintenance requests retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: request, error } = await supabase
      .from("maintenance")
      .select("*")
      .eq("id", req.params.requestId)
      .single();

    if (error || !request) {
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
    const supabase = getSupabase();

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      status: req.body.status,
      assigned_to: req.body.assignedTo,
      expected_completion_date: req.body.expectedCompletionDate,
      actual_completion_date: req.body.actualCompletionDate,
      cost: req.body.cost ? parseFloat(req.body.cost) : undefined,
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: request, error } = await supabase
      .from("maintenance")
      .update(updateData)
      .eq("id", req.params.requestId)
      .select()
      .single();

    if (error || !request) {
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
    const supabase = getSupabase();

    const { data: existing, error: selectError } = await supabase
      .from("maintenance")
      .select("id")
      .eq("id", req.params.requestId)
      .single();

    if (selectError || !existing) {
      throw new ApiError(404, "Maintenance request not found");
    }

    const { error: deleteError } = await supabase
      .from("maintenance")
      .delete()
      .eq("id", req.params.requestId);

    if (deleteError) {
      throw new ApiError(500, deleteError.message);
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
