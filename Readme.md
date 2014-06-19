# graphs

An intuitive data structure for graphs, implemented using ES6 data structures.

```js
var Graph = require('graphs')
var graph = new Graph()
graph.add(a)
graph.add(b)
graph.link(a, b)
```

## Examples

### Adding Nodes

```js
var graph = new Graph()
var a = {name: 'a'}

graph.add(a)
graph.has(a) // => true
graph.size // => 1

var b = {name: 'b'}
graph.has(b) // => false
graph.size // => 2

graph.add(b)
graph.has(b) // => true
```

### Connecting Nodes

Note linking will also add any missing nodes to the graph.

```js
graph.link(a, b)
```

### Getting connections to a Node

`.to` and `.from` return ES6 Sets of connected nodes.

```js
graph.link(a, b)

graph.from(a) // Set of nodes connected from a
graph.from(a).size // => 1
graph.from(a).has(b) // => true


graph.to(b) // Set of nodes connected to b
graph.to(b).has(a) // => true
graph.from(b).size // => 0
```

### Unlinking nodes

```js
graph.unlink(a, b)
graph.from(a).size // => 0
```

### Deleting nodes

```js
// Also removes all links.
graph.delete(b)
```

### Listing all nodes

Note: `.forEach` will even include unlinked nodes.

```js
graph.forEach(function(node) {
  console.log('node: %s', node.name)
})

```

### Traversing links from a certain node

Will not follow cycles.

```js
graph.traverse(startNode, function(node) {
  console.log('node: %s', node.name)
})
```

## Before/After/Guard Hooks

Makes it easy to embed custom logic into your graph.

```js
graph.before('add', function(a,b) {
  // execute before add
})

graph.after('add', function(a,b) {
  // execute after add
})

graph.guard('add', function(node) {
  // prevent add from running if return falsey
})

```

See these libraries for usage information:

* [timoxley/beforefn](http://github.com/timoxley/beforefn)
* [timoxley/guardfn](http://github.com/timoxley/guardfn)
* [timoxley/afterfn](http://github.com/timoxley/afterfn)

## License

MIT
