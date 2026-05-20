const Property = require("../models/Property");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createProperty = async (req, res, next) => {
  try {
    const propertyData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const property = await Property.create(propertyData);
    res.status(201).json(new ApiResponse(201, property, "Property created successfully"));
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ createdBy: req.user.id });
    res.status(200).json(new ApiResponse(200, properties, "Properties retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findOne({ id: req.params.propertyId, createdBy: req.user.id });
    if (!property) {
      throw new ApiError(404, "Property not found");
    }
    res.status(200).json(new ApiResponse(200, property, "Property retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findOneAndUpdate(
      { id: req.params.propertyId, createdBy: req.user.id },
      req.body
    );
    if (!property) {
      throw new ApiError(404, "Property not found");
    }
    res.status(200).json(new ApiResponse(200, property, "Property updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    // Check if property exists and belongs to user
    const property = await Property.findOne({ id: req.params.propertyId, createdBy: req.user.id });
    if (!property) {
      throw new ApiError(404, "Property not found");
    }
    await Property.deleteOne({ id: req.params.propertyId });
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
