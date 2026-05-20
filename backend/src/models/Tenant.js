const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class Tenant {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.companyName = data.companyName;
    this.contactPerson = data.contactPerson;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.industry = data.industry;
    this.status = data.status || "active";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Save tenant to database
  async save() {
    const db = readDB();
    const existingIndex = db.tenants.findIndex(t => t.id === this.id);

    if (existingIndex >= 0) {
      db.tenants[existingIndex] = { ...this };
    } else {
      db.tenants.push({ ...this });
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
    const tenant = db.tenants.find(t =>
      Object.keys(query).every(key => t[key] === query[key])
    );
    return tenant ? new Tenant(tenant) : null;
  }

  static async findById(id) {
    const db = readDB();
    const tenant = db.tenants.find(t => t.id === id);
    return tenant ? new Tenant(tenant) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let tenants = db.tenants;

    // Apply filters
    if (query.userId) {
      tenants = tenants.filter(t => t.userId === query.userId);
    }
    if (query.status) {
      tenants = tenants.filter(t => t.status === query.status);
    }

    return tenants.map(t => new Tenant(t));
  }

  static async create(data) {
    const tenant = new Tenant(data);
    return await tenant.save();
  }

  static async findOneAndUpdate(query, updateData) {
    const db = readDB();
    const index = db.tenants.findIndex(t =>
      Object.keys(query).every(key => t[key] === query[key])
    );

    if (index >= 0) {
      db.tenants[index] = { ...db.tenants[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Tenant(db.tenants[index]);
    }
    return null;
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const index = db.tenants.findIndex(t => t.id === id);

    if (index >= 0) {
      db.tenants[index] = { ...db.tenants[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Tenant(db.tenants[index]);
    }
    return null;
  }

  static async findByIdAndDelete(id) {
    const db = readDB();
    const index = db.tenants.findIndex(t => t.id === id);

    if (index >= 0) {
      const deletedTenant = db.tenants.splice(index, 1)[0];
      writeDB(db);
      return new Tenant(deletedTenant);
    }
    return null;
  }

  static async deleteOne(query) {
    const db = readDB();
    const index = db.tenants.findIndex(t =>
      Object.keys(query).every(key => t[key] === query[key])
    );

    if (index >= 0) {
      db.tenants.splice(index, 1);
      writeDB(db);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = Tenant;
