var util = require('./util.js');

function Device(name, defaults) {
  this._name = name;
  this._zones = [];
  this._defaults = defaults || {};
  this._data = util.shallowCopy(this._defaults);
}

Device.prototype = {
  key: function() {
    return this._name;
  },
  set: function(key, value) {
    console.log("Setting " + key + " for " + this._name + " to " + value);
    this._data[key] = value;
    return this;
  },
  get: function(key) {
    return this._data[key];
  },
  defaultFor: function(key) {
    return this._defaults[key];
  },
  defaults: function() {
    return util.shallowCopy(this._defaults);
  }
};

module.exports = Device;
