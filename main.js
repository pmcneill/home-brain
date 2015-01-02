var State = require('./state.js').State,
    Device = require('./device.js').Device,
    Rule = require('./rule.js').Rule;

function main() {
  var state = new State(),
      sw1 = new Device('switch 1'),
      sw2 = new Device('switch 2'),
      rule1 = new Rule(function() {
        var retval = ! this.get("last");
        this.set("last", retval);
        return retval;
      });

  rule1.addDevice(sw1);
  rule1.addDevice(sw2, 80, 0);

  state.addRule(rule1);
  state.update();
  state.update();
  state.update();
}

main();
