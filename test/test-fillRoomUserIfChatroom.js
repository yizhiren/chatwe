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

test('wechat fillRoomUserIfChatroom 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren' }

  let msgToProcess = {}
  wechat.fillRoomUserIfChatroom('-', {}, undefined, msgToProcess)
  t.equal(undefined, msgToProcess.ChatRoomUser)
  t.equal(undefined, msgToProcess.IsAtMe)
})

test('wechat fillRoomUserIfChatroom 2', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren', 'NickName': 'sb' }

  let msgToProcess = { 'Type': 'Text', 'Content': '54321@sb hh' }
  wechat.fillRoomUserIfChatroom(UserTypes.USER_TYPE_CHATROOM, {
    MemberList: [
      { UserName: '@12345', Tag: 'X' },
      { UserName: 'yizhiren', Tag: 'Y' }
    ]
  }, { UserName: '@12345', Tag: 'Z' }, msgToProcess)
  t.equal('Z', msgToProcess.ChatRoomUser.Tag)
  t.equal('54321@sb hh', msgToProcess.Content)
  t.equal(true, msgToProcess.IsAtMe)
})

test('wechat fillChatroomUser 3', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren', 'NickName': 'sb' }

  let msgToProcess = { 'Type': 'Text', 'Content': '54321@sbhh' }
  wechat.fillRoomUserIfChatroom(UserTypes.USER_TYPE_CHATROOM, {
    MemberList: [
      { UserName: '@12345', Tag: 'X' },
      { UserName: 'yizhiren', Tag: 'Y' }
    ]
  }, { UserName: '@12345', Tag: 'X' }, msgToProcess)
  t.equal('X', msgToProcess.ChatRoomUser.Tag)
  t.equal('54321@sbhh', msgToProcess.Content)
  t.equal(false, msgToProcess.IsAtMe)
})

test('wechat parseContentIfChatroom 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = { 'UserName': 'yizhiren', 'NickName': 'sb' }

  let msg = { MsgType: 1, Content: '@12345:<br/>hi' }
  wechat.parseContentIfChatroom(UserTypes.USER_TYPE_CHATROOM, {
    MemberList: [
      { UserName: '@12345', Tag: 'X' },
      { UserName: 'yizhiren', Tag: 'Y' }
    ]
  }, msg)
  t.equal('X', msg.ChatRoomUser.Tag)
  t.equal('hi', msg.Content)
  t.equal(undefined, msg.IsAtMe)
})

test('cleanup', function (t) {
  t.end()
})
