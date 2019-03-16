'use strict'

var Wechat = require('../index')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let Config = require('../lib/config')
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'
var wechat = new Wechat()
wechat.setLogging('info')

test('setup', function (t) {
  t.end()
})

test('wechat registerTextHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Text'])
  wechat.registerTextHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Text'])
})

test('wechat registerMapHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Map'])
  wechat.registerMapHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Map'])
})

test('wechat registerImageHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Image'])
  wechat.registerImageHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Image'])
})

test('wechat registerVoiceHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Voice'])
  wechat.registerVoiceHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Voice'])
})

test('wechat registerVideoHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Video'])
  wechat.registerVideoHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Video'])
})

test('wechat registerSysHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Sys'])
  wechat.registerSysHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Sys'])
})

test('wechat registerFriendHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Friend'])
  wechat.registerFriendHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Friend'])
})

test('wechat registerCardHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Card'])
  wechat.registerCardHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Card'])
})

test('wechat registerStatusHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Status'])
  wechat.registerStatusHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Status'])
})

test('wechat registerRecallHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Recall'])
  wechat.registerRecallHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Recall'])
})

test('wechat registerFileHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['File'])
  wechat.registerFileHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['File'])
})

test('wechat registerNoteHandler', async function (t) {
  t.equal(undefined, wechat.messageHandler['Note'])
  wechat.registerNoteHandler(function () {})
  t.notEqual(undefined, wechat.messageHandler['Note'])
})

test('cleanup', function (t) {
  t.end()
})
