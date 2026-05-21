const { getSupabase } = require("../config/supabase");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createProperty = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const propertyData = {
      name: req.body.name,
      address: req.body.address,
      type: req.body.type,
      total_area: parseFloat(req.body.totalArea) || null,
      total_units: parseInt(req.body.totalUnits) || null,
      amenities: req.body.amenities || [],
      status: req.body.status || "available",
      description: req.body.description,
      created_by: req.user.id,
      images: req.body.images || [],
    };

    const { data: property, error } = await supabase
      .from("properties")
      .insert(propertyData)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(201).json(new ApiResponse(201, property, "Property created successfully"));
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: properties, error } = await supabase
      .from("properties")
      .select("*")
      .eq("created_by", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json(new ApiResponse(200, properties, "Properties retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    const { data: property, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", req.params.propertyId)
      .eq("created_by", req.user.id)
      .single();

    if (error || !property) {
      throw new ApiError(404, "Property not found");
    }

    res.status(200).json(new ApiResponse(200, property, "Property retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    // First verify ownership
    const { data: existing, error: selectError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", req.params.propertyId)
      .eq("created_by", req.user.id)
      .single();

    if (selectError || !existing) {
      throw new ApiError(404, "Property not found");
    }

    const updateData = {
      name: req.body.name,
      address: req.body.address,
      type: req.body.type,
      total_area: req.body.totalArea ? parseFloat(req.body.totalArea) : undefined,
      total_units: req.body.totalUnits ? parseInt(req.body.totalUnits) : undefined,
      amenities: req.body.amenities,
      status: req.body.status,
      description: req.body.description,
      images: req.body.images,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: property, error } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", req.params.propertyId)
      .select()
      .single();

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.status(200).json(new ApiResponse(200, property, "Property updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    // Verify ownership
    const { data: existing, error: selectError } = await supabase
      .from("properties")
      .select("id")
      .eq("id", req.params.propertyId)
      .eq("created_by", req.user.id)
      .single();

    if (selectError || !existing) {
      throw new ApiError(404, "Property not found");
    }

    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", req.params.propertyId);

    if (deleteError) {
      throw new ApiError(500, deleteError.message);
    }

    res.status(200).json(new ApiResponse(200, null, "Property deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
};
