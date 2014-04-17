var native = require("./lib/native");
var javascript = require("./lib/javascript");

function flatty(file, options) {
  if(!options) {
    options = {};
  }
  if("undefined" === typeof options.native) {
    options.native = true;
  }
  if(!options.native) {
    return new javascript(file, options);
  } else {
    return new native(file, options);
  }
}

module.exports = flatty;
