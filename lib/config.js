'use strict'

const os = require('os')

module.exports = {
  VERSION: '1.3.10',
  BASE_URL: 'https://login.weixin.qq.com',
  PUSHLOGIN_BASE_URL: 'https://wx.qq.com',
  OS: os.platform(),
  DIR: process.cwd(),
  DEFAULT_QR: 'QR.png',
  TIMEOUT: 60,
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
  MSG_TYPES: {
    MSGTYPE_TEXT: 1,
    MSGTYPE_IMAGE: 3,
    MSGTYPE_VOICE: 34,
    MSGTYPE_VIDEO: 43,
    MSGTYPE_MICROVIDEO: 62,
    MSGTYPE_EMOTICON: 47,
    MSGTYPE_APP: 49,
    MSGTYPE_VOIPMSG: 50,
    MSGTYPE_VOIPNOTIFY: 52,
    MSGTYPE_VOIPINVITE: 53,
    MSGTYPE_LOCATION: 48,
    MSGTYPE_STATUSNOTIFY: 51,
    MSGTYPE_SYSNOTICE: 9999,
    MSGTYPE_POSSIBLEFRIEND_MSG: 40,
    MSGTYPE_VERIFYMSG: 37,
    MSGTYPE_SHARECARD: 42,
    MSGTYPE_SYS: 1e4,
    MSGTYPE_RECALLED: 10002
  },
  APPMSG_TYPES: {
    APPMSGTYPE_TEXT: 1,
    APPMSGTYPE_IMG: 2,
    APPMSGTYPE_AUDIO: 3,
    APPMSGTYPE_VIDEO: 4,
    APPMSGTYPE_URL: 5,
    APPMSGTYPE_ATTACH: 6,
    APPMSGTYPE_OPEN: 7,
    APPMSGTYPE_EMOJI: 8,
    APPMSGTYPE_VOICE_REMIND: 9,
    APPMSGTYPE_SCAN_GOOD: 10,
    APPMSGTYPE_GOOD: 13,
    APPMSGTYPE_EMOTION: 15,
    APPMSGTYPE_CARD_TICKET: 16,
    APPMSGTYPE_REALTIME_SHARE_LOCATION: 17,
    APPMSGTYPE_TRANSFERS: 2e3,
    APPMSGTYPE_RED_ENVELOPES: 2001,
    APPMSGTYPE_READER_TYPE: 100001
  },
  MSGTYPE_NAMES: {
    Text: 'Text',
    Map: 'Map',
    Image: 'Image',
    Voice: 'Voice',
    Video: 'Video',
    Friend: 'Friend',
    Status: 'Status',
    Card: 'Card',
    Sys: 'Sys',
    File: 'File',
    Note: 'Note',
    Recall: 'Recall'
  },
  USER_TYPES: {
    USER_TYPE_FRIEND: 'friend',
    USER_TYPE_MP: 'mp',
    USER_TYPE_CHATROOM: 'chatroom',
    USER_TYPE_SELF: 'self'
  },
  StatusNotifyCodes: {
    1: 'StatusNotifyCode_READED',
    2: 'ENTER_SESSION',
    3: 'INITED',
    4: 'SYNC_CONV',
    5: 'QUIT_SESSION'
  }

}
