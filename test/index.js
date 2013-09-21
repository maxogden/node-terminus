var test = require("tape").test

var terminus = require("../terminus")
var spigot = require("stream-spigot")
var spy = require("through2-spy")

test("make", function (t) {
  t.plan(5)

  var i = 0
  var input = "my dog ate my shoe".split(" ")
  function check (chunk, encoding, callback) {
    t.equals(chunk.toString(), input[i++])
    callback()
  }
  spigot(input.slice(0))
    .pipe(terminus(check))
})

test("ctor", function (t) {
  t.plan(10)

  var i = 0
  var input = "my dog ate my shoe".split(" ")
  function check (chunk, encoding, callback) {
    t.equals(chunk.toString(), input[i++])
    callback()
  }

  var type = terminus.ctor(check)
  spigot(input.slice(0))
    .pipe(type())

  setTimeout(function () {
    i = 0
    spigot(input.slice(0))
      .pipe(type())
  }, 20)

})

test("objectMode", function (t) {
  t.plan(5)

  var i = 0
  var input = [
    {foo: 1},
    {foo: 2},
    {foo: 3},
    {foo: 4},
    {foo: 5}
  ]
  function check (chunk, encoding, callback) {
    t.deepEquals(chunk, input[i++])
    callback()
  }
  spigot({objectMode: true}, input.slice(0))
    .pipe(terminus({objectMode: true}, check))
})

test("hwm hit/stream paused with no terminus", function (t) {
  var input = [
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  ]
  var chunkCount = 0
  spigot(input)
    .pipe(spy({highWaterMark: 25}, function () {
      chunkCount++
    }))

  setTimeout(function () {
    t.equals(chunkCount, 1)
    t.end()
  }, 50)
})

test("devnull", function (t) {
  var input = [
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  ]
  var chunkCount = 0
  spigot(input)
    .pipe(spy({highWaterMark: 25}, function () {
      chunkCount++
    }))
    .pipe(terminus.devnull())

  setTimeout(function () {
    t.equals(chunkCount, 4)
    t.end()
  }, 50)
})

test("concat", function (t) {
  var input = [
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  ]

  function check(contents) {
    t.equals(contents.toString(), input.join(""))
    t.end()
  }
  spigot(input.slice(0))
    .pipe(terminus.concat(check))
})

test("concat objectMode", function (t) {
  var input = [
    {foo: 1},
    {foo: 2},
    {foo: 3},
    {foo: 4},
    {foo: 5}
  ]

  function check(contents) {
    t.deepEquals(contents, input)
    t.end()
  }
  spigot({objectMode: true}, input.slice(0))
    .pipe(terminus.concat({objectMode: true}, check))
})

test("tail", function (t) {
  t.plan(4)
  var input = [
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  ]

  function check(chunk) {
    t.equals(chunk.toString(), input[0])
  }

  spigot(input.slice(0))
    .pipe(terminus.tail(check))
})

test("tail objectMode", function (t) {
  t.plan(5)
  var input = [
    {foo: 1},
    {foo: 2},
    {foo: 3},
    {foo: 4},
    {foo: 5}
  ]

  var chunkCount = 0
  function check(chunk) {
    t.equals(chunk, input[chunkCount++])
  }

  spigot({objectMode: true}, input.slice(0))
    .pipe(terminus.tail({objectMode: true}, check))
})