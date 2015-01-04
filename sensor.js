function Sensor(name) {
  this._name = name;
  this._data = {};
  this._handler = null;
}

Sensor.prototype = {
  key: function() {
    return this._name;
  },

  onChange: function(handler) {
    this._handler = handler;
    return this;
  },
  changed: function() {
    if ( this._handler ) this._handler();
    return this;
  },

  get: function(name) {
    return this._data[name];
  },
  set: function(name, value) {
    this._data[name] = value;
    return this;
  },
  has: function(name) {
    return this._data.hasOwnProperty(name);
  }
};

module.exports = Sensor;
