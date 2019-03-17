var Wechat = require('./')
var wechat = new Wechat()

wechat.setLogging('debug')
wechat.registerTextHandler(async function (msg) {
  console.log(msg)
}).registerMapHandler(async function (msg) {
  await msg.Download()
  console.log(msg)
}).login()
