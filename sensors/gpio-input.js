var util = require('../util.js'),
    Sensor = require('../sensor.js');

/*
 * Wait for a signal on a GPIO pin.  The pin should be the 
 * wiringPi pin number, target 0 or 1.  The pin will be
 * set to input mode with an appropriate pull up/down 
 * resistor.
 */
function GPIOInputSensor(name, pin, target) {
  Sensor.call(this, name);

  var that = this;

  this._pin = pin;
  this._target = target;
  this._wfi_mode = target == 0 ? 'falling' : 'rising';

  util.gpioExec("mode", pin, "in", function() {
    util.gpioExec("mode", pin, that._target == 0 ? 'up' : 'down', function() {
      setTimeout(that.waitForInput.bind(that), 100);
    })
  });
}

GPIOInputSensor.prototype = new Sensor();
GPIOInputSensor.prototype.constructor = GPIOInputSensor;

GPIOInputSensor.prototype.waitForInput = function() {
  var that = this;

  util.gpioExec("wfi", this._pin, this._wfi_mode, function() {
    that.changed();

    // Give it some leeway for de-bouncing
    setTimeout(that.waitForInput.bind(that), 100);
  });
};

module.exports = GPIOInputSensor;
