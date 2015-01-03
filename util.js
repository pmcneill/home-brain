var exec = require('child_process').exec,
    cfg = require('./config.js');

module.exports = {
  gpioExec: function(command, pin, arg, callback) {
    exec(cfg.gpio_path + " " + command + " " + pin + " " + arg, function(err, stdout) {
      if ( err ) throw "Error running GPIO";
      callback(stdout);
    });
  }
};
