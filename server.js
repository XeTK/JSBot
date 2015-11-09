//var irc    = require('./irc');
var loader = require('./loader');
var slack  = require('./slack');

console.log('Starting application');

slack.connect(
	function() {
		console.log("Reconnecting");
	}
);

/*
irc.connect(
	'irc.aberwiki.org',
	6667,
	'SpunkyJrTest',
	false,
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

var modules = loader.module_holder;

var collective = {
	"irc": slack,
	"plugins": modules
};

for(var module in modules)
	modules[module](collective);
*/

console.log('Ending application');
