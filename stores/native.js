function nativeStore(options) {
  if(!options) {
    options = {};
  }
  this.separator = options.separator || null;
  this.lineEnding = options.lineEnd || null;
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
    meta = JSON.parse(data.substr(6, newlinePos));
    this.separator = meta.separator;
    this.lineEnding = meta.lineEnding;
    data = data.substr(newlinePos);
  }
  splitted = data.split(this.lineEnding);
  for (var i in splitted) {
    if (splitted[i] === '') {
      continue;
    }
    spl = splitted[i].substring(splitted[i].indexOf(this.separator) + 1);
    parsed[spl[0]] = JSON.parse(spl[1]);
    parsed[spl[0]].id = spl[0];
  }
  callback && callback(parsed);
  return parsed;
}

module.exports = nativeStore;
