let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let moment = require('moment');

let MessageSchema = new Schema({
  title: { type: String, required: true, max: 100 },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date },
});

MessageSchema
.virtual('dateFormatted')
.get(function () {
  return moment(this.date).format('Do of MMM \'YY, h:mm A');
});

module.exports = mongoose.model('Message', MessageSchema);
