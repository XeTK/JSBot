var rek     = require('rekuire');
var request = require('request');
var cheerio = require('cheerio');

var colour = rek('irccolour.js');

var keys   = rek('keys.json');

var blacklist = [
	'youtube',
	'imgur'
];

var red = colour.getColour('red');
var dgr = colour.getColour('dark_green');
var grn = colour.getColour('green');
var brn = colour.getColour('brown');
var blu = colour.getColour('blue');
var yel = colour.getColour('yellow');
var pur = colour.getColour('magenta');

var wotCategories = {
	"101": "Malware or viruses",
	"102": "Poor customer experience",
	"103": "Phishing",
	"104": "Scam",
	"105": "Potentially illegal",
	"201": "Misleading claims or unethical",
	"202": "Privacy risks",
	"203": "Suspicious",
	"204": "Hate, discrimination",
	"205": "Spam",
	"206": "Potentially unwanted programs",
	"207": "Ads / pop-ups",
	"301": "Online tracking",
	"302": "Alternative or controversial medicine",
	"303": "Opinions, religion, politics",
	"304": "Other",
	"501": "Good site ",
	"401": "Adult content",
	"402": "Incidental nudity",
	"403": "Gruesome or shocking",
	"404": "Site for kids "
};

function handler(collective) {

	var irc = collective.irc;

	irc.addCallBack(
		'privmsg',
		function(data) {

			var rgx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/g;

			var groups = rgx.exec(data.message);

			if (groups && groups.length > 0) { 
				var found = false;

				for (var blackitem in blacklist) {
					if (groups[2].indexOf(blacklist) != -1) {
						found = true;
						break;
					}
				}

				if (found) 
					return;

				var url = groups[1];

			    request(
			    	url, 
			    	function(error, response, html){

				        if(!error){

				            var $ = cheerio.load(html);

				            var title = $('title').text();

				            var str = '';
				            str += colour.colourStr('[URL]', blu);
				            str += ' ' + title;
				            str += ' | ';

				            var apiKey = keys.wot;

							var wotURL = "http://api.mywot.com/0.4/public_link_json2?hosts=" + url + "/&key=" + apiKey;

						    request(
								wotURL, 
								function(error, response, body){

							        if(!error){

										var wotSTR = convertWOT(body);

										str += wotSTR;

										irc.sendPrivMsg(data.channel, str);
									}
								}
							);
				        }
			    	}
			    );
			}
		}
	);
}

function convertWOT(json) {

	var ret = '';

	json = JSON.parse(json);

	for (var key in json) {

		var site = json[key];

		if (site["0"] != undefined) {
			// trustworthyness
			var trust = average(site["0"]);

			ret += colourStr(trust, "Trustworthiness: " + trust + ' |');
		}

		if (site["4"] != undefined) {
			// child friendlyness
			var child = average(site["4"]);

			ret += colourStr(child, " Child safety: " + child + ' | ');
		}

		var cats = site.categories;

		if (cats) {
			for (var cat in cats) {

				var score = cats[cat];
				score = average(score);
				var name = wotCategories[cat];

				ret += colourStr(score, name + ': ' + score + ' | ');
			}
			
		}

		var bl = site.blacklists;

		if (bl) {

			var tStr = 'This site has been marked as blacklisted for ';

			for (var black in bl) {
				tStr += black + ', ';
			}

			ret += tStr;
		}

		ret = ret.substring(0, ret.length - 2);
	}

	return ret;
}

function average(obj) {

	if (obj.constructor !== Array) {
		return obj;
	} else {
		var temp = 0;

		for (var num in obj) {
			temp += obj[num];
		}

		return (temp / obj.length);
	}
}

function colourStr(num, str) {
	var col = blu;

	if (num > 90) {
		col = dgr;
	} else if (num > 70) {
		col = grn;
	} else if (num > 50) {
		col = yel;
	} else if (num > 30) {
		col = brn;
	} else if (num > 10) {
		col = pur;
	} else {
		col = red;
	}

	return colour.colourStr(str, col);

}

module.exports = function(module_holder) {
    module_holder['scrapper'] = handler;
};
