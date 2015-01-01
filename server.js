var irc    = require('./irc');
var loader = require('./loader')

console.log('Starting application');

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

for(var module in modules) 
	modules[module](irc);


console.log('Ending application');
