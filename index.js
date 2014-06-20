"use strict"

var inherits = require('inherits')
var guard = require('guardfn')
var after = require('afterfn')
var before = require('beforefn')
var slice = require('sliced')

var Set = require('es6-set')
var Map = require('es6-map')

module.exports = Graph

function Graph() {
  Set.apply(this, arguments)
  this.linkMap = new Map()

  aspectify(this)
  this.guard('add', function() {
    return arguments.length
  })
  this.before('add', function fn() {
    fn.args = fn.args
    .filter(function(item) {
      return item && !this.has(item)
    }, this)
  })

  this.after('delete', function() {
    slice(arguments).forEach(function(item) {
      this.unlinkAll(item)
    }, this)
  })

  // ensure items added
  this.after('link', function ensureAdded() {
    slice(arguments).forEach(function(item) {
      this.add(item)
    }, this)
  })
}

inherits(Graph, Set)

Graph.prototype.link = function(from, to) {
  var linked = this._linked(from)
  linked.add(to)
  return true
}

Graph.prototype.unlink = function(from, to) {
  var linked = this._linked(from)
  if (!linked.has(to)) return false
  linked.delete(to)
  if (!linked.size) this.linkMap.delete(from)
  return true
}

Graph.prototype.unlinkAll = function unlinkAll(node) {
  this.from(node).forEach(function unlinkEachLinkedFrom(to) {
    this.unlink(node, to)
  }, this)
  this.to(node).forEach(function unlinkEachLinkedTo(from) {
    this.unlink(from, node)
  }, this)
}

Graph.prototype.from = function from(from) {
  return new Set(this._linked(from))
}

Graph.prototype.to = function to(to) {
  var linked = new Set()
  this.linkMap.forEach(function (value, key) {
    if (value.has(to)) linked.add(key)
  })
  return linked
}

Graph.prototype._linked = function _linked(from) {
  var linkedFrom = this.linkMap.get(from)
  if (!linkedFrom) {
    linkedFrom = new Set()
    this.linkMap.set(from, linkedFrom)
  }
  return linkedFrom
}

Graph.prototype.visit = function visit(root, fn, visited) {
  if (arguments.length == 1) { // only callback
    fn = root
    return this.visitAll(fn)
  } else if (arguments.length == 2) { // either root, callback
    if (typeof fn === 'function') {
      return this.visitFrom(root, fn)
    } else { // or callback, visited
      visited = fn
      fn = root
      return this.visitAll(fn, visited)
    }
  }

  return this.visitFrom(root, fn, visited)
}

Graph.prototype.visitFrom = function visitFrom(root, fn, visited, previous) {
  visited = visited || new Set()
  if (!this.has(root)) return
  if (visited.has(root)) return
  visited.add(root)
  fn.call(this, root, previous)
  return this.from(root).forEach(function(linked) {
    this.visitFrom(linked, fn, visited, root)
  }, this)
}

Graph.prototype.visitAll = function visitAll(fn, visited) {
  visited = visited || new Set()
  this.forEach(function(node) {
    this.visitFrom(node, fn, visited)
  }, this)
}

Graph.prototype.traverse = function traverse(from, fn) {
  if (arguments.length === 1) return this.traverseAll(from)
  return this.traverseFrom(from, fn)
}

Graph.prototype.traverseFrom = function traverseFrom(from, fn, visited) {
  visited = visited || new Map()
  var linked = visited.get(from)
  if (!linked) linked = new Set()
  visited.set(from, linked)
  this.from(from).forEach(function(to) {
    if (linked.has(to)) return
    linked.add(to)
    fn.call(this, from, to)
    this.traverseFrom(to, fn, visited)
  }, this)
}

Graph.prototype.traverseAll = function traverseAll(fn) {
  var self = this
  this.linkMap.forEach(function(links, from) {
    links.forEach(function(to) {
      fn.call(self, from, to)
    })
  })
}

function aspectify(target) {
  var _before = before
  var _after = after
  var _guard = guard
  target.before = function before(name, fn) {
    this[name] = _before(this[name], fn)
    return this
  }

  target.after = function after(name, fn) {
    this[name] = _after(this[name], fn)
    return this
  }

  target.guard = function guard(name, fn) {
    this[name] = _guard(this[name], fn)
    return this
  }
  return target
}
