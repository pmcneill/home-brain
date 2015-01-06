var suncalc = require('suncalc'),
    Sensor = require('../sensor.js'),
    cfg = require('../config.js');

function DaylightSensor(name, path) {
  Sensor.call(this, name);

  this._last_run = null;

  this.recalculate();

  // Okay to run this pretty often since it'll only signal a change
  // if the data is new
  setInterval(this.recalculate.bind(this), 60 * 1000);
}

DaylightSensor.prototype = new Sensor();
DaylightSensor.prototype.constructor = DaylightSensor;

DaylightSensor.prototype.recalculate = function() {
  var now = new Date(), isChanged = false;

  if ( ! this._last_run || this._last_run.getDay() != now.getDay() ) {
    // Right after midnight, suncalc still returns data for the previous day
    var noon = new Date();
    noon.setHours(12);

    times = suncalc.getTimes(noon, cfg.latitude, cfg.longitude);

    this.set("sunrise", times.sunrise);
    this.set("dawn", times.dawn);
    this.set("dusk", times.dusk);
    this.set("sunset", times.sunset);
    this.set("startGoldenHour", times.goldenHour);
    this.set("endGoldenHour", times.goldenHourEnd);

    isChanged = true;
    this._last_run = now;
  }

  var isDark = (now < this.get("endGoldenHour")) || (now > this.get("startGoldenHour")),
      lastDark = this.get("isDark");

  if ( lastDark === undefined || lastDark != isDark ) {
    this.set("isDark", isDark);

    isChanged = true;
  }

  if ( isChanged ) this.changed();

  return this;
};

module.exports = DaylightSensor;
