var fs = require('fs'),
    Sensor = require('../sensor.js');

function TestFileSensor(name, path) {
  var that = this;
  Sensor.call(this, name);

  setInterval(function() {
    fs.exists(path, function(exists) {
      if ( exists != !!that.get("exists") ) {
        that.set("exists", exists);
        that.changed();
      }
    });
  }, 5000);
}

TestFileSensor.prototype = new Sensor();
TestFileSensor.prototype.constructor = TestFileSensor;

module.exports = TestFileSensor;
