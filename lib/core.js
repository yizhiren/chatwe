'use strict'

let rp = require('request-promise')
let r = require('request')
let Config = require('./config')
let FileCookieStore = require('tough-cookie-filestore-fix')
let fse = require('fs-extra')
let logsystem = require('./logsystem')
let Login = require('./login')
let Messages = require('./messages')
let MsgHandler = require('./msghandler')

let instNum = 0
class Core {
  init () {
    this.isLogined = false
    this.isLogging = false
    this.loginInfo = {}

    this.uuid = ''

    this.memberList = []
    this.mpList = []
    this.chatroomList = []

    this.init_memberList = []
    this.init_mpList = []
    this.init_chatroomList = []

    this.messageHandler = {}
  }

  setLogging (level) {
    logsystem.setLogging(level)
  }

  constructor () {
    this.init()
    fse.ensureDirSync('cache')
    this.cookieFile = 'cookie/wxcookie' + instNum + '.json'
    fse.ensureFileSync(this.cookieFile)
    this.cookieStore = new FileCookieStore(this.cookieFile)
    this.cookieJar = rp.jar(this.cookieStore)
    this.s = rp.defaults({
      jar: this.cookieJar,
      headers: {
        'User-Agent': Config.USER_AGENT
      }
    })
    this.s0 = r.defaults({
      jar: this.cookieJar,
      headers: {
        'User-Agent': Config.USER_AGENT
      }
    })
    Login.Register(this)
    Messages.Register(this)
    MsgHandler.Register(this)

    instNum++
  }
}

module.exports = Core
