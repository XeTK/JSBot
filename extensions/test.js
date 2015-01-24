var Lipsum = require('node-lipsum');

function handler(collective) {

	var irc = collective.irc;

	irc.addCallBack(
		'privmsg',
		function(data) {
			if (data.message == 'test') {
				var lipsum = new Lipsum();

				var lipsumOpts = {
					start: 'yes',
					what: 'bytes',
					amount: 2000
				};

				lipsum.getText(
					function(text) {
						irc.sendPrivMsg(data.channel, text);
					}, 
					lipsumOpts
				);
			}
			//irc.sendPrivMsg('#xetk', JSON.stringify(data));
		}
	);

	/*irc.addCallBack(
		'server',
		function(data) {
			irc.sendPrivMsg('#xetk', JSON.stringify(data));
		}
	);*/
}

module.exports = function(module_holder) {
    module_holder['test'] = handler;
};
