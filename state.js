var cfg = require('./config.js');

function State() {
  this._rules = [];
  this._devices = {};
  this._timeout_handle = null;
}

State.prototype = {
  addDevice: function(dev) {
    this._devices[dev.key()] = dev;
    return this;
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

    rule.sensors().forEach(function(sen) {
      sen.onChange(function() {
        if ( that._timeout_handle ) {
          clearTimeout(that._timeout_handle);
          that._timeout_handle = null;
        }

        if ( cfg.debug ) {
          console.log(sen.key() + ": Cleared timeout, forcing immediate update");
          console.log(sen._data);
        }

        that.update();
      });
    });

    return this;
  },

  update: function() {
    // Check things at least every half hour
    var next_run = 1800, that = this;
    var attrs = {};
    var active = 0;

    // The device defaults are basically -infinity priority, when it comes
    // to rules and weighting.
    for ( var key in this._devices ) {
      attrs[key] = this._devices[key].defaults();
    }

    this._rules.forEach(function(r) {
      if ( r.rule.evaluate() ) {
        active++;

        var rattrs = r.rule.attributes();
        for ( var dev_key in rattrs ) {
          for ( var attr_key in rattrs[dev_key] ) {
            attrs[dev_key][attr_key] = rattrs[dev_key][attr_key];
          }
        }
      }

      var rule_next_run = r.rule.nextUpdate();
      if ( rule_next_run && rule_next_run < next_run ) next_run = rule_next_run;
    });

    for ( var dev_key in attrs ) {
      var dattrs = attrs[dev_key],
          dev = this._devices[dev_key];

      for ( var attr_key in dattrs ) {
        // Only update an attribute level if it's different
        if ( dattrs[attr_key] !== dev.get(attr_key) ) {
          dev.set(attr_key, dattrs[attr_key]);
        }
      }
    }

    if ( cfg.debug ) {
      console.log("Update finished.  " + active + " rules were active.  Next run in " + next_run + " seconds");
    }

    // Run in a new context, using .bind() to set the "this" for the call
    this._timeout_handle = setTimeout(this.update.bind(this), next_run * 1000);
  }
};

module.exports = State;
