var zwave = require('../zwave.js'),
    cfg = require('../config.js'),
    Device = require('../device.js');

function ZWaveSwitchDevice(name, node_id, defaultLevel, instance) {
  Device.call(this, name, { level: !!defaultLevel } );

  this._instance = instance;
  this._switch = zwave.Switch.byNode(node_id);
}

ZWaveSwitchDevice.prototype = new Device();
ZWaveSwitchDevice.prototype.constructor = ZWaveSwitchDevice;

ZWaveSwitchDevice.prototype.set = function(key, value) {
  Device.prototype.set.call(this, key, value);

  this._switch.set(value, this._instance);

  return this;
};

module.exports = ZWaveSwitchDevice;
