var util = require('../util.js'),
    Device = require('../device.js');

function GPIOOutputDevice(name, pin, defaultLevel) {
  defaultLevel = defaultLevel || 0;

  Device.call(this, name, { level: defaultLevel } );

  this._pin = pin;

  util.gpioExec("mode", pin, "out", function() {
    util.gpioExec("write", pin, defaultLevel);
  });
}

GPIOOutputDevice.prototype = new Device();
GPIOOutputDevice.prototype.constructor = GPIOOutputDevice;

GPIOOutputDevice.prototype.set = function(key, value) {
  Device.prototype.set.call(this, key, value);

  util.gpioExec("write", this._pin, value);

  return this;
};

module.exports = GPIOOutputDevice;
