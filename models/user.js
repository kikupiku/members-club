let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  firstName: { type: String, required: true, max: 20 },
  lastName: { type: String, required: true, max: 20 },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isMember: { type: Boolean, default: false },
});

UserSchema
.virtual('fullName')
.get(function () {
  return firstName + ' ' + lastName;
});

module.exports = mongoose.model('User', UserSchema);
