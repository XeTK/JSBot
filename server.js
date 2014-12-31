var irc = require('./irc');

var Lipsum = require('node-lipsum');

console.log('Starting application');

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
					irc.sendPrivMsg('#xetk', text);
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


irc.connect(
	'holmes.freenode.net',
	7070,
	'SpunkyJr',
	true,
	function(){
		joinServer();
	}
);

joinServer();

function joinServer() {
	irc.joinChannel('#xetk');
	//irc.sendPrivMsg('#xetk',   'Hello World');
	//irc.sendActionMsg('#xetk', 'Hello World'); 
}

console.log('Ending application');
