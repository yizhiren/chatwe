let log4js = require('log4js');
let logger = log4js.getLogger('chatwe')
let Config = require('./config')
let QRcode = require('qrcode-terminal')
let url = require('url');
let cheerio = require('cheerio')
let util = require('./utils')
let unesacpetext = require('unescape');


MessageHandler={}

function registerMessageHandler(type,handler){
	MessageHandler[type] = handler
}

async function wait_one_second() {

  return new Promise(resolve => setTimeout(resolve, 1000));
}


function get_QR() {

	QRcode.generate(Config.BASE_URL + '/l/' + this.uuid, {small: true});
}

async function get_login_info(text) {
	logger.debug('get_login_info()')
	logger.debug('text :', text)

    regx = /window.redirect_uri="(\S+)";/
    data = regx.exec(text)
    this.loginInfo['url'] = data[1] + '&fun=new&version=v2'
    logger.debug('info url :', this.loginInfo['url'])

    headers = { 'User-Agent' : Config.USER_AGENT }

    loginInfoUrl = this.loginInfo['url']
	var options = {
	    uri: loginInfoUrl 
	}

	urlinfo = url.parse(this.loginInfo['url']);
	logger.debug('urlinfo :', urlinfo)
	this.loginInfo['url'] = `https://${urlinfo.host}/cgi-bin/mmwebwx-bin`
	this.loginInfo['fileUrl'] = `https://${'file.'+urlinfo.host}/cgi-bin/mmwebwx-bin`
	this.loginInfo['syncUrl'] = `https://${'webpush.'+urlinfo.host}/cgi-bin/mmwebwx-bin`

    this.loginInfo['deviceid'] = 'e' + Date.now() + '99'
    this.loginInfo['logintime'] = Date.now()
    this.loginInfo['BaseRequest'] = {
    	'DeviceID': this.loginInfo['deviceid']
    }

    self = this

	return this.s(options)
	    .then(function (resp) {

	        let pm = resp.match(/<ret>(.*)<\/ret>/)
	        if (pm && (pm[1] === '0')) {
				self.loginInfo['skey'] = self.loginInfo['BaseRequest']['Skey'] = resp.match(/<skey>(.*)<\/skey>/)[1]
				self.loginInfo['wxsid'] = self.loginInfo['BaseRequest']['Sid'] = resp.match(/<wxsid>(.*)<\/wxsid>/)[1]
				self.loginInfo['wxuin'] = self.loginInfo['BaseRequest']['Uin'] = resp.match(/<wxuin>(.*)<\/wxuin>/)[1]
				self.loginInfo['pass_ticket'] = resp.match(/<pass_ticket>(.*)<\/pass_ticket>/)[1]

				logger.debug("login info :", self.loginInfo)
				return true

	        } else {
	        	return false
	        }

	    })
	    .catch(function (err) {
	    	logger.warn('err :', err)
	    	return false
	    });

}

async function check_login() {
	logger.debug('check_login()')
	localTime = Date.now()
	r = Math.floor(-localTime / 1579)


	var options = {
	    uri: Config.BASE_URL + '/cgi-bin/mmwebwx-bin/login',
	    qs: {
	        'loginicon' : 'true',
	        'uuid'   : this.uuid,
	        'tip' : 1,
	        'r' : r,
	        '_' : localTime
    	}
	}

	self = this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('check_login resp :', resp)
	        regx = /window.code=(\d+)/
		    data = regx.exec(resp)
		    if (data && data[1] == '200') {
		    	return self.get_login_info(resp).then(function(succ){
		    		return succ?200:400
		    	}).catch(function(err){
		    		return 400
		    	})
		    } else if (data) {
		    	return data[1]
		    } else {
		    	return 400
		    }

	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return 400
	    });

}

async function push_login() {
	logger.debug('push_login()')
	wxuid = ''
	this.cookieStore.findCookie('wx.qq.com', '/', 'wxuin', function(err,cookie){
		if(cookie) {
			wxuid = cookie.value
		} else {
			wxuid = ''
		}
	})
	logger.debug('pushlogin, wxuid :', wxuid)
	if(wxuid == ''){
		return wxuid
	}

	var options = {
	    uri: Config.PUSHLOGIN_BASE_URL + '/cgi-bin/mmwebwx-bin/webwxpushloginurl?uin=' + wxuid,
	    json: true
	}

	logger.debug('push login option :', options)

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('push_login resp :', resp)
	    	if(resp && '0' == resp.ret) {
	    		return resp['uuid']
	    	}
	    	return ''
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return ''
	    });
}

