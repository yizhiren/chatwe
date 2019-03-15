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

let ret = '{"BaseResponse":{"Ret":0}}'
let stcode = 200
let fname = '/tmp/a'
var s = http.createServer(function (req, res) {
  res.statusCode = stcode
  logger.debug(req.url)
  if (req.url.startsWith('/webwxgetmsgimg')) {
    res.end(ret)
  }
  if (req.url.startsWith('/xyz')) {
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

test('wechat getDownloadSlaveFn 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}
  let resp = await (wechat.getDownloadSlaveFn(fname, 111))()
  t.equal(resp, true)
})

test('wechat getDownloadFn 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}
  let resp = await (wechat.getDownloadFn(fname, 111, 'xyz'))()
  t.equal(resp, true)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
