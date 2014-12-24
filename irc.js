var sock = require('./ircsocket');

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

function handleIRCServer(data) {

	var msg      = data.toString();

	var pingRegx = /^PING\s:(.*)/g;

	var groups   = pingRegx.exec(msg);

	if (groups && groups.length > 0) {
		sock.sendData('PONG :' + groups[1]);
	}
}

exports.connect         = connect;
exports.joinChannel     = joinChannel;
exports.sendPrivMsg     = sendPrivMsg;
exports.sendActionMsg   = sendActionMsg;