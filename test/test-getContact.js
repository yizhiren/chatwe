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

wechat.get_mem = function () {
  return [this.memberList, this.mpList, this.chatroomList]
}

let seq = 3

var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxgetcontact')) {
    res.end(JSON.stringify({
      'BaseResponse': { 'Ret': 0 },
      Seq: --seq,
      MemberList: [
        { Sex: 1 },
        { Sex: 0, UserName: '@@d' },
        { Sex: 0, UserName: '@x', VerifyFlag: 8 },
        { Sex: 0, UserName: '@c', VerifyFlag: 8 },
        { Sex: 0, UserName: '@d', VerifyFlag: 1 },
        { Sex: 0, UserName: 'weixin' },
        { Sex: 0, UserName: 'filehelper' }
      ]
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

test('wechat getContact 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  let succ = await wechat.getContact()
  t.equal(succ, true)
  let [initMember, initMp, initRoom] = wechat.get_init()
  initMember.push({})
  initMp.push({})
  initRoom.push({})

  let [member, mp, room] = wechat.get_mem()
  t.equal(3, room.length)
  t.equal(12, member.length)
  t.equal(6, mp.length)

  t.equal(1, initRoom.length)
  t.equal(1, initMember.length)
  t.equal(1, initMp.length)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
