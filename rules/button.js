var Rule = require('../rule.js');

// Triggers whenever one of its sensors is at target
function ButtonRule(name) {
  name = name || 'button';

  // No need to figure a manual "next alert" time, since
  // the daylight sensor fires an alert
  Rule.call(this, name, function() {
    var retval = false;

    this.sensors().forEach(function(sen) {
      if ( sen.isTriggered() ) retval = true;
    });

    return retval;
  });
}

ButtonRule.prototype = new Rule();
ButtonRule.prototype.constructor = ButtonRule;

module.exports = ButtonRule;
