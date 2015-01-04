var Rule = require('../rule.js');

// Reads a given motion sensor and returns true whenever motion is 
// detected plus for a given delay afterwards.
function MotionDelayRule(name, delay, sensor) {
  var that = this;

  Rule.call(this, name, function() {
    var offAt,
        lastSensed = null,
        now = (new Date()).getTime() / 1000;

    this.sensors().forEach(function(sen) {
      if ( ! sen.has("lastTargetAt") ) return;

      var testLastSensed = sen.get("lastTargetAt");
      if ( ! lastSensed || testLastSensed > lastSensed ) lastSensed = testLastSensed;
    });

    if ( ! lastSensed ) return false;

    lastSensed = lastSensed.getTime() / 1000;
    offAt = lastSensed + delay;

    if ( now < offAt ) {
      that.setNextUpdate(offAt - now);
      return true;
    } else {
      return false;
    }
  });
}

MotionDelayRule.prototype = new Rule();
MotionDelayRule.prototype.constructor = MotionDelayRule;

module.exports = MotionDelayRule;
