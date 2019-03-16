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

var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxbatchgetcontact')) {
    var body = ''
    req.on('data', function (chunk) {
      body += chunk
    })

    req.on('end', function () {
      // 解析参数
      body = JSON.parse(body)

      logger.debug('body:', body)

      let contactList = [
        { Sex: 1 },
        { Sex: 0, UserName: '@@d' },
        { Sex: 0, UserName: '@x', VerifyFlag: 8 },
        { Sex: 0, UserName: '@c', VerifyFlag: 8 },
        { Sex: 0, UserName: '@d', VerifyFlag: 1 },
        { Sex: 0, UserName: 'weixin' },
        { Sex: 0, UserName: 'filehelper' }
      ]

      res.end(JSON.stringify({
        'BaseResponse': { 'Ret': 0 },
        ContactList: contactList.slice(0, body.Count)
      }))
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

test('wechat getBatchContact', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  let us = []
  us.push({ Sex: 0, UserName: '@@a' })
  us.push({ Sex: 0, UserName: '@@b' })
  us.push({ Sex: 0, UserName: '@@c' })
  us.push({ Sex: 0, UserName: '@@d' })
  us.push({ Sex: 0, UserName: '@@e' })
  us.push({ Sex: 0, UserName: '@@f' })
  us.push({ Sex: 0, UserName: '@@g' })
  let contacts = await wechat.getBatchContact(us)
  t.equal(7, contacts.length)
})

test('wechat updateAllChatroom', async function (t) {
  wechat.init()
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.chatroomList.push({ Sex: 0, UserName: '@@a' })
  wechat.chatroomList.push({ Sex: 0, UserName: '@@b' })
  wechat.chatroomList.push({ Sex: 0, UserName: '@@c' })
  wechat.chatroomList.push({ Sex: 0, UserName: '@@d' })
  wechat.chatroomList.push({ Sex: 0, UserName: '@@e' })
  wechat.chatroomList.push({ Sex: 0, UserName: '@@f' })
  wechat.chatroomList.push({ Sex: 0, UserName: '@@g' })

  let [member, mp, room] = wechat.get_mem()
  t.equal(7, room.length)
  t.equal(0, member.length)
  t.equal(0, mp.length)

  await wechat.updateAllChatroom()

  t.equal(7, room.length)
  t.equal(4, member.length)
  t.equal(2, mp.length)
})

test('wechat updateUser', async function (t) {
  wechat.init()
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.chatroomList.push({ Sex: 0, UserName: '@@d' })

  let [member, mp, room] = wechat.get_mem()
  t.equal(1, room.length)
  t.equal(0, member.length)
  t.equal(0, mp.length)

  await wechat.updateUser('@@d')

  t.equal(1, room.length)
  t.equal(1, member.length)
  t.equal(0, mp.length)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
