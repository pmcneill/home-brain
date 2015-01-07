var zwave = require('../zwave.js'),
    cfg = require('../config.js'),
    Device = require('../device.js');

function ZWaveDimmerDevice(name, node_id, defaultLevel) {
  defaultLevel = defaultLevel || 0;
  Device.call(this, name, { level: defaultLevel } );

  this._dimmer = zwave.Dimmer.byNode(node_id);
}

ZWaveDimmerDevice.prototype = new Device();
ZWaveDimmerDevice.prototype.constructor = ZWaveDimmerDevice;

ZWaveDimmerDevice.prototype.set = function(key, value) {
  Device.prototype.set.call(this, key, value);

  this._dimmer.setLevel(value);

  return this;
};

module.exports = ZWaveDimmerDevice;
