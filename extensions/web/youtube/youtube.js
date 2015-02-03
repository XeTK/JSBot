var rek     = require('rekuire');
var request = require('request');

var colour = rek('irccolour.js');

var keys   = rek('keys.json');

function handler(collective) {

	var irc = collective.irc;

	irc.addCallBack(
		'privmsg',
		function(data) {
			var regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})(?:.+)?/g;

			var groups = regex.exec(data.message);

			if (groups && groups.length > 0) {

				var id = groups[1];
				var apiKey = keys.youtube;

				var options = {
				    url: 'https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=' + apiKey +'&part=snippet,statistics'
				};

				function callback(error, response, body) {
				    if (!error) {
				        var info = JSON.parse(body);

				        if (!info.error) {
		
					        info = info.items[0];

					        console.log(JSON.stringify(info));

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
				}

				request(options, callback);

			}
		}
	);
}

module.exports = function(module_holder) {
    module_holder['youtube'] = handler;
};
