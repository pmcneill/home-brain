var Rule = require('../rule.js');

function DarknessRule(name) {
  name = name || 'darkness';

  // No need to figure a manual "next alert" time, since
  // the daylight sensor fires an alert
  Rule.call(this, name, function() {
    var retval = false;

    this.sensors().forEach(function(sen) {
      if ( sen.has('isDark') && sen.get('isDark') ) retval = true;
    });

    return retval;
  });
}

DarknessRule.prototype = new Rule();
DarknessRule.prototype.constructor = DarknessRule;

module.exports = DarknessRule;
