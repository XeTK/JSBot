var irc = require('./irc');

console.log('Starting application');

irc.addCallBack(
	'privmsg',
	function(data) {
		irc.sendPrivMsg('#xetk', JSON.stringify(data));
	}
);


irc.connect(
	'holmes.freenode.net',
	7070,
	'SpunkyJr',
	true,
	function(data) {
		//console.log('some new data ' + data);
	},
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
