var sock = require('./ircsocket');

var callbacks = [];

var cMsgLen = 410;

function callback(call, func) {
	var iCall = call;
	var iFunc = func;
	this.func = function(obj) {
		iFunc(obj);
	}
	this.call = function() {
		return iCall;
	}
}

function connect(url, port, username, tls, reConnectCallBack) {

	sock.connect(
		url,
		port, 
		tls,
		function(data) {
			handleIRCServer(data);
		},
		function() {
			connectToServer(username);
			reConnectCallBack();
		}
	);

	connectToServer(username);
}

function connectToServer(username) {
	if (sock.isConnected()) {
		sock.sendData('NICK ' + username);
		sock.sendData('USER ' + username + ' 8 *: ' + username + ' ' + username);
	} else {
		console.error('Not connected to server!');
	}
}

function joinChannel(channel) {
	if (sock.isConnected()) {
		sock.sendData('JOIN ' + channel);
	} else {
		console.error('Not connected to server!');
	}
}

function sendPrivMsg(resp, message)  {
	if (sock.isConnected()) {
		var dataArr = limitStrLen(message);

		dataArr.forEach(
			function(tData) {
				sock.sendData('PRIVMSG ' + resp + ' :' + tData);
			}
		);
	} else {
		console.error('Not connected to server!');
	}
}

function sendActionMsg(resp, message)  {
	var msg = '\001ACTION ' + message;
	sendPrivMsg(resp, msg); 
}

function addCallBack(call, func) {
	var tmp = new callback(call, func);
	callbacks.push(tmp);
}

function limitStrLen(data) {
	var tmp = data;

	var ret = [];

	if (tmp.length > cMsgLen) {
		while (true) {
			if (tmp.length > cMsgLen) {

				for (var j = 0; j < tmp.length; j++) {
										
					var x = cMsgLen - j;

					var curChar = tmp[x];

					if (curChar == ' ') {
						var t = tmp.substring(0, x);
						ret.push(t);

						tmp = tmp.substring(x + 1, tmp.length);
						break;
					}
				}
			} else {
				ret.push(tmp);
				break;
			}
		}
	} else {
		ret.push(data);
	}

	return ret;
}

function handleIRCServer(data) {

	var regexList = [
		{
			regex: /^PING\s:(.*)/g,
			func:  'ping'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sPRIVMSG\s([\w\d\#\-]*)\s(?:\:)?(.*)/g,
			func:  'privmsg'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sQUIT\s(?:\:)?(.*)/g,
			func: 'quit'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sPART\s([\w\d\#\-]*)\s(?:\:)?(.*)/g,
			func:  'part'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sJOIN\s(?:\:)?(#.*)/g,
			func:  'join'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sMODE\s([\w\d\#\-]*)\s([-+].)(.*)/g,
			func:  'mode'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sKICK\s([\w\d\#\-]*)\s([\w\d]*)\s(?:\:)?(.*)/g,
			func:  'kick'
		},
		{
			regex: /^:([\w\d^\\\{\}\[\]\|`~^-]*)!(?:~)?([\w\d\@\/\-\.]*)\sINVITE\s([\w\d]*)\s:(#[\w\d]*)/g,
			func:  'invite'
		},
		{
			regex: /^:([\w\d\@\/\-\.]*)\s([\d]{3})\s([\w\d]*)\s(?:[\:\@\=]?(?:\s)?)?(.*)/g,
			func:  'server'
		}
	];

	function quickMatch(regx, type) {

		groups = regx.exec(data);

		if (groups && groups.length > 0) {

			if (type == 'ping') {
				sock.sendData('PONG :' + groups[1]);
			} else {
				runCallBacks(type, groups);
			}

			return true;
		}

		return false;
	}

	for (var i = 0; i < regexList.length; i++) {
		var regObj = regexList[i];

		var retVal = quickMatch(regObj.regex, regObj.func);

		if (retVal)
			break;
	}

}

function runCallBacks(type, groups) {
	for (var i = 0; i < callbacks.length; i++) {
		var obj = callbacks[i];
		if (obj.call() == type) {
			var data = convertGroupsToObjects(groups, type);
			obj.func(data);
		}
	}
}

function convertGroupsToObjects(groups, type) {
	
	var ret = {
		time:     new Date(),
		type:     type,
		nickname: groups[1],
		host:     groups[2]
	};

	switch(type) {
		case 'privmsg':
			ret['channel'] = groups[3];
			ret['message'] = groups[4];
			break;
		case 'quit':
			ret['message'] = groups[3];
			break;
		case 'part':
			ret['channel'] = groups[3];
			ret['message'] = groups[4];
			break;
		case 'join':
			ret['channel'] = groups[3];
			break;
		case 'mode':
			ret['channel']   = groups[3];
			ret['parameter'] = groups[4];
			ret['option']    = groups[5];
			break;
		case 'kick':
			ret['channel'] = groups[3];
			ret['user']    = groups[4];
			ret['message'] = groups[5];
			break;
		case 'invite':
			ret['user']    = groups[3];
			ret['channel'] = groups[4];
			break;
		case 'server':
			ret['host']    = groups[1];
			ret['status']  = groups[2];
			ret['user']    = groups[3];
			ret['message'] = groups[4];
			delete ret['nickname'];
			break;
		default:
			ret = {};
			break;
	}

	return ret;

}

exports.connect       = connect;
exports.joinChannel   = joinChannel;
exports.sendPrivMsg   = sendPrivMsg;
exports.sendActionMsg = sendActionMsg;
exports.addCallBack   = addCallBack;
