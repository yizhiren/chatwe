const os = require('os')

module.exports = {
  VERSION: '1.3.10',
  BASE_URL: 'https://login.weixin.qq.com',
  PUSHLOGIN_BASE_URL: 'https://wx.qq.com',
  OS: os.platform(),
  DIR: process.cwd(),
  DEFAULT_QR: 'QR.png',
  TIMEOUT: 60,
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
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
