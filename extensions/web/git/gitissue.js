var request = require('request');
var rek     = require('rekuire');

var keys = rek('keys.json');

function handler(irc) {

	irc.addCallBack(
		'privmsg',
		function(data) {

			var user = data.nickname;

			if (!(user == 'XeTK' || user == 'ijz'))
				return;

			var regex = /^\.issue\s(.{1,140})$/g;

			var groups = regex.exec(data.message);

			if (groups && groups.length > 0) {

				var issueBody = '';
				issueBody += ':octocat: This message was generated automatically by '; 
				issueBody += data.nickname;
				issueBody += ' in ';
				issueBody += data.channel;
				issueBody += '. Once confirmed, please remove `unconfirmed` tag.';

				var options = {
					method : 'POST',
				    url    : 'https://api.github.com/repos/XeTK/JSBot/issues',
				    headers: {
				        'Authorization' : 'token ' + keys.github,
				        'Content-Type'  : 'application/x-www-form-urlencoded',
				        'User-Agent'    : 'JSBot'
				    },
				    json: {
				    	'title'  : groups[1],
				    	'body'   : issueBody,
				    	'labels' : [
				    		'bug', 
				    		'unconfirmed'
				    	]
				    }
				};

				function callback(error, response, body) {
				    if (!error) {
				        var info = body;

				        var str = '';
				        str += data.nickname;
				        str += ': Issue #';
				        str += info.number;
				        str += ' created: ';
				        str += info.url;

				        irc.sendPrivMsg(data.channel, str);
				    }
				}

				request(options, callback);

			}
		}
	);
}

module.exports = function(module_holder) {
    module_holder['gitissue'] = handler;
};