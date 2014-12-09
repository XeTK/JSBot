var net = require('net');

var socket = null;

function connect(url, port, onDataCallBack){

	if (!socket) {
		socket = net.Socket();

		socket.on(
			'data',
			function(data) {
				console.log('-> ' + data.toString());
				onDataCallBack(data);
			}
		);

		socket.connect(port, url);
	} else {
		console.error('Socket already open!');
	}
}

function sendData(data) {
	if (socket) {
		console.log('<- ' + String(data));
		socket.write(data + '\r\n');
	} else {
		console.error('There is no socket open!');
	}
}

function disconnect() {
	if (socket) {
		console.log('Socket was closed!');
		socket.end();
	} else {
		console.error('Socekt was not open!');
	}
}

function isConnected() {
	return (socket);
}

exports.connect     = connect;
exports.sendData    = sendData;
exports.disconnect  = disconnect;
exports.isConnected = isConnected;