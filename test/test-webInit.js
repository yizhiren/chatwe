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

wechat.get_init = function () {
  return [this.init_memberList, this.init_mpList, this.init_chatroomList]
}

var s = http.createServer(function (req, res) {
  res.statusCode = 200
  console.log(req.url)
  if (req.url.startsWith('/webwxinit')) {
    res.end(JSON.stringify({
      InviteStartCount: 3,
      User: {},
      SyncKey: {
        List: [
          { Key: '1', Val: '2' },
          { Key: '11', Val: '22' },
          { Key: '111', Val: '222' },
          { Key: '1111', Val: '2222' }
        ]
      },
      ContactList: [
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

test('wechat webInit 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  await wechat.webInit()
  t.equal(wechat.loginInfo['synckey'], '1_2|11_22|111_222|1111_2222')
  let [member, mp, room] = wechat.get_init()
  t.equal(1, room.length)
  t.equal(4, member.length)
  t.equal(2, mp.length)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
