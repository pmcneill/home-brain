var fs = require('fs'),
    http = require('http'),
    Sensor = require('../sensor.js'),
    cfg = require('../config.js');

function WeatherSensor(name) {
  Sensor.call(this, name);

  this.updateWeather();
  setInterval(this.updateWeather.bind(this), 30 * 60 * 1000);
}

WeatherSensor.prototype = new Sensor();
WeatherSensor.prototype.constructor = WeatherSensor;

WeatherSensor.prototype.updateWeather = function() {
  var that = this,
      options = {
    hostname: 'api.wunderground.com',
    port: 80,
    path:  "/api/" + cfg.wunderground_api_key + "/geolookup/conditions/lang:EN/q/" + cfg.latitude + "," + cfg.longitude + ".json",
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  http.request(options, function(res) {
    res.setEncoding('utf8');

    var data = ''

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function() {
      data = JSON.parse(data).current_observation;

      that.set("description", data.weather);
      that.set("temperature", data.temp_f);
      that.set("humidity", parseInt(data.relative_humidity.replace("%", "")));

      that.changed();
    });
 }).end();
};

module.exports = WeatherSensor;
