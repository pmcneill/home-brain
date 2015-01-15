var fs = require('fs'),
    State = require('./state.js'),
    Device = require('./device.js'),
    Rule = require('./rule.js'),
    DaylightSensor = require('./sensors/daylight.js'),
    DarknessRule = require('./rules/darkness.js'),
    BeforeTimeRule = require('./rules/before-time.js'),
    MotionDelayRule = require('./rules/motion-delay.js'),
    GPIOInputSensor = require('./sensors/gpio-input.js'),
    FileSensor = require('./sensors/test-file.js'),
    ZWaveDimmerDevice = require('./devices/zwave-dimmer.js');
    ZWaveSwitchDevice = require('./devices/zwave-switch.js');

function main() {
  var state = new State(),
      den1 = new ZWaveDimmerDevice('Lamp (stairs)', 4),
      den2 = new ZWaveDimmerDevice('Lamp (wall)', 5),
      den3 = new ZWaveDimmerDevice('Lamp (corner)', 9),
      blue = new ZWaveDimmerDevice('Blue Room Lamp', 3),
      flood = new ZWaveDimmerDevice('Flood Light', 7),
      deck = new ZWaveDimmerDevice('Deck Door', 6),
      garage = new ZWaveDimmerDevice('Garage Back Door', 8),
      steps = new ZWaveSwitchDevice('Step Lights', 2, false, 3);
      patio = new ZWaveSwitchDevice('Patio Lights', 2, false, 2);
      daylight = new DaylightSensor('Daylight');
      darkness = new DarknessRule();

  // Obviously, refactor this...
  var zwave_devices = {
    3: blue,
    4: den1,
    5: den2,
    6: deck,
    7: flood,
    8: garage,
    9: den3,
    '2.2': patio,
    '2.3': steps
  };

  darkness.addSensor(daylight);

  // Den lights on from darkness until 11pm
  state.addRule(
    new Rule('Evening lights')
          .addSubRule(darkness)
          .addSubRule(new BeforeTimeRule('bedtime', 22, 0))
          .addDevice(den1, { level: 50 })
          .addDevice(den2, { level: 50 })
          .addDevice(steps, { level: true }),
    10
  );

  state.addRule(
    new Rule('Motion lights')
          .addSubRule(darkness)
          .addSubRule(
            new MotionDelayRule('Den Motion', 300)
              .addSensor(new GPIOInputSensor('Den Motion', 0, 0, 15000))
          )
          .addDevice(den1, { level: 40 })
          .addDevice(den2, { level: 40 }),
    5
  );

  state.addRule(
    new Rule('Deck door lights')
          .addSubRule(darkness)
          .addSubRule(
            new MotionDelayRule('Deck door open delay', 600)
              .addSensor(new GPIOInputSensor('Deck door open', 5, 1, 500))
          )
          .addDevice(flood, { level: 100 })
          .addDevice(garage, { level: 100 })
          .addDevice(steps, { level: true })
          .addDevice(patio, { level: true }),
    5
  );

  state.addRule(
    new Rule('Front door lights')
          .addSubRule(darkness)
          .addSubRule(
            new MotionDelayRule('Front door open delay', 300)
              .addSensor(new GPIOInputSensor('Front door open', 6, 1, 1000))
          )
          .addDevice(blue, { level: 80 }),
    5
  );

  for ( var node_id in zwave_devices ) {
    (function(node_id) {
      var dev = zwave_devices[node_id],
          key = dev.key(),
          path = "/tmp/node-" + node_id;

      console.log("Node ID " + node_id + " controlled at " + path);

      state.addRule(
        new Rule(key + ' manual control', function() {
            if ( ! this.sensor(path).get("exists") ) return false;
            var level = 75;

            if ( fs.existsSync(path) ) {  // double-check, in case of lag
              level = parseInt(fs.readFileSync(path, "utf8"));
              if ( isNaN(level) ) level = 75;
            }

            if ( dev instanceof ZWaveSwitchDevice ) level = !!level;

            this.setAttribute(key, 'level', level);
            return true;
          })
          .addSensor(new FileSensor(path, path))
          .addDevice(dev, { level: (dev instanceof ZWaveSwitchDevice) ? true : 75 }
        ),
        100
      );
    })(node_id);
  };

  state.update();
}

main();
