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

let topic = 'R1'
let users = [{ UserName: '1' }, { UserName: '2' }]
let ret = '{"BaseResponse":{"Ret":0}}'
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxcreatechatroom')) {
    var body = ''
    req.on('data', function (chunk) {
      body += chunk
    })

    req.on('end', function () {
      // 解析参数
      body = JSON.parse(body)
      if (body.Topic === topic && body.MemberCount === users.length) {
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

test('wechat createroom 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.createChatroom(users, topic)

  t.equal(0, resp.BaseResponse.Ret)
})

test('wechat createroom 2', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}
  ret = '{"BaseResponse":{"Ret":1}}'
  let resp = await wechat.createChatroom(users, topic)

  t.equal(null, resp)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
