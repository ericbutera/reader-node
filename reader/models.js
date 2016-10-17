var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , sys = require('sys')
  , logger = require('./logger')
;
mongoose.connect('mongodb://localhost/reader-node');

var Subscription = new Schema({
    feedUrl      : { type: String, index: { unique: true } }
   , title       : String
   , url         : String
   , added       : { type: Date, default: Date.now }
   , updated     : Date
   , unread      : { type: Number, default: 0 }
   , description : String
});
mongoose.model('Subscription', Subscription);
var sub = module.exports.Subscription = mongoose.model("Subscription");
sub.findForUpdate = function(cb) {
  var query = { '$or' : [{"updated":null} , {"updated":{'$lt':new Date()}}] };
  this.find(query, cb); // will call back using function (err, docs)
};


var Entry = new Schema({
    guid          : { type: String, index: { unique: true } }
   , title        : String
   , link         : String
   , description  : String
   , pubDate      : { type: Date, default: Date.now }
   , views        : { type: Number, default: 0 }
   , isRead       : { type: Number, default: 0 }
   , subscription : [Subscription]
});
mongoose.model('Entry', Entry);
module.exports.Entry = mongoose.model('Entry');

