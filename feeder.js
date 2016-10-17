var sys = require('sys')
  , Step = require('step')
  , logger = require(__dirname + '/reader/logger')
  , models = require(__dirname + '/reader/models')
  , UPDATE_INTERVAL = 1000 * 60 * 2
;
console.log("logger " + sys.inspect(logger));
console.log("require paths in feeder");
console.log(sys.inspect(require.paths));
require.paths.unshift(__dirname + "/reader");
console.log("path " + sys.inspect(__dirname + "/reader"));
console.log(sys.inspect(require.paths));

console.log("And on this glorious day, I have come into existence with the pid " + process.pid);
console.log("hello from feeder.js");

// what if we have a slow sub.. prevent multiple runs again the same url
function update() {
  // since this will be a long running process, we should refresh the listing of subscriptions
  // every now and again
  Step(
    function loadSubs() {
      // models.Subscription.find({}, this);
      models.Subscription.findForUpdate(this);
    },
    function fetchRss(err, subs) {
      // throttle number of requests per second that we do against remote rss feeds.  maybe 5 at a time
      // https://github.com/mikeal/request
      // also make sure to handle error conditions.  are we being denied by remote?  404? 500? notify via web interface
      if (err) throw err;
      subs.forEach(function(sub, key){
        logger.info("fetching %s", sub.feedUrl);
      });
    }
  );
}

var onmessage = function (msg) {
  logger.debug("worker got message %s", sys.inspect(msg));
  postMessage({"thanks":msg});
};

var onclose = function() {
  logger.debug("worker going away");
};

// kick off and update
update();
setInterval(update, UPDATE_INTERVAL);


