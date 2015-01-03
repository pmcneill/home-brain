function Rule(eval_function) {
  this._devices = [];
  this._sensors = {};
  this._subRules = [];
  this._evaluate = eval_function;
  this._data = {};
  this._next_update = null;
}

Rule.prototype = {
  // Attributes is an object hash of fields to set in the
  // device associated with the values to set them to.
  addDevice: function(dev, attributes) {
    this._devices.push({
      device: dev,
      attributes: attributes
    });
    return this;
  },
  devices: function() {
    return this._devices.map(function(d) { return d.device; });
  },

  addSensor: function(sensor) {
    this._sensors[sensor.key()] = sensor;
    return this;
  },
  sensors: function() {
    var retval = [];
    for ( var key in this._sensors ) {
      if ( ! this._sensors.hasOwnProperty(key) ) continue;
      retval.push(this._sensors[key]);
    }
    return retval;
  },
  sensor: function(key) {
    return this._sensors[key];
  },

  // For the eval function to persist data
  set: function(key, value) {
    this._data[key] = value;
    return this;
  },
  get: function(key) {
    return this._data[key];
  },

  evaluate: function() {
    for ( var i = 0 ; i < this._subRules.length ; i++ ) {
      if ( ! this._subRules.evaluate() ) return false;
    }

    return this._evaluate();
  },

  attributes: function() {
    var retval = {};

    this._devices.forEach(function(dev) {
      retval[dev.device.key()] = dev.attributes;
    });

    return retval;
  },

  // The evaluate function should call this to request a future
  // update.
  setNextUpdate: function(secs) {
    this._next_update = secs;
    return this;
  },
  nextUpdate: function() {
    var retval = this._next_update;
    this._next_update = null;
    return retval;
  }
};

module.exports = Rule;
