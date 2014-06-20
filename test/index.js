"use strict"

var test = require('tape')
var Graph = require('../')
var Set = require('es6-set')

test('is sane', function(t) {
  t.ok(new Graph() instanceof Graph)
  t.end()
})


test('connecting 2 nodes', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  graph.add(a)
  graph.add(b)
  graph.link(a, b)
  t.equal(graph.nodes.size, 2)
  t.equal(graph.links.size, 1)

  t.test('can get connections from and to a node', function(t) {
    t.ok(graph.from(a).has(b))
    t.equal(graph.from(a).size, 1)

    t.ok(graph.to(b).has(a))
    t.equal(graph.to(b).size, 1)

    t.test('from/to returns cloned set', function(t) {
      var c = {name: 'c'}
      graph.from(a).add(c)
      t.equal(graph.from(a).size, 1)
      t.notOk(graph.from(a).has(c))
      t.end()
    })
    t.end()
  })
  t.end()
})

test('can disconnect 2 nodes', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  graph.add(a)
  graph.add(b)
  graph.link(a, b)
  t.ok(graph.from(a).has(b))

  graph.unlink(a, b)
  t.equal(graph.nodes.size, 2)
  t.notOk(graph.from(a).has(b))
  t.equal(graph.from(a).size, 0)
  t.end()
})

test('can not add node twice', function(t) {
  var graph = new Graph()
  ;[
    '',
    null,
    undefined,
    false
  ].forEach(function(falsey) {
    graph.add(falsey)
    t.equal(graph.nodes.size, 0)
    t.notOk(graph.nodes.has(falsey))
  })
  t.end()
})

test('can not add falsey values', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  graph.add(a)
  t.equal(graph.nodes.size, 1)
  graph.add(a)
  t.equal(graph.nodes.size, 1)
  graph.add(b)
  t.equal(graph.nodes.size, 2)
  graph.link(a, b)
  t.equal(graph.nodes.size, 2)
  t.end()
})

test('can connect a node with multiple other nodes', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.add(a)
  graph.add(b)
  graph.add(c)
  graph.link(a, b)
  graph.link(a, c)
  t.equal(graph.nodes.size, 3)
  t.equal(graph.from(a).size, 2)
  t.ok(graph.from(a).has(b))
  t.ok(graph.from(a).has(c))
  t.end()
})

test('linking to items not in graph will add them', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.link(a, b)
  graph.link(a, c)
  t.equal(graph.nodes.size, 3)
  t.equal(graph.from(a).size, 2)
  t.end()
})

test('forEach', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.add(a)
  graph.add(b)
  graph.add(c)
  graph.link(a, b)
  graph.link(a, c)
  var visited = []
  graph.forEach(function(node) {
    visited.push(node)
  })
  t.equal(visited.length, 3)
  t.ok(visited.indexOf(a) !== -1)
  t.ok(visited.indexOf(b) !== -1)
  t.ok(visited.indexOf(c) !== -1)
  t.end()
})

test('forEach no nodes', function(t) {
  var graph = new Graph()
  // no nodes
  graph.forEach(function(node) {
    t.fail('should not fire')
  })
  t.end()
})

test('traverseLinked node coverage', function(t) {

  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  var d = {name: 'd'}
  graph.link(a, b)
  graph.link(c, d)

  t.test('traverseLinked will cover disconnected graphs', function(t) {
    var expectedNodes = [a, b, c, d]
    t.plan(expectedNodes.length)
    graph.traverseLinked(function(node) {
      var nodeIndex = expectedNodes.indexOf(node)
      t.notEqual(nodeIndex, -1)
      expectedNodes.splice(nodeIndex, 1)
    })
  })

  t.test('will not cover disconnected nodes', function(t) {
    var e = {name: 'e'}
    graph.add(e)
    var expectedNodes = [a, b, c, d]
    t.plan(expectedNodes.length)
    graph.traverseLinked(function(node) {
      var nodeIndex = expectedNodes.indexOf(node)
      t.notEqual(nodeIndex, -1)
      expectedNodes.splice(nodeIndex, 1)
    })
  })
  t.end()
})

test('traverseAll node coverage', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  var d = {name: 'd'}
  graph.link(a, b)
  graph.link(c, d)

  t.test('will cover disconnected graphs', function(t) {
    var expectedNodes = [a, b, c, d]
    t.plan(expectedNodes.length)
    graph.traverseAll(function(node) {
      var nodeIndex = expectedNodes.indexOf(node)
      t.notEqual(nodeIndex, -1)
      expectedNodes.splice(nodeIndex, 1)
    })
  })

  t.test('will also cover disconnected nodes', function(t) {
    var e = {name: 'e'}
    graph.add(e)
    var expectedNodes = [a, b, c, d, e]
    t.plan(expectedNodes.length)
    graph.traverseAll(function(node) {
      var nodeIndex = expectedNodes.indexOf(node)
      t.notEqual(nodeIndex, -1)
      expectedNodes.splice(nodeIndex, 1)
    })
  })
  t.end()
})