async function get_QRuuid() {
	logger.debug('get_QRuuid()')
	var options = {
	    uri: Config.BASE_URL + '/jslogin',
	    qs: {
	        'appid' : 'wx782c26e4c19acffb',
	        'fun'   : 'new',
	        'lang'  : 'zh_CN',
	        '_'     : Date.now()
    	},
	    headers: {
	        'User-Agent': Config.USER_AGENT
	    }
	};
	logger.debug('get_QRuuid, option :', options)

	return this.s(options)
	    .then(function (resp) {
	        regx = /window.QRLogin.code = (\d+); window.QRLogin.uuid = "(\S+?)";/
		    data = regx.exec(resp)
		    if (data && data[1] == '200') {
		    	logger.info('uuid =',data[2])
		        return data[2]
		    } else {
		    	return ''
		    }

	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return ''
	    });
}

function pickupDifferentInitContact(contactList) {
	logger.debug('pickupDifferentInitContact', contactList)
    for (let key in contactList) {
    	item = contactList[key]
        if(item['Sex'] != 0) {
        	this.init_memberList.push(item)
        } else if('@@' == item['UserName'].substr(0,2)) {
        	this.init_chatroomList.push(item)
        } else if('@' == item['UserName'].substr(0,1)) {
        	if(item['VerifyFlag'] & 8 == 0) {
	        	this.init_memberList.push(item)
        	} else {
        		this.init_mpList.push(item)
        	}
        } else if('weixin' == item['UserName'] || 'filehelper' == item['UserName']){
        	this.init_memberList.push(item)
        } else {
        	logger.info('unknow contact:', item)
        }
    }
}

function get_myname() {
	return this.loginInfo['User']['UserName']
}

function get_myNickName() {
	return this.loginInfo['User']['NickName']
}

async function web_init() {
	logger.debug('web_init()')
	localTime = Date.now()
	r = Math.floor(-localTime / 1579)

	var options = {
	    uri: this.loginInfo['url'] + '/webwxinit',
	    qs: {
	        'pass_ticket'   : this.loginInfo['pass_ticket'],
	        'r' : r
    	},
    	body : {
    		'BaseRequest' : this.loginInfo['BaseRequest']
    	},
    	json: true,
    	method: 'POST'
	}

	logger.debug('web_init, option :', options)
	self = this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('web_init resp :', resp)

		    self.loginInfo['InviteStartCount'] = resp['InviteStartCount']
		    self.loginInfo['User'] = resp['User']
		    self.memberList.push(self.loginInfo['User'])
		    self.loginInfo['SyncKey'] = resp['SyncKey']
			synckey = ''
		    for (let key in resp['SyncKey']['List']) {
		    	item = resp['SyncKey']['List'][key]
		        synckey += item['Key'] + '_' + item['Val'] + '|'
		    }
		    self.loginInfo['synckey'] = synckey.substr(0, synckey.length - 1)
		    self.init_subscribeList = resp.MPSubscribeMsgList
		    contactList = resp['ContactList'] || []
		    pickupDifferentInitContact.call(self, contactList)

	    })
	    .catch(function (err) {
	        logger.warn(err)

	    });
}


async function show_mobile_login() {
	logger.debug('show_mobile_login()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxstatusnotify',
	    qs: {
	        'pass_ticket'  : this.loginInfo['pass_ticket']
    	},
    	body : {
    		'BaseRequest' : this.loginInfo['BaseRequest'],
	        'Code'         : 3,
	        'FromUserName' : this.loginInfo['User']['UserName'],
	        'ToUserName'   : this.loginInfo['User']['UserName'],
	        'ClientMsgId'  : localTime, 
    	},
    	json: true,
    	method: 'POST'
	}

	logger.debug('show_mobile_login, option :', options)

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('show_mobile_login resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('show_mobile_login issucc :', issucc)
	    	if(!issucc){
	    		logger.warn("show_mobile_login fail :", resp)
	    	}
	    	return issucc
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}


function pickupDifferentTotalMember(memberList) {
	for (let key in memberList) {
    	item = memberList[key]
        if(item['Sex'] != 0) {
        	this.memberList.push(item)
        } else if('@@' == item['UserName'].substr(0,2)) {
        	this.chatroomList.push(item)
        } else if('@' == item['UserName'].substr(0,1)) {
        	if(item['VerifyFlag'] & 8 == 0) {
	        	this.memberList.push(item)
        	} else {
        		this.mpList.push(item)
        	}
        } else if('filehelper' == item['UserName']) {
        	this.memberList.push(item)
        } else if('weixin' == item['UserName'] || 'filehelper' == item['UserName']){
        	this.memberList.push(item)
        } else {
        	logger.info('unknow member:', item)
        }
    }
}

async function get_contact(seq = 0, memberList = []) {
	logger.debug('get_contact()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxgetcontact',
	    qs: {
	    	r: localTime,
	    	seq: seq,
	    	skey: this.loginInfo['skey'],
    	},
    	json: true,
    	method: 'GET'
	}

	logger.debug('get_contact, seq=', seq, ', option :', options)

	self = this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('get_contact, seq=', seq, ', resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	if(issucc) {
	    		nextSeq = resp.Seq || 0
	    		memberList = memberList.concat(resp.MemberList)
	    		if(nextSeq > 0) {
	    			return self.get_contact(nextSeq,memberList)
	    		}
	    		pickupDifferentTotalMember.call(self, memberList);
	    		return true
	    	}
	    	return false
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return false
	    });
}

