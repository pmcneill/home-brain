var cfg = require('./config.js');

function Rule(name, eval_function) {
  this._name = name;
  this._devices = {};
  this._sensors = {};
  this._subRules = {};
  this._evaluate = eval_function;
  this._data = {};
  this._next_update = null;
}

Rule.prototype = {
  key: function() {
    return this._name;
  },

  // Attributes is an object hash of fields to set in the
  // device associated with the values to set them to.
  addDevice: function(dev, attributes) {
    this._devices[dev.key()] = {
      device: dev,
      attributes: attributes
    };
    return this;
  },
  devices: function() {
    var retval = [];
    for ( var key in this._devices ) retval.push(this._devices[key].device);
    return retval;
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
  unset: function(key) {
    delete this._data[key];
    return this;
  },
  get: function(key) {
    return this._data[key];
  },

  addSubRule: function(rule) {
    this._subRules[rule.key()] = rule;

    // Copy up any sensors used to ensure the state will pick them up later
    var that = this;
    rule.sensors().forEach(function(sen) {
      that.addSensor(sen);
    });

    return this;
  },
  subRule: function(key) {
    return this._subRules[key];
  },

  evaluate: function(attrs) {
    for ( var key in this._subRules ) {
      if ( ! this._subRules[key].evaluate(attrs) ) return false;
    }

    if ( ! this._evaluate ) return true;
    return this._evaluate(attrs);
  },

  setAttribute: function(dev_key, attr, value) {
    this._devices[dev_key].attributes[attr] = value;
  },
  attributes: function() {
    var retval = {};

    for ( var key in this._devices ) {
      retval[key] = this._devices[key].attributes;
    };

    return retval;
  },

  // The evaluate function should call this to request a future update.
  setNextUpdate: function(secs) {
    this._next_update = secs;
    return this;
  },
  nextUpdate: function() {
    var retval = this._next_update;

    if ( cfg.debug >= 2 ) console.log(this._name + ": main next update time: " + retval);

    for ( var key in this._subRules ) {
      var subNext = this._subRules[key].nextUpdate();

      if ( subNext && ( ! retval || subNext < retval ) ) {
        if ( cfg.debug >= 2 ) console.log(this._name + " child " + key + " time is lower: " + retval + " vs " + subNext);
        retval = subNext;
      }
    }

    if ( cfg.debug >= 2 && this._next_update != retval ) console.log(this._name + ": using " + retval);

    this._next_update = null;

    return retval;
  }
};

module.exports = Rule;
