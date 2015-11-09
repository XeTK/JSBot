var restify = require('restify');
var request = require("request");

var keys = require('./keys.json');
var opts = require('./options.json');

var PORT = 3000;
var SLACK_ENDPOINT = "https://slack.com"


var AUTH =  "/api/rtm.start";

var options = {
	method: 'POST',
	headers: {
		 'cache-control': 'no-cache'
	 },
	formData: {
		token: 'xoxp-14183742036-14190542432-14188705779-85ad4e7594'
	}
};

var callbacks = [];

var server = restify.createServer(
	{
	  name: opts.name,
	  version: '1.0.0'
	}
);

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get(
	'/',
	function (req, res, next) {
	  res.send("Hello World");
	  return next();
	}
);

server.post(
	'hello',
	function create(req, res, next) {

		var userName = req.params.user_name;
		var botPayload = {
			text : 'Hello, ' + userName + '!'
		};

		if (userName !== opts.name) {
	    res.send(200, botPayload);
	  } else {
	    res.send(200);
	  }

	   return next();
	 }
)

server.listen(
	PORT,
	function () {
  	console.log('%s listening at %s', server.name, server.url);
	}
);

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

function connect(reConnectCallBack) {

	var opts = options;

	options['url'] = SLACK_ENDPOINT + AUTH;

	request(
		opts,
		function (error, response, body) {
		  if (error) throw new Error(error);

		  console.log(body);
		}
	);

}

function joinChannel(channel) {

}

function sendPrivMsg(resp, message)  {

}

function sendActionMsg(resp, message)  {

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
