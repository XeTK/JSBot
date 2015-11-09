var opts   = require('./json/options.json');

var irc    = require('./connectors/irc');
var slack  = require('./connectors/slack');

var loader = require('./utils/loader');

console.log('Starting application');

var connector = null;

if (opts.isIRC) {

	irc.connect(
		opts.server,
		opts.port,
		'SpunkyJrTest',
		opts.isTLS,
		function(){
			joinServer();
		}
	);

	joinServer();

	function joinServer() {
		var channels = opts.channels;

		for (var channel in channels) {
			irc.joinChannel(channel);
		}
	}

	connector = irc;

} else {
	slack.connect();
	connector = slack;
}

var modules = loader.module_holder;

var collective = {
	"connector" : connector,
	"plugins"   : modules
};

for(var module in modules)
	modules[module](collective);


console.log('Ending application');
