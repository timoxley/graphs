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
  this.nodes = this
  this.links = new Map()

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
  if (!this.canUnlink(from, to)) return false
  var linked = this._linked(from)
  if (!linked.has(to)) return false
  linked.delete(to)
  if (!linked.size) this.links.delete(from)
  return true
}

Graph.prototype.unlinkAll = function(node) {
  this.from(node).forEach(function(to) {
    this.unlink(node, to)
  }, this)
  this.to(node).forEach(function(from) {
    this.unlink(from, node)
  }, this)
}

Graph.prototype.canLink = function canLink(from, to) {
  return true
}

Graph.prototype.canUnlink = function canUnlink(from, to) {
  return true
}
Graph.prototype.from =
Graph.prototype.linked = function(from) {
  return new Set(this._linked(from))
}

Graph.prototype._linked = function(from) {
  var linkedFrom = this.links.get(from)
  if (!linkedFrom) {
    linkedFrom = new Set()
    this.links.set(from, linkedFrom)
  }
  return linkedFrom
}

Graph.prototype.to =
Graph.prototype.getLinkedTo = function(to) {
  var linked = new Set()
  this.linkMap.forEach(function(value, key) {
    if (value.has(to)) linked.add(key)
  })
  return linked
}

Graph.prototype.traverse = function(root, fn) {
  if (typeof root === 'function' && arguments.length === 1) {
    fn = root
    return this.traverseAll(fn)
  } else {
    return this.traverseFrom(root, fn)
  }
}

Graph.prototype.traverseFrom = function(root, fn, traversed, previous) {
  traversed = traversed || new Set()
  if (!this.nodes.has(root)) return
  if (traversed.has(root)) return
  traversed.add(root)
  fn.call(this, root, previous)
  return this.linked(root).forEach(function(linked) {
    this.traverseFrom(linked, fn, traversed, root)
  }, this)
}

Graph.prototype.traverseAll = function(fn, traversed) {
  traversed = traversed || new Set()
  this.nodes.forEach(function(node) {
    this.traverseFrom(node, fn, traversed)
  }, this)
}

Graph.prototype.traverseLinked = function(fn, traversed) {
  traversed = traversed || new Set()
  this.links.forEach(function(value, key) {
    this.traverseFrom(key, fn, traversed)
  }, this)
}

function aspectify(target) {
  target.before = function (name, fn) {
    this[name] = before(this[name], fn)
    return this
  }

  target.after = function (name, fn) {
    this[name] = after(this[name], fn)
    return this
  }

  target.guard = function (name, fn) {
    this[name] = guard(this[name], fn)
    return this
  }
  return target
}
