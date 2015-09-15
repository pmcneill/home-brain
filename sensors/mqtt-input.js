var util = require('../util.js'),
    Sensor = require('../sensor.js'),
    mqtt = require('mqtt');

var client = mqtt.connect('mqtt://192.168.0.27:1883'),
    sensors = {};

client.on('connect', function() {
  console.log("Connected to MQTT server");
  client.subscribe('/security');
});

client.on('message', function(topic, payload) {
  var parts = payload.toString().split(','),
      sensor = parseInt(parts[0]),
      value = parseInt(parts[1]);

  console.log("MQTT: Received " + sensor + " => " + value);

  if ( sensors[sensor] ) {
    sensors[sensor].update(value);
  }
});

function MQTTInputSensor(name, num, target) {
  Sensor.call(this, name);

  var that = this;

  this._num = num;
  this._target = target;

  sensors[num] = this;
}

MQTTInputSensor.prototype = new Sensor();
MQTTInputSensor.prototype.constructor = MQTTInputSensor;

MQTTInputSensor.prototype.update = function(level) {
  var lastLevel = this.get("level");
  if ( typeof(level) != 'number' ) level = parseInt(level);

  this.set("level", level);
  if ( level === this._target ) this.set("lastTargetAt", new Date());

  if ( level !== lastLevel ) this.changed();

  return level;
}

MQTTInputSensor.prototype.isTriggered = function() {
  return this.get('level') === this._target;
}

module.exports = MQTTInputSensor;
