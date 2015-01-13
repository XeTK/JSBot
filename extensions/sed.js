var request = require('request');

function handler(irc) {

	irc.addCallBack(
		'privmsg',
		function(data) {
			var regex = /s\/.+?\/.*?\/[gmixs]?/;

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
			}
			else {
				// Try and do fancy backreferencing stuff.
			}
		}
	);
}

function parseSed(msg) {

	var engine = {
		valid: false,
		type: 'DFA',
		search: '',
		replace: '',
		mods: '-i'
	};

}
