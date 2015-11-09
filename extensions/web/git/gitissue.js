var request = require('request');
var rek     = require('rekuire');

var keys = rek('keys.json');
var opts = rek('options.json');

function handler(collective) {

	var connector = collective.connector;

	connector.addCallBack(
		'privmsg',
		function(data) {

			var user = data.nickname;

			if (opts.admins.indexOf(user) == -1)
				return;

			var regex = /^\.issue\s(.{1,140})$/g;

			var groups = regex.exec(data.message);

			if (groups && groups.length > 0) {

				var issueBody = '';
				issueBody += ':octocat: This message was generated automatically by ';
				issueBody += data.nickname;
				issueBody += ' in ';
				issueBody += (opts.isIRC) ? data.channel : data.channelName;
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
				        str += info.html_url;

				        connector.sendPrivMsg(data.channel, str);
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
