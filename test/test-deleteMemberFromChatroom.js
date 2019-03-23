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

let roomName = '@@xxx'
let users = [{ UserName: '1' }, { UserName: '2' }]
let ret = '{"BaseResponse":{"Ret":0}}'
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxupdatechatroom')) {
    var body = ''
    req.on('data', function (chunk) {
      body += chunk
    })

    req.on('end', function () {
      let query = require('url').parse(req.url, true)
      // 解析参数
      body = JSON.parse(body)
      if (query.query.fun === 'delmember' && body.DelMemberList === '1,2' && body.ChatRoomName === roomName) {
        res.end(ret)
      }
    })
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

test('wechat deleteMemberFromChatroom 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.deleteMemberFromChatroom({ UserName: roomName }, users)

  t.equal(0, resp.BaseResponse.Ret)
})

test('wechat deleteMemberFromChatroom 2', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}
  ret = '{"BaseResponse":{"Ret":1}}'
  let resp = await wechat.deleteMemberFromChatroom({ UserName: roomName }, users)

  t.equal(null, resp)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
