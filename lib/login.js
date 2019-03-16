'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
let rperrors = require('request-promise/errors')
let Config = require('./config')
let QRcode = require('qrcode-terminal')
let url = require('url')
let util = require('./utils')
let UserTypes = Config.USER_TYPES

async function waitOneSecond () {
  return new Promise(resolve => setTimeout(resolve, 1000))
}

function getQR () {
  QRcode.generate(Config.BASE_URL + '/l/' + this.uuid, { small: true })
}

async function getLoginInfo (text) {
  logger.debug('getLoginInfo()')
  logger.debug('text :', text)

  let regx = /window.redirect_uri="(\S+)";/
  let data = regx.exec(text)
  this.loginInfo['url'] = data[1] + '&fun=new&version=v2'
  logger.debug('info url :', this.loginInfo['url'])

  let loginInfoUrl = this.loginInfo['url']
  let options = {
    uri: loginInfoUrl
  }

  let urlinfo = url.parse(this.loginInfo['url'])
  logger.debug('urlinfo :', urlinfo)
  this.loginInfo['url'] = `https://${urlinfo.host}/cgi-bin/mmwebwx-bin`
  this.loginInfo['fileUrl'] = `https://${'file.' + urlinfo.host}/cgi-bin/mmwebwx-bin`
  this.loginInfo['syncUrl'] = `https://${'webpush.' + urlinfo.host}/cgi-bin/mmwebwx-bin`

  this.loginInfo['deviceid'] = 'e' + Date.now() + '99'
  this.loginInfo['logintime'] = Date.now()
  this.loginInfo['BaseRequest'] = {
    'DeviceID': this.loginInfo['deviceid']
  }

  logger.debug('getLoginInfo option :', options)

  let self = this

  return this.s(options)
    .then(function (resp) {
      let pm = resp.match(/<ret>(.*)<\/ret>/)
      if (pm && (pm[1] === '0')) {
        self.loginInfo['skey'] = self.loginInfo['BaseRequest']['Skey'] = resp.match(/<skey>(.*)<\/skey>/)[1]
        self.loginInfo['wxsid'] = self.loginInfo['BaseRequest']['Sid'] = resp.match(/<wxsid>(.*)<\/wxsid>/)[1]
        self.loginInfo['wxuin'] = self.loginInfo['BaseRequest']['Uin'] = resp.match(/<wxuin>(.*)<\/wxuin>/)[1]
        self.loginInfo['pass_ticket'] = resp.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]

        logger.debug('login info :', self.loginInfo)
        return true
      } else {
        return false
      }
    })
    .catch(function (err) {
      logger.warn('err :', err)
      return false
    })
}

async function checkLogin () {
  logger.debug('checkLogin()')
  let localTime = Date.now()

  let options = {
    uri: Config.BASE_URL + '/cgi-bin/mmwebwx-bin/login',
    qs: {
      'loginicon': true,
      'uuid': this.uuid,
      'tip': 1,
      'r': localTime
    }
  }

  let self = this

  return this.s(options)
    .then(function (resp) {
      logger.debug('checkLogin resp :', resp)
      let regx = /window.code=(\d+)/
      let data = regx.exec(resp)
      if (data && data[1] === '200') {
        return self.getLoginInfo(resp).then(function (succ) {
          return succ ? 200 : 400
        }).catch(function (err) {
          logger.debug('checkLogin getLoginInfo fail once:', err)
          return 400
        })
      } else if (data) {
        return parseInt(data[1])
      } else {
        return 400
      }
    })
    .catch(function (err) {
      logger.warn(err)
      return 400
    })
}

async function pushLogin () {
  logger.debug('pushLogin()')
  let wxuid = ''
  this.cookieStore.findCookie('wx.qq.com', '/', 'wxuin', function (err, cookie) {
    if (cookie) {
      wxuid = cookie.value
    } else {
      wxuid = ''
    }

    if (err) {
      logger.debug('pushLogin findCookie fail:', err)
    }
  })
  logger.debug('pushlogin, wxuid :', wxuid)
  if (wxuid === '') {
    return wxuid
  }

  let options = {
    uri: Config.PUSHLOGIN_BASE_URL + '/cgi-bin/mmwebwx-bin/webwxpushloginurl?uin=' + wxuid,
    json: true
  }

  logger.debug('pushLogin option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('pushLogin resp :', resp)
      if (resp && resp.ret === '0') {
        return resp['uuid']
      }
      return ''
    })
    .catch(function (err) {
      logger.warn(err)
      return ''
    })
}

