var util = require('../util.js'),
    Sensor = require('../sensor.js');

/*
 * Wait for a signal on a GPIO pin.  The pin should be the 
 * wiringPi pin number, target 0 or 1.  The pin will be
 * set to input mode with an appropriate pull up/down 
 * resistor, based on the pullDown arg.
 */
function GPIOInputSensor(name, pin, target, interval, pullDown) {
  Sensor.call(this, name);

  var that = this;

  this._pin = pin;
  this._target = target;
  this._timeoutHandle = null;

  util.gpioExec("mode", pin, "in", function() {
    util.gpioExec("mode", pin, pullDown ? 'down' : 'up');
  });

  setInterval(this.readLevel.bind(this), interval || 15000);
}

GPIOInputSensor.prototype = new Sensor();
GPIOInputSensor.prototype.constructor = GPIOInputSensor;

GPIOInputSensor.prototype.update = function(level) {
  var lastLevel = this.get("level");
  if ( typeof(level) != 'number' ) level = parseInt(level);

  this.set("level", level);
  if ( level === this._target ) this.set("lastTargetAt", new Date());

  if ( level !== lastLevel ) this.changed();

  return level;
}

GPIOInputSensor.prototype.readLevel = function(callback) {
  var that = this;

  // If we're already at the target level, wait for 
  util.gpioExec("read", this._pin, "", function(out) {
    var level = that.update(out);
    if ( callback ) callback(level);
  });
}

module.exports = GPIOInputSensor;
