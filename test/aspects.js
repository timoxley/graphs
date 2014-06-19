var test = require('tape')
var Graph = require('../')

test('resets across graphs', function(t) {
  t.plan(6)
  var graphA = new Graph()
  var graphB = new Graph()
  var item = {}

  var called = []
  graphA.before('add', function(arg) {
    t.deepEqual(called, [])
    called.push(1)
    t.equal(item, arg)
  })

  graphB.before('add', function(arg) {
    t.deepEqual(called, [])
    called.push(2)
    t.equal(item, arg)
  })

  graphA.add(item)
  t.deepEqual(called, [1])

  called = []
  graphB.add(item)
  t.deepEqual(called, [2])
})

test('before/after', function(t) {
  t.plan(9)
  var graph = new Graph()

  var called = []
  graph.before('add', function(arg) {
    t.equal(arg, item)
    t.deepEqual(called, [])
    called.push(1)
  })

  graph.before('add', function(arg) {
    t.equal(arg, item)
    t.deepEqual(called, [1])
    t.ok(!graph.has(arg))
    called.push(2)
  })

  graph.after('add', function() {
    t.ok(graph.has(item))
    t.deepEqual(called, [1, 2])
    called.push(3)
  })

  graph.after('add', function() {
    t.deepEqual(called, [1, 2, 3])
    called.push(4)
  })
  var item = {value: 3}
  graph.add(item)
  t.deepEqual(called, [1, 2, 3, 4])
})

test('guard vs before', function(t) {
  var graph = new Graph()
  var a = {name: 'a'}
  var b = {name: 'b'}
  var called = []

  graph.before('add', function(item) {
    t.deepEqual(called, [1])
    called.push(2)
    t.equal(item, a)
  })

  graph.before('add', function(item) {
    t.deepEqual(called, [1,2])
    called.push(3)
    t.equal(item, a)
  })

  graph.guard('add', function(item) {
    t.deepEqual(called, [])
    called.push(1)
    return item !== b
  })


  graph.add(a)
  t.deepEqual(called, [1,2,3])
  called = []
  graph.add(b)
  t.deepEqual(called, [1])
  t.end()
})
