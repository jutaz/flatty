var native = require("../build/Release/flatty");

module.exports = function(file, options) {
  var lib = new native(file, options);
  var interval = setInterval(function() {
    lib.ticker();
  }, options.tickInterval);
  interval.unref();
  return lib;
}
