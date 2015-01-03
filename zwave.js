var ozw = require('openzwave'),
    cfg = require('./config.js'),
    zwave = new ozw(cfg.zwave_path);

var nodes = {},
    onReady_callbacks = [],
    zwaveReady = false;

// Calls back with the list of available nodes
function onReady(callback) {
  onReady_callbacks.push(callback);
}

zwave.on('scan complete', function() {
  if ( cfg.debug ) {
    console.log("Z-wave scan complete!");
    console.log(nodes);
  }
  zwaveReady = true;

  onReady_callbacks.forEach(function(cb) {
    cb(nodes);
  });

  for ( var nodeid in nodes ) {
    zwave.enablePoll(nodeid, 38);
  }
});

function Dimmer(nodeid) {
  this._id = nodeid;
  this._actual_level = 0;
}

Dimmer.prototype = {
  level: function() {
    return this._actual_level;
  },
  setLevel: function(level) {
    zwave.setLevel(this._id, level);
    return this;
  },
  _pollLevelUpdate: function(level) {
    this._actual_level = level;
    return this;
  }
};

var value_handler = function(nodeid, comclass, value) {
  if ( comclass != 38 ) return;

  if ( ! nodes[nodeid] ) {
    nodes[nodeid] = new Dimmer(nodeid);
  }
  nodes[nodeid]._pollLevelUpdate(value.value);
};

zwave.on('value added', value_handler);
zwave.on('value changed', value_handler);

zwave.connect();

process.on('SIGINT', function() {
  console.log('Disconnecting...');
  zwave.disconnect();
  process.exit();
});

module.exports = {
  Dimmer: Dimmer,
  onReady: onReady
};
