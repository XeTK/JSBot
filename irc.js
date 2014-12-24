var sock = require('./ircsocket');

var callbacks = [];

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

function connect(url, port, username, tls, connectCallBack, reConnectCallBack) {

	sock.connect(
		url,
		port, 
		tls,
		function(data) {
			handleIRCServer(data);
			connectCallBack(data);
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
		sock.sendData('PRIVMSG ' + resp + ' :' + message);
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

function handleIRCServer(data) {

	function quickMatch(regx, type) {

		groups = regx.exec(msg);

		if (groups && groups.length > 0) {
			runCallBacks(type, groups);
			return true;
		}

		return false;
	}

	var msg      = data.toString();

	var pingRegx = /^PING\s:(.*)/g;

	var groups   = pingRegx.exec(msg);

	if (groups && groups.length > 0) {
		sock.sendData('PONG :' + groups[1]);
		return;
	}

	// PRIVMSG
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sPRIVMSG\s([\w\d\#\-]*)\s(?:\:)?(.*)/g, 'privmsg');

	// QUIT
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sQUIT\s(?:\:)?(.*)/g, 'quit');

	// PART
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sPART\s([\w\d\#\-]*)\s(?:\:)?(.*)/g, 'part');

	// JOIN
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sJOIN\s(?:\:)?(#.*)/g, 'join');

	// MODE
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sMODE\s([\w\d\#\-]*)\s([-+].)(.*)/g, 'mode');

	// KICK
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sKICK\s([\w\d\#\-]*)\s([\w\d]*)\s(?:\:)?(.*)/g, 'kick');

	// INVITE
	quickMatch(/^:([\w\d]*)!(?:~)?([\w\d\@\/\-\.]*)\sINVITE\s([\w\d]*)\s:(#[\w\d]*)/g, 'invite');

	// SERVER
	quickMatch(/^:([\w\d\@\/\-\.]*)\s([\d]{3})\s([\w\d]*)\s(?:[\:\@\=]?(?:\s)?)?(.*)/g, 'server');

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
			ret = {
				host:    groups[1],
				status:  groups[2],
				user:    groups[3],
				message: groups[4]
			}
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