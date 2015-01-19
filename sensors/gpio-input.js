var util = require('../util.js'),
    Sensor = require('../sensor.js');

/*
 * Wait for a signal on a GPIO pin.  The pin should be the 
 * wiringPi pin number, target 0 or 1.  The pin will be
 * set to input mode with an appropriate pull up/down 
 * resistor, based on the pullDown arg.
 */
function GPIOInputSensor(name, pin, target, useInterrupt, interval, pullDown) {
  Sensor.call(this, name);

  var that = this;

  this._pin = pin;
  this._target = target;
  this._timeoutHandle = null;
  this._interval = interval || 15000;

  util.gpioExec("mode", pin, "in", function() {
    util.gpioExec("mode", pin, pullDown ? 'down' : 'up');
  });

  if ( useInterrupt ) {
    this.waitForInput();
  } else {
    setInterval(this.readLevel.bind(this), this._interval);
  }
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

GPIOInputSensor.prototype.waitForInput = function() {
  var that = this;

  this.readLevel(function(level) {
    var wfi_mode = level ? 'falling' : 'rising';

    if ( level === that._target ) {
      setTimeout(that.waitForInput.bind(that), that._interval);
    } else {
      util.gpioExec("wfi", that._pin, wfi_mode, function() {
        that.readLevel(function() { setTimeout(that.waitForInput.bind(that), 250) });
      });
    }
  });

}

GPIOInputSensor.prototype.isTriggered = function() {
  return this.get('level') === this._target;
}

module.exports = GPIOInputSensor;
