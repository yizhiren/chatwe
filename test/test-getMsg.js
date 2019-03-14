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

wechat.get_init = function () {
  return [this.init_memberList, this.init_mpList, this.init_chatroomList]
}

let ret = 0
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxsync')) {
    res.end(JSON.stringify({
      'BaseResponse': { 'Ret': ret },
      SyncKey: {
        List: [
          { Key: '91', Val: '2' },
          { Key: '911', Val: '22' },
          { Key: '9111', Val: '222' },
          { Key: '91111', Val: '2222' }
        ]
      },
      SyncCheckKey: {
        List: [
          { Key: '1', Val: '2' },
          { Key: '11', Val: '22' },
          { Key: '111', Val: '222' },
          { Key: '1111', Val: '2222' }
        ]
      }
    }))
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

test('wechat webwxsync 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  ret = 0
  let resp = await wechat.getMsg()
  t.equal(wechat.loginInfo['synckey'], '1_2|11_22|111_222|1111_2222')
  t.equal(wechat.loginInfo['SyncKey']['List'][0].Key, '91')
  t.equal(0, resp.BaseResponse.Ret)
})

test('wechat webwxsync 2', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  ret = 1
  let resp = await wechat.getMsg()
  t.equal(null, resp)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
