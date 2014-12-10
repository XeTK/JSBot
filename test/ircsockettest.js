var assert = require("assert");
var ircSoc = require("../ircsocket");

var url  = 'irc.aberwiki.org';
var port = 6667; 

describe(
	'connect',
	function() {

		ircSoc.connect(
			url, 
			port,
			function(data) {

			}
		);

		it(
			'should return true to indicate the method connected',
			function () {
				assert(ircSoc.isConnected() == true);
			}
		);
	}
)