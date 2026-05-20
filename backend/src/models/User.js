const bcrypt = require("bcryptjs");
const { readDB, writeDB } = require("../config/db");
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "tenant";
    this.phone = data.phone;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Save user to database
  async save() {
    const db = readDB();
    const existingIndex = db.users.findIndex(u => u.id === this.id);

    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...this };
    } else {
      db.users.push({ ...this });
    }

    writeDB(db);
    return this;
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2a$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    return this;
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    return userObject;
  }

  // Static methods
  static async findOne(query) {
    const db = readDB();
    const user = db.users.find(u =>
      Object.keys(query).every(key => u[key] === query[key])
    );
    return user ? new User(user) : null;
  }

  static async findById(id) {
    const db = readDB();
    const user = db.users.find(u => u.id === id);
    return user ? new User(user) : null;
  }

  static async find(query = {}) {
    const db = readDB();
    let users = db.users;

    // Apply filters
    if (query.role) {
      users = users.filter(u => u.role === query.role);
    }

    return users.map(u => new User(u));
  }

  static async create(data) {
    const user = new User(data);
    await user.hashPassword();
    return await user.save();
  }

  static async findOneAndUpdate(query, updateData) {
    const db = readDB();
    const index = db.users.findIndex(u =>
      Object.keys(query).every(key => u[key] === query[key])
    );

    if (index >= 0) {
      db.users[index] = { ...db.users[index], ...updateData, updatedAt: new Date() };
      writeDB(db);
      return new User(db.users[index]);
    }
    return null;
  }

  static async deleteOne(query) {
    const db = readDB();
    const index = db.users.findIndex(u =>
      Object.keys(query).every(key => u[key] === query[key])
    );

    if (index >= 0) {
      db.users.splice(index, 1);
      writeDB(db);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = User;
