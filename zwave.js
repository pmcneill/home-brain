var ozw = require('openzwave'),
    cfg = require('./config.js'),
    zwave = new ozw(cfg.zwave_path),
    state = require('./state.js'),
    manual = require('./rules/manual.js');

var nodes = {};

zwave.on('scan complete', function() {
  if ( cfg.debug ) console.log("Z-wave scan complete!");

  for ( var nodeid in nodes ) {
    if ( cfg.debug ) console.log("...node " + nodeid + " class " + nodes[nodeid]._classNum);
    nodes[nodeid].ready();
  }
});

function Node(nodeid, valueLabel, classNum) {
  this._id = nodeid;
  this._isReady = false;
  this._updated = false;
  this._classNum = classNum;
  this._valueLabel = valueLabel;
  this._updateCallback = null;
}

Node.prototype = {
  classNum: function() { return this._classNum; },
  ready: function() {
    this._isReady = true;
    zwave.enablePoll(this._id, this._classNum);
    if ( this._updated ) this._flushSaved();
  },
  onUpdate: function(callback) {
    this._updateCallback = callback;
  }
};

// Dimmer and Switch are mostly caching layers -- give the outer bits 
// something to talk to until the z-wave controller is ready
function Dimmer(nodeid) {
  Node.call(this, nodeid, 'Level', 38);

  this._level = 0;
  this._polled_level = 0;
}

Dimmer.prototype = new Node();
Dimmer.prototype.constructor = Node;

Dimmer.prototype.level = function() {
    return this._polled_level;
}
Dimmer.prototype.setLevel = function(level) {
  if ( level >= 100 ) level = 99;
  if ( level < 0 ) level = 0;
  this._level = level;

  zwave.setLevel(this._id, level);
  if ( ! this._isReady ) this._updated = true;

  return this;
}
Dimmer.prototype._pollUpdate = function(classNum, value) {
  if ( classNum != this.classNum() || ! value || value.label != 'Level' ) return;
  if ( cfg.debug ) console.log("Z-wave node " + this._id + " polled level is " + value.value);
  this._polled_level = value.value;

  if ( this._updateCallback ) this._updateCallback(this._level);
}
Dimmer.prototype._flushSaved = function() {
  if ( cfg.debug ) console.log("Z-wave network ready, setting " + this._id + " to " + this._level);
  this.setLevel(this._level);
}
   
Dimmer.byNode = function(id) {
  if ( ! nodes[id] ) nodes[id] = new Dimmer(id);
  return nodes[id];
}



function Switch(nodeid) {
  Node.call(this, nodeid, 'Switch', 37);
  this._id = nodeid;

  // instance_id => value
  this._instances = {};
  this._polled = {};
}

Switch.prototype = new Node();
Switch.prototype.constructor = Node;
Switch.prototype.set = function(value, instance) {
  instance = instance || 1;
  this._instances[instance] = value;

  zwave["switch" + (value ? "On" : "Off")](this._id, instance);
  if ( ! this._isReady ) this._updated = true;

  return this;
}
Switch.prototype.on = function(instance) {
  this.set(true, instance);
}
Switch.prototype.off = function(instance) {
  this.set(false, instance);
}
Switch.prototype.isOn = function(instance) {
  return this._polled[instance || 1];
}
Switch.prototype._flushSaved = function() {
  for ( var key in this._instances ) {
    if ( cfg.debug ) console.log("Z-wave network ready, setting " + this._id + "." + key + " to " + this._level);
    this.set(this._instances[key], key);
  }
}
Switch.prototype._pollUpdate = function(classNum, value) {
  if ( classNum != this.classNum() || ! value || value.label != 'Switch' ) return;
  if ( cfg.debug ) console.log("Z-wave node " + this._id + "." + value.instance + " polled level is " + value.value);
  this._polled[value.instance] = value.value;

  if ( this._updateCallback ) this._updateCallback(value.instance, value.value);
}

Switch.byNode = function(id) {
  if ( ! nodes[id] ) nodes[id] = new Switch(id);
  return nodes[id];
}

var value_handler = function(nodeid, comclass, value) {
  if ( ! nodes[nodeid] ) return;
  nodes[nodeid]._pollUpdate(comclass, value);
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
  Switch: Switch
};
