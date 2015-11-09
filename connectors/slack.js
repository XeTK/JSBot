var restify = require('restify');
var request = require("request");
var rek     = require('rekuire');

var keys = rek('keys.json');
var opts = rek('options.json');

var PORT = 3000;

var SLACK_ENDPOINT = "https://slack.com/api/"

var AUTH = "rtm.start";
var POST = "chat.postMessage";

var options = {
	method: 'POST',
	headers: {
		 'cache-control': 'no-cache'
	 },
	formData: {
		token    : keys.slack,
		username : opts.name
	}
};

var callbacks = [];

function connect() {

	var server = restify.createServer(
		{
		  name: opts.name,
		  version: '1.0.0'
		}
	);

	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser());
	server.use(restify.bodyParser());

	server.post(
		'hello',
		function create(req, res, next) {

			var userName = req.params.user_name;
			var channel  = req.params.channel_id;
			var text     = req.params.text;

			if (userName !== 'slackbot') {

				console.log(('-> ' + text).cyan);

				var ret = {
					time:     new Date(),
					type:     'privmsg',
					nickname: userName,
					host:     '',
					channel:  channel,
					message:  text
				};

				for (var i = 0; i < callbacks.length; i++) {
					var obj = callbacks[i];
					obj.func(ret);
				}

			}

			res.send(200);

			return next();
		}
	)

	server.listen(
		PORT,
		function () {
	  	console.log('%s listening on port %s', server.name, PORT);
		}
	);

}

function joinChannel(channel) {}

function sendPrivMsg(resp, message)  {
	postMessage(resp, message, false);
}

function sendActionMsg(resp, message)  {
	postMessage(resp, message, true);
}


function postMessage(resp, message, isMine) {
	var opts = options;

	options['url'] = SLACK_ENDPOINT + POST;

	options.formData['channel'] = resp;
	options.formData['text']    = message;
	options.formData['as_user'] = isMine;

	console.log(('<- ' + message).yellow);

	request(
		opts,
		function (error, response, body) {
			if (error) throw new Error(error);

			console.log(body);
		}
	);
}

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

function addCallBack(call, func) {
	var tmp = new callback(call, func);
	callbacks.push(tmp);
}


exports.connect       = connect;
exports.joinChannel   = joinChannel;
exports.sendPrivMsg   = sendPrivMsg;
exports.sendActionMsg = sendActionMsg;
exports.addCallBack   = addCallBack;
