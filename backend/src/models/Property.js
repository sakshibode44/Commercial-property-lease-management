const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class Property {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.address = data.address;
    this.type = data.type;
    this.totalArea = data.totalArea;
    this.totalUnits = data.totalUnits;
    this.amenities = data.amenities || [];
    this.status = data.status || "available";
    this.description = data.description;
    this.createdBy = data.createdBy;
    this.images = data.images || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Save property to database
  async save() {
    const db = readDB();
    const existingIndex = db.properties.findIndex(p => p.id === this.id);

    if (existingIndex >= 0) {
      db.properties[existingIndex] = { ...this };
    } else {
      db.properties.push({ ...this });
    }

    writeDB(db);
    return this;
  }

  // Convert to JSON
  toJSON() {
    return { ...this };
  }

  // Static methods
  static async findOne(query) {
    const db = readDB();
    const property = db.properties.find(p =>
      Object.keys(query).every(key => p[key] === query[key])
    );
    return property ? new Property(property) : null;
  }

  static async findById(id) {
    const db = readDB();
    const property = db.properties.find(p => p.id === id);
    return property ? new Property(property) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let properties = db.properties;

    // Apply filters
    if (query.type) {
      properties = properties.filter(p => p.type === query.type);
    }
    if (query.status) {
      properties = properties.filter(p => p.status === query.status);
    }
    if (query.createdBy) {
      properties = properties.filter(p => p.createdBy === query.createdBy);
    }

    return properties.map(p => new Property(p));
  }

  static async create(data) {
    const property = new Property(data);
    return await property.save();
  }

  static async findOneAndUpdate(query, updateData) {
    const db = readDB();
    const index = db.properties.findIndex(p =>
      Object.keys(query).every(key => p[key] === query[key])
    );

    if (index >= 0) {
      db.properties[index] = { ...db.properties[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Property(db.properties[index]);
    }
    return null;
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const index = db.properties.findIndex(p => p.id === id);

    if (index >= 0) {
      db.properties[index] = { ...db.properties[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Property(db.properties[index]);
    }
    return null;
  }

  static async findByIdAndDelete(id) {
    const db = readDB();
    const index = db.properties.findIndex(p => p.id === id);

    if (index >= 0) {
      const deletedProperty = db.properties.splice(index, 1)[0];
      writeDB(db);
      return new Property(deletedProperty);
    }
    return null;
  }

  static async deleteOne(query) {
    const db = readDB();
    const index = db.properties.findIndex(p =>
      Object.keys(query).every(key => p[key] === query[key])
    );

    if (index >= 0) {
      db.properties.splice(index, 1);
      writeDB(db);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = Property;
