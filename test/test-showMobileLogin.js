'use strict'

var http = require('http')
var Wechat = require('../index')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let Config = require('../lib/config')
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'
var wechat = new Wechat()
wechat.setLogging('debug')

wechat.get_loginInfo = function () {
  return this.loginInfo
}

wechat.get_loginInfo()['pass_ticket'] = '111'
wechat.get_loginInfo()['User'] = {}
wechat.get_loginInfo()['url'] = Config.BASE_URL
let ret = '{"BaseResponse":{"Ret":0}}'

var s = http.createServer(function (req, res) {
  console.log(req.url)
  res.statusCode = 200
  if (req.url.startsWith('/webwxstatusnotify?pass_ticket=111')) {
    // res.writeHead(200,{'Content-Type':'application/json'});
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

test('wechat showMobileLogin 1', async function (t) {
  let succ = await wechat.showMobileLogin()
  t.equal(succ, true)
})

test('wechat showMobileLogin 2', async function (t) {
  ret = '{}'
  let succ = await wechat.showMobileLogin()
  t.equal(succ, false)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
