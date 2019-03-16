'use strict'

var Wechat = require('../index')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let Config = require('../lib/config')
let UserTypes = Config.USER_TYPES
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'
var wechat = new Wechat()
wechat.setLogging('info')

test('setup', function (t) {
  t.end()
})

test('wechat fillChatroomUser 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren' }

  let msgToProcess = {}
  wechat.fillChatroomUser('-', {}, UserTypes.USER_TYPE_CHATROOM, {
    MemberList: [
      { UserName: 'yizhiren', Tag: 'X' }
    ]
  }, msgToProcess)
  t.equal('X', msgToProcess.ChatRoomUser.Tag)
  t.equal(false, msgToProcess.IsAtMe)
})

test('wechat fillChatroomUser 2', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren', 'NickName': 'sb' }

  let msgToProcess = { 'Type': 'Text', 'Content': '@12345:<br/>54321@sb hh' }
  wechat.fillChatroomUser(UserTypes.USER_TYPE_CHATROOM, {
    MemberList: [
      { UserName: '@12345', Tag: 'X' },
      { UserName: 'yizhiren', Tag: 'Y' }
    ]
  }, '-', {}, msgToProcess)
  t.equal('X', msgToProcess.ChatRoomUser.Tag)
  t.equal('54321@sb hh', msgToProcess.Content)
  t.equal(true, msgToProcess.IsAtMe)
})

test('wechat fillChatroomUser 3', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren', 'NickName': 'sb' }

  let msgToProcess = { 'Type': 'Text', 'Content': '@12345:<br/>54321@sbhh' }
  wechat.fillChatroomUser(UserTypes.USER_TYPE_CHATROOM, {
    MemberList: [
      { UserName: '@12345', Tag: 'X' },
      { UserName: 'yizhiren', Tag: 'Y' }
    ]
  }, '-', {}, msgToProcess)
  t.equal('X', msgToProcess.ChatRoomUser.Tag)
  t.equal('54321@sbhh', msgToProcess.Content)
  t.equal(false, msgToProcess.IsAtMe)
})

test('cleanup', function (t) {
  t.end()
})
