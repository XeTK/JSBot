var request = require('request');

var sedstack = { };
var engine = {
	valid: false,
	type: 'DFA',
	nick: '',
	isAction: false,
	msg: '',
	search: '',
	replace: '',
	mods: '',
	prematch: '',
	match: '',
	postmatch: '',
	groups: [],
	success: false,
	result: '',
	reply: ''
};

function handler(collective) {

	var connector = collective.connector;

	connector.addCallBack(
		'privmsg',
		function(data) {

			addStack(data);

			var regex = /^([a-zA-Z0-9^\\_\{\}\[\]\|`~^-]+\s?[:,~-]\s?)?s\/.+?\/.*?(\/[gi]*)?/;

			if(!regex.test(data.message)) {
				return;
			}

			engine = {}; // Clear it, just in case.

			// Well it *looks* like a regex, now parse it.
			parseSed(data, connector);

			sedstack[ data.nickname ].pop(); // don't want the sed command on the stack.

			if(engine.type === 'DFA') {
				// Use normal JS .replace stuff.
				if( engine.nick in sedstack ) {
					try {
						if(engine.mod) {
							engine.search = new RegExp(engine.search, engine.mod);
						}
						else {
							engine.search = new RegExp(engine.search);
						}
					}
					catch(err) {
						connector.sendPrivMsg(data.channel, data.nickname + ": " + err);
						return;
					}

					var lines = sedstack[ engine.nick ];
					for(var i = lines.length; i > 0; i--) {
						engine.msg = lines[i - 1];

						var actiontest = /^\x01ACTION (.*?)\x01/.exec(engine.msg);
						if(actiontest && actiontest.length > 0) {
							engine.isAction = true;
							engine.msg = actiontest[1];
						}


						engine.result = engine.msg.replace(engine.search, engine.replace);
						if(engine.result === engine.msg) {
							// No change. Continue.
							continue;
						}
						else {
							// Found a Match.
							engine.success = true;
							if(engine.isAction) {
								lines[i - 1] = "\x01ACTION " + engine.result + "\x01";
							}
							else {
								lines[i - 1] = engine.result;
							}
							break;
						}
					}
					if(!engine.success) {
						engine.err = "Sorry, " + data.nickname + ", No matches.";
					}
				}
				else {
					engine.err = "Sorry, " + data.nickname + ", I couldn't find any data for " + engine.nick + ".";
				}
			}
			else {
				// Try and do fancy backreferencing stuff.
				connector.sendPrivMsg(data.channel, "Lookbehind assertions will be supported soon.");
				//doLookbehind(data, engine);
				return;
			}

			if(!engine.err && engine.success) {
				makeReply(data, engine);
				connector.sendPrivMsg(data.channel, engine.reply);
			}
			else {
				connector.sendPrivMsg(data.channel, engine.err);
			}
		}
	);
}

function doLookbehind(data, engine) {


}

function addStack(data) {

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

function parseSed(data, irc) {

	var expr = '';

	var nickre = /^(?:([a-zA-Z0-9^\\_\{\}\[\]\|`~^-]+)(?:\s?[:,~-]\s?))?(s\/.+)$/;
	var groups = nickre.exec(data.message);
	if(groups && groups.length > 0) {
		if(groups[1]) {
			engine.nick = groups[1];
		}
		else {
			engine.nick = data.nickname;
		}
		expr = groups[2];
        }

	if(/\(\?<[^\)]+\)/.test(expr)) {
		engine.type = 'NFA';
	}
	else {
		engine.type = 'DFA';
	}

	if(expr.match(/\//g).length < 2) {
		// Already we have problems... not enough slashes for it to be a valid sed.
		engine.valid = false;
		return;
	}

	var indices = [];
	var proceed = false;
	for(var i = 1; i < expr.length; i++) {
		// Start at 1 because expr[0] is 's'.
		if(expr.charAt(i) == '\\' && (expr.charAt(i + 1) == '/' || expr.charAt(i + 1) == '\\')) {
			if(proceed) {
				proceed = false;
				if(! i < (expr.length - 2)) {
					continue;
				}
			}
			proceed = true;
		}
		else if(expr.charAt(i) == '/') {
			if (expr.charAt(i - 1) != '\\' || (expr.charAt(i - 1) == '\\' && !proceed)) {
				indices.push(i);
			}
			proceed = false;
		}
	}

	// Populate engine.search, engine.replace, and engine.mods using the indices array.
	for(var index = 0; index < indices.length; index++) {
		if(index == 2) {
			// Modifiers.
			engine.mod = expr.slice(indices[index] + 1);
			if(!engine.mod.match(/^((gi|ig|g|i)(\s|$))/)) {
				engine.valid = false;
				engine.mod = null;
				return;
			}
		}
		else if(index == 1) {
			// Replacement.
			var tmp;
			if(indices.length < 3) { // i.e. there's no final / to terminate the sed.
				// Slice from after the index to the end.
				tmp = expr.slice(indices[index] + 1);
			}
			else { // Slice from after the index until before the next index.
				tmp = expr.slice(indices[index] + 1, indices[index + 1]);
			}

			engine.replace = tmp.replace(/\\(\\|\/)/g, "$1"); // Unescape slashes.
		}
		else if(index == 0) {
			// Search pattern.
			if((indices.length < 3 || indices.length > 3) && expr.charAt(expr.length - 1) ==  '/') {
				if(indices.length < 3) {
					engine.search = expr.slice(indices[index] + 1, indices[index + 1] + 1);
				}
				if(indices.length > 3) {
					engine.search = expr.slice(indices[index] + 1, indices[index + 1] + 2);
				}
			}
			else {
				engine.search = expr.slice(indices[index] + 1, indices[index + 1]);
			}
		}

	}

	return engine;
}

function makeReply(data, engine) {

	if(data.nickname !== engine.nick) {
		engine.reply = data.nickname
			+ ' thinks that '
			+ engine.nick
			+ ' meant: ';

	}
	else {
		engine.reply = data.nickname + ' meant: ';
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
