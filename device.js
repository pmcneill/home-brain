function Device(name) {
  this._name = name;
  this._zones = [];
  this._level = 0;
}

Device.prototype = {
  key: function() {
    return this._name;
  },
  off: function() {
    this.setLevel(0);
  },
  on: function() {
    this.setLevel(100);
  },
  setLevel: function(l) {
    console.log("Setting level for " + this._name + " to " + l);
    return this._level = l;
  },
  level: function() {
    return this._level;
  }
};

module.exports = {
  Device: Device
};