async function logout() {
	logger.debug('logout()')

	var options = {
	    uri: this.loginInfo['url'] + '/webwxlogout',
	    qs: {
            'redirect' : 1,
            'type'     : 1,
            'skey'     : this.loginInfo['skey'] 
        },
    	method: 'GET'
	}

	logger.debug('logout, option :', options)

	self = this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('logout, resp :', resp)
	    }).catch(function (err) {
	        logger.warn(err)
	    }).finally(function(){
	    	self.init()
	    });
}


async function sync_check() {
	logger.debug('sync_check()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['syncUrl'] + '/synccheck',
	    qs: {
	        'r'        : localTime,
	        'skey'     : this.loginInfo['skey'],
	        'sid'      : this.loginInfo['wxsid'],
	        'uin'      : this.loginInfo['wxuin'],
	        'deviceid' : this.loginInfo['deviceid'],
	        'synckey'  : this.loginInfo['synckey'],
	        '_'        : this.loginInfo['logintime']
    	},
    	timeout: 60*1000,
    	method: 'GET'
	}

	logger.debug('sync_check, option :', options)
	this.loginInfo['logintime'] += 1

	self = this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('sync_check, resp :', resp)
	    	regx = /window.synccheck={retcode:"(\d+)",selector:"(\d+)"}/
	    	group = regx.exec(resp)
	    	if(group && group[1]=='0'){
	    		return parseInt(group[2])
	    	}else{
	    		logger.warn("sync_check, fail :", resp)
	    		return -1
	    	}
	    }).catch(function (err) {
	        logger.warn(err)
	        throw err
	    });
}

async function get_msg() {
	logger.debug('get_msg()')
	localTime = Date.now()

	var options = {
	    uri: this.loginInfo['url'] + '/webwxsync',
	    qs: {
	        'sid'  : this.loginInfo['wxsid'],
	        'pass_ticket'   : this.loginInfo['pass_ticket'],
	        'skey': this.loginInfo['skey']
    	},
    	body : {
    		'BaseRequest' : this.loginInfo['BaseRequest'],
	        'SyncKey'     : this.loginInfo['SyncKey'],
	        'rr'          : ~localTime 
    	},
    	json: true,
    	method: 'POST'
	}

	logger.debug('get_msg, option :', options)
	self=this

	return this.s(options)
	    .then(function (resp) {
	    	logger.debug('get_msg resp :', resp)
	    	issucc = resp && resp.BaseResponse && resp.BaseResponse.Ret == 0
	    	logger.debug('get_msg issucc :', issucc)
	    	if(issucc){
			    self.loginInfo['SyncKey'] = resp['SyncKey']
				synckey = ''
			    for (let key in resp['SyncKey']['List']) {
			    	item = resp['SyncKey']['List'][key]
			        synckey += item['Key'] + '_' + item['Val'] + '|'
			    }
			    self.loginInfo['synckey'] = synckey.substr(0, synckey.length - 1)
	    	} else {
	    		logger.warn('get_msg fail :', resp)
	    	}
	    	return resp
	    })
	    .catch(function (err) {
	        logger.warn(err)
	        return null
	    });
}

