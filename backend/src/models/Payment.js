const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class Payment {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.leaseId = data.leaseId;
    this.tenantId = data.tenantId;
    this.amount = data.amount;
    this.dueDate = data.dueDate;
    this.paidDate = data.paidDate;
    this.method = data.method;
    this.status = data.status || "pending";
    this.receiptNumber = data.receiptNumber;
    this.notes = data.notes;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    const db = readDB();
    const existingIndex = db.payments.findIndex(p => p.id === this.id);
    if (existingIndex >= 0) {
      db.payments[existingIndex] = { ...this };
    } else {
      db.payments.push({ ...this });
    }
    writeDB(db);
    return this;
  }

  toJSON() { return { ...this }; }

  static async findOne(query) {
    const db = readDB();
    const payment = db.payments.find(p => Object.keys(query).every(key => p[key] === query[key]));
    return payment ? new Payment(payment) : null;
  }

  static async findById(id) {
    const db = readDB();
    const payment = db.payments.find(p => p.id === id);
    return payment ? new Payment(payment) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let payments = db.payments;
    if (query.leaseId) payments = payments.filter(p => p.leaseId === query.leaseId);
    if (query.tenantId) payments = payments.filter(p => p.tenantId === query.tenantId);
    if (query.status) payments = payments.filter(p => p.status === query.status);
    return payments.map(p => new Payment(p));
  }

  static async create(data) { const payment = new Payment(data); return await payment.save(); }
  static async findOneAndUpdate(query, updateData) {
    const db = readDB();
    const index = db.payments.findIndex(p => Object.keys(query).every(key => p[key] === query[key]));
    if (index >= 0) {
      db.payments[index] = { ...db.payments[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new Payment(db.payments[index]);
    }
    return null;
  }

  static async deleteMany(query) {
    const db = readDB();
    const originalLength = db.payments.length;
    db.payments = db.payments.filter(p => !Object.keys(query).every(key => p[key] === query[key]));
    writeDB(db);
    return { deletedCount: originalLength - db.payments.length };
  }

  static async updateMany(query, updateData) {
    const db = readDB();
    let modifiedCount = 0;
    db.payments = db.payments.map(p => {
      const matches = Object.keys(query).every(key => {
        const value = query[key];
        if (value && typeof value === 'object' && '$lt' in value) {
          return new Date(p[key]) < new Date(value.$lt);
        }
        return p[key] === value;
      });
      if (matches) {
        modifiedCount += 1;
        return { ...p, ...updateData, updatedAt: new Date() };
      }
      return p;
    });
    writeDB(db);
    return { modifiedCount };
  }

  static async insertMany(items) {
    const db = readDB();
    const payments = items.map(item => {
      const payment = new Payment(item);
      db.payments.push({ ...payment });
      return payment;
    });
    writeDB(db);
    return payments;
  }
}

module.exports = Payment;
