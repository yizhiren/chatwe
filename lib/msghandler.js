'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
let util = require('./utils')
let unesacpetext = require('unescape')
let fs = require('fs')
let url = require('url')
let Config = require('./config')
let MsgTypes = Config.MSG_TYPES
let UserTypes = Config.USER_TYPES
let AppMsgTypes = Config.APPMSG_TYPES
let MsgTypeNames = Config.MSGTYPE_NAMES
let StatusNotifyCodes = Config.StatusNotifyCodes

function registerMessageHandler (type, handler) {
  this.messageHandler[type] = handler
  return this
}

function registerTextHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Text, handler)
}
function registerMapHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Map, handler)
}
function registerImageHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Image, handler)
}

function registerVoiceHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Voice, handler)
}

function registerVideoHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Video, handler)
}

function registerSysHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Sys, handler)
}

function registerFriendHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Friend, handler)
}

function registerCardHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Card, handler)
}

function registerStatusHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Status, handler)
}

function registerRecallHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Recall, handler)
}

function registerFileHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.File, handler)
}

function registerNoteHandler (handler) {
  return this.registerMessageHandler(MsgTypeNames.Note, handler)
}

function getImageDownloadFn (filename, msgId) {
  return this.getDownloadFn(filename, msgId, 'webwxgetmsgimg')
}

function getEmoticonDownloadFn (filename, msgId) {
  return this.getDownloadFn(filename, msgId, 'webwxgetmsgimg')
}

function getVideoDownloadFn (filename, msgId) {
  return this.getDownloadFn(filename, msgId, 'webwxgetvideo', { 'Range': 'bytes=0-' })
}

function getVoiceDownloadFn (filename, msgId) {
  return this.getDownloadFn(filename, msgId, 'webwxgetvoice')
}

function getDownloadFn (filename, msgId, interfaceUrl, headers = {}) {
  let self = this
  return async function () {
    var options = {
      uri: self.loginInfo['url'] + '/' + interfaceUrl,
      qs: {
        'MsgID': msgId,
        'skey': self.loginInfo['skey']
      },
      headers: headers,
      timeout: 60 * 1000,
      method: 'GET'
    }

    logger.debug(interfaceUrl, ', option :', options)

    return new Promise(
      (resolve, reject) => self.s0(options)
        .on('error', () => resolve(false)) // pipe input error
        .pipe(fs.createWriteStream(filename, { autoClose: true }))
        .on('finish', () => resolve(true))
        .on('error', () => resolve(false)) // pipe output error
    )
  }
}

function getAppMsgFileDownloadFn (msg, filename) {
  let self = this

  return async function () {
    var options = {
      uri: self.loginInfo['fileUrl'] + '/webwxgetmedia',
      qs: {
        'sender': msg['FromUserName'],
        'mediaid': msg['MediaId'],
        'encryfilename': msg['EncryFileName'],
        'fromuser': self.loginInfo['wxuin'],
        'pass_ticket': self.loginInfo['pass_ticket'],
        'webwx_data_ticket': self.getWebwxDataTicket()
      },
      timeout: 60 * 1000,
      method: 'GET'
    }

    logger.debug('getAppMsgFileDownloadFn, option :', options)

    return new Promise(
      (resolve, reject) => self.s0(options)
        .on('error', () => resolve(false)) // pipe input error
        .pipe(fs.createWriteStream(filename, { autoClose: true }))
        .on('finish', () => resolve(true))
        .on('error', () => resolve(false)) // pipe output error
    )
  }
}

function getMapPreviewDownloadFn (urlpath, filename) {
  let self = this
  let urlinfo = url.parse(this.loginInfo['url'])
  let previewUrl = urlinfo.protocol + '//' + urlinfo.host + urlpath

  return async function () {
    var options = {
      uri: previewUrl,
      timeout: 60 * 1000,
      method: 'GET'
    }

    logger.debug('getMapPreviewDownloadFn, option :', options)

    return new Promise(
      (resolve, reject) => self.s0(options)
        .on('error', () => resolve(false)) // pipe input error
        .pipe(fs.createWriteStream(filename, { autoClose: true }))
        .on('finish', () => resolve(true))
        .on('error', () => resolve(false)) // pipe output error
    )
  }
}

