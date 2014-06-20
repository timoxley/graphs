# graphs

An intuitive data structure for graphs, implemented using ES6 data structures.

```js
var Graph = require('graphs')
var graph = new Graph()
var a = {name: 'a'}
var b = {name: 'b'}
graph.add(a)
graph.add(b)
graph.link(a, b)
graph.traverse(function(from, to) {
  console.log(from.name, 'linked to', to.name)
})
// => a linked to b
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

### Linking Nodes

```js
graph.link(a, b)
```

Linking will also add nodes to the graph.

### Getting Links to a Node

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

### Unlinking Nodes

```js
graph.unlink(a, b)
graph.from(a).size // => 0
```

### Deleting Nodes

* Also removes any links (but not linked nodes).

```js
graph.delete(b)
```

### Iterating over all Nodes

* `.forEach` will even include entirely unlinked nodes.

```js
graph.forEach(function(node) {
  console.log('node: %s', node.name)
})

```

### Traversing the Graph

`graph.traverse` will traverse all links from the specified node.

* Arguments to the callback are `from, to`
* Starts at a node and follows links.
* May visit a node multiple times (depending on how many times it's linked to).
* The callback will always fire with valid `from` and `to` parameters.
* If startNode is not linked to anything, callback will not fire.
* Will not follow cycles.

```js
graph.traverse(startNode, function(from, to) {
  console.log('from: %s', from)
  console.log('to: %s', to)
})
```

### Visiting Linked Nodes

`graph.visit` will visit each node that can be reached from the specified node, once.

* Arguments to the callback are `to, from`
* Will follow links but will not visit any node more than once.
* The `from` argument may not be set if `visit` didn't follow a link to
the current node (e.g. on the first iteration).

```js
graph.visit(startNode, function(node, linkedFrom) {
  console.log('node: %s', node)
  console.log('linkedFrom: %s', linkedFrom)
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
