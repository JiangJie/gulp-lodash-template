'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var tmpl = require('lodash.template');

var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-lodash-template';

module.exports = function (options) {
    options = options || {};

    var _escape = 'var _ = {};\n\
var escapeMap = {\n\
    \'&\': \'&amp;\',\n\
    \'<\': \'&lt;\',\n\
    \'>\': \'&gt;\',\n\
    \'"\': \'&quot;\',\n\
    "\'": \'&#x27;\'\n\
};\n\
var escapeRegexp = new RegExp(\'[\' + Object.keys(escapeMap).join(\'\') + \']\', \'g\');\n\
_.escape = function(string) {\n\
    if (!string) return \'\';\n\
    return String(string).replace(escapeRegexp, function(match) {\n\
        return escapeMap[match];\n\
    });\n\
};\n';

    function compiler(file) {
        var template = tmpl(file.contents.toString(), false, options.templateSettings).source;

        var strict = options.strict ? '\'use strict;\'\n' : '';
        var escape = options.noescape ? 'var _ = {};\n' : _escape;

        var prefix;
        var postfix = '';

        if(options.es6module) prefix = strict + escape + 'export default ';
        else if(options.commonjs) prefix = strict + escape + 'module.exports = ';
        else if(options.amd) {
            prefix = 'define(function() {\n' + strict + escape + 'return ';
            postfix = '});';
        } else {
            var name = typeof options.name === 'function' && options.name(file) || file.relative;
            var namespace = options.namespace || 'JST';
            prefix = '(function() {\n' + strict + escape + '(window[\''+ namespace +'\'] = window[\''+ namespace +'\'] || {})[\''+ name.replace(/\\/g, '/') +'\'] = ';
            postfix = '})();';
        }

        return prefix + template + postfix;
    }

    var stream = through.obj(function(file, enc, callback) {

        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return callback();
        }

        var filePath = file.path;

        try {
            var compiled = compiler(file);

            file.contents = new Buffer(compiled);
            file.path = gutil.replaceExtension(file.path, '.js');
        } catch (err) {
            this.emit('error', new PluginError(PLUGIN_NAME, err, {fileName: filePath}));
            return callback();
        }

        this.push(file);
        callback();
    });

    return stream;
};