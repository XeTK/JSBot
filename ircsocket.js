var net = require('net');

var socket = null;

var cTimeout = 600000;

var gPort                = 0;
var gUrl                 = '';
var gOnDataCallBack      = null;
var gOnReconnectCallBack = null;

function connect(url, port, onDataCallBack, onReconnectCallBack){
	gUrl                 = url;
	gPort                = port;
	gOnDataCallBack      = onDataCallBack;
	gOnReconnectCallBack = onReconnectCallBack;

	inConnect();
}

function inConnect() {

	if (!socket) {
		socket = net.Socket();

		socket.setTimeout(cTimeout);

		socket.on(
			'data',
			function(data) {
				console.log('-> ' + data.toString());
				gOnDataCallBack(data);
			}
		);

		socket.on(
			'end',
			function(data) {
				handleReconnect();
			}
		);

		socket.on(
			'timeout',
			function(data) {
				handleReconnect();
			}
		);

		socket.connect(gPort, gUrl);
	} else {
		console.error('Socket already open!');
	}
}

function handleReconnect() {
	console.log('Reconnecting');

	socket.destroy();

	socket = null;

	inConnect();
	gOnReconnectCallBack();
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
	return (socket != null);
}

exports.connect     = connect;
exports.sendData    = sendData;
exports.disconnect  = disconnect;
exports.isConnected = isConnected;