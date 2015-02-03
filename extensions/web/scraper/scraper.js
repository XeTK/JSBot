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
var blk = colour.getColour('black');
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
	"401": "Adult content",
	"402": "Incidental nudity",
	"403": "Gruesome or shocking",
	"404": "Site for kids",
	"501": "Good site"
};

var posWOTCats = [
	"404",
	"501"
];

function handler(collective) {

	var irc = collective.irc;

	irc.addCallBack(
		'privmsg',
		function(data) {

			var rgx = /(((https?:\/\/)[\da-zA-Z\.-]+)((.*\?)(.*))?)/;
			var groups = rgx.exec(data.message);

			if (groups && groups.length > 0) { 

				var found = false;

				for (var blackitem in blacklist) {
					if (groups[2].indexOf(blacklist[blackitem]) != -1) {
						found = true;
						break;
					}
				}

				if (found) 
					return;

				var url = groups[2];

			    request(
			    	url, 
			    	function(error, response, html){

			    		var str = '';

				        if(!error){

				            var $ = cheerio.load(html);

				            var title = $('title').text();

				            title = title.trim();

				           	if (title.length == 0) {
				           		str += colour.colourStr('Could not get title for ' + url, red);
				           	} else {
				           		str += colour.colourStr('[URL]', blu);
				            	str += ' ' + title;	
				           	}

						} else {
							str += colour.colourStr('Could not get title for ' + url, red);
						}

						str += ' | ';

			            var apiKey = keys.wot;

						var wotURL = "http://api.mywot.com/0.4/public_link_json2?hosts=" + url + "/&key=" + apiKey;

					    request(
							wotURL, 
							function(error, response, body){

						        if(!error){

									var wotSTR = convertWOT(body);

									if (wotSTR.length == 0) 
										wotSTR = 'This website does not yet have a rating.';

									str += colour.colourStr('W', red);
									str += colour.colourStr('O', grn);
									str += colour.colourStr('T', yel);

									str += ' Rating: ' + wotSTR;

									
								}

								irc.sendPrivMsg(data.channel, str);
							}
						);
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
			// trustworthiness
			var trust = average(site["0"]);

			ret += colourStr(trust, "Trustworthiness: " + trust + ' | ', false);
		}

		if (site["4"] != undefined) {
			// child friendliness
			var child = average(site["4"]);

			ret += colourStr(child, "Child safety: " + child + ' | ', false);
		}

		var cats = site.categories;

		if (cats) {
			for (var cat in cats) {

				var score = cats[cat];
				score = average(score);
				var name = wotCategories[cat];

				var negative = true;

				// Dirty dirty work around, because i don't want to change the data structures...
				for (var i = 0; i < posWOTCats.length; i++) {
					if (cat == posWOTCats[i]) {
						negative = false;
						break;
					}
				}

				ret += colourStr(score, name + ': ' + score + ' | ', negative);
			}
			
		}

		var bl = site.blacklists;

		if (bl) {

			var tStr = 'This site has been marked as blacklisted for ';

			for (var black in bl) {
				tStr += black + ', ';
			}

			ret += colour.colourStr(tStr, blk, red);
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

		var result = (temp / obj.length);

		return Math.round(result);
	}
}

function colourStr(num, str, negative) {
	var col = blu;

	if (negative) {
		num = (100 - num);
	}

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
    module_holder['scraper'] = handler;
};
