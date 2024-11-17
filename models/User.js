// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  username: { type: String, unique: true, default: null }, // Сделать username необязательным
  twoFASecret: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Добавлено поле role
});

module.exports = mongoose.model('User', UserSchema);
