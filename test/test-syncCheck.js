'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
var http = require('http')
var Wechat = require('../index')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let Config = require('../lib/config')
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'
var wechat = new Wechat()
wechat.setLogging('info')

let ret = ''
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/synccheck')) {
    res.end(ret)
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

test('wechat synccheck 1', async function (t) {
  wechat.loginInfo['syncUrl'] = Config.BASE_URL
  ret = 'window.synccheck={retcode:"0",selector:"0"}'
  let cnt = await wechat.syncCheck()
  t.equal(0, cnt)
})

test('wechat synccheck 2', async function (t) {
  wechat.loginInfo['syncUrl'] = Config.BASE_URL
  ret = 'window.synccheck={retcode:"0",selector:"3"}'
  let cnt = await wechat.syncCheck()
  t.equal(3, cnt)
})

test('wechat synccheck 3', async function (t) {
  wechat.loginInfo['syncUrl'] = Config.BASE_URL
  ret = 'window.synccheck={retcode:"1",selector:"0"}'
  let cnt = await wechat.syncCheck()
  t.equal(-1, cnt)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