function update_contact(contacts) {
	logger.debug("updateContact :", contacts)
	for (let key in contacts) {
		contact = contacts[key]
		userName = contact.UserName
		idx = util.search_dict_list(this.memberList, 'UserName', userName)
		if(idx >= 0){
			logger.info('old:',this.memberList[idx])
			logger.info('new:',contact)
			this.memberList[idx] = contact
			continue
		}

		idx = util.search_dict_list(this.mpList, 'UserName', userName)
		if(idx >= 0){
			logger.info('old:',this.mpList[idx])
			logger.info('new:',contact)
			this.mpList[idx] = contact
			continue
		}

		idx = util.search_dict_list(this.chatroomList, 'UserName', userName)
		if(idx >= 0){
			logger.info('old:',this.chatroomList[idx])
			logger.info('new:',contact)
			this.chatroomList[idx] = contact
			continue
		}

		pickupDifferentTotalMember.call(this, [contact])

	}
}


function find_user(userName) {
	logger.debug("find_user :", userName)
	idx = util.search_dict_list(this.memberList, 'UserName', userName)
	if(idx >= 0){
		return ['friend',this.memberList[idx]]
	}

	idx = util.search_dict_list(this.mpList, 'UserName', userName)
	if(idx >= 0){
		return ['mp',this.mpList[idx]]
	}	

	idx = util.search_dict_list(this.chatroomList, 'UserName', userName)
	if(idx >= 0){
		return ['chatroom',this.chatroomList[idx]]
	}

	return ['',{}]
}

function default_handler(msg) {
	fromUser = msg.From
	toUser = msg.To
	notifyUsers = msg.NotifyUsers
	content = msg.Content
	msgType = msg.MsgType

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

	console.log("[%d]%s -> %s : %s => %s", msgType, fromName, toName, content, notifyName)
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
		let content = msg.Content
		let msgType = msg.MsgType

		let msgToProcess = {
			From: fromUser,
			To: toUser,
			NotifyUsers: notifyUsers,
			Content: unesacpetext(content),
			Type: msgType,
			FromType: fromType,
			OrigMsg: msg
		}
		
		this.default_handler(msgToProcess)
		if(typeof(MessageHandler[msgType]) == 'function'){
			await MessageHandler[msgType].call(this, msgToProcess)
		}

	}
	
}

async function start_receiving() {
	logger.debug("start_receiving()")
	retryCount = 0
	while(this.isLogined) {
		try{
			count = await this.sync_check()
			logger.info("selector:", count)
			if (count < 0) {
				this.isLogined = false
			} else if (count == 0) {
				continue;
			} else {
				messages = await this.get_msg()
				logger.debug("start_receiving got:", messages)
				if(messages){
					modContactList = messages.ModContactList
					this.update_contact(modContactList)

					msgList = messages.AddMsgList
					this.msgList.concat(msgList)
					await this.produce_msg(msgList)
				}
			}
			retryCount = 0
		}catch(err){
			logger.warn(err)

			retryCount += 1
			if(retryCount >= 500) {
				this.isLogined = false
			} else {
				await wait_one_second()
				await wait_one_second()
			}
		}
	}

	await this.logout()
}


async function login() {
	logger.debug('login()')
	if(this.isLogined || this.isLogging) {
		logger.warning('has already logged in.')
		return
	}

	while(!this.isLogined) {
		this.isLogging = true
		this.uuid = await this.push_login()
		if('' == this.uuid) {
			this.uuid = await this.get_QRuuid()
		}
		if(this.uuid == ''){continue}
		this.get_QR()
		while(!this.isLogined) {
			status = await this.check_login()
			logger.debug('check status :', status)
			if(status == 200) {
				this.isLogined = true
			} else if(status == 201) {
				logger.info('Please press confirm on your phone.')
				await wait_one_second()
			} else if(status != 408) {
				break
			}

		}
		if(this.isLogined) {
			break
		} else {
			logger.info('Log in time out, reloading QR code.')
		}
	}

	this.isLogging = false

	await this.web_init()
	await this.show_mobile_login()
	await this.get_contact()
	util.clear_screen()
	this.start_receiving()

}


module.exports.Register =  function(core) {
	core.login =  login
	core.get_QRuuid = get_QRuuid
	core.get_QR = get_QR
	core.check_login = check_login
	core.get_login_info = get_login_info
	core.push_login = push_login
	core.web_init = web_init
	core.show_mobile_login = show_mobile_login
	core.get_contact = get_contact
	core.start_receiving = start_receiving
	core.sync_check = sync_check
	core.logout = logout
	core.start_receiving = start_receiving
	core.get_msg = get_msg
	core.update_contact = update_contact
	core.produce_msg = produce_msg
	core.find_user = find_user
	core.default_handler = default_handler
	core.registerMessageHandler = registerMessageHandler
	core.get_myname = get_myname
	core.get_myNickName = get_myNickName
}

