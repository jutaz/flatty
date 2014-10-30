function nativeStore(options) {
  if(!options) {
    options = {};
  }
  this.separator = options.separator || null;
  this.lineEnding = options.lineEnd || null;
  if (this.separator === null) {
      this.separator = "null";
  }
  if (this.lineEnding === null) {
      this.lineEnding = "null";
  }
}

nativeStore.prototype.init = function() {
  return "";
};

nativeStore.prototype.stringify = function(data, callback) {
  var processed = 'meta: {"separator": "'+this.separator+'", "lineEnding": "'+this.lineEnding+'"}\n';
  for (var i in data) {
    processed += i + this.separator + JSON.stringify(data[i]) + this.lineEnding;
  }
  callback && callback(processed);
  return processed;
};

nativeStore.prototype.parse = function(data, callback) {
  var parsed = {};
  data = data.toString();
  if(data.indexOf("meta: ") === 0) {
    var newlinePos = data.indexOf("\n");
    var meta = JSON.parse(data.substr(6, newlinePos-6));
    this.separator = meta.separator;
    this.lineEnding = meta.lineEnding;
    data = data.substr(newlinePos+1);
  }
  var regexp = new RegExp('}+' + this.lineEnding + '|]'+ this.lineEnding)
  var splitted = data.split(regexp);
  for (var i in splitted) {
    if (splitted[i] === '' || new Buffer(splitted[i]).length < 2) {
      continue;
    }
    var id = splitted[i].substring(0, splitted[i].indexOf(this.separator));
    var symbol = splitted[i][splitted[i].indexOf(this.separator)+this.separator.length];
    switch (symbol) {
        case "{":
            splitted[i] += "}";
            break;
        case "[":
            splitted[i] += "]";
            break;
        default:
            splitted[i] += "\"";
    }
    parsed[id] = JSON.parse(splitted[i].substring(splitted[i].indexOf(this.separator) + this.separator.length));
    parsed[id].id = id;
  }
  callback && callback(parsed);
  return parsed;
};

module.exports = nativeStore;
