var request = require('request');

var colour = require('../irccolour');

var keys = require('../keys');

function handler(irc) {
	irc.addCallBack(
		'privmsg',
		function(data) {
			var regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})(?:.+)?/g;

			var groups = regex.exec(data.message);

			if (groups && groups.length > 0) {

				var id = groups[1];
				var api_key = keys.youtube;

				var options = {
				    url: 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=' + api_key +'&part=snippet,statistics'
				};

				function callback(error, response, body) {
				    if (!error) {
				        var info = JSON.parse(body);

				        info = info.items[0];

				        var snippet = info.snippet;
				        var stats   = info.statistics;

				        var blk = colour.getColour('black');
				        var wht = colour.getColour('white');
				        var red = colour.getColour('red');
				        var grn = colour.getColour('green');
				    	var blu = colour.getColour('blue');

				        var str = '';

				        str += colour.colourStr('YOU', blk, wht);
				        str += colour.colourStr('TUBE', wht, red);
				        str += ' | ';
				        str += snippet.title + ' - ' + snippet.channelTitle + ' | ';
				        str += 'views: ';
				        str += colour.colourStr(stats.viewCount, blu, null);
				        str += ' | ';
				        str += 'likes ';
				        str += colour.colourStr(stats.likeCount, grn, null);
				        str += ' ';
				        str += colour.colourStr(stats.dislikeCount, red, null);
						str += ' dislikes';

				        irc.sendPrivMsg(data.channel, str);
				    }
				}

				request(options, callback);

			}
		}
	);
}

module.exports = function(module_holder) {
    module_holder['youtube'] = handler;
};