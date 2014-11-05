'use strict;'
var _ = {};
_.escape = require('lodash.escape');
module.exports = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<header></header>';

}
return __p
}