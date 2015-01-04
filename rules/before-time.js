var Rule = require('../rule.js');

// Returns true if it's before the given time.
// resetHour/Min determine when it's "tomorrow", ie, before the 
// next time instead of after the previous one.
function BeforeTimeRule(name, hour, minute, resetHour, resetMin) {
  if ( resetMin === undefined ) resetMin = 0;
  if ( resetHour === undefined ) resetHour = 12;
  if ( minute === undefined ) minute = 0;

  var that = this;

  Rule.call(this, name, function() {
    var d = new Date(),
        now = d.getTime(),
        goaltime, resettime;

    d.setHours(hour);
    d.setMinutes(minute);
    goaltime = d.getTime();

    d.setHours(resetHour);
    d.setMinutes(resetMin);
    resettime = d.getTime();

    if ( now <= goaltime ) {
      that.setNextUpdate((goaltime - now) / 1000);
    }

    if ( resettime < goaltime ) {
      // If it's a simple range, ie, noon-11pm, just check if now is in it
      return ( now > resettime && now <= goaltime );
    } else {
      return ( now <= goaltime || now > resettime );
    }

  });
}

BeforeTimeRule.prototype = new Rule();
BeforeTimeRule.prototype.constructor = BeforeTimeRule;

module.exports = BeforeTimeRule;
