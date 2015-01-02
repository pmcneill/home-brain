function State() {
  this._rules = [];
  this._devices = {};
}

State.prototype = {
  addDevice: function(dev) {
    this._devices[dev.key()] = dev;
  },

  // Rule instances aren't modified by the state manager, so they
  // can keep internal state, be duplicated, etc.  For instance,
  // a rule that's active for 15 minutes upon sensing motion could
  // record the state of the motion sensor + the last time it fired.
  addRule: function(rule, priority) {
    this._rules.push({rule: rule, priority: priority});

    // Keep the rules sorted by ascending priority (the order they'll run).
    this._rules.sort(function(a, b) {
      if ( a.priority < b.priority ) return -1;
      if ( a.priority > b.priority ) return 1;
      return 0;
    });

    var that = this;

    rule.devices().forEach(function(dev) {
      that.addDevice(dev);
    });
  },

  update: function() {
    var new_levels = {};

    // Run each rule, from lowest to highest priority, keeping
    // track of 
    this._rules.forEach(function(r) {
      var rule_levels = r.rule.getNewLevels();
      for ( var key in rule_levels ) {
        new_levels[key] = rule_levels[key];
      }
    });

    for ( var key in new_levels ) {
      var l = new_levels[key];

      if ( l != this._devices[key].level() ) {
        this._devices[key].setLevel(l);
      }
    }
  }
};

module.exports = {
  State: State
};
