function Rule(eval_function) {
  this._devices = [];
  this._subRules = [];
  this._evaluate = eval_function;
  this._data = {};
}

Rule.prototype = {
  addDevice: function(dev, onLevel, offLevel) {
    onLevel = (onLevel === undefined) ? 100 : onLevel;
    offLevel = (offLevel == undefined) ? 0 : offLevel;

    this._devices.push({
      device: dev,
      onLevel: onLevel,
      offLevel: offLevel
    });
  },

  devices: function() {
    return this._devices.map(function(d) { return d.device; });
  },

  // For the eval function to persist data
  set: function(key, value) {
    return this._data[key] = value;
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

    if ( ! this.evaluate() ) levelField = "offLevel";

    this._devices.forEach(function(dev) {
      retval[dev.device.key()] = dev[levelField];
    });

    return retval;
  }
};

module.exports = {
  Rule: Rule
};
