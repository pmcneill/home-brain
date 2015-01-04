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

  setInterval(this.readLevel.bind(this), 15000);
}

GPIOInputSensor.prototype = new Sensor();
GPIOInputSensor.prototype.constructor = GPIOInputSensor;

GPIOInputSensor.prototype.readLevel = function() {
  var that = this, lastLevel = this.get("level");

  util.gpioExec("read", this._pin, "", function(out) {
    var level = parseInt(out.trim());
    that.set("level", level);

    if ( level == that._target ) that.set("lastTargetAt", new Date());

    if ( lastLevel != level ) that.changed();
  });
};

GPIOInputSensor.prototype.waitForInput = function() {
  var that = this;

  util.gpioExec("wfi", this._pin, this._wfi_mode, function() {
    that.set("lastTargetAt", new Date());
    that.set("level", that._target);

    that.changed();

    // Give it some leeway for de-bouncing / pin release
    setTimeout(that.waitForInput.bind(that), 250);
  });
};

module.exports = GPIOInputSensor;
