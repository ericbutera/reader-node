var sys = require("sys")
  , sax = require("sax")
  , fs = require("fs")
  , crypto = require("crypto")
  , request = require("request")
  , strict = true
  , saxParser = sax.parser(strict)
  , logger = require(__dirname + '/logger')
;

function FeedParser() {
  this.start = new Date().getTime()
  , this.end = null
  , this.inItem = false
  , this.openCount = 0
  , this.openTags = []
  , this.tagLevel = 0
  , this.tagOut = ''
  , this.items = []
  , this.currentItem = null
  , this.currentTag = null
  , this.parser = saxParser

  // register parser event handlers
  this.parser.onerror = function (e) {
    // an error happened.
    console.log("parser onerror" + sys.inspect(e));
  };

  this.parser.ontext = function (t) {
    // got some text.  t is the string of text.
    console.log(t);
    try {
      this.currentItem[this.currentTag] = t;
    }catch(e){}
  };

  this.parser.oncdata = function (c) {
    // console.log("<![CDATA["+ c + "]]>");
    try {
      this.currentItem[this.currentTag] = c;
    }catch(e){}
  };

  this.parser.onopentag = function (node) {
    // opened a tag.  node has "name" and "attributes"
    console.log("<" + node.name);
    this.openTags.push(node.name);
    ++this.tagLevel;
    if ("item" == node.name) { 
      this.currentItem = new FeedItem();
      this.inItem = true;
      this.tagOut +="\n\t"; 
    } else if(this.inItem) {
      this.currentTag = node.name;
    }
    this.tagOut += "<"+ this.tagLevel +":"+ node.name+">";
  };

  this.parser.onclosetag = function (tag) {
    console.log("</" + tag + "\n");
    if ("item" == tag) {
      this.inItem = false;
      this.items.push(this.currentItem);
    } else if (this.inItem) {
      this.inTag = false;
    }
    this.tagOut += "</"+ this.tagLevel +":"+ tag+">";
    this.openTags.pop();
    --this.tagLevel;
  }

  this.parser.onattribute = function (attr) {
    console.log("parser attr" + sys.inspect(attr));
    // an attribute.  attr has "name" and "value"
  };

  this.parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    this.end = new Date().getTime()
    , this.final = (this.end - this.start) / 1000;
    console.log("final: %s", this.final);

    console.log("tagOut");
    console.log(this.tagOut);

    console.log("items:");
    console.log(this.items.length);

    var i = this.items.pop();
    console.log("item");
    console.log(i);
    console.log(i.guid);
  };
}

FeedParser.prototype = {
  parse: function(feedUrl) {
    this.url = feedUrl;
    // fetch url
    console.log("starting request for " + feedUrl);
    request({'url':feedUrl}, function (err, res, body){
      if (!err && res.statusCode == 200) {
        logger.log("FeedParser.parse " + sys.inspect(feedUrl));
        console.log("starting parsing " + body.substr(0, 25) + "..."+  body.substr(body.length-25, body.length) +" length: "+ body.length);
        try {
          console.log("parser: " + sys.inspect(this.parser));
          var r = this.parser.write(body).close();
          sys.inspect("r: "+ sys.inspect(r));
        } catch (e) { console.log("parse ex" + e.getMessage()); }
        console.log("done parsing");
        console.log("items");
        console.log(this.items);
      }
    });
  } 
};
module.exports.FeedParser = FeedParser;


/*
try {
  var file = __dirname + "/hn.rss";
  console.log("opening "+ file);
  var res = fs.readFile(file, 'utf8', function(err, data){
    if (err) throw err;
    parser.write(data).close();
  });
} catch (e) {
  console.log("exception!");
  console.log(e);
  console.log(e.toString());
}
*/

function FeedItem() {
  this.title = null
  , this.link = null
  , this.description = null
  , this.comments = null
  , this.pubDate = new Date()
  , this.author = null
  , this._guid = null;
}
FeedItem.prototype = {
  get guid() {
    console.log("get guid called "+ this._guid);
    if (null === this._guid) {
      this._guid = crypto.createHash('md5').update(this.title +":"+ this.link).digest('hex');
    }
    return this._guid;
  },
  set guid(guid) {
    this._guid = guid;
  }
};

module.exports.FeedItem = FeedItem;

