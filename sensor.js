function Sensor(name) {
  this._name = name;
  this._level = 0;
}

Sensor.prototype = {
  key: function() {
    return this._name;
  },
  level: function() {
    return this._level;
  },
  onChange: function(handler) {
    handler(level);
    return this;
  }
};

module.exports = {
  Sensor: Sensor
};
