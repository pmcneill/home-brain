var Rule = require('../rule.js'),
    state = require('../state.js'),
    cfg = require('../config.js');

function ManualRule(name) {
  name = name || 'Manual override';

  Rule.call(this, name, function(attrs) {
    var retval = true, that = this;

    this.devices().forEach(function(dev) {
      var dattrs = attrs[dev.key()];

      for ( var key in dattrs ) {
        if ( !!dattrs[key] != !!that._devices[dev.key()].attributes[key] ) {
          if ( cfg.debug ) console.log("Canceling manual rule: " + dattrs[key] + ", " + that._devices[dev.key()].attributes[key]);
          retval = false;
          return;
        }
      }
    });

    if ( ! retval ) {
      state.deleteRule(this);
    }

    return retval;
  });
}

ManualRule.prototype = new Rule();
ManualRule.prototype.constructor = ManualRule;

module.exports = ManualRule;
