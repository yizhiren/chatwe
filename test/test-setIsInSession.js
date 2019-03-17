'use strict'

var tape = require('tape')
var Wechat = require('../index')
var wechat = new Wechat()

tape('setup', function (t) {
  t.end()
})

tape('setIsInSession 1', function (t) {
  let obj = { Type: 'Status',
    From: { Uin: 0,
      UserName: '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550',
      IsOwner: 0 },
    Content: 'ENTER_SESSION',
    IsChatRoom: false,
    NotifyUsers:
   [ { Uin: 0,
     UserName: '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550',
     IsOwner: 0 } ] }
  wechat.setIsInSession(obj)

  t.equal(wechat.currentSession.UserName, '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550')
  t.equal(obj.IsPhoneInSession, true)
  t.end()
})

tape('setIsInSession 2', function (t) {
  let obj = { Type: 'Status',
    From: { Uin: 0,
      UserName: '@@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550',
      IsOwner: 0 },
    Content: 'StatusNotifyCode_READED',
    IsChatRoom: false,
    NotifyUsers:
   [ { Uin: 0,
     UserName: '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550',
     IsOwner: 0 } ] }
  wechat.setIsInSession(obj)

  t.equal(wechat.currentSession.UserName, '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550')
  t.equal(obj.IsPhoneInSession, false)
  t.end()
})

tape('setIsInSession 3', function (t) {
  let obj = { Type: 'Status',
    From: { Uin: 0,
      UserName: '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550',
      IsOwner: 0 },
    Content: 'QUIT_SESSION',
    IsChatRoom: false,
    NotifyUsers:
   [ { Uin: 0,
     UserName: '@@987ab005c925c620a76245e5f8ee33b0ea4bf001b1f26f8be1e45439681c5550',
     IsOwner: 0 } ] }
  wechat.setIsInSession(obj)

  t.equal(wechat.currentSession.UserName, undefined)
  t.equal(obj.IsPhoneInSession, false)
  t.end()
})

tape('cleanup', function (t) {
  t.end()
})
