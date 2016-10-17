var iniparser = require('iniparser')
  , express = require("express")
  , io = require('socket.io')
  , sys = require('sys')
  , _ = require('underscore')._
  , models = require('./reader/models')
  , controllers = require('./reader/controllers')
  , socketQueue = require('./reader/socketQueue')
  , logger = require('./reader/logger')
;

require.paths.unshift(__dirname + "/reader");

logger.log("Starting up!");

/*
var sub = new models.Subscription();
models.Subscription.findOne({'url':'http://localhost/rss-samples/hn.xml'}, function (err, found){
  console.log("err: %s", sys.inspect(err));
  console.log("found: %s", sys.inspect(found));
});
sub.url = "http://localhost/rss-samples/hn.xml";
sub.title = "Hacker News";
sub.feedUrl = "http://localhost/rss-samples/hn.xml";
sub.description = "Nerds!";
sub.save(function(err){
  console.log("save %s", sys.inspect(err));
});
*/

// application configuration
var config = iniparser.parseSync('./config.ini');
var app = express.createServer();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: config.session.secret }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

_.each(controllers, function(actions, requestMethod){
  _.each(actions, function(action, route){
    logger.log("registering route: %s %s", requestMethod, sys.inspect(route));
    app[requestMethod](route, action);
  });
});
app.listen(9001);

var queue = Object.create(socketQueue);

// socket.io
var socket = io.listen(app); 
socket.on('connection', function(client){ 
  // do stuff
  client.send("hello there client " + client.sessionId);
  queue.setClient(client);
  logger.log("connection ", client.sessionId);
});
socket.on('disconnect', function(){
  logger.log("disconnect");
  queue.setClient(null);
});

// not sure where to put this yet, experimenting!
process.env.NODE_DEBUG = 1;
logger.log("parent "+ process.pid +" creating child worker...");
var Worker = require("webworker").Worker
var w = new Worker(__dirname + '/reader/feeder.js');
// var w = new Worker(__dirname + '/worker.js');
// logger.log("worker " + sys.inspect(w));

w.postMessage({"task":"update ze urls!"});
w.postMessage({"hello":"world"});
w.onmessage = function(e) {
  console.log("got message " + sys.inspect(e));
  queue.addMessage("got webworker message " + sys.inspect(e));
  // w.terminate();
};

/*
var spawn = require("child_process").spawn
  , path = process.execPath +" "+ __dirname + "/reader/worker.js"

console.log("running worker: "+ worker);
*/

logger.log("Running...");

