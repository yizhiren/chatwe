'use strict'

let log4js = require('log4js')
let logger = log4js.getLogger('chatwe')
let fs = require('fs')
let md5File = require('md5-file')
let mime = require('mime-types')
let path = require('path')

async function replyTo (userName, content) {
  logger.debug('replyTo()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxsendmsg',
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Msg': {
        'Type': 1,
        'Content': content,
        'FromUserName': this.get_myname(),
        'ToUserName': userName,
        'LocalID': localTime * 10,
        'ClientMsgId': localTime * 10
      },
      'Scene': 0
    },
    json: true,
    method: 'POST'
  }

  logger.debug('reply, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('reply resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('reply issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function reply (msg, content) {
  logger.debug('reply()')
  return this.replyTo(msg.From.UserName, content)
}

async function uploadFileChunk (basefilename, fileSize, chunkIdx, chunks, buffer, uploadmediarequest) {
  logger.debug('uploadFileChunk()')

  let mimetype = mime.lookup(basefilename) || 'application/octet-stream'
  let filetype = mimetype.startsWith('image') ? 'pic'
    : mimetype.startsWith('video') ? 'video'
      : 'doc'

  let options = {
    uri: this.loginInfo['fileUrl'] + '/webwxuploadmedia',
    qs: {
      'f': 'json'
    },
    formData: {
      'id': 'WU_FILE_0',
      'name': basefilename,
      'type': mimetype,
      'lastModifiedDate': Date(),
      'size': fileSize,
      'mediatype': filetype,
      'uploadmediarequest': uploadmediarequest,
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    json: true,
    method: 'POST'
  }
  let webwxDataTicket = ''
  this.cookieStore.findCookie('qq.com', '/', 'webwx_data_ticket', function (err, cookie) {
    if (cookie) {
      webwxDataTicket = cookie.value
    } else {
      webwxDataTicket = ''
    }
    if (err) {
      logger.debug('uploadFileChunk.findCookie fail:', err)
    }
  })
  options.formData['webwx_data_ticket'] = webwxDataTicket
  if (chunks > 1) {
    options.formData['chunk'] = chunkIdx
    options.formData['chunks'] = chunks
  }
  options.formData.filename = {
    value: buffer,
    options: {
      filename: basefilename,
      contentType: mimetype
    }
  }

  logger.debug('uploadFileChunk, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('uploadFileChunk resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('uploadFileChunk issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function uploadFileTo (toUserName, filename) {
  logger.debug('uploadFileTo(', toUserName, filename, ')')
  let localTime = Date.now()
  let resp = { 'BaseResponse': { 'Ret': -1005, 'ErrMsg': 'Empty file detected' } }

  if (!fs.existsSync(filename)) {
    return resp
  }

  let stat = fs.lstatSync(filename)
  if (!stat.isFile()) {
    return resp
  }

  let fileMd5 = md5File.sync(filename)
  let fileSize = stat.size
  let maxLengthOneTime = 524288
  let chunks = Math.floor((fileSize - 1) / maxLengthOneTime) + 1
  let clientMediaId = localTime * 10

  let uploadmediarequest = {
    'UploadType': 2,
    'BaseRequest': this.loginInfo['BaseRequest'],
    'ClientMediaId': clientMediaId,
    'TotalLen': fileSize,
    'StartPos': 0,
    'DataLen': fileSize,
    'MediaType': 4,
    'FromUserName': this.get_myname(),
    'ToUserName': toUserName,
    'FileMd5': fileMd5
  }
  uploadmediarequest = JSON.stringify(uploadmediarequest)
  let buffer = Buffer.allocUnsafe(maxLengthOneTime)

  let fd = fs.openSync(filename, 'r')
  let basename = path.basename(filename)
  for (let i = 0; i < chunks; i++) {
    let realBytes = fs.readSync(fd, buffer, 0, maxLengthOneTime, null)
    // function upload_file_chunk(basefilename, fileSize, chunkIdx, chunks, buffer, uploadmediarequest)
    resp = await this.upload_file_chunk(basename, fileSize, i, chunks, buffer.slice(0, realBytes), uploadmediarequest)
    let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
    if (!issucc) {
      resp = { 'BaseResponse': { 'Ret': -1005, 'ErrMsg': 'upload chunk fail' } }
      break
    }
  }
  fs.closeSync(fd)

  logger.debug('uploadFileTo() resp:', resp)

  return resp
}

async function sendImageTo (userName, mediaId) {
  logger.debug('sendImageTo()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxsendmsgimg',
    qs: {
      'f': 'json',
      'fun': 'async'
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Msg': {
        'Type': 3,
        'MediaId': mediaId,
        'FromUserName': this.get_myname(),
        'ToUserName': userName,
        'LocalID': localTime * 10,
        'ClientMsgId': localTime * 10
      },
      'Scene': 0
    },
    json: true,
    method: 'POST'
  }

  logger.debug('sendImageTo, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('sendImageTo resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('sendImageTo issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function sendEmoticonTo (userName, mediaId) {
  logger.debug('sendEmoticonTo()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxsendemoticon',
    qs: {
      'fun': 'sys'
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Msg': {
        'EmojiFlag': 2,
        'Type': 47,
        'MediaId': mediaId,
        'FromUserName': this.get_myname(),
        'ToUserName': userName,
        'LocalID': localTime * 10,
        'ClientMsgId': localTime * 10
      },
      'Scene': 0
    },
    json: true,
    method: 'POST'
  }

  logger.debug('sendEmoticonTo, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('sendEmoticonTo resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('sendEmoticonTo issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function sendVideoTo (userName, mediaId) {
  logger.debug('sendVideoTo()')
  let localTime = Date.now()

  let options = {
    uri: this.loginInfo['url'] + '/webwxsendvideomsg',
    qs: {
      'fun': 'async',
      'f': 'json',
      'pass_ticket': this.loginInfo['pass_ticket']
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Msg': {
        'Type': 43,
        'MediaId': mediaId,
        'FromUserName': this.get_myname(),
        'ToUserName': userName,
        'LocalID': localTime * 10,
        'ClientMsgId': localTime * 10
      },
      'Scene': 0
    },
    json: true,
    method: 'POST'
  }

  logger.debug('sendVideoTo, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('sendVideoTo resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('sendVideoTo issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function sendFileTo (userName, mediaId, filename) {
  logger.debug('sendFileTo()')
  let localTime = Date.now()

  if (!fs.existsSync(filename)) {
    return false
  }

  let stat = fs.lstatSync(filename)
  if (!stat.isFile()) {
    return false
  }

  let fileSize = stat.size

  let content = `<appmsg appid='wxeb7ec651dd0aefa9' sdkver=''><title>${path.basename(filename)}</title>` +
                '<des></des><action></action><type>6</type><content></content><url></url><lowurl></lowurl>' +
                `<appattach><totallen>${fileSize}</totallen><attachid>${mediaId}</attachid>` +
                `<fileext>${path.extname(filename).replace('.', '')}</fileext></appattach><extinfo></extinfo></appmsg>`

  let options = {
    uri: this.loginInfo['url'] + '/webwxsendappmsg',
    qs: {
      'fun': 'async',
      'f': 'json'
    },
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'Msg': {
        'Type': 6,
        'Content': content,
        'FromUserName': this.get_myname(),
        'ToUserName': userName,
        'LocalID': localTime * 10,
        'ClientMsgId': localTime * 10
      },
      'Scene': 0
    },
    json: true,
    method: 'POST'
  }

  logger.debug('sendFileTo, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('sendFileTo resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('sendFileTo issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

async function replyFileTo (userName, filename) {
  logger.debug('replyFileTo()')
  let resp = await this.upload_file_to(userName, filename)
  let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
  if (!issucc) {
    return false
  }

  let mediaId = resp.MediaId
  let mimetype = mime.lookup(filename) || 'application/octet-stream'
  logger.debug('replyFileTo(), mime:', mimetype)
  if (mimetype === 'image/gif') {
    return this.sendEmoticonTo(userName, mediaId)
  } else if (mimetype.startsWith('image')) {
    return this.sendImageTo(userName, mediaId)
  } else if (mimetype.startsWith('video')) {
    return this.sendVideoTo(userName, mediaId)
  } else {
    return this.sendFileTo(userName, mediaId, filename)
  }
}

async function replyFile (msg, filename) {
  logger.debug('replyFile()')
  return this.replyFileTo(msg.From.UserName, filename)
}

async function revoke (userName, msgResp) {
  logger.debug('revoke()')

  let msgId = msgResp.MsgID
  let localId = msgResp.LocalID

  let options = {
    uri: this.loginInfo['url'] + '/webwxrevokemsg',
    body: {
      'BaseRequest': this.loginInfo['BaseRequest'],
      'ClientMsgId': localId,
      'SvrMsgId': msgId,
      'ToUserName': userName
    },
    json: true,
    method: 'POST'
  }

  logger.debug('revoke, option :', options)

  return this.s(options)
    .then(function (resp) {
      logger.debug('revoke resp :', resp)
      let issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret === 0
      logger.debug('revoke issucc :', issucc)
      return resp
    })
    .catch(function (err) {
      logger.warn(err)
      return false
    })
}

module.exports.Register = function (core) {
  core.reply = reply
  core.replyTo = replyTo
  core.uploadFileChunk = uploadFileChunk
  core.uploadFileTo = uploadFileTo
  core.replyFile = replyFile
  core.replyFileTo = replyFileTo
  core.sendVideoTo = sendVideoTo
  core.sendEmoticonTo = sendEmoticonTo
  core.sendImageTo = sendImageTo
  core.sendFileTo = sendFileTo
  core.revoke = revoke
}