async function getQRuuid () {
  logger.debug('getQRuuid()')
  let options = {
    uri: Config.BASE_URL + '/jslogin',
    qs: {
      'appid': 'wx782c26e4c19acffb',
      'fun': 'new',
      'lang': 'zh_CN',
      '_': Date.now()
    },
    headers: {
      'User-Agent': Config.USER_AGENT
    }
  }
  logger.debug('getQRuuid, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('getQRuuid resp:', resp)
      let regx = /window.QRLogin.code = (\d+); window.QRLogin.uuid = "(\S+?)";/
      let data = regx.exec(resp)
      if (data && data[1] === '200') {
        logger.debug('uuid =', data[2])
        return data[2]
      } else {
        return ''
      }
    })
    .catch(function (err) {
      logger.warn(err)
      return ''
    })
}

function pickupDifferentInitContact (contactList) {
  logger.debug('pickupDifferentInitContact', contactList)
  for (let key in contactList) {
    let item = contactList[key]
    if (item['Sex'] !== 0) {
      this.init_memberList.push(item)
    } else if (item['UserName'] === 'weixin' || item['UserName'] === 'filehelper') {
      this.init_memberList.push(item)
    } else if (item['UserName'].substr(0, 2) === '@@') {
      this.init_chatroomList.push(item)
    } else if (item['UserName'].substr(0, 1) === '@') {
      if ((item['VerifyFlag'] & 8) === 0) {
        this.init_memberList.push(item)
      } else {
        this.init_mpList.push(item)
      }
    } else {
      logger.warn('unknow contact:', item)
    }
  }
}

function getMyName () {
  return this.loginInfo['User']['UserName']
}

function getMyNickname () {
  return this.loginInfo['User']['NickName']
}

function getShowName (user) {
  let showname = user.RemarkName
  if (showname === '') {
    showname = user.NickName
  }

  return showname
}

async function webInit () {
  logger.debug('webInit()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxinit',
    qs: {
      'pass_ticket': this.loginInfo['pass_ticket'],
      'r': localTime
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest']
    },
    json: true,
    method: 'POST'
  }

  logger.debug('webInit, option :', options)
  let self = this

  return this.s(options)
    .then(function (resp) {
      logger.debug('webInit resp :', resp)

      self.loginInfo['InviteStartCount'] = resp['InviteStartCount']
      self.loginInfo['User'] = resp['User']
      // self.memberList.push(self.loginInfo['User'])
      self.loginInfo['SyncKey'] = resp['SyncKey']
      let synckey = ''
      for (let key in resp['SyncKey']['List']) {
        let item = resp['SyncKey']['List'][key]
        synckey += item['Key'] + '_' + item['Val'] + '|'
      }
      self.loginInfo['synckey'] = synckey.substr(0, synckey.length - 1)
      // self.init_subscribeList = resp.MPSubscribeMsgList
      let contactList = resp['ContactList'] || []
      pickupDifferentInitContact.call(self, contactList)

      return true
    })
    .catch(function (err) {
      logger.warn(err)

      return false
    })
}

