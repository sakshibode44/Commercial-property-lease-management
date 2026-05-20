const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class Maintenance {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.propertyId = data.propertyId;
    this.tenantId = data.tenantId;
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority || "medium";
    this.status = data.status || "pending";
    this.requestedDate = data.requestedDate || new Date();
    this.completedDate = data.completedDate;
    this.cost = data.cost;
    this.assignedTo = data.assignedTo;
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = readDB();
    const existingIndex = db.maintenance.findIndex(m => m.id === this.id);
    if (existingIndex >= 0) {
      db.maintenance[existingIndex] = { ...this };
    } else {
      db.maintenance.push({ ...this });
    }
    writeDB(db);
    return this;
  }

  toJSON() { return { ...this }; }

  static async findOne(query) {
    const db = readDB();
    const maintenance = db.maintenance.find(m => Object.keys(query).every(key => m[key] === query[key]));
    return maintenance ? new Maintenance(maintenance) : null;
  }

  static async findById(id) {
    const db = readDB();
    const maintenance = db.maintenance.find(m => m.id === id);
    return maintenance ? new Maintenance(maintenance) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let maintenance = db.maintenance;
    if (query.propertyId) maintenance = maintenance.filter(m => m.propertyId === query.propertyId);
    if (query.tenantId) maintenance = maintenance.filter(m => m.tenantId === query.tenantId);
    if (query.status) maintenance = maintenance.filter(m => m.status === query.status);
    return maintenance.map(m => new Maintenance(m));
  }

  static async create(data) { const maintenance = new Maintenance(data); return await maintenance.save(); }

  static async findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const index = db.maintenance.findIndex(m => m.id === id);
    if (index >= 0) {
      db.maintenance[index] = { ...db.maintenance[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Maintenance(db.maintenance[index]);
    }
    return null;
  }

  static async findByIdAndDelete(id) {
    const db = readDB();
    const index = db.maintenance.findIndex(m => m.id === id);
    if (index >= 0) {
      const deleted = db.maintenance.splice(index, 1)[0];
      writeDB(db);
      return new Maintenance(deleted);
    }
    return null;
  }
}

module.exports = Maintenance;
