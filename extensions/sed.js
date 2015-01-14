var request = require('request');

module.data = {};

function handler(irc) {

	irc.addCallBack(
		'privmsg',
		function(data) {

			addStack(data);

			var regex = /^([a-zA-Z0-9^\\_{}\[\]\|`~^-]+\s?[:,~-]\s?)?s\/.+?\/.*?\/[gmixs]*?/;

			if(!regex.test(data.message)) {
				return;
			}

			// Well it *looks* like a regex, now parse it.
			engine = parseSed(data.message);

			if(!engine.valid) {
				// Oh no an error. Do something.
			}

			if(engine.type === 'DFA') {
				// Use normal JS .replace stuff.
				if( engine.nick in module.data ) {
					var lines = module.data[ engine.nick ];
					for(var i = lines.length; i > 0; i--) {
						engine.msg = lines[i - 1]
						engine.result = engine.msg.replace(engine.search, engine.replace);
						if(engine.result === engine.msg) {
							// No change. Continue.
							continue;
						}
						else {
							// Found a Match.
							engine.success = true;
							break;
						}
					}
				}
				else {
					engine.err = "Sorry, " + data.nickname + ", I couldn't find any matches.";
				}
			}
			else {
				// Try and do fancy backreferencing stuff.
				irc.sendPrivMsg(data.channel, "Lookbehind assertions will be supported soon.");
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

	if(data.nickname in module.data) {
		module.data[ data.nickname ].push(data.message);
		while(module.data[ data.nickname ].length > 100) {
			module.data[ data.nickname ].shift();
		}
	}
	else {
		module.data[ data.nickname ] = [ data.message ];
	}

}

function parseSed(data) {

	var engine = {
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

	var nickre = /^([a-zA-Z0-9^\\_{}\[\]\|`~^-]+\s?[:,~-]\s?)?s\//;
	var groups = nickre.exec(data.message);
	if(groups && groups.length > 0) {
		engine.nick = groups[1];
        }

	if(/\(\?<[^\)]+\)/.test(data.message)) {
		engine.type = 'NFA';
	}

	var regex = /s\/(.+?)\/(.*?)\/([gmixs]*)?/;
	var groups = regex.exec(data.message);
	if(groups && groups.length > 0) {
		engine.search = groups[1];
		engine.replace = groups[2];
	}

	return engine;
}

function makeReply(data, engine) {

	if(data.nickname !== engine.nick) {
		engine.reply += data.nickname
			+ ' thinks that '
			+ engine.nick
			+ ' meant: ';

		if(engine.isAction) {
			engine.reply += ' * '
				+ engine.nick
				+ ' ';
		}
	}
	else {
		engine.reply += data.nickname + ' meant: ';
	}
	engine.reply += engine.result;
}

module.exports = function(module_holder) {
    module_holder['sed'] = handler;
};

