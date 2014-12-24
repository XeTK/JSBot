var net     = require('net');
var tls     = require('tls');
var fs      = require('fs');
var colours = require('colors')

var socket  = null;

var cTimeout = 600000;

var gPort                = 0;
var gUrl                 = '';
var gOnDataCallBack      = null;
var gOnReconnectCallBack = null;
var gTLS                 = false;

var priKeyPath = 'private-key.pem';
var certPath   = 'public-cert.pem';

var options = {};

function connect(url, port, tls, onDataCallBack, onReconnectCallBack){

	gUrl                 = url;
	gPort                = port;
	gTLS                 = tls;
	gOnDataCallBack      = onDataCallBack;
	gOnReconnectCallBack = onReconnectCallBack;

	if (tls) {

		var fKey  = fs.existsSync(priKeyPath) ? fs.readFileSync(priKeyPath) : null;
		var fCert = fs.existsSync(certPath)   ? fs.readFileSync(certPath)   : null;

		if (!fKey || !fCert) {
			console.error('TLS Cert or Private Key missing!'.red);
			process.exit(1);
		}

		options = {
			key:  fKey,
			cert: fCert
		};
	}

	inConnect();
}

function inConnect() {

	if (!socket) {

		if (gTLS) {
			socket = tls.connect(gPort, gUrl, options);
		} else {
			socket = net.Socket();
			socket.connect(gPort, gUrl);
		}

		socket.setTimeout(cTimeout);

		socket.on(
			'data',
			function(data) {
				console.log(('-> ' + data.toString()).cyan);
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
		console.log(('<- ' + String(data)).yellow);
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