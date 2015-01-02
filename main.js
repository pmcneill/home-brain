var State = require('./state.js').State,
    Device = require('./device.js').Device,
    Rule = require('./rule.js').Rule;

function main() {
  var sw1 = new Device('switch 1'),
      sw2 = new Device('switch 2'),
      rule1 = new Rule(function() {
        var retval = ! this.get("last");
        this.set("last", retval);
        this.setNextUpdate(1);
        return retval;
      });

  rule1.addDevice(sw1);
  rule1.addDevice(sw2, 80, 0);

  State.addRule(rule1);
  State.update();
}

main();
