var Wechat = require('./')
var wechat = new Wechat()

wechat.setLogging('debug')
wechat.registerTextHandler(async function (msg) {
  console.log(msg)
}).registerMapHandler(async function (msg) {
  await msg.Download()
  console.log(msg)
}).registerImageHandler(async function (msg) {
  await msg.Download()
  console.log(msg)
}).registerVoiceHandler(async function (msg) {
  await msg.Download()
  console.log(msg)
}).registerVideoHandler(async function (msg) {
  await msg.Download()
  console.log(msg)
}).registerSysHandler(async function (msg) {
  console.log(msg)
}).registerFriendHandler(async function (msg) {
  console.log(msg)
}).registerCardHandler(async function (msg) {
  console.log(msg)
}).registerStatusHandler(async function (msg) {
  console.log(msg)
}).registerRecallHandler(async function (msg) {
  console.log(msg)
}).registerFileHandler(async function (msg) {
  await msg.Download()
  console.log(msg)
}).registerNoteHandler(async function (msg) {
  console.log(msg)
}).login()
