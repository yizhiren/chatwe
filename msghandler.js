let log4js = require('log4js');
let logger = log4js.getLogger('chatwe')
let util = require('./utils')
let unesacpetext = require('unescape');
let fs = require('fs')
let url = require('url');
let Config = require('./config')
let MsgTypes = Config.MSG_TYPES


MessageHandler={}

function registerMessageHandler(type,handler){
	MessageHandler[type] = handler
}

function registerTextHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_TEXT, handler)
}

function registerPictureHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_IMAGE, handler)
	registerMessageHandler(MsgTypes.MSGTYPE_EMOTICON, handler)
}

function registerVoiceHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_VOICE, handler)
}

function registerVideoHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_VIDEO, handler)
	registerMessageHandler(MsgTypes.MSGTYPE_MICROVIDEO, handler)
}

function registerSysHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_SYS, handler)
	registerMessageHandler(MsgTypes.MSGTYPE_RECALLED, handler)
}

function registerFriendHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_VERIFYMSG, handler)
}

function registerCardHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_SHARECARD, handler)
}

function registerStatusHandler(handler){
	registerMessageHandler(MsgTypes.MSGTYPE_STATUSNOTIFY, handler)
}



function get_image_download_fn(filename,msgId) {
	return this.get_download_fn(filename,msgId,'webwxgetmsgimg')

}


function get_emoticon_download_fn(filename,msgId) {
	return this.get_download_fn(filename,msgId,'webwxgetmsgimg')

}

function get_video_download_fn(filename,msgId) {
	return this.get_download_fn(filename,msgId,'webwxgetvideo',{'Range': 'bytes=0-'})

}

function get_voice_download_fn(filename,msgId) {
	return this.get_download_fn(filename,msgId,'webwxgetvoice')
}

function get_download_fn(filename,msgId,interface,headers={}) {
	self = this
	return async function(){
		var options = {
		    uri: self.loginInfo['url'] + '/' + interface,
		    qs: {
		        'MsgID'        : msgId,
		        'skey'     : self.loginInfo['skey']
	    	},
	    	headers: headers,
	    	timeout: 60*1000,
	    	method: 'GET'
		}

		logger.debug(interface, ', option :', options)

		return new Promise(resolve =>
		    self.s0(options)
		      .pipe(fs.createWriteStream(filename,{autoClose:true}))
		      .on('finish', resolve));

	}
}

function get_download_slave_fn(filename,msgId,interface='webwxgetmsgimg',headers={}) {
	self = this
	return async function(){
		var options = {
		    uri: self.loginInfo['url'] + '/' + interface,
		    qs: {
		        'MsgID'    : msgId,
		        'skey'     : self.loginInfo['skey'],
		        'type'     : 'slave'
	    	},
	    	headers: headers,
	    	timeout: 60*1000,
	    	method: 'GET'
		}

		logger.debug(interface, ', option :', options)

		return new Promise(resolve =>
		    self.s0(options)
		      .pipe(fs.createWriteStream(filename,{autoClose:true}))
		      .on('finish', resolve));

	}
}


