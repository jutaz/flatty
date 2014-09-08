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
}

nativeStore.prototype.stringify = function(data, callback) {
  processed = 'meta: {"separator": "'+this.separator+'", "lineEnding": "'+this.lineEnding+'"}\n';
  for (var i in data) {
    processed += i + this.separator + JSON.stringify(data[i]) + this.lineEnding;
  }
  callback && callback(processed);
  return processed;
}

nativeStore.prototype.parse = function(data, callback) {
  parsed = {};
  data = data.toString();
  if(data.indexOf("meta: ") === 0) {
    newlinePos = data.indexOf("\n");
    meta = JSON.parse(data.substr(6, newlinePos-6));
    this.separator = meta.separator;
    this.lineEnding = meta.lineEnding;
    data = data.substr(newlinePos+1);
  }
  splitted = data.split('}' + this.lineEnding);
  for (var i in splitted) {
    if (splitted[i] === '' || new Buffer(splitted[i]).length < 2) {
      continue;
    }
    splitted[i] += "}";
    id = splitted[i].substring(0, splitted[i].indexOf(this.separator));
    parsed[id] = JSON.parse(splitted[i].substring(splitted[i].indexOf(this.separator) + this.separator.length));
    parsed[id].id = id;
  }
  callback && callback(parsed);
  return parsed;
}

module.exports = nativeStore;
