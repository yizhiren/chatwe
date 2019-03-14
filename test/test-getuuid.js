'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
var http = require('http')
var Wechat = require('../index')

var tape = require('tape')
var _test = require('tape-promise').default // <---- notice 'default'
var test = _test(tape) // decorate tape

let Config = require('../lib/config')
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'

var wechat = new Wechat()
wechat.setLogging('info')

let cnt = 2
let uuid = 'X1X'

var s = http.createServer(function (req, res) {
  logger.debug(req.url)
  res.statusCode = 200
  if (req.url.startsWith('/jslogin?appid=wx782c26e4c19acffb&fun=new&lang=zh_CN&_=')) {
    res.end(`window.QRLogin.code = ${cnt}; window.QRLogin.uuid = "${uuid}";`)
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

test('wechat getQRuuid 1', async function (t) {
  cnt = 2
  let uuid = await wechat.getQRuuid()
  t.equal(uuid, '')
})

test('wechat getQRuuid 2', async function (t) {
  cnt = 200
  let uuid = await wechat.getQRuuid()
  t.equal(uuid, 'X1X')
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
