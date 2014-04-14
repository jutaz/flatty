var fs = require("fs");
var path = require("path");
var util = require("util");
var rand = require("generate-key");
var eventEmitter = require("events").EventEmitter;

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
  this.on("option:change", this.onOptionChange.bind(this));
  this.changes = 0;
  this.logStore = [];
  this.tickInterval = options.interval || 50;
  this.separator = options.separator || "\t";
  this.options = options;
  this.ticker();
  this.buildIndex();
  ["delete", "update", "set"].forEach(function(event) {
    this.on("record:" + event, this.log.bind(this, event))
  }.bind(this));
}

util.inherits(engine, eventEmitter);

engine.prototype.buildIndex = function() {
  if (this.options.index) {
    this.indexed = {};
    for (var i in this.data) {
      this.index(i);
    }
  }
}

engine.prototype.index = function(id, callback) {
  if (!this.options.index) {
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

engine.prototype.log = function(action, data) {
  if (this.options.log) {
    this.logStore.push({
      action: action,
      data: data,
      time: new Date().getTime()
    });
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
  this.index(key);
  callback && callback(key);
  this.changes++;
  this.emit("record:set", key);
}

engine.prototype.update = function(key, data, callback) {
  for (var i in data) {
    this.data[key][i] = data[i];
  }
  callback && callback(key);
  this.changes++;
  this.emit("record:update", key);
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
  this.emit("record:delete", key);
}

engine.prototype.option = function(key, val, callback) {
  this.options[key] = val;
  this.emit("option:change", key, val);
}

engine.prototype.onOptionChange = function(key, val) {
  if (key === "index") {
    if (val) {
      this.buildIndex();
      this.find = this.findIndexed;
    } else {
      this.indexed = {};
      this.find = this.findRecursive;
    }
  }
}

engine.prototype.find = function(obj, callback) {
  if (this.options.index) {
    this.findIndexed(obj, callback)
  } else {
    this.findRecursive(obj, callback);
  }
}

engine.prototype.findIndexed = function(obj, callback) {
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
  this.emit("record:find", ret);
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
  callback && callback(ret);
  this.emit("record:find", ret, true);
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
    processed += i + this.separator + JSON.stringify(data[i]) + "\n";
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
    spl = splitted[i].substring(splitted[i].indexOf(this.separator) + 1);
    parsed[spl[0]] = JSON.parse(spl[1]);
    parsed[spl[0]].id = spl[0];
  }
  callback && callback(parsed);
  return parsed;
}

module.exports = engine;
