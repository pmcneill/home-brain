var exec = require('child_process').exec,
    cfg = require('./config.js');

module.exports = {
  gpioExec: function(command, pin, arg, callback) {
    exec(cfg.gpio_path + " " + command + " " + pin + " " + arg, function(err, stdout) {
      if ( err ) throw "Error running GPIO";
      if ( callback ) callback(stdout);
    });
  },
  shallowCopy: function(obj) {
    var retval = {};
    for ( var key in obj ) {
      if ( obj.hasOwnProperty(key) ) retval[key] = obj[key];
    }
    return retval;
  }
};
