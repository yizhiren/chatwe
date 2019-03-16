'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
var http = require('http')
var Wechat = require('../index')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let Config = require('../lib/config')
let MsgTypes = Config.MSG_TYPES
let AppMsgTypes = Config.APPMSG_TYPES
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'
var wechat = new Wechat()
wechat.setLogging('info')

let ret = '{"BaseResponse":{"Ret":0}}'
let stcode = 200
var s = http.createServer(function (req, res) {
  res.statusCode = stcode
  logger.debug(req.url)
  if (req.url.startsWith('/webwxgetmsgimg')) {
    res.end(ret)
  }
  if (req.url.startsWith('/xyz')) {
    res.end(ret)
  }
  if (req.url.startsWith('/timeout')) {
    setTimeout(function () {
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.write('waited')
      res.end()
    }, 200)
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

test('wechat pickMainInfoFromMsg MSGTYPE_TEXT', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_TEXT,
    Content: 'ASD&lt;&gt;lg'
  })
  t.equal(resp.Type, 'Text')
  t.equal(resp.Content, 'ASD<>lg')
})

test('wechat pickMainInfoFromMsg MSGTYPE_TEXT.Map', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_TEXT,
    Content: 'æ°¸æ—ºå®¶å›­å››åŒº(åŒ—äº¬å¸‚æµ·æ·€åŒºä¸°æ™ºä¸œè·¯):<br/>/cgi-bin/mmwebwx-bin/webwxgetpubliclinkimg?url=xxx&msgid=5390103377716754276&pictype=location',
    Url: 'http://apis.map.qq.com/uri/v1/geocoder?coord=40.067356,116.257927'
  })
  t.equal(resp.Type, 'Map')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.png'))
  t.equal(resp.Text, 'æ°¸æ—ºå®¶å›­å››åŒº(åŒ—äº¬å¸‚æµ·æ·€åŒºä¸°æ™ºä¸œè·¯)')
  t.equal(resp.Url, 'http://apis.map.qq.com/uri/v1/geocoder?coord=40.067356,116.257927')
})

test('wechat pickMainInfoFromMsg MSGTYPE_VOIPINVITE', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_VOIPINVITE,
    Content: 'ASD&lt;&gt;lg'
  })
  t.equal(resp.Type, 'Note')
  t.equal(resp.Content, 'ASD<>lg')
})

test('wechat pickMainInfoFromMsg MSGTYPE_APP.APPMSGTYPE_ATTACH', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_APP,
    AppMsgType: AppMsgTypes.APPMSGTYPE_ATTACH,
    EncryFileName: 'aaa.xyz'
  })
  t.equal(resp.Type, 'File')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.xyz'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_APP.APPMSGTYPE_EMOJI', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_APP,
    AppMsgType: AppMsgTypes.APPMSGTYPE_EMOJI
  })
  t.equal(resp.Type, 'Image')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.gif'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_APP.APPMSGTYPE_REALTIME_SHARE_LOCATION', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_APP,
    AppMsgType: AppMsgTypes.APPMSGTYPE_REALTIME_SHARE_LOCATION,
    EncryFileName: 'aaa.xyz'
  })
  t.equal(resp.Type, 'Note')
  t.equal('aaa.xyz', resp.Content)
})

test('wechat pickMainInfoFromMsg MSGTYPE_APP.other', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_APP,
    AppMsgType: 999,
    Content: 'aaa.xyz'
  })
  t.equal(resp.Type, 'Note')
  t.equal('aaa.xyz', resp.Content)
})

test('wechat pickMainInfoFromMsg MSGTYPE_IMAGE', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_IMAGE
  })
  t.equal(resp.Type, 'Image')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.png'))
  t.equal(true, resp.Preview.startsWith('cache/'))
  t.equal(true, resp.Preview.endsWith('.png'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_EMOTICON', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_EMOTICON
  })
  t.equal(resp.Type, 'Image')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.gif'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_VOICE', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_VOICE
  })
  t.equal(resp.Type, 'Voice')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.mp3'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_VIDEO', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_VIDEO
  })
  t.equal(resp.Type, 'Video')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.mp4'))
  t.equal(true, resp.Preview.startsWith('cache/'))
  t.equal(true, resp.Preview.endsWith('.png'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_MICROVIDEO', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_MICROVIDEO
  })
  t.equal(resp.Type, 'Video')
  t.equal(true, resp.Content.startsWith('cache/'))
  t.equal(true, resp.Content.endsWith('.mp4'))
  t.equal(true, resp.Preview.startsWith('cache/'))
  t.equal(true, resp.Preview.endsWith('.png'))
  t.equal('function', typeof (resp.Download))
})

test('wechat pickMainInfoFromMsg MSGTYPE_VERIFYMSG', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_VERIFYMSG,
    Status: 1,
    RecommendInfo: { UserName: 2 },
    Ticket: 3
  })
  t.equal(resp.Type, 'Friend')
  t.equal(1, resp.Content.status)
  t.equal(2, resp.Content.userName)
  t.equal(3, resp.Content.verifyContent)
  t.equal(2, resp.Content.autoUpdate.UserName)
})

test('wechat pickMainInfoFromMsg MSGTYPE_STATUSNOTIFY', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_STATUSNOTIFY
  })
  t.equal(resp.Type, 'Status')
})

test('wechat pickMainInfoFromMsg MSGTYPE_SHARECARD', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_SHARECARD,
    RecommendInfo: 1
  })
  t.equal(resp.Type, 'Card')
  t.equal(resp.Content, 1)
})

test('wechat pickMainInfoFromMsg MSGTYPE_RECALLED', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: MsgTypes.MSGTYPE_RECALLED,
    Content: 'kk[CDATA[ASD&lt;&gt;lg]]ll'
  })
  t.equal(resp.Type, 'Recall')
  t.equal(resp.Content, 'ASD<>lg')
})

test('wechat pickMainInfoFromMsg other', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}

  let resp = await wechat.pickMainInfoFromMsg({
    MsgType: 999,
    Content: 'kk[CDATA[ASD&lt;&gt;lg]]ll'
  })
  t.equal(resp.Type, 'NotSupported-999')
  t.equal(resp.Content.Content, 'kk[CDATA[ASD&lt;&gt;lg]]ll')
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
