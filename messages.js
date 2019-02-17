let log4js = require('log4js');
let logger = log4js.getLogger('chatwe')
let Config = require('./config')
let url = require('url');
let cheerio = require('cheerio')
let util = require('./utils')
let unesacpetext = require('unescape');
let fs = require('fs')
let md5File = require('md5-file')
let mime = require('mime-types')
let path = require('path')

async function reply_to(userName, content) {
	logger.debug('reply_to()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendmsg',
    	body : {
	        'BaseRequest': this.loginInfo['BaseRequest'],
	        'Msg': {
	            'Type': 1,
	            'Content': content,
	            'FromUserName': this.get_myname(),
	            'ToUserName': userName,
	            'LocalID': localTime * 10,
	            'ClientMsgId': localTime * 10,
	            },
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('reply, option :', options)
	self=this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('reply resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('reply issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function reply(msg, content) {
	logger.debug('reply()')
	return await this.reply_to(msg.From.UserName, content)
}

async function upload_file_chunk(basefilename, fileSize, chunkIdx, chunks, buffer, uploadmediarequest) {
	logger.debug('upload_file_chunk()')

	mimetype = mime.lookup(basefilename) || 'application/octet-stream'
	filetype = mimetype.startsWith('image') ? 'pic' 
				: mimetype.startsWith('video') ? 'video' 
				: 'doc'

	var options = {
	    uri: this.loginInfo['fileUrl'] + '/webwxuploadmedia',
	    qs: {
	        'f' : 'json'
    	},
    	formData : {
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
	webwx_data_ticket = ''
	this.cookieStore.findCookie('qq.com', '/', 'webwx_data_ticket', function(err,cookie){
		if(cookie) {
			webwx_data_ticket = cookie.value
		} else {
			webwx_data_ticket = ''
		}
	})
	options.formData['webwx_data_ticket'] = webwx_data_ticket
	if (chunks > 1) {
		options.formData['chunk'] = chunkIdx
		options.formData['chunks'] = chunks
	}
	options.formData.filename = {
	    value:  buffer,
	    options: {
	      filename: basefilename,
	      contentType: mimetype
	    }
	}


	logger.debug('upload_file_chunk, option :', options)
	self=this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('upload_file_chunk resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('upload_file_chunk issucc :', issucc)
	    	return resp
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function upload_file_to(toUserName, filename) {
	logger.debug('reply_to(', toUserName, filename, ')')
	localTime = Date.now()
	resp = {'BaseResponse': {'Ret': -1005, 'ErrMsg': 'Empty file detected'}}

	if(!fs.existsSync(filename)){
		return resp
	}

	stat = fs.lstatSync(filename)
	if(!stat.isFile()){
		return resp
	}

	fileMd5 = md5File.sync(filename)
	fileSize = stat.size
	maxLengthOneTime = 524288
	chunks = Math.floor((fileSize - 1) / maxLengthOneTime) + 1
	clientMediaId = localTime * 10

	uploadmediarequest = {
        'UploadType':2,
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
	buffer = Buffer.allocUnsafe(maxLengthOneTime)


	fd = fs.openSync(filename,'r')
	basename = path.basename(filename)
    for (var i=0;i<chunks;i++) {
    	realBytes = fs.readSync(fd, buffer, 0, maxLengthOneTime, null);
    	// function upload_file_chunk(basefilename, fileSize, chunkIdx, chunks, buffer, uploadmediarequest)
    	resp = await this.upload_file_chunk(basename, fileSize, i, chunks, buffer.slice(0, realBytes), uploadmediarequest)
    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
    	if (!issucc){
    		resp = {'BaseResponse': {'Ret': -1005, 'ErrMsg': 'upload chunk fail'}}
    		break
    	}
    }
    fs.closeSync(fd)

    logger.debug('upload_file_to() resp:', resp)

    return resp

}

async function send_image_to(userName, mediaId) {
	logger.debug('send_image_to()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendmsgimg',
	    qs: {
	        'f' : 'json',
	        'fun': 'async'
    	},
    	body : {
	        'BaseRequest': this.loginInfo['BaseRequest'],
	        'Msg': {
	            'Type': 3,
	            'MediaId': mediaId,
	            'FromUserName': this.get_myname(),
	            'ToUserName': userName,
	            'LocalID': localTime * 10,
	            'ClientMsgId': localTime * 10
	        },
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('send_image_to, option :', options)

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('send_image_to resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('send_image_to issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function send_emoticon_to(userName, mediaId) {
	logger.debug('send_emoticon_to()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendemoticon',
	    qs: {
	        'fun': 'sys'
    	},
    	body : {
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
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('send_emoticon_to, option :', options)

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('send_emoticon_to resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('send_emoticon_to issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function send_video_to(userName, mediaId) {
	logger.debug('send_video_to()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendvideomsg',
	    qs: {
	        'fun': 'async',
	        'f': 'json',
	        'pass_ticket': this.loginInfo['pass_ticket']
    	},
    	body : {
	        'BaseRequest': this.loginInfo['BaseRequest'],
	        'Msg': {
	            'Type': 43,
	            'MediaId': mediaId,
	            'FromUserName': this.get_myname(),
	            'ToUserName': userName,
	            'LocalID': localTime * 10,
	            'ClientMsgId': localTime * 10
	        },
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('send_video_to, option :', options)

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('send_video_to resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('send_video_to issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function send_file_to(userName, mediaId, filename) {
	logger.debug('send_file_to()')
	localTime = Date.now()

	if(!fs.existsSync(filename)){
		return false
	}

	stat = fs.lstatSync(filename)
	if(!stat.isFile()){
		return false
	}

	fileSize = stat.size

	content =   `<appmsg appid='wxeb7ec651dd0aefa9' sdkver=''><title>${path.basename(filename)}</title>` +
                "<des></des><action></action><type>6</type><content></content><url></url><lowurl></lowurl>" +
                `<appattach><totallen>${fileSize}</totallen><attachid>${mediaId}</attachid>` +
                `<fileext>${path.extname(filename).replace('.','')}</fileext></appattach><extinfo></extinfo></appmsg>`

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsendappmsg',
	    qs: {
	        'fun': 'async',
	        'f': 'json'
    	},
    	body : {
	        'BaseRequest': this.loginInfo['BaseRequest'],
	        'Msg': {
	            'Type': 6,
	            'Content': content,
	            'FromUserName': this.get_myname(),
	            'ToUserName': userName,
	            'LocalID': localTime * 10,
	            'ClientMsgId': localTime * 10
	        },
	        'Scene': 0, 
	    },
    	json: true,
    	method: 'POST'
	}

	logger.debug('send_file_to, option :', options)

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('send_file_to resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('send_file_to issucc :', issucc)
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function reply_file_to(userName, filename) {
	logger.debug('reply_file_to()')
	resp = await this.upload_file_to(userName, filename)
	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	if(!issucc) {
		return false
	}

	mediaId = resp.MediaId
	mimetype = mime.lookup(filename) || 'application/octet-stream'
	logger.debug('reply_file_to(), mime:', mimetype)
	if('image/gif' == mimetype) {
		return await this.send_emoticon_to(userName, mediaId)
	} else if(mimetype.startsWith('image')) {
		return await this.send_image_to(userName, mediaId)
	} else if(mimetype.startsWith('video')) {
		return await this.send_video_to(userName, mediaId)
	} else {
		return await this.send_file_to(userName, mediaId, filename)
	}

}

async function reply_file(msg, filename) {
	logger.debug('reply_file()')
	return await this.reply_file_to(msg.From.UserName, filename)
}


module.exports.Register =  function(core) {
	core.reply = reply
	core.reply_to = reply_to
	core.upload_file_chunk = upload_file_chunk
	core.upload_file_to = upload_file_to
	core.reply_file = reply_file
	core.reply_file_to = reply_file_to
	core.send_video_to = send_video_to
	core.send_emoticon_to = send_emoticon_to
	core.send_image_to = send_image_to
	core.send_file_to = send_file_to
}

