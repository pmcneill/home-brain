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
    ZWave = require('./zwave.js'),
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
      daylight = new DaylightSensor('Daylight');
      darkness = new DarknessRule();

  // Obviously, refactor this...
  var zwave_devices = {
    3: tree,
    4: den1,
    5: den2,
    6: deck,
    7: flood,
    8: garage,
    9: den3
  };

  darkness.addSensor(daylight);

  // Den lights on from darkness until 11pm
  state.addRule(
    new Rule('Evening lights')
          .addSubRule(darkness)
          .addSubRule(new BeforeTimeRule('bedtime', 23, 0))
          .addDevice(den1, { level: 80 })
          .addDevice(den2, { level: 80 })
          .addDevice(tree, { level: 100 }),
    10
  );

  state.addRule(
    new Rule('Motion lights')
          .addSubRule(darkness)
          .addSubRule(
            new MotionDelayRule('Den Motion', 300)
              .addSensor(motion)
          )
          .addDevice(flood, { level: 100 })
          .addDevice(garage, { level: 100 })
          .addDevice(den1, { level: 40 })
          .addDevice(den2, { level: 40 }),
    5
  );

  ZWave.onReady(function(nodes) {
    for (var node_id in nodes) {
      (function(node_id) {
        var key = zwave_devices[node_id].key(),
            path = "/tmp/node-" + node_id;

        console.log("Node ID " + node_id + " controlled at " + path);

        state.addRule(
          new Rule(key + ' manual control', function() {
            if ( ! this.sensor(path).get("exists") ) return false;
            var level = parseInt(fs.readFileSync(path, "utf8")) || 75;
            this.setAttribute(key, 'level', level);
            return true;
          })
          .addSensor(new FileSensor(path, path))
          .addDevice(zwave_devices[node_id], { level: 75 }),
          20
        );
      })(node_id);
    }
  });

  state.update();
}

main();
