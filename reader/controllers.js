var models = require('./models')
  , sys = require('sys')
  , Step = require('step')
  , logger = require('./logger')
;

var get = {
  '/': function(req, res) {
    Step(
      function load() {
        models.Subscription.find({}, this);
      },
      function render(err, subscriptions) {
        if (err) throw err;
        res.render('index', { 
          pageTitle: "Many Returns of the Day to You!",
          locals: { 'subscriptions':subscriptions }
        });
      }
    );
  },
  '/subscription.:format?': function(req, res) {
    Step(
      function load() {
        models.Subscription.find({}, this);
      },
      function render(err, subscriptions) {
        if (err) throw err;
        logger.debug("req format: %s", sys.inspect(req.params.format));
        if (req.params.format == 'json') {
          res.send(subscriptions)
        } else {
          res.render('subscription/view', { 
            locals: { 'subscriptions':subscriptions }
          });
        }
      }
    );
  },
  '/subscription/:id.:format?': function(req, res) { // get subscription
    Step(
      function load() {
        models.Subscription.findOne({_id: req.params.id}, this);
      },
      function render(err, subscription) {
        if (err) throw err;
        res.send(subscription)
      }
    );
  },
  '/subscription/header/:id': function(req, res) {
    Step(
      function load() {
        models.Subscription.findOne({_id: req.params.id}, this);
      },
      function render(err, subscription) {
        if (err) throw err;
        res.render('subscription/_header', { 
          locals: { 'subscription':subscription }
        });
      }
    );
  },
};

var post = {
  '/subscription.:format?': function(req, res) { // add subscription
    var sub = new models.Subscription(req.body);
    if (!sub.title) {
      sub.title = sub.feedUrl;
    }
    logger.debug(sys.inspect(sub));
    sub.save(function(err){
      if (err) throw err;
      if (req.params.format == 'json') {
        res.send(sub);
      } else {
        req.flash('info', 'Added ' + sub.feedUrl);
        res.redirect('/');
      }
    });
  }
};

var put = {
  '/subscription/:id.:format?': function(req, res, next) { // update sub
    models.Subscription.findOne({_id: req.params.id}, function(err, subscription) {
      if (!subscription) return next(new Error("Invalid subscription"));
      // TODO figure out a way to read props of schema and load from req.body
      subscription.feedUrl = req.body.feedUrl;
      subscription.title = req.body.title;
      subscription.save(function(err){
        if (err) throw err;
        if (req.params.format == 'json') {
          res.send(subscription);
        } else {
          req.flash('info', 'Updated ' + subscription.feedUrl);
          res.redirect('/');
        }
      });
    });
  }
};

var del = {
  '/subscription/:id': function(req, res) { // delete
    res.send(req.params);
  }
};

module.exports = {
  'get': get,
  'post': post,
  'put': put,
  'del': del
};

