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
let retcode = 0
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/cgi-bin/mmwebwx-bin/login')) {
    res.end(ret)
  }
  if (req.url === '/logininfo?a=b&fun=new&version=v2') {
    res.end(`<B><ret>${retcode}</ret><skey>2222</skey><wxsid>3333</wxsid><wxuin>4444</wxuin><pass_ticket>5555</pass_ticket></B>`)
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

test('wechat login 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  ret = 'window.code=201'
  let code = await wechat.checkLogin()

  t.equal(201, code)
})

test('wechat login 2', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  ret = 'window.code!=201'
  let code = await wechat.checkLogin()

  t.equal(400, code)
})

test('wechat login 3', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  retcode = 0
  ret = 'window.code=200;window.redirect_uri="http://127.0.0.1:12345/logininfo?a=b";'
  let code = await wechat.checkLogin()

  t.equal(200, code)
})

test('wechat login 4', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  retcode = 1
  ret = 'window.code=200;window.redirect_uri="http://127.0.0.1:12345/logininfo?a=b";'
  let code = await wechat.checkLogin()

  t.equal(400, code)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
