var State = require('./state.js'),
    Device = require('./device.js'),
    Rule = require('./rule.js'),
    TestFileSensor = require('./sensors/test-file.js'),
    DaylightSensor = require('./sensors/daylight.js'),
    WeatherSensor = require('./sensors/weather.js');

function main() {
  var state = new State(),
      sw1 = new Device('switch 1'),
      sw2 = new Device('switch 2'),
      fs1 = new TestFileSensor('sensor 1', '/tmp/foo'),
      weather = new WeatherSensor('Main'),
      dl = new DaylightSensor('Light or dark'),
      rule1 = new Rule(function() {
        var retval = ! this.get("last");
        this.set("last", retval);
        this.setNextUpdate(60);
        return retval;
      });

  rule1.addDevice(sw1);
  rule1.addDevice(sw2, 80, 0);
  rule1.addSensor(fs1);
  rule1.addSensor(weather);
  rule1.addSensor(dl);

  state.addRule(rule1);
  state.update();
}

main();
