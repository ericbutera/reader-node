var logger = require('./logger');

module.exports = {
  _client: null,
  _messages: [],

  pushMessages: function() {
    if (!this.hasClient()) {
      return;
    }
    var message = '';
    while (message = this._messages.shift()) {
      logger.debug("pushing [%s] [%d remaining]", message, this._messages.length);
      this._client.send("message: " + message + " remaining: "+ this._messages.length);
    }
  },

  addMessage: function(message) {
    logger.debug("adding message: %s", message);
    this._messages.push(message);
    this.pushMessages();
  },

  setClient: function(client) {
    this._client = client;
    this.pushMessages();
  },

  hasClient: function() {
    return (this._client !== null);
  }
}
