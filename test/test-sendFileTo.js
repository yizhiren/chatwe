'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
var http = require('http')
let path = require('path')
var Wechat = require('../index')
var tape = require('tape')
var _test = require('tape-promise').default
var test = _test(tape)
let Config = require('../lib/config')
Config.BASE_URL = 'http://127.0.0.1:12345'
Config.PUSHLOGIN_BASE_URL = 'http://127.0.0.1:12345'
var wechat = new Wechat()
wechat.setLogging('info')

let filename = path.join(__dirname, '/../LICENSE')
let fileSize = 1065 // LICENSE文件大小
let mediaId = 222
let userName = 'EINSTAIN'
let ret = '{"BaseResponse":{"Ret":0}}'
var s = http.createServer(function (req, res) {
  res.statusCode = 200
  logger.debug(req.url)
  if (req.url.startsWith('/webwxsendappmsg')) {
    var body = ''
    req.on('data', function (chunk) {
      body += chunk
    })

    req.on('end', function () {
      // 解析参数
      body = JSON.parse(body)

      let content = `<appmsg appid='wxeb7ec651dd0aefa9' sdkver=''><title>${path.basename(filename)}</title>` +
                '<des></des><action></action><type>6</type><content></content><url></url><lowurl></lowurl>' +
                `<appattach><totallen>${fileSize}</totallen><attachid>${mediaId}</attachid>` +
                `<fileext>${path.extname(filename).replace('.', '')}</fileext></appattach><extinfo></extinfo></appmsg>`

      if (body.Msg.Content === content && body.Msg.ToUserName === userName) {
        res.end(ret)
      }
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

test('wechat sendFileTo 1', async function (t) {
  wechat.loginInfo['url'] = Config.BASE_URL
  wechat.loginInfo['User'] = {}
  let resp = await wechat.sendFileTo(userName, mediaId, filename)

  t.equal(0, resp.BaseResponse.Ret)
})

test('wechat sendFileTo 2', async function (t) {
  ret = '{"BaseResponse":{"Ret":1}}'
  wechat.loginInfo['User'] = {}
  wechat.loginInfo['url'] = Config.BASE_URL

  let resp = await wechat.sendFileTo(userName, mediaId, filename)

  t.equal(null, resp)
})

test('cleanup', function (t) {
  s.close(function () {
    t.end()
  })
})
