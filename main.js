var State = require('./state.js'),
    Device = require('./device.js'),
    Rule = require('./rule.js'),
    TestFileSensor = require('./sensors/test-file.js'),
    DaylightSensor = require('./sensors/daylight.js'),
    WeatherSensor = require('./sensors/weather.js'),
    GPIOInputSensor = require('./sensors/gpio-input.js'),
    GPIOOutputDevice = require('./devices/gpio-output.js'),
    ZWaveDimmerDevice = require('./devices/zwave-dimmer.js');

function main() {
  var state = new State(),
      sw1 = new ZWaveDimmerDevice('Lamp (stairs)', 4, 0),
      sw2 = new ZWaveDimmerDevice('Lamp (wall)', 5, 0),
      gp1 = new GPIOOutputDevice('LED', 24),
      gp2 = new GPIOOutputDevice('Relay', 25, 1);

  // Turn switches on and off every minute...
  state.addRule(
    new Rule(function() {
      var retval = ! this.get("last");
      this.set("last", retval);
      this.setNextUpdate(60);
      return retval;
    }).addDevice(sw1, { level: 80 })
      .addDevice(sw2, { level: 80 })
      .addDevice(gp1, { level: 1 })
      .addDevice(gp2, { level: 0 }),
    1 // priority
  );

  // Higher-priority rule that turns lamp 1 on 100% while dark.
  // No timing information here, since the daylight sensor will
  // trigger a change event when isDark changes.
  state.addRule(
    new Rule(function() {
      return this.sensor('Light or Dark').get('isDark');
    }).addDevice(sw1, { level: 75 })
      .addSensor(new DaylightSensor('Light or Dark')),
    2
  );

  state.update();
}

main();
