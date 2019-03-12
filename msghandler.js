let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
let util = require('./utils')
let unesacpetext = require('unescape')
let fs = require('fs')
let Config = require('./config')
let MsgTypes = Config.MSG_TYPES
let UserTypes = Config.USER_TYPES
let StatusNotifyCodes = Config.StatusNotifyCodes

let MessageHandler = {}

function registerMessageHandler (type, handler) {
  MessageHandler[type] = handler
}

function registerTextHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_TEXT, handler)
}

function registerPictureHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_IMAGE, handler)
  registerMessageHandler(MsgTypes.MSGTYPE_EMOTICON, handler)
}

function registerVoiceHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_VOICE, handler)
}

function registerVideoHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_VIDEO, handler)
  registerMessageHandler(MsgTypes.MSGTYPE_MICROVIDEO, handler)
}

function registerSysHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_SYS, handler)
  registerMessageHandler(MsgTypes.MSGTYPE_RECALLED, handler)
}

function registerFriendHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_VERIFYMSG, handler)
}

function registerCardHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_SHARECARD, handler)
}

function registerStatusHandler (handler) {
  registerMessageHandler(MsgTypes.MSGTYPE_STATUSNOTIFY, handler)
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
        .pipe(fs.createWriteStream(filename, { autoClose: true }))
        .on('finish', resolve)
        .on('error', reject)
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

    return new Promise(resolve =>
      self.s0(options)
        .pipe(fs.createWriteStream(filename, { autoClose: true }))
        .on('finish', resolve))
  }
}

async function pickMainInfoFromMsg (msg) {
  let localTime = Date.now()

  if (MsgTypes.MSGTYPE_TEXT === msg.MsgType) {
    return {
      'Type': 'Text',
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
      'Type': 'Image',
      'Content': filename,
      'Preview': previewFile,
      'Download': this.getImageDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_EMOTICON === msg.MsgType) {
    let filename = 'cache/' + localTime + '.gif'
    return {
      'Type': 'Gif',
      'Content': filename,
      'Download': this.getEmoticonDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_VOICE === msg.MsgType) {
    let filename = 'cache/' + localTime + '.mp3'
    return {
      'Type': 'Voice',
      'Content': filename,
      'Download': this.getVoiceDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_VIDEO === msg.MsgType ||
        MsgTypes.MSGTYPE_MICROVIDEO === msg.MsgType) {
    let filename = 'cache/' + localTime + '.mp4'
    return {
      'Type': 'Video',
      'Content': filename,
      'Preview': previewFile,
      'Download': this.getVideoDownloadFn(filename, msg['MsgId'])
    }
  }

  if (MsgTypes.MSGTYPE_VERIFYMSG === msg.MsgType) {
    return {
      'Type': 'Friend',
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
      'Type': 'Status',
      'Content': StatusNotifyCodes[msg.StatusNotifyCode]
    }
  }

  if (MsgTypes.MSGTYPE_SHARECARD === msg.MsgType) {
    return {
      'Type': 'Card',
      'Content': msg['RecommendInfo']
    }
  }

  if (MsgTypes.MSGTYPE_SYS === msg.MsgType) {
    return {
      'Type': 'Sys',
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
      'Type': 'Recall',
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
  logger.debug('fillChatroomUser,', fromType, fromUser, toType, toUser, msgToProcess)

  if (toType === UserTypes.USER_TYPE_CHATROOM) {
    msgToProcess.ChatRoomUser = this.getChatroomUser(toUser, this.getMyName())
  } else if (fromType === UserTypes.USER_TYPE_CHATROOM && msgToProcess['Type'] === 'Text') {
    let res = /(@[0-9a-z]*?):<br\/>(.*)$/.exec(msgToProcess.Content)
    if (res) {
      let myChatroomUser = this.getChatroomUser(fromUser, this.getMyName())
      let myDisplayName = myChatroomUser.DisplayName !== '' ? myChatroomUser.DisplayName
        : this.getMyNickname()
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
    let [fromType, fromUser] = this.findUser(msg.FromUserName)
    let [toType, toUser] = this.findUser(msg.ToUserName)
    let notifyUserNames = msg.StatusNotifyUserName.split(',')
    logger.debug('notifyUserNames:', notifyUserNames)
    let notifyUsers = []
    for (let i in notifyUserNames) {
      if (notifyUserNames[i] !== '') {
        let [, notifyUser] = this.findUser(notifyUserNames[i])
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
    if (typeof (MessageHandler[msg.MsgType]) === 'function') {
      await MessageHandler[msg.MsgType].call(this, msgToProcess)
    } else {
      logger.debug('not register handler :', msg.MsgType)
    }
  }
}

module.exports.Register = function (core) {
  core.defaultHandler = defaultHandler
  core.registerTextHandler = registerTextHandler
  core.registerPictureHandler = registerPictureHandler
  core.registerVoiceHandler = registerVoiceHandler
  core.registerVideoHandler = registerVideoHandler
  core.registerSysHandler = registerSysHandler
  core.registerFriendHandler = registerFriendHandler
  core.registerCardHandler = registerCardHandler
  core.pickMainInfoFromMsg = pickMainInfoFromMsg
  core.getImageDownloadFn = getImageDownloadFn
  core.getEmoticonDownloadFn = getEmoticonDownloadFn
  core.getVoiceDownloadFn = getVoiceDownloadFn
  core.getVideoDownloadFn = getVideoDownloadFn
  core.getDownloadFn = getDownloadFn
  core.getDownloadSlaveFn = getDownloadSlaveFn
  core.produceMsg = produceMsg
  core.fillChatroomUser = fillChatroomUser
  core.getChatroomUser = getChatroomUser
  core.registerStatusHandler = registerStatusHandler
}

module.exports.MessageHandler = MessageHandler
