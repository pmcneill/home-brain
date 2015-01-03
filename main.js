var State = require('./state.js'),
    Device = require('./device.js'),
    Rule = require('./rule.js'),
    TestFileSensor = require('./sensors/test-file.js'),
    DaylightSensor = require('./sensors/daylight.js'),
    WeatherSensor = require('./sensors/weather.js'),
    GPIOInputSensor = require('./sensors/gpio-input.js');

function main() {
  var state = new State(),
      sw1 = new Device('switch 1', { level: 0 }),
      sw2 = new Device('switch 2', { level: 25 }),
      rule1 = new Rule(function() {
        var retval = ! this.get("last");
        this.set("last", retval);
        this.setNextUpdate(60);
        return retval;
      });

  rule1.addDevice(sw1, { level: 100 });
  rule1.addDevice(sw2, { level: 80 });
//  rule1.addSensor(new GPIOInputSensor('Motion Detector', 7, 0));
//  rule1.addSensor(new WeatherSensor('Weather'));
  rule1.addSensor(new DaylightSensor('Light or Dark'));

  state.addRule(rule1);
  state.update();
}

main();
