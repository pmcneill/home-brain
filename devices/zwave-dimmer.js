var zwave = require('../zwave.js'),
    cfg = require('../config.js'),
    Device = require('../device.js');

function ZWaveDimmerDevice(name, node_id, defaultLevel) {
  defaultLevel = defaultLevel || 0;
  Device.call(this, name, { level: defaultLevel } );

  this._node_id = node_id;
  this._dimmer = null;
  this._levelChanged = false;

  var that = this;
  zwave.onReady(function(nodes) {
    that._dimmer = nodes[node_id];

    if ( that._levelChanged ) {
      if ( cfg.debug ) console.log("Z-wave ready, setting " + that._node_id + " level to previously-set " + that.get("level"));
      that._dimmer.setLevel(that.get("level"));
      that._levelChanged = false;
    }
  });
}

ZWaveDimmerDevice.prototype = new Device();
ZWaveDimmerDevice.prototype.constructor = ZWaveDimmerDevice;

ZWaveDimmerDevice.prototype.set = function(key, value) {
  Device.prototype.set.call(this, key, value);

  if ( this._dimmer ) {
    if ( cfg.debug ) console.log("Setting z-wave node " + this._node_id + " to " + value);
    this._dimmer.setLevel(value);
  } else {
    if ( cfg.debug ) console.log("Z-wave not ready, setting value to " + value + " later");
    this._levelChanged = true;
  }

  return this;
};

module.exports = ZWaveDimmerDevice;
