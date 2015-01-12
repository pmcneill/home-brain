var zwave = require('../zwave.js'),
    cfg = require('../config.js'),
    Device = require('../device.js'),
    state = require('../state.js'),
    ManualRule = require('../rules/manual.js');

function ZWaveSwitchDevice(name, node_id, defaultLevel, instance) {
  Device.call(this, name, { level: !!defaultLevel } );

  this._instance = instance;
  this._switch = zwave.Switch.byNode(node_id);

  var that = this;

/*
  this._switch.onUpdate(function(level) {
    if ( !!level == !!that.get('level') ) return;

    var m = new ManualRule("Node " + node_id + " override to " + level);
    if ( cfg.debug ) console.log("Creating override rule for switch " + node_id + " at " + level);
    m.addDevice(that, { level: level });
    state.addRule(m, 9999);
  });
*/
}

ZWaveSwitchDevice.prototype = new Device();
ZWaveSwitchDevice.prototype.constructor = ZWaveSwitchDevice;

ZWaveSwitchDevice.prototype.set = function(key, value) {
  Device.prototype.set.call(this, key, value);

  this._switch.set(value, this._instance);

  return this;
};

module.exports = ZWaveSwitchDevice;
