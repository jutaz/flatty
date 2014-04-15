function jsonStore() {

}

jsonStore.prototype.init = function() {
  return "{}";
}

jsonStore.prototype.stringify = function(data, callback) {
  try {
    data = JSON.stringify(data);
  } catch (e) {
    throw new Error('Invalid data passed to json store when stringifying data.');
  }
  callback && callback(data);
  return data;
}

jsonStore.prototype.parse = function(data, callback) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    throw new Error('Invalid data passed to json store when parsing data.');
  }
  callback && callback(data);
  return data;
}

module.exports = jsonStore;
