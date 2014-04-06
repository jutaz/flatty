var fs = require("fs");
var path = require("path");
var rand = require("generate-key");

function engine(file, options) {
  if (!options) {
    options = {};
  }
  this.file = file;
  if (!fs.existsSync(this.file)) {
    fs.writeFileSync(this.file, "{}");
  }
  if (path.extname(this.file) === ".json") {
    this.data = JSON.parse(fs.readFileSync(this.file));
  } else {
    this.data = this.parse(fs.readFileSync(this.file));
  }
  this.changes = 0;
  this.tickInterval = options.interval || 50;
  this.options = options;
  this.ticker();
  this.buildIndex();
}

engine.prototype.buildIndex = function() {
  if (this.options.index) {
    this.indexed = {};
    for (var i in this.data) {
      this.index(i);
    }
  } else {
    this.find = this.findRecursive;
  }
}

engine.prototype.index = function(id, callback) {
  if(!this.options.index) {
    return;
  }
  collection = this.data[id];
  for (var i in collection) {
    if (i === "id") {
      continue;
    }
    if ('object' !== typeof this.indexed[i]) {
      this.indexed[i] = {};
    }
    if (!Array.isArray(this.indexed[i][collection[i]])) {
      this.indexed[i][collection[i]] = [];
    }
    if ('string' === typeof collection[i] && collection[i].length < 1024) {
      this.indexed[i][collection[i]].push(id);
    } else if ('number' === typeof collection[i]) {
      this.indexed[i][collection[i]].push(id);
    }
  }
}

engine.prototype.get = function(key, callback) {
  if ('function' == typeof key) {
    callback = key;
    key = null;
  }
  if (this.data[key] && 'object' == typeof this.data[key] || key === null) {
    if (key === null) {
      arr = [];
      data = this.data;
      for (var i in data) {
        data[i].id = i;
        arr.push(data[i]);
      }
      callback && callback(arr);
      delete data;
    } else {
      callback && callback(this.data[key]);
    }
  } else {
    callback && callback(null);
  }
}

engine.prototype.set = function(key, data, callback) {
  if ('function' == typeof data) {
    callback = data;
    data = key;
    key = rand.generateKey();
  }
  if (this.data[key] && 'object' == typeof this.data[key]) {
    this.update(key, data, callback);
    return;
  }
  this.data[key] = data;
  this.data[key].id = key;
  callback && callback(key);
  this.index(key);
  this.changes++;
}

engine.prototype.update = function(key, data, callback) {
  for (var i in data) {
    this.data[key][i] = data[i];
  }
  callback && callback(key);
  this.changes++;
}

engine.prototype.delete = function(key, callback) {
  if (this.data[key] && 'object' == typeof this.data[key]) {
    this.data[key] = null;
    delete this.data[key];
  } else if ('function' === typeof key) {
    this.data = {};
    this.indexed = {};
    callback = key;
  }
  callback && callback();
  this.changes++;
}

engine.prototype.find = function(obj, callback) {
  ret = [];
  encounters = {};
  search = Object.keys(obj);
  for (var i in search) {
    if (this.indexed[search[i]] && this.indexed[search[i]][obj[search[i]]]) {
      for (var s in this.indexed[search[i]][obj[search[i]]]) {
        if (!encounters[this.indexed[search[i]][obj[search[i]]][s]]) {
          encounters[this.indexed[search[i]][obj[search[i]]][s]] = 0;
        }
        encounters[this.indexed[search[i]][obj[search[i]]][s]]++;
      }
    }
  }
  for (var e in encounters) {
    if (encounters[e] === search.length) {
      ret.push(this.data[e]);
    }
  }
  callback && callback(ret);
}

engine.prototype.findRecursive = function(obj, callback) {
  ret = [];
  for (var i in this.data) {
    matches = 0;
    for (var e in obj) {
      if (this.data[i][e] == obj[e]) {
        matches++;
        if (matches === Object.keys(obj).length) {
          dat = this.data[i];
          dat.id = i;
          ret.push(dat);
        }
      }
    }
  }
  callback && callback(ret)
}

engine.prototype.ticker = function() {
  this.locked = false;
  this.tick = setInterval(function() {
    if (this.locked || this.changes == 0) {
      return;
    }
    this.locked = true;
    fs.writeFile(this.file, this.stringify(this.data), function(err) {
      if (err) {
        throw new Error(err);
      }
      this.locked = false;
      this.changes = 0;
    }.bind(this));
  }.bind(this), this.interval);
  this.tick.unref();
}

engine.prototype.stringify = function(data, callback) {
  processed = "";
  for (var i in data) {
    processed += i + "\t" + JSON.stringify(data[i]) + "\n";
  }
  callback && callback(processed);
  return processed;
}

engine.prototype.parse = function(data, callback) {
  parsed = {};
  splitted = data.toString().split("\n");
  for (var i in splitted) {
    if (splitted[i] === '') {
      continue;
    }
    spl = splitted[i].split("\t");
    parsed[spl[0]] = JSON.parse(spl[1]);
    parsed[spl[0]].id = spl[0];
  }
  callback && callback(parsed);
  return parsed;
}

module.exports = engine;
