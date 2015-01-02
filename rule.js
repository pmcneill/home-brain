function Rule(eval_function) {
  this._devices = [];
  this._sensors = [];
  this._subRules = [];
  this._evaluate = eval_function;
  this._data = {};
  this._next_update = null;
}

Rule.prototype = {
  addDevice: function(dev, onLevel, offLevel) {
    onLevel = (onLevel === undefined) ? 100 : onLevel;
    offLevel = (offLevel === undefined) ? 0 : offLevel;

    this._devices.push({
      device: dev,
      onLevel: onLevel,
      offLevel: offLevel
    });
    return this;
  },
  devices: function() {
    return this._devices.map(function(d) { return d.device; });
  },

  addSensor: function(sensor) {
    this._sensors.push(sensor);
    return this;
  },
  sensors: function() {
    return this._sensors;
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

  getNewLevels: function() {
    var levelField = "onLevel",
        retval = {};

    this._next_update = null;

    if ( ! this.evaluate() ) levelField = "offLevel";

    this._devices.forEach(function(dev) {
      retval[dev.device.key()] = dev[levelField];
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
    return this._next_update;
  }
};

module.exports = {
  Rule: Rule
};
