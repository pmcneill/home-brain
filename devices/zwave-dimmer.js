var zwave = require('../zwave.js'),
    cfg = require('../config.js'),
    Device = require('../device.js'),
    state = require('../state.js'),
    ManualRule = require('../rules/manual.js');

function ZWaveDimmerDevice(name, node_id, defaultLevel) {
  defaultLevel = defaultLevel || 0;
  Device.call(this, name, { level: defaultLevel } );

  this._dimmer = zwave.Dimmer.byNode(node_id);

  var that = this;
  this._manualRule = null;

  this._dimmer.onUpdate(function(level) {
    if ( !!level == !!that.get('level') ) {
      if ( cfg.debug ) console.log("Dimmer " + node_id + " level update " + level + ", " + that.get('level') + ", ignoring");
      return;
    }

    if ( this._manualRule ) {
      state.deleteRule(this._manualRule);
      this._manualRule = null;
    } else {
      var m = new ManualRule("Node " + node_id + " override to " + level);
      m.addDevice(that, { level: level });
      if ( cfg.debug ) console.log("Creating override rule for dimmer " + node_id + " at " + level);
      state.addRule(m, 9999);
    }
  });
}

ZWaveDimmerDevice.prototype = new Device();
ZWaveDimmerDevice.prototype.constructor = ZWaveDimmerDevice;

ZWaveDimmerDevice.prototype.set = function(key, value) {
  Device.prototype.set.call(this, key, value);

  this._dimmer.setLevel(value);

  return this;
};

module.exports = ZWaveDimmerDevice;
