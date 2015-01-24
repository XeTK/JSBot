// https://stackoverflow.com/questions/10914751/loading-node-js-modules-dynamically-based-on-route
// https://gist.github.com/kethinov/6658166

var fs          = require('fs');
var path_module = require('path');

var module_holder = {};

var path = path_module.join(__dirname, 'extensions');

var walkSync = function(dir, filelist) {

    files = fs.readdirSync(dir);

    filelist = filelist || [];

    files.forEach(
        function(file) {

            var iPath = path_module.join(dir, file);

            if (fs.statSync(iPath).isDirectory()) {
                filelist = walkSync(iPath + '/', filelist);
            } else {
                filelist.push(iPath);
            }
        }
    );

    return filelist;
}; 

var files = walkSync(path + '/');

files.forEach(
    function(file) {
        
        var regex = /\.js$/g;

        if (regex.test(file)) {
            console.log(('Loading plugin: ' + file).green);
            require(file)(module_holder);
        } else {
            console.log(('Not loading: ' + file).red);
        }
    }
);

exports.module_holder = module_holder;