var rek     = require('rekuire');
var request = require('request');

	

function handler(collective) {

	var irc = collective.irc;

	irc.addCallBack(
		'privmsg',
		function(data) {

			var regex = /(?:http(?:s)?:\/\/)(?:i\.)?imgur.com(?:\/(a|gallery))?\/([\w\d]{5,7})(?:.(png|jpg|gif))?/g;

			var groups = regex.exec(data.message);

			if (groups && groups.length > 0) {

				var iURL = 'https://api.imgur.com/3/gallery/image/';

				if (groups[1] == 'a'){
					iURL = 'https://api.imgur.com/3/album/'
				} else if (groups[1] == 'gallery'){
					iURL = 'https://api.imgur.com/3/gallery/image/';
				} else {
					iURL = 'https://api.imgur.com/3/image/';
				}

				var options = {
				    url: iURL + groups[2],
				    headers: {
				        'Authorization': 'Client-ID ' + keys.imgur
				    }
				};

				function callback(error, response, body) {
				    if (!error) {
				        var info = JSON.parse(body);

				        info = info.data;

					    var blk = colour.getColour('black');
				        var wht = colour.getColour('white');
				        var gre = colour.getColour('green');

				        var str = '';

				        str += colour.colourStr('I', gre, blk);
				        str += colour.colourStr('MGUR', wht, blk);
				        str += ' | ';

				        if (info.nsfw)
				        	str += '[NSFW] ';

				        if (info.title)
				        	str += info.title;
				        else 
				        	str += 'Nameless Picture';

				        if (info.type)
				        	str += ' {' + info.type + '}';

				        if (info.views)
				        	str += ' - ' + info.views + ' views';

				        if (info.width || info.height || info.size)
				        	str += ' - ' + info.width + 'px x ' + info.height + 'px, ' + parseInt(info.size / 1024) + 'kb';

				        if (info.error)
				        	str = info.error;

				        irc.sendPrivMsg(data.channel, str);
				    }
				}

				request(options, callback);

			}
		}
	);
}

module.exports = function(module_holder) {
    module_holder['imgur'] = handler;
};