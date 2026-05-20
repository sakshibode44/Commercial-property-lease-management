const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class Utility {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.propertyId = data.propertyId;
    this.tenantId = data.tenantId;
    this.utilityType = data.utilityType;
    this.billingPeriod = data.billingPeriod;
    this.amount = data.amount;
    this.dueDate = data.dueDate;
    this.paidDate = data.paidDate;
    this.status = data.status || "pending";
    this.meterReading = data.meterReading;
    this.consumption = data.consumption;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = readDB();
    const existingIndex = db.utilities.findIndex(u => u.id === this.id);
    if (existingIndex >= 0) {
      db.utilities[existingIndex] = { ...this };
    } else {
      db.utilities.push({ ...this });
    }
    writeDB(db);
    return this;
  }

  toJSON() { return { ...this }; }

  static async findOne(query) {
    const db = readDB();
    const utility = db.utilities.find(u => Object.keys(query).every(key => u[key] === query[key]));
    return utility ? new Utility(utility) : null;
  }

  static async findById(id) {
    const db = readDB();
    const utility = db.utilities.find(u => u.id === id);
    return utility ? new Utility(utility) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let utilities = db.utilities;
    if (query.propertyId) utilities = utilities.filter(u => u.propertyId === query.propertyId);
    if (query.tenantId) utilities = utilities.filter(u => u.tenantId === query.tenantId);
    if (query.status) utilities = utilities.filter(u => u.status === query.status);
    return utilities.map(u => new Utility(u));
  }

  static async create(data) { const utility = new Utility(data); return await utility.save(); }

  static async findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const index = db.utilities.findIndex(u => u.id === id);
    if (index >= 0) {
      db.utilities[index] = { ...db.utilities[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Utility(db.utilities[index]);
    }
    return null;
  }

  static async findByIdAndDelete(id) {
    const db = readDB();
    const index = db.utilities.findIndex(u => u.id === id);
    if (index >= 0) {
      const deleted = db.utilities.splice(index, 1)[0];
      writeDB(db);
      return new Utility(deleted);
    }
    return null;
  }
}

module.exports = Utility;