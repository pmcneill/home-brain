var State = require('./state.js'),
    Device = require('./device.js'),
    Rule = require('./rule.js'),
    DaylightSensor = require('./sensors/daylight.js'),
    GPIOInputSensor = require('./sensors/gpio-input.js'),
    ZWaveDimmerDevice = require('./devices/zwave-dimmer.js');

function main() {
  var state = new State(),
      den1 = new ZWaveDimmerDevice('Lamp (stairs)', 4),
      den2 = new ZWaveDimmerDevice('Lamp (wall)', 5),
      den3 = new ZWaveDimmerDevice('Lamp (corner)', 9),
      tree = new ZWaveDimmerDevice('Christmas Tree', 3),
      flood = new ZWaveDimmerDevice('Flood Light', 7),
      deck = new ZWaveDimmerDevice('Deck Door', 6),
      garage = new ZWaveDimmerDevice('Garage Back Door', 8),
      motion = new GPIOInputSensor('Den Motion', 7, 0),
      darkness = new DaylightSensor('Darkness');

  // Den lights on from darkness until 11pm
  state.addRule(
    new Rule(function() {
      var bedtime = new Date(), now = bedtime.getTime() / 1000, delay;
      bedtime.setHours(23);
      bedtime.setMinutes(0);
      bedtime = bedtime.getTime() / 1000;

      delay = bedtime - now;
      if ( delay > 0 ) this.setNextUpdate(delay);

      return this.sensor('Darkness').get('isDark') && now < bedtime;
    }).addSensor(darkness)
      .addDevice(den1, { level: 80 })
      .addDevice(den2, { level: 80 })
      .addDevice(tree, { level: 100 }),
    10
  );

  state.addRule(
    new Rule(function() {
      if ( ! this.sensor('Darkness').get('isDark') ) return false;

      var sen = this.sensor('Den Motion'),
          lightsOffAt,
          now = (new Date()).getTime() / 1000,
          lastSensed = sen.get("lastTargetAt");

      if ( ! lastSensed ) return false;

      lastSensed = lastSensed.getTime() / 1000;
      lightsOffAt = lastSensed + 300;

      if ( now < lightsOffAt ) {
        this.setNextUpdate(lightsOffAt - now);
        return true;
      } else {
        return false;
      }
    }).addSensor(darkness)
      .addSensor(motion)
      .addDevice(flood, { level: 100 })
      .addDevice(garage, { level: 100 })
      .addDevice(den1, { level: 50 })
      .addDevice(den2, { level: 50 }),
    5
  );

  state.update();
}

main();
