var sys = require('sys')
  , Step = require('step')
  , _ = require('underscore')._
  , logger = require(__dirname + '/logger')
  , models = require(__dirname + '/models')
  , parser = require(__dirname + '/rss-parser')
  , UPDATE_INTERVAL = 1000 * 60 * 15
;

logger.info("hello from reader/feeder.js " + process.pid);

update();
setInterval(update, UPDATE_INTERVAL);

// what if we have a slow sub.. prevent multiple runs again the same url
function update() {
  try { 
  logger.info("feeder update called");
  // since this will be a long running process, we should refresh the listing of subscriptions
  // every now and again
  Step(
    function getSubs() {
      models.Subscription.findForUpdate(this);
    },
    function fetchRss(err, subs) {
      logger.info("fetching rss");
      // throttle number of requests per second that we do against remote rss feeds.  maybe 5 at a time
      // https://github.com/mikeal/request
      // also make sure to handle error conditions.  are we being denied by remote?  404? 500? notify via web interface
      if (err) throw err;
      subs.forEach(function(sub, key){
        logger.info("fetching %s", sub.feedUrl);
        try {
          var feedParser = new parser.FeedParser();
          console.log("feeder.js feedparser parse start");
          feedParser.parse(sub.feedUrl);
          console.log("feeder.js feedparser parse end");
        } catch(e) { console.log("ex "+ sys.inspect(e)); }
        // var throttled = _.throttle(fn, wait)

        // update
        // fetch 5 at a time
      });
    }
  );
  } catch (e) {
    logger.error("uncaught exception " + sys.inspect(e));
  }
}

var onmessage = function (msg) {
  logger.debug("worker got message %s", sys.inspect(msg));
  postMessage({"thanks":msg});
};

var onclose = function() {
  logger.debug("worker going away");
};


