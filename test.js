var Engine = require('./main');
var engine = new Engine("./test.db");

engine.set("a", {data: "test"}, function(id) {
  console.log(id);
  var i = 0;
  setInterval(function() {
    engine.get("a", function(id) {
      i++;
      console.log(id, i);
    });
  }, 2);
  // engine.get(function(data) {
  //   console.log(data);
  // });
  // engine.get(id, function(data) {
  //   console.log(data);
  // });
});
