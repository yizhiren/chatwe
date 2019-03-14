'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
let r = require('request')
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

let olduuid = '--'
let ret = ''
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/cgi-bin/mmwebwx-bin/webwxpushloginurl?uin=' + olduuid)) {
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

test('wechat pushlogin 1', async function (t) {
  olduuid = '111'
  let cookie = r.cookie('wxuin=' + olduuid)
  cookie.domain = 'wx.qq.com'
  cookie.path = '/'
  wechat.cookieStore.putCookie(cookie, function () {})
  ret = '{}'
  let uuid = await wechat.pushLogin()
  t.equal(uuid, '')
})

test('wechat pushlogin 2', async function (t) {
  olduuid = '222'
  let cookie = r.cookie('wxuin=' + olduuid)
  cookie.domain = 'wx.qq.com'
  cookie.path = '/'
  wechat.cookieStore.putCookie(cookie, function () {})
  ret = '{ "ret": "0", "msg": "all ok", "uuid": "ga-teLG1_g==" }'
  let uuid = await wechat.pushLogin()
  t.equal(uuid, 'ga-teLG1_g==')
})

test('wechat pushlogin 3', async function (t) {
  olduuid = '333'
  let cookie = r.cookie('wxuin=' + olduuid)
  cookie.domain = 'wx.qq.com'
  cookie.path = '/'
  wechat.cookieStore.putCookie(cookie, function () {})
  ret = '{ "ret": "1", "msg": "all ok", "uuid": "ga-teLG1_g=="" }'
  let uuid = await wechat.pushLogin()
  t.equal(uuid, '')
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
