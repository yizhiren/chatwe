'use strict'

var http = require('http')
var tape = require('tape')

var s = http.createServer(function (req, res) {
  res.statusCode = 200
  res.end()
})

tape('setup', function (t) {
  s.listen(0, function () {
    s.port = this.address().port
    s.url = 'http://localhost:' + s.port
    t.end()
  })
})

tape('empty test', function (t) {
  t.end()
})

tape('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
