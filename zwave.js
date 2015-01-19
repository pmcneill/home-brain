var ozw = require('openzwave'),
    cfg = require('./config.js'),
    zwave = new ozw(cfg.zwave_path);

var nodes = {};

zwave.on('scan complete', function() {
  if ( cfg.debug ) console.log("Z-wave scan complete!");

  for ( var nodeid in nodes ) {
    if ( cfg.debug ) console.log("...node " + nodeid + " class " + nodes[nodeid]._classNum);
    nodes[nodeid].ready();
  }
});

var COMMANDS_PER_SECOND = 3;
var times = [];
var queue = [];
var queue_timeout = null;

function zwaveRunQueue() {
  var now = (new Date()).getTime();

  for ( var i = 0 ; i < COMMANDS_PER_SECOND && queue.length > 0 ; i++ ) {
    var last = times[0];

    if ( times.length >= COMMANDS_PER_SECOND ) {
      if ( last > now - 1000 ) {
        console.log("RunQueue: Setting next run, " + now);
        queue_timeout = setTimeout(zwaveRunQueue, 1000);
        return;
      }

      times.shift();
    }

    times.push(now);
    var cmd = queue.shift();
    console.log("RunQueue: Actually running " + cmd.command + " " + cmd.node + " " + cmd.arg);
    zwave[cmd.command](cmd.node, cmd.arg);
  }

  if ( queue.length > 0 ) queue_timeout = setTimeout(zwaveRunQueue, 1000);
}

function zwaveCommand(node, command, arg) {
  queue.push({node: node, command: command, arg: arg});

  if ( ! queue_timeout ) zwaveRunQueue();
}

function Node(nodeid, classNum) {
  this._id = nodeid;
  this._isReady = false;
  this._updated = false;
  this._classNum = classNum;
}

Node.prototype = {
  classNum: function() { return this._classNum; },
  ready: function() {
    this._isReady = true;
    zwave.enablePoll(this._id, this._classNum);
    if ( this._updated ) this._flushSaved();
  }
};

// Dimmer and Switch are mostly caching layers -- give the outer bits 
// something to talk to until the z-wave controller is ready
function Dimmer(nodeid) {
  Node.call(this, nodeid, 38);

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

  zwaveCommand(this._id, "setLevel", level);
  if ( ! this._isReady ) this._updated = true;

  return this;
}
Dimmer.prototype._pollUpdate = function(classNum, value) {
  if ( classNum != this.classNum() || ! value || value.label != 'Level' ) return;
  if ( cfg.debug ) console.log("Z-wave node " + this._id + " polled level is " + value.value);
  this._polled_level = value.value;
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
  Node.call(this, nodeid, 37);
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

  zwaveCommand(this._id, "switch" + (value ? "On" : "Off"), instance);

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