async function showMobileLogin () {
  logger.debug('showMobileLogin()')

  let options = {
    uri: this.loginInfo['url'] + '/webwxstatusnotify',
    qs: {
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Code': 3,
      'FromUserName': this.loginInfo['User']['UserName'],
      'ToUserName': this.loginInfo['User']['UserName'],
      'ClientMsgId': util.getClientMsgId()
    },
    json: true,
    method: 'POST'
  }

  logger.debug('showMobileLogin, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('showMobileLogin resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      if (issucc) {
        return true
      }
      logger.warn('showMobileLogin fail :', resp)
      return false
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

function pickupDifferentTotalMember (memberList) {
  for (let key in memberList) {
    let item = memberList[key]
    if (item['Sex'] !== 0) {
      this.memberList.push(item)
    } else if (item['UserName'].substr(0, 2) === '@@') {
      this.chatroomList.push(item)
    } else if (item['UserName'].substr(0, 1) === '@') {
      if ((item['VerifyFlag'] & 8) === 0) {
        this.memberList.push(item)
      } else {
        this.mpList.push(item)
      }
    } else if (item['UserName'] === 'filehelper') {
      this.memberList.push(item)
    } else if (item['UserName'] === 'weixin' || item['UserName'] === 'filehelper') {
      this.memberList.push(item)
    } else {
      logger.warn('unknow member:', item)
    }
  }
}

async function getContact (seq = 0, memberList = []) {
  logger.debug('getContact()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxgetcontact',
    qs: {
      r: localTime,
      seq: seq,
      skey: this.loginInfo['skey']
    },
    json: true,
    method: 'GET'
  }

  logger.debug('getContact, seq=', seq, ', option :', options)

  let self = this

  return this.s(options)
    .then(function (resp) {
      logger.debug('getContact, seq=', seq, ', resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      if (issucc) {
        let nextSeq = resp.Seq || 0
        memberList = memberList.concat(resp.MemberList)
        if (nextSeq > 0) {
          return self.getContact(nextSeq, memberList)
        }
        pickupDifferentTotalMember.call(self, memberList)
        self.memberList = self.memberList.concat(self.init_memberList)
        self.chatroomList = self.chatroomList.concat(self.init_chatroomList)
        self.mpList = self.mpList.concat(self.init_mpList)
        return true
      }
      return false
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function getBatchContact (memberList = []) {
  logger.debug('getBatchContact()')
  let localTime = Date.now()

  if (memberList.length === 0) {
    return []
  }

  // 一次最多50
  let headPart = memberList.slice(0, 50)
  let tailPart = memberList.slice(50)

  let options = {
    uri: this.loginInfo['url'] + '/webwxbatchgetcontact',
    qs: {
      r: localTime,
      type: 'ex',
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Count': headPart.length,
      'List': headPart
    },
    json: true,
    method: 'POST'
  }

  logger.debug('getBatchContact option :', options)

  let self = this

  let headContactList = await this.s(options)
    .then(function (resp) {
      logger.debug('getBatchContact resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      if (issucc) {
        return resp.ContactList
      }
      return null
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })

  if (!headContactList) {
    return null
  }

  let tailContactList = await self.getBatchContact(tailPart)
  if (!tailContactList) {
    return null
  }

  return headContactList.concat(tailContactList)
}

async function updateAllChatroom () {
  let userNames = []
  for (let i in this.chatroomList) {
    userNames.push({ UserName: this.chatroomList[i].UserName })
  }
  let userInfos = await this.getBatchContact(userNames)
  logger.debug('updateAllChatroom:', userInfos)
  this.updateContact(userInfos)
}

async function updateUser (userName) {
  let userNames = [{ UserName: userName }]
  let userInfos = await this.getBatchContact(userNames)
  logger.debug('updateUser:', userInfos)
  this.updateContact(userInfos)
}

async function logout () {
  logger.debug('logout()')

  let options = {
    uri: this.loginInfo['url'] + '/webwxlogout',
    qs: {
      'redirect': 1,
      'type': 1,
      'skey': this.loginInfo['skey']
    },
    method: 'GET'
  }

  logger.debug('logout, option :', options)

  let self = this

  return this.s(options)
    .then(function (resp) {
      logger.debug('logout, resp :', resp)
    }).catch(function (err) {
      logger.warn(err)
    }).finally(function () {
      self.init()
    })
}

async function syncCheck () {
  logger.debug('syncCheck()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['syncUrl'] + '/synccheck',
    qs: {
      'r': localTime,
      'skey': this.loginInfo['skey'],
      'sid': this.loginInfo['wxsid'],
      'uin': this.loginInfo['wxuin'],
      'deviceid': this.loginInfo['deviceid'],
      'synckey': this.loginInfo['synckey'],
      '_': this.loginInfo['logintime']
    },
    timeout: 35 * 1000,
    method: 'GET'
  }

  logger.debug('syncCheck, option :', options)
  this.loginInfo['logintime'] += 1

  return this.s(options)
    .then(function (resp) {
      logger.debug('syncCheck, resp :', resp)

      let group = /window.synccheck={retcode:"(\d+)",selector:"(\d+)"}/.exec(resp)
      if (group && group[1] === '0') {
        return parseInt(group[2])
      }

      logger.warn('synccheck, fail :', resp)
      return -1
    }).catch(rperrors.StatusCodeError, function (reason) {
      /*
          这可能是微信的bug，浏览器上也会出现这种情况。复现条件是：
          本人刚回复对方不久，这时候对方按键盘，手机端会出现对方正在输入的提示，而web端就出现synccheck返回statusCode==0的情况
      */
      logger.debug('StatusCodeError:', reason.statusCode, reason.response.body)
      return 0
    }).catch(function (err) {
      throw err
    })
}

async function getMsg () {
  logger.debug('getMsg()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxsync',
    qs: {
      'sid': this.loginInfo['wxsid'],
      'pass_ticket': this.loginInfo['pass_ticket'],
      'skey': this.loginInfo['skey']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'SyncKey': this.loginInfo['SyncKey'],
      'rr': ~localTime
    },
    json: true,
    method: 'POST'
  }

  logger.debug('getMsg, option :', options)
  let self = this

  return this.s(options)
    .then(function (resp) {
      logger.debug('getMsg resp :', JSON.stringify(resp))
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      if (issucc) {
        self.loginInfo['SyncKey'] = resp['SyncKey']
        let synckey = ''
        for (let key in resp['SyncCheckKey']['List']) {
          let item = resp['SyncCheckKey']['List'][key]
          synckey += item['Key'] + '_' + item['Val'] + '|'
        }
        self.loginInfo['synckey'] = synckey.substr(0, synckey.length - 1)
        return resp
      } else {
        logger.warn('getMsg fail :', resp)
        return null
      }
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })
}

function updateContact (contacts) {
  logger.debug('updateContact :', contacts)
  for (let key in contacts) {
    let contact = contacts[key]
    let userName = contact.UserName
    let idx = util.searchDictList(this.memberList, 'UserName', userName)
    if (idx >= 0) {
      logger.debug('old:', this.memberList[idx])
      logger.debug('new:', contact)
      this.memberList[idx] = contact
      continue
    }

    idx = util.searchDictList(this.mpList, 'UserName', userName)
    if (idx >= 0) {
      logger.debug('old:', this.mpList[idx])
      logger.debug('new:', contact)
      this.mpList[idx] = contact
      continue
    }

    idx = util.searchDictList(this.chatroomList, 'UserName', userName)
    if (idx >= 0) {
      logger.debug('old:', this.chatroomList[idx])
      logger.debug('new:', contact)
      this.chatroomList[idx] = contact
      continue
    }

    pickupDifferentTotalMember.call(this, [contact])
  }
}

function findUserInLocal (userName) {
  if (userName === this.loginInfo['User'].UserName) {
    return [UserTypes.USER_TYPE_SELF, this.loginInfo['User']]
  }

  let idx = util.searchDictList(this.memberList, 'UserName', userName)
  if (idx >= 0) {
    return [UserTypes.USER_TYPE_FRIEND, this.memberList[idx]]
  }

  idx = util.searchDictList(this.mpList, 'UserName', userName)
  if (idx >= 0) {
    return [UserTypes.USER_TYPE_MP, this.mpList[idx]]
  }

  idx = util.searchDictList(this.chatroomList, 'UserName', userName)
  if (idx >= 0) {
    return [UserTypes.USER_TYPE_CHATROOM, this.chatroomList[idx]]
  }

  return ['', {}]
}

async function findUser (userName) {
  logger.debug('findUser :', userName)

  let [userType, user] = this.findUserInLocal(userName)
  if (userType === '') {
    await this.updateUser(userName)
    return this.findUserInLocal(userName)
  }

  return [userType, user]
}

async function loopReceiving () {
  logger.debug('loopReceiving()')
  let retryCount = 0
  while (this.isLogined) {
    try {
      let count = await this.syncCheck()
      logger.debug('selector:', count)
      if (count < 0) {
        this.isLogined = false
      } else if (count === 0) {
        continue
      } else {
        let messages = await this.getMsg()
        logger.debug('getMsg got:', messages)
        if (messages) {
          let modContactList = messages.ModContactList
          this.updateContact(modContactList)

          let msgList = messages.AddMsgList
          await this.produceMsg(msgList)
        }
      }
      retryCount = 0
    } catch (err) {
      logger.warn(err)

      retryCount += 1
      if (retryCount >= 100) {
        this.isLogined = false
      } else {
        await waitOneSecond()
        await waitOneSecond()
      }
    }
  }

  await this.logout()
}

async function login () {
  logger.debug('login()')
  if (this.isLogined || this.isLogging) {
    logger.warning('has already logged in.')
    return
  }

  while (!this.isLogined) {
    this.isLogging = true
    this.uuid = await this.pushLogin()
    if (this.uuid === '') {
      this.uuid = await this.getQRuuid()
    }
    if (this.uuid === '') { continue }
    this.getQR()
    while (!this.isLogined) {
      let status = await this.checkLogin()
      logger.debug('check status :', status)
      if (status === 200) {
        this.isLogined = true
      } else if (status === 201) {
        logger.info('Please press confirm on your phone.')
        await waitOneSecond()
      } else if (status !== 408) {
        break
      }
    }
    if (this.isLogined) {
      break
    } else {
      logger.info('Log in time out, reloading QR code.')
    }
  }

  this.isLogging = false

  await this.webInit()
  await this.showMobileLogin()
  await this.getContact()
  await this.updateAllChatroom()
  util.clearScreen()
  this.loopReceiving()
}

module.exports.Register = function (core) {
  core.login = login
  core.getQRuuid = getQRuuid
  core.getQR = getQR
  core.checkLogin = checkLogin
  core.getLoginInfo = getLoginInfo
  core.pushLogin = pushLogin
  core.webInit = webInit
  core.showMobileLogin = showMobileLogin
  core.getContact = getContact
  core.loopReceiving = loopReceiving
  core.syncCheck = syncCheck
  core.logout = logout
  core.getMsg = getMsg
  core.updateContact = updateContact
  core.findUser = findUser
  core.findUserInLocal = findUserInLocal
  core.updateUser = updateUser
  core.updateAllChatroom = updateAllChatroom
  core.getBatchContact = getBatchContact
  core.getMyName = getMyName
  core.getMyNickname = getMyNickname
  core.getShowName = getShowName
}
