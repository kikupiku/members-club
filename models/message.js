let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
  title: { type: String, required: true, max: 100 },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date },
});

module.exports = mongoose.model('Message', MessageSchema);
