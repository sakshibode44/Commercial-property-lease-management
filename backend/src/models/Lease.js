const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class Lease {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.propertyId = data.propertyId;
    this.tenantId = data.tenantId;
    this.unitNumber = data.unitNumber;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.monthlyRent = data.monthlyRent;
    this.escalationClause = data.escalationClause || {};
    this.securityDeposit = data.securityDeposit;
    this.status = data.status || "active";
    this.documents = data.documents || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Save lease to database
  async save() {
    const db = readDB();
    const existingIndex = db.leases.findIndex(l => l.id === this.id);

    if (existingIndex >= 0) {
      db.leases[existingIndex] = { ...this };
    } else {
      db.leases.push({ ...this });
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
    const lease = db.leases.find(l =>
      Object.keys(query).every(key => l[key] === query[key])
    );
    return lease ? new Lease(lease) : null;
  }

  static async findById(id) {
    const db = readDB();
    const lease = db.leases.find(l => l.id === id);
    return lease ? new Lease(lease) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let leases = db.leases;

    // Apply filters
    if (query.propertyId) {
      leases = leases.filter(l => l.propertyId === query.propertyId);
    }
    if (query.tenantId) {
      leases = leases.filter(l => l.tenantId === query.tenantId);
    }
    if (query.status) {
      leases = leases.filter(l => l.status === query.status);
    }

    return leases.map(l => new Lease(l));
  }

  static async create(data) {
    const lease = new Lease(data);
    return await lease.save();
  }

  static async findOneAndUpdate(query, updateData) {
    const db = readDB();
    const index = db.leases.findIndex(l =>
      Object.keys(query).every(key => l[key] === query[key])
    );

    if (index >= 0) {
      db.leases[index] = { ...db.leases[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Lease(db.leases[index]);
    }
    return null;
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = readDB();
    const index = db.leases.findIndex(l => l.id === id);

    if (index >= 0) {
      db.leases[index] = { ...db.leases[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Lease(db.leases[index]);
    }
    return null;
  }

  static async findByIdAndDelete(id) {
    const db = readDB();
    const index = db.leases.findIndex(l => l.id === id);

    if (index >= 0) {
      const deletedLease = db.leases.splice(index, 1)[0];
      writeDB(db);
      return new Lease(deletedLease);
    }
    return null;
  }

  static async deleteOne(query) {
    const db = readDB();
    const index = db.leases.findIndex(l =>
      Object.keys(query).every(key => l[key] === query[key])
    );

    if (index >= 0) {
      db.leases.splice(index, 1);
      writeDB(db);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = Lease;