function getDownloadSlaveFn (filename, msgId, interfaceUrl = 'webwxgetmsgimg', headers = {}) {
  let self = this
  return async function () {
    var options = {
      uri: self.loginInfo['url'] + '/' + interfaceUrl,
      qs: {
        'MsgID': msgId,
        'skey': self.loginInfo['skey'],
        'type': 'slave'
      },
      headers: headers,
      timeout: 60 * 1000,
      method: 'GET'
    }

    logger.debug(interfaceUrl, ', option :', options)

    return new Promise(
      (resolve, reject) => self.s0(options)
        .on('error', () => resolve(false)) // pipe input error
        .pipe(fs.createWriteStream(filename, { autoClose: true }))
        .on('finish', () => resolve(true))
        .on('error', () => resolve(false)) // pipe output error
    )
  }
}

async function pickMainInfoFromMsg (msg) {
  let localTime = Date.now()

  if (MsgTypes.MSGTYPE_TEXT === msg.MsgType) {
    if (msg.Url !== undefined && msg.Url !== '') {
      let placeInfo = {
        'Type': MsgTypeNames.Map,
        'Url': msg.Url
      }
      let group = /(.*?):<br\/>(.*)$/.exec(unesacpetext(msg.Content))
      if (group) {
        let filename = 'cache/' + localTime + '.png'
        placeInfo.Text = group[1]
        placeInfo.Content = filename
        placeInfo.Download = this.getMapPreviewDownloadFn(group[2], filename)
      }

      return placeInfo
    }

    return {
      'Type': MsgTypeNames.Text,
      'Content': unesacpetext(msg.Content)
    }
  }

  let previewFile = 'cache/' + localTime + '_slave.png'
  if (MsgTypes.MSGTYPE_IMAGE === msg.MsgType ||
        MsgTypes.MSGTYPE_VIDEO === msg.MsgType ||
        MsgTypes.MSGTYPE_MICROVIDEO === msg.MsgType) {
    let downSlave = this.getDownloadSlaveFn(previewFile, msg['MsgId'])
    await downSlave()
  }

  if (MsgTypes.MSGTYPE_IMAGE === msg.MsgType) {
    let filename = 'cache/' + localTime + '.png'
    return {
      'Type': MsgTypeNames.Image,
      'Content': filename,
      'Preview': previewFile,
      'Download': this.getImageDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_EMOTICON === msg.MsgType) {
    let filename = 'cache/' + localTime + '.gif'
    return {
      'Type': MsgTypeNames.Image,
      'Content': filename,
      'Download': this.getEmoticonDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_VOICE === msg.MsgType) {
    let filename = 'cache/' + localTime + '.mp3'
    return {
      'Type': MsgTypeNames.Voice,
      'Content': filename,
      'Download': this.getVoiceDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_VIDEO === msg.MsgType ||
        MsgTypes.MSGTYPE_MICROVIDEO === msg.MsgType) {
    let filename = 'cache/' + localTime + '.mp4'
    return {
      'Type': MsgTypeNames.Video,
      'Content': filename,
      'Preview': previewFile,
      'Download': this.getVideoDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_VERIFYMSG === msg.MsgType) {
    return {
      'Type': MsgTypeNames.Friend,
      'Content': {
        'status': msg['Status'],
        'userName': msg['RecommendInfo']['UserName'],
        'verifyContent': msg['Ticket'],
        'autoUpdate': msg['RecommendInfo']
      }
    }
  }

  if (MsgTypes.MSGTYPE_STATUSNOTIFY === msg.MsgType) {
    return {
      'Type': MsgTypeNames.Status,
      'Content': StatusNotifyCodes[msg.StatusNotifyCode]
    }
  }

  if (MsgTypes.MSGTYPE_SHARECARD === msg.MsgType) {
    return {
      'Type': MsgTypeNames.Card,
      'Content': msg['RecommendInfo']
    }
  }

  if (MsgTypes.MSGTYPE_SYS === msg.MsgType) {
    return {
      'Type': MsgTypeNames.Sys,
      'Content': unesacpetext(msg.Content)
    }
  }

  if (MsgTypes.MSGTYPE_APP === msg.MsgType) {
    if (msg.AppMsgType === AppMsgTypes.APPMSGTYPE_ATTACH) {
      let filename = 'cache/' + localTime + '_' + decodeURIComponent(msg['EncryFileName'])
      return {
        'Type': MsgTypeNames.File,
        'Content': filename,
        'Download': this.getAppMsgFileDownloadFn(msg, filename)
      }
    }

    if (msg.AppMsgType === AppMsgTypes.APPMSGTYPE_EMOJI) {
      let filename = 'cache/' + localTime + '.gif'
      return {
        'Type': MsgTypeNames.Image,
        'Content': filename,
        'Download': this.getEmoticonDownloadFn(filename, msg['MsgId'])
      }
    }

    if (msg.AppMsgType === AppMsgTypes.APPMSGTYPE_REALTIME_SHARE_LOCATION) {
      return {
        'Type': MsgTypeNames.Note,
        'Content': decodeURIComponent(msg['EncryFileName'])
      }
    }

    return {
      'Type': MsgTypeNames.Note,
      'Content': unesacpetext(msg.Content)
    }
  }

  if (MsgTypes.MSGTYPE_VOIPINVITE === msg.MsgType) {
    return {
      'Type': MsgTypeNames.Note,
      'Content': unesacpetext(msg.Content)
    }
  }

  if (MsgTypes.MSGTYPE_RECALLED === msg.MsgType) {
    let data = /\[CDATA\[(.+?)\]\]/.exec(msg.Content)
    let content = 'System message'
    if (data) {
      content = data[1].replace(/\\/g, '')
    }
    return {
      'Type': MsgTypeNames.Recall,
      'Content': unesacpetext(content)
    }
  }

  return {
    'Type': 'NotSupported-' + msg.MsgType,
    'Content': msg
  }
}

function defaultHandler (msg) {
  let fromUser = msg.From
  let toUser = msg.To
  let notifyUsers = msg.NotifyUsers
  let content = msg.Content
  let msgType = msg.Type

  let fromName = fromUser.NickName
  if (fromUser.RemarkName && fromUser.RemarkName !== '') {
    fromName += '(' + fromUser.RemarkName + ')'
  }
  let toName = toUser.NickName
  if (toUser.RemarkName && toUser.RemarkName !== '') {
    toName += '(' + toUser.RemarkName + ')'
  }
  let notifyName = 'NotifyName:'
  for (let i in notifyUsers) {
    notifyName += util.emojiFormatter(notifyUsers[i], 'NickName') + ','
  }

  console.log('[%s]%s -> %s : %s => %s', msgType, fromName, toName, content, notifyName)
}

function getChatroomUser (chatroom, username) {
  logger.debug('getChatroomUser:', chatroom, username)
  let idx = util.searchDictList(chatroom.MemberList, 'UserName', username)
  return chatroom.MemberList[idx] || {}
}

function fillChatroomUser (fromType, fromUser, toType, toUser, msgToProcess) {
  msgToProcess.IsAtMe = false
  if (toType === UserTypes.USER_TYPE_CHATROOM) {
    msgToProcess.ChatRoomUser = this.getChatroomUser(toUser, this.getMyName())
  } else if (fromType === UserTypes.USER_TYPE_CHATROOM && msgToProcess['Type'] === 'Text') {
    let res = /(@[0-9a-z]*?):<br\/>(.*)$/.exec(msgToProcess.Content)
    if (res) {
      let myChatroomUser = this.getChatroomUser(fromUser, this.getMyName())
      let myDisplayName = myChatroomUser.DisplayName === undefined ? this.getMyNickname()
        : myChatroomUser.DisplayName === '' ? this.getMyNickname()
          : myChatroomUser.DisplayName
      let AtTag = '@' + myDisplayName

      msgToProcess.ChatRoomUser = this.getChatroomUser(fromUser, res[1])
      msgToProcess.Content = res[2]
      msgToProcess.IsAtMe = msgToProcess.Content.indexOf(AtTag + String.fromCodePoint('0x2005')) >= 0 ||
                               msgToProcess.Content.indexOf(AtTag + ' ') >= 0 ||
                               msgToProcess.Content.endsWith(AtTag)
    } else {
      logger.warn("fillChatroomUser : can't parse cotent ", msgToProcess.Content)
    }
  }
}

async function produceMsg (msgList) {
  logger.debug('produceMsg :', msgList)

  for (let key in msgList) {
    let msg = msgList[key]
    let [fromType, fromUser] = await this.findUser(msg.FromUserName)
    let [toType, toUser] = await this.findUser(msg.ToUserName)
    let notifyUserNames = msg.StatusNotifyUserName.split(',')
    logger.debug('notifyUserNames:', notifyUserNames)
    let notifyUsers = []
    for (let i in notifyUserNames) {
      if (notifyUserNames[i] !== '') {
        let [, notifyUser] = await this.findUser(notifyUserNames[i])
        notifyUsers.push(notifyUser)
      }
    }

    let msgToProcess = await this.pickMainInfoFromMsg(msg)
    this.fillChatroomUser(fromType, fromUser, toType, toUser, msgToProcess)
    logger.debug('msgToProcess :', msgToProcess)

    msgToProcess.NotifyUsers = notifyUsers
    msgToProcess.FromType = fromType
    msgToProcess.OrigMsg = msg
    msgToProcess.From = fromUser
    msgToProcess.To = toUser
    if (msg.ToUserName === 'filehelper') {
      msgToProcess.From = toUser
      msgToProcess.FromType = toType
      msgToProcess.To = fromUser
    }

    this.defaultHandler(msgToProcess)
    if (typeof (this.messageHandler[msgToProcess.Type]) === 'function') {
      await this.messageHandler[msgToProcess.Type].call(this, msgToProcess)
    } else {
      logger.debug('not register handler :', msg.MsgType)
    }
  }
}

module.exports.Register = function (core) {
  core.defaultHandler = defaultHandler
  core.registerMessageHandler = registerMessageHandler
  core.registerTextHandler = registerTextHandler
  core.registerMapHandler = registerMapHandler
  core.registerImageHandler = registerImageHandler
  core.registerVoiceHandler = registerVoiceHandler
  core.registerVideoHandler = registerVideoHandler
  core.registerSysHandler = registerSysHandler
  core.registerFriendHandler = registerFriendHandler
  core.registerCardHandler = registerCardHandler
  core.registerFileHandler = registerFileHandler
  core.registerRecallHandler = registerRecallHandler
  core.registerNoteHandler = registerNoteHandler
  core.pickMainInfoFromMsg = pickMainInfoFromMsg
  core.getImageDownloadFn = getImageDownloadFn
  core.getEmoticonDownloadFn = getEmoticonDownloadFn
  core.getVoiceDownloadFn = getVoiceDownloadFn
  core.getVideoDownloadFn = getVideoDownloadFn
  core.getDownloadFn = getDownloadFn
  core.getDownloadSlaveFn = getDownloadSlaveFn
  core.getMapPreviewDownloadFn = getMapPreviewDownloadFn
  core.getAppMsgFileDownloadFn = getAppMsgFileDownloadFn
  core.produceMsg = produceMsg
  core.fillChatroomUser = fillChatroomUser
  core.getChatroomUser = getChatroomUser
  core.registerStatusHandler = registerStatusHandler
}
