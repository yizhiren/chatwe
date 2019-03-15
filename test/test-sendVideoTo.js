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
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxsendvideomsg')) {
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

test('wechat sendVideoTo 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}
  let resp = await wechat.sendVideoTo('NAME', 'MEDIA')

  t.equal(0, resp.BaseResponse.Ret)
})

test('wechat sendVideoTo 2', async function (t) {
  ret = '{"BaseResponse":{"Ret":1}}'
  wechat.loginInfo['User'] = {}
  wechat.loginInfo['url'] = Config.BASE_URL

  let resp = await wechat.sendVideoTo('NAME', 'MEDIA')

  t.equal(null, resp)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