async function pick_main_info_from_msg(msg) {
	localTime = Date.now()

	if(MsgTypes.MSGTYPE_TEXT == msg.MsgType) {
		return {
			'Type': 'Text',
			'Content': unesacpetext(msg.Content)
		}
	}


	previewFile = __dirname + '/cache/' + localTime + '_slave.png'
	if (MsgTypes.MSGTYPE_IMAGE == msg.MsgType ||
		MsgTypes.MSGTYPE_VIDEO == msg.MsgType ||
		MsgTypes.MSGTYPE_MICROVIDEO == msg.MsgType) {

		let downSlave = this.get_download_slave_fn(previewFile,msg['MsgId'])
		await downSlave()
	}

	if(MsgTypes.MSGTYPE_IMAGE == msg.MsgType) {
		let filename = __dirname + '/cache/' + localTime + '.png'
		return {
			'Type': 'Image',
			'Content': filename,
			'Preview': previewFile,
			'Download': this.get_image_download_fn(filename,msg['MsgId'])
		}
	}


	if(MsgTypes.MSGTYPE_EMOTICON == msg.MsgType) {
		let filename = __dirname + '/cache/' + localTime + '.gif'
		return {
			'Type': 'Gif',
			'Content': filename,
			'Download': this.get_emoticon_download_fn(filename,msg['MsgId'])
		}
	}

	if(MsgTypes.MSGTYPE_VOICE == msg.MsgType) {
		let filename = __dirname + '/cache/' + localTime + '.mp3'
		return {
			'Type': 'Voice',
			'Content': filename,
			'Download': this.get_voice_download_fn(filename,msg['MsgId'])
		}
	}

	if(MsgTypes.MSGTYPE_VIDEO == msg.MsgType ||
		MsgTypes.MSGTYPE_MICROVIDEO == msg.MsgType) {
		let filename = __dirname + '/cache/' + localTime + '.mp4'
		return {
			'Type': 'Video',
			'Content': filename,
			'Preview': previewFile,
			'Download': this.get_video_download_fn(filename,msg['MsgId'])
		}
	}

	if(MsgTypes.MSGTYPE_VERIFYMSG == msg.MsgType) {
		return {
			'Type': 'Friend',
			'Content': {
                    'status'        : msg['Status'],
                    'userName'      : msg['RecommendInfo']['UserName'],
                    'verifyContent' : msg['Ticket'],
                    'autoUpdate'    : msg['RecommendInfo']
            }
		}
	}

	if(MsgTypes.MSGTYPE_STATUSNOTIFY == msg.MsgType) {
		return {
			'Type': 'Status',
			'Content': msg['Status']
		}
	}

	if(MsgTypes.MSGTYPE_SHARECARD == msg.MsgType) {
		return {
			'Type': 'Card',
			'Content': msg['RecommendInfo']
		}
	}

	if(MsgTypes.MSGTYPE_SYS == msg.MsgType) {
		return {
			'Type': 'Sys',
			'Content': unesacpetext(msg.Content)
		}
	}

	if(MsgTypes.MSGTYPE_RECALLED == msg.MsgType) {
        data =  /\[CDATA\[(.+?)\]\]/.exec(msg.Content)
        let content = 'System message'
        if(data) {
        	 content = data[1].replace(/\\/g, '')
        }
        return {
            'Type': 'Recall',
            'Content': unesacpetext(content)
        }
	}
	
	{
		return {
			'Type': 'NotSupported-' + msg.MsgType,
			'Content': msg
		}
	}

}



function default_handler(msg) {
	fromUser = msg.From
	toUser = msg.To
	notifyUsers = msg.NotifyUsers
	content = msg.Content
	msgType = msg.Type

	fromName = fromUser.NickName
	if(fromUser.RemarkName && ''!=fromUser.RemarkName) {
		fromName += '(' + fromUser.RemarkName + ')'
	}
	toName = toUser.NickName
	if(toUser.RemarkName && ''!=toUser.RemarkName) {
		toName += '(' + toUser.RemarkName + ')'
	}
	notifyName = 'NotifyName:'
	for (let i in notifyUsers){
		notifyName += util.emoji_formatter(notifyUsers[i],'NickName') + ','
	}

	console.log("[%s]%s -> %s : %s => %s", msgType, fromName, toName, content, notifyName)
}

async function produce_msg(msgList) {
	logger.debug("produce_msg :", msgList)

	for (let key in msgList) {
		let msg = msgList[key]
		let [fromType,fromUser] = this.find_user(msg.FromUserName)
		let [toType,toUser] = this.find_user(msg.ToUserName)
		let notifyUserNames = msg.StatusNotifyUserName.split(',')
		logger.debug('notifyUserNames:',notifyUserNames)
		let notifyUsers = []
		for (let i in notifyUserNames){
			if('' != notifyUserNames[i]) {
				let [_, notifyUser] = this.find_user(notifyUserNames[i])
				notifyUsers.push(notifyUser)
			}
		}

		let msgToProcess = await this.pick_main_info_from_msg(msg)
		logger.debug("msgToProcess :", msgToProcess)

		msgToProcess.From = fromUser
		msgToProcess.To = toUser
		msgToProcess.NotifyUsers = notifyUsers
		msgToProcess.FromType = fromType,
		msgToProcess.OrigMsg = msg
		
		this.default_handler(msgToProcess)
		if(typeof(MessageHandler[msg.MsgType]) == 'function'){
			await MessageHandler[msg.MsgType].call(this, msgToProcess)
		} else {
			logger.debug('not register handler :', msg.MsgType)
		}

	}
	
}

module.exports.Register =  function(core) {
	core.default_handler = default_handler
	core.registerTextHandler = registerTextHandler
	core.registerPictureHandler = registerPictureHandler
	core.registerVoiceHandler = registerVoiceHandler
	core.registerVideoHandler = registerVideoHandler
	core.registerSysHandler = registerSysHandler
	core.registerFriendHandler = registerFriendHandler
	core.registerCardHandler = registerCardHandler
	core.pick_main_info_from_msg = pick_main_info_from_msg
	core.get_image_download_fn = get_image_download_fn
	core.get_emoticon_download_fn = get_emoticon_download_fn
	core.get_voice_download_fn = get_voice_download_fn
	core.get_video_download_fn = get_video_download_fn
	core.get_download_fn = get_download_fn
	core.get_download_slave_fn = get_download_slave_fn
	core.produce_msg = produce_msg
}

module.exports.MessageHandler = MessageHandler

