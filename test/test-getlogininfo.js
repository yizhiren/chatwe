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

wechat.get_loginInfo = function () {
  return this.loginInfo
}

var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url === '/logininfo?a=b&fun=new&version=v2') {
    res.end('<B><ret>0</ret><skey>2222</skey><wxsid>3333</wxsid><wxuin>4444</wxuin><pass_ticket>5555</pass_ticket></B>')
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

test('wechat getlogininfo 1', async function (t) {
  let succ = await wechat.getLoginInfo('window.redirect_uri="http://127.0.0.1:12345/logininfo?a=b";')
  t.equal(succ, true)
  t.equal(wechat.get_loginInfo()['url'], 'https://127.0.0.1:12345/cgi-bin/mmwebwx-bin')
  t.equal(wechat.get_loginInfo()['fileUrl'], 'https://file.127.0.0.1:12345/cgi-bin/mmwebwx-bin')
  t.equal(wechat.get_loginInfo()['syncUrl'], 'https://webpush.127.0.0.1:12345/cgi-bin/mmwebwx-bin')
  t.notEqual(wechat.get_loginInfo()['logintime'], '')
  t.equal(wechat.get_loginInfo()['deviceid'], 'e' + wechat.get_loginInfo()['logintime'] + '99')
  t.equal(wechat.get_loginInfo()['BaseRequest']['DeviceID'], 'e' + wechat.get_loginInfo()['logintime'] + '99')
  t.equal(wechat.get_loginInfo()['BaseRequest']['Skey'], '2222')
  t.equal(wechat.get_loginInfo()['BaseRequest']['Sid'], '3333')
  t.equal(wechat.get_loginInfo()['BaseRequest']['Uin'], '4444')

  t.equal(wechat.get_loginInfo()['skey'], '2222')
  t.equal(wechat.get_loginInfo()['wxsid'], '3333')
  t.equal(wechat.get_loginInfo()['wxuin'], '4444')
  t.equal(wechat.get_loginInfo()['pass_ticket'], '5555')
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
