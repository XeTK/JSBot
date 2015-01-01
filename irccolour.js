
function getColour(name) {
	switch(name) {
		case 'white':
			return "00";
		case 'black':
			return "01";
		case 'dark_blue':
			return "02";
		case 'dark_green':
			return "03";
		case 'red':
			return "04";
		case 'brown':
			return "05";
		case 'purple':
			return "06";
		case 'olive':
			return "07";
		case 'yellow':
			return "08";
		case 'green':
			return "09";
		case 'teal':
			return "10";
		case 'cyan':
			return "11";
		case 'blue':
			return "12";
		case 'magenta':
			return "13";
		case 'dark_gray':
			return "14";
		case 'light_gray':
			return "15";
		default:
			return "00";
	}
}

function colourStr(str, foreground, background) {
	var ret = "\u0003" + foreground;

	if (background)
		ret += "," + background;

	ret += str + "\u000f";

	return ret;
}

exports.getColour = getColour;
exports.colourStr = colourStr;