var Wechat = require('./')
var wechat = new Wechat()

wechat.setLogging('debug')
wechat.registerTextHandler(async function (msg) {
  await this.reply(msg, '[received]')
}).login()