test('traverseFrom from some root', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.add(a)
  graph.add(b)
  graph.add(c)
  graph.link(a, b)
  graph.link(a, c)
  var expectedOrder = [a, b, c]
  t.plan(expectedOrder.length)
  graph.traverseFrom(a, function(node) {
    var expected = expectedOrder.shift()
    t.strictEqual(node, expected)
  })
})

test('traverseFrom passes previous to callback', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.add(a)
  graph.add(b)
  graph.add(c)
  graph.link(a, b)
  graph.link(a, c)
  var expectedOrder = [a, b, c]
  t.plan(expectedOrder.length * 2)
  graph.traverseFrom(a, function(node, parent) {
    var expected = expectedOrder.shift()
    t.strictEqual(node, expected)
    if (node !== a) t.strictEqual(parent, a)
    else t.strictEqual(parent, undefined)
  })
})

test('traverseFrom through children', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  var d = {name: 'd'}
  var e = {name: 'e'}
  graph.add(a)
  graph.add(b)
  graph.add(c)
  graph.add(d)
  graph.add(e)
  graph.link(a, b)
  graph.link(b, c)
  graph.link(c, d)
  graph.link(c, e)
  var expectedOrder = [a, b, c, d, e]
  t.plan(expectedOrder.length)
  graph.traverseFrom(a, function(node) {
    var expected = expectedOrder.shift()
    t.strictEqual(node, expected)
  })
})

test('traverseFrom will not follow loops', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  graph.add(a)
  graph.add(b)
  graph.link(a, b)
  graph.link(b, a)
  var expectedOrder = [a, b]
  t.plan(expectedOrder.length)
  graph.traverseFrom(a, function(node) {
    var expected = expectedOrder.shift()
    t.strictEqual(node, expected)
  })
})

test('traverseFrom no links', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.add(a)
  graph.add(b)
  graph.add(c)
  // nothing from.
  var expectedOrder = [a]
  graph.traverseFrom(a, function(node) {
    var expected = expectedOrder.shift()
    t.strictEqual(node, expected)
  })
  t.end()
})

test('traverseFrom undefined', function(t) {
  var graph = new Graph()
  graph.traverseFrom(undefined, function(node) {
    t.fail('should not traverse!')
  })
  t.end()
})

test('traverseFrom root not in graph', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  // not added
  graph.traverseFrom(a, function(node) {
    t.fail('should not fire')
  })
  t.end()
})

test('traverseFrom falsey root', function(t) {
  var graph = new Graph()
  graph.traverseFrom(null, function(node) {
    t.fail('should not fire')
  })
  t.end()
})

test('traverse(fn) == traverseAll', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.link(a, b)
  graph.add(c)

  t.plan(graph.nodes.size)
  graph.traverse(function(node) {
    t.ok(node)
  })
})

test('traverse(root, fn) == traverseFrom', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.link(a, b)
  graph.add(c)

  t.plan(1) // should only hit b
  graph.traverse(b, function(node) {
    t.strictEqual(node, b)
  })
})

test('traverse(fn, traversed) == traverseAll', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.link(a, b)
  graph.add(c)

  var traversed = new Set()
  traversed.add(c)
  t.plan(2) // should not hit c even though in graph
  graph.traverse(function(node) {
    t.ok(node !== c)
  }, traversed)
})

test('traverse(root, fn, traversed) == traverseAll', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  var d = {name: 'd'}
  graph.link(a, b)
  graph.link(b, c)
  graph.link(c, d)

  var traversed = new Set()
  traversed.add(c)
  t.plan(4)
  graph.traverse(a, function(node) {
    // should not hit c or d even though linked
    t.ok(node !== c)
    t.ok(node !== d)
  }, traversed)
})

test('can traverse with functions as data', function(t) {
  var graph = new Graph()
  function a() {}
  function b() {}
  function c() {}
  graph.link(a, b)
  graph.add(c)
  t.plan(3)
  var expected = [a, b]
  graph.traverse(a, function(node, prev) {
    t.strictEqual(node, expected.shift())
    if (prev) t.strictEqual(prev, a)
  })
})

test('removing nodes', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var c = {name: 'c'}
  graph.link(a, b)
  graph.link(a, c)
  graph.link(b, c)
  graph.delete(b)

  t.notOk(graph.nodes.has(b), 'graph should delete node')
  t.test('unlinking connected nodes', function(t) {
    t.equal(graph.from(a).size, 1, 'a should have 1 connection')
    t.ok(graph.from(a).has(c), 'a should be from to c')

    t.equal(graph.from(b).size, 0, 'b should have no links')
    t.equal(graph.from(c).size, 0, 'link from c to b should be deleted')
    t.end()
  })
  t.end()
})
