'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
var http = require('http')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let util = require('../lib/utils')
let path = require('path')
let Config = require('../lib/config')
Config.BASE_URL = 'http://127.0.0.1:12345/testconnect'

var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/testconnect')) {
    res.end('')
  }
})

test('setup', function (t) {
  s.listen({
    host: 'localhost',
    port: 12345,
    exclusive: true
  }, function () {
    t.end()
  })
})

test('wechat printLine 1', async function (t) {
  util.printLine('ss', true)
  util.printLine('ss', false)
  t.end()
})

test('wechat checkFile 1', async function (t) {
  t.equal(util.checkFile('/tmp'), false)
  t.equal(util.checkFile(path.join(__dirname, '../index.js')), true)
  t.end()
})
/*
test('wechat testConnect 1', async function (t) {
  let resp = await util.testConnect()
  t.equal(true, resp)
  t.end()
})
*/

test('wechat emojiFormatter 1', async function (t) {
  let obj = { content: '<span class="emoji emoji1f64d"></span>' }
  util.emojiFormatter(obj, 'content')
  t.equal(String.fromCodePoint('0x1f64d'), obj.content)
  t.end()
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
