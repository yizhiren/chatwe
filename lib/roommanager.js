'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')

async function createChatroom (memberList, topic) {
  logger.debug('createChatroom()')
  let localTime = Date.now()

  let userNames = []
  for (let i in memberList) {
    userNames.push({ UserName: memberList[i].UserName })
  }

  let options = {
    uri: this.loginInfo['url'] + '/webwxcreatechatroom',
    qs: {
      'r': localTime,
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'MemberCount': userNames.length,
      'MemberList': userNames,
      'Topic': topic
    },
    json: true,
    method: 'POST'
  }

  logger.debug('createChatroom, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('createChatroom resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('createChatroom issucc :', issucc)
      return issucc ? resp : null
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })
}

async function setChatroomName (chatroom, topic) {
  logger.debug('SetChatroomName()')

  let options = {
    uri: this.loginInfo['url'] + '/webwxupdatechatroom',
    qs: {
      'fun': 'modtopic',
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'ChatRoomName': chatroom.UserName,
      'NewTopic': topic
    },
    json: true,
    method: 'POST'
  }

  logger.debug('createChatroom, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('SetChatroomName resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('SetChatroomName issucc :', issucc)
      return issucc ? resp : null
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })
}

async function deleteMemberFromChatroom (chatroom, memberList) {
  logger.debug('deleteMemberFromChatroom()')

  let userNames = ''
  for (let i in memberList) {
    userNames += memberList[i].UserName + ','
  }
  userNames = userNames.substr(0, userNames.length - 1)

  let options = {
    uri: this.loginInfo['url'] + '/webwxupdatechatroom',
    qs: {
      'fun': 'delmember',
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'ChatRoomName': chatroom.UserName,
      'DelMemberList': userNames
    },
    json: true,
    method: 'POST'
  }

  logger.debug('deleteMemberFromChatroom, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('deleteMemberFromChatroom resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('deleteMemberFromChatroom issucc :', issucc)
      return issucc ? resp : null
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })
}

async function inviteMemberToChatroom (chatroom, memberList) {
  logger.debug('inviteMemberToChatroom()')

  let userNames = ''
  for (let i in memberList) {
    userNames += memberList[i].UserName + ','
  }
  userNames = userNames.substr(0, userNames.length - 1)

  let options = {
    uri: this.loginInfo['url'] + '/webwxupdatechatroom',
    qs: {
      'fun': 'invitemember',
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'ChatRoomName': chatroom.UserName,
      'InviteMemberList': userNames
    },
    json: true,
    method: 'POST'
  }

  logger.debug('inviteMemberToChatroom, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('inviteMemberToChatroom resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('inviteMemberToChatroom issucc :', issucc)
      return issucc ? resp : null
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })
}

async function addMemberToChatroom (chatroom, memberList) {
  logger.debug('inviteMemberToChatroom()')

  let userNames = ''
  for (let i in memberList) {
    userNames += memberList[i].UserName + ','
  }
  userNames = userNames.substr(0, userNames.length - 1)

  let options = {
    uri: this.loginInfo['url'] + '/webwxupdatechatroom',
    qs: {
      'fun': 'addmember',
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'ChatRoomName': chatroom.UserName,
      'AddMemberList': userNames
    },
    json: true,
    method: 'POST'
  }

  logger.debug('inviteMemberToChatroom, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('inviteMemberToChatroom resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('inviteMemberToChatroom issucc :', issucc)
      return issucc ? resp : null
    })
    .catch(function (err) {
      logger.warn(err)
      return null
    })
}

module.exports.Register = function (core) {
  core.createChatroom = createChatroom
  core.setChatroomName = setChatroomName
  core.deleteMemberFromChatroom = deleteMemberFromChatroom
  core.inviteMemberToChatroom = inviteMemberToChatroom
  core.addMemberToChatroom = addMemberToChatroom
}
