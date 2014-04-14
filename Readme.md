# Flatty

This library was build for quickly testing API using local DB. Also can be used as non-failing, always reachable DB used for presentations (This is why it was created).
This module is small ~300 LOC.

> Be warned, that it is not stable and API is subject to change.

install: ```npm install flatty```

## API

```javascript
var flatty = require("flatty");
var Store = require("flatty/stores/native");

var pokemons = new flatty("./pokemons.json", {
    interval: 50, // In ms
    store: new Store()
});
```
### Methods

#### set([id], data, callback)

Options:

* ```id``` (if omitted, random id will be generated)
* ```data``` - valid JSON data
* ```callback``` - Obvious

Example:
```javascript
pokemons.set({name: "Lapras", type: "ice"}, function(id) {
  console.log(id) // Some random string (qFbzoWk7qyWFMW0u)
});
pokemons.set("AFgzoWk7qAWFMd3f", {name: "Rotom", type: "ghost"}, function(id) {
  console.log(id) // Some random string (qFbzoWk7qyWFMW0u)
});
```
#### get([id], callback)

Options:

* ```id``` (if omitted, will return all records)
* ```callback(results)``` - Again, callback! ```typeof results === (id === undefined) ? "array" : "object"```

Example:
```javascript
pokemons.get(function(pokemons) {
  console.log(pokemons) // [{name: "Lapras", type: "ice", id: "qFbzoWk7qyWFMW0u"},{name: "Rotom", type: "ghost", id: "AFgzoWk7qAWFMd3f"}]
});

pokemons.get("qFbzoWk7qyWFMW0u", function(pokemon) {
    console.log(pokemon) // {name: "Lapras", type: "ice", id: "qFbzoWk7qyWFMW0u"}
});
```

#### delete(id, callback)

Options:

* ```id``` - ID of the record
* ```callback``` - OH, THAT!

Example:

```javascript
pokemon.delete("AFgzoWk7qAWFMd3f", function() {
  //Deleted record!
});
```

#### update(id, data, callback)

Options:

* ```id``` - ID of the record
* ```callback``` - SUCH CALLBACK!

Example:

```javascript
pokemon.update("AFgzoWk7qAWFMd3f", {pokedex_id: 479}, function() {
  //Updated!
});
```

#### find(search, callback)

Options:

* ```search``` - valid JSON object
* ```callback(results)``` - CALLBACK WOW! ```typeof results === "array"```

Example:

```javascript
pokemon.find({pokedex_id: 479}, function(results) {
  console.log(results) // [{name: "Rotom", type: "ghost", id: "AFgzoWk7qAWFMd3f"}]
});

pokemon.find({pokedex_id: 479, name: "Lapras"}, function(results) {
  console.log(results) // null
});
```

#### option(key, val)

Options:

* ```key``` - option name
* ```val``` - options value

Example:

```javascript
pokemon.option("index", true);
```

### Events

`record:set` - callback: `fn(key)`. Key is id of record.
`record:update` - callback: `fn(key)`. Key is id of record.
`record:delete` - callback: `fn(key)`. Key is id of record.

`option:change` - Emitted when option has changed.

### Ticker

Ticker is a function, that saves data to disk at certain interval. Data format is JSON or native format, which looks like `ID\t{data: "stuff"}\n`, so it\`s highly editable and readable.
Currently interval is set to ```50ms```. But dont worry! It will not flood your drive, because it will write only if changes were made.
