var request = require('request');

var sedstack = { };
var engine = { };

function handler(irc) {

	irc.addCallBack(
		'privmsg',
		function(data) {

			addStack(data);

			var regex = /^([a-zA-Z0-9^\\_\{\}\[\]\|`~^-]+\s?[:,~-]\s?)?s\/.+?\/.*?\/[gmixs]*?/;

			if(!regex.test(data.message)) {
				return;
			}

			// Well it *looks* like a regex, now parse it.
			parseSed(data);

			if(!engine.valid) {
				// Oh no an error. Do something.
			}

			sedstack[ data.nickname ].pop(); // don't want the sed command on the stack.

			if(engine.type === 'DFA') {
				console.log("Nick: " + engine.nick);
				// Use normal JS .replace stuff.
				if( engine.nick in sedstack ) {
					try {
						engine.search = new RegExp(engine.search);
					}
					catch(err) {
						irc.sendPrivMsg(data.channel, data.nickname + ": " + err);
						return;
					}

					var lines = sedstack[ engine.nick ];
					console.log(lines);
					for(var i = lines.length; i > 0; i--) {
						engine.msg = lines[i - 1];
						console.log("Testing: " + engine.msg);

						var actiontest = /^\x01ACTION (.*?)\x01/.exec(engine.msg);
						if(actiontest && actiontest.length > 0) {
							engine.isAction = true;
							engine.msg = actiontest[1];
							console.log("result: " + engine.msg);
						}
						console.log("not an action");
						
						engine.result = engine.msg.replace(engine.search, engine.replace);
						if(engine.result === engine.msg) {
							// No change. Continue.
							console.log("No change");
							continue;
						}
						else {
							// Found a Match.
							engine.success = true;
							console.log("Matched!");
							if(engine.isAction) {
								lines[i - 1] = "\x01ACTION " + engine.result + "\x01";
							}
							else {
								lines[i - 1] = engine.result;
							}
							break;
						}
					}
				}
				else {
					engine.err = "Sorry, " + data.nickname + ", I couldn't find any data for " + engine.nick + ".";
				}
			}
			else {
				// Try and do fancy backreferencing stuff.
				irc.sendPrivMsg(data.channel, "Lookbehind assertions will be supported soon.");
				return;
			}

			if(!engine.err && engine.success) {
				makeReply(data, engine);
				irc.sendPrivMsg(data.channel, engine.reply);
			}
			else {
				irc.sendPrivMsg(data.channel, engine.err);
			}
		}
	);
}

function addStack(data) {

	//console.log(sedstack["ijz"][ sedstack["ijz"].length - 1 ]);

	if(data.nickname in sedstack) {
		sedstack[ data.nickname ].push(data.message);
		while(sedstack[ data.nickname ].length > 100) {
			sedstack[ data.nickname ].shift();
		}
	}
	else {
		sedstack[ data.nickname ] = [ data.message ];
	}

}

function parseSed(data) {

	console.log("parseSed(): Nick: " + data.nickname);

	engine = {
		valid: false,
		type: 'DFA',
                nick: data.nickname,
                isAction: false,
		msg: '',
		search: '',
		replace: '',
		mods: '-i',
                prematch: '',
                match: '',
                postmatch: '',
                groups: [],
		success: false,
                result: '',
		reply: ''
	};

	var nickre = /^([a-zA-Z0-9^\\_\{\}\[\]\|`~^-]+)\s?[:,~-]\s?s\//;
	var groups = nickre.exec(data.message);
	if(groups && groups.length > 0) {
		console.log("Is this returning true?");
		engine.nick = groups[1];
        }

	if(/\(\?<[^\)]+\)/.test(data.message)) {
		engine.type = 'NFA';
	}

	var regex = /s\/(.+?)\/(.*?)\/([gmixs]*)?/;
	var capts = regex.exec(data.message);
	if(capts && capts.length > 0) {
		engine.search = capts[1];
		engine.replace = capts[2];
	}

	console.log("parseSed(): Nick: " + engine.nick);

	return engine;
}

function makeReply(data, engine) {

	if(data.nickname !== engine.nick) {
		engine.reply += data.nickname
			+ ' thinks that '
			+ engine.nick
			+ ' meant: ';

	}
	else {
		engine.reply += data.nickname + ' meant: ';
	}
	
	if(engine.isAction) {
		engine.reply += '* '
			+ engine.nick
			+ ' ';
	}

	engine.reply += engine.result;
}

module.exports = function(module_holder) {
    module_holder['sed'] = handler;
};

